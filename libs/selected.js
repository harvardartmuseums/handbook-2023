const HAM = require('@harvardartmuseums/ham');
const nlp = require('compromise');
const storyWriter = require('./story-writer');

let isCached = false;

let api = new HAM(process.env.HAM_APIKEY);

const idList = [300051,227955,337219,354737,299843,257997,227498,291708,232266,217448,94699,272934,342196,351365,302052,101510,230670,222207,55075,299965,336312,288045,201095,230338,343566,299877,149492,206430,50822,296855,54859,288237,337138,273494,359943,205669,303530,   
    352919,365352,202415,208625,362541,169984,217807,376555,371385,371074,372945,209642,303779,195290,223329,288894,201655,202280,297550,308424,297107,374123,336770,219609,183480,54441,222353,303416,181580,359971,225909,374721,369966,51716,373775,228406,303976];

let stats = {};
let lists = {
    facets: {},
    exhibitions: [],
    objects: []
};

async function buildLists() {
      let exhibitionIdList = [];
      let publicationsIdList = [];
    
      const dateOfMuseumOpening = new Date("2014-11-16");
      const now = new Date();
      const daysSinceMuseumOpened = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(dateOfMuseumOpening.getFullYear(), dateOfMuseumOpening.getMonth(), dateOfMuseumOpening.getDate()) ) /(1000 * 60 * 60 * 24));
    
      for (let i=0; i<idList.length; i++) {
        let artwork = await api.Objects.get(idList[i]);

        // get the openai description
        if (artwork.images) {
          let criteria = {
            q: 'source:"Azure OpenAI Service"',
            image: artwork.images[0].imageid
          };
          let annotations = await api.Annotations.search(criteria);
          if (annotations.info.totalrecords > 0) {
            artwork.openai = annotations.records[0].body;
          }
        }
        // get the exhibition ids
        if (artwork.exhibitions) {
          exhibitionIdList = exhibitionIdList.concat(artwork.exhibitions.map(v => v.exhibitionid));
        }
        // get the publication ids
        if (artwork.publications) {
          publicationsIdList = publicationsIdList.concat(artwork.publications.map(v => v.publicationid));
        }
        // calculate the age of the object
        if (artwork.datebegin && artwork.dateend) {
          artwork.age = now.getFullYear() - ((artwork.datebegin + artwork.dateend)/2);
          if (artwork.datebegin !== artwork.dateend) {
            artwork.agequalifier = 'about';
          }
    
          if (artwork.accessionyear) {
            artwork.ageatacquisition = artwork.age - (now.getFullYear() - artwork.accessionyear);
          }
        }
        // calculate the number of previous owners
        artwork.provenancecount = 0;
        if (artwork.provenance) {
          // try to count the number of entries in the provenance description
          artwork.provenancecount = (artwork.provenance.match(/\r\n/g) || []).length;
    
          let doc = nlp(artwork.provenance);
          artwork.provenance = {
            text: artwork.provenance,
            topics: doc.topics().people().json()
          };
        }
        // calculate the object popularity
        artwork.popularity = 0;
    
    
        // try to extract the dimensions of the painting only (not frame)
        if (artwork.dimensions) {
          let endIndex = artwork.dimensions.indexOf("framed");
          if (endIndex !== -1) {
            // Extract the content before "framed" 
            artwork.dimNoFrame = artwork.dimensions.substring(0, endIndex);
          } else {
            endIndex = artwork.dimensions.indexOf("frame");
            if (endIndex !== -1){
              artwork.dimNoFrame = artwork.dimensions.substring(0, endIndex);
            }
          }
        }

        // split hex colors to rgb
        if (artwork.colors) {
            let max = 0;
            artwork.colors.forEach(c => {
                c.percentScaled = Math.floor(c.percent*1000000);
                max += c.percentScaled;
            });
        
            artwork.colors.forEach(c => {
                c.percentRounded = Math.floor(Math.abs((((c.percentScaled - 0) * (100 - 1)) / (max - 0)) + 1));
                // colors.map(c => (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin; )
        
                let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c.color);
                c.r = parseInt(result[1], 16);
                c.g = parseInt(result[2], 16);
                c.b = parseInt(result[3], 16)
            });
        }

        // fetch details about the gallery
        if (artwork.gallery) {
          // calculate the # of days on view
          const dt1 = new Date(artwork.gallery.begindate);
          artwork.gallery.age = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
    
          let gallery = await api.Galleries.get(artwork.gallery.galleryid);
          artwork.gallery.details = gallery; // can add gallery to line 46
        }

        // fetch activities for the object
        artwork.activity = await getObjectActivityByYear(artwork.objectid);

        const stories = storyWriter(artwork);
        artwork.stories = Object.assign({}, stories);

        // append a "pretty print" version of the raw JSON; use to display the JSON directly on a web page
        artwork.raw = JSON.stringify(artwork, null, "\t");

        // update the object record in the list with the complete record we just built
        lists.objects.push(artwork);
    }

    // build facets
    publicationsIdList = [...new Set(publicationsIdList)];
    
    // object facets
    let criteria = {
        'id': lists.objects.map(v => v.objectid).join("|"),
        'size': 0,
        'fields': 'id'
    };
    let aggs = {
        "by_classification": {
            "terms": {
            "field": "classification.exact",
            "size": 100
            }
        },
        "by_division": {
            "terms": {
            "field": "division",
            "size": 5
            }
        },
        "by_technique": {
            "terms": {
            "field": "technique",
            "size": 100
            }
        }
    };
    let objects = await api.Objects.search(criteria, aggs);    
    lists.facets = objects.aggregations;

    // exhibition venue facets
    exhibitionIdList = [...new Set(exhibitionIdList)];
    criteria = {
      'id': exhibitionIdList.join("|"),
      'size': 0
    };
    aggs = {
      "venues": {
          "nested": {
              "path": "venues"
          },
          "aggs": {
              "by_city": {
                  "terms": {
                      "field": "venues.city",
                      "size": 100
                  }
              },
              "by_country": {
                  "terms": {
                      "field": "venues.country",
                      "size": 100
                  }
              }
          }
      }
    };
    let exhibitions = await api.Exhibitions.search(criteria, aggs);
    lists.facets.venues = exhibitions.aggregations.venues;
      

    // build stats
    let totalAge = lists.objects.reduce((a,c) => a + c.age, 0);
    let totalPageViews = lists.objects.reduce((a,c) => a + c.totalpageviews, 0);
    let totalPublications = lists.objects.reduce((a,c) => a + c.publicationcount, 0);
    let totalExhibitions = lists.objects.reduce((a,c) => a + c.exhibitioncount, 0);
    stats = {
        totalrecords: lists.objects.length,
        totalpageviews: totalPageViews,
        totalage: totalAge,
        totalexhibitions: totalExhibitions,
        totalpublications: totalPublications
    };

    let data = await api.Objects.search({size: 0, fields: "id", q: "accesslevel:1"});
    stats.totalsizeofham = data.info.totalrecords;

    isCached = true;
}

async function getObjectActivityByYear(objectid) {
    let now = new Date();
      
    let aggActivities = {
      "activities": {
        "terms": { 
          "field": "activitytype",
          "size": 10
        },
        "aggs": {
          "by_year": {
            "date_histogram": {
              "field": "date",
              "interval": "year",
              "format": "yyy",
              "min_doc_count": 0,
              "extended_bounds": {
                "min": "2009",
                "max": now.getFullYear().toString() 
              }
            },
            "aggs": {
              "totals": {
                "sum": {
                  "field": "activitycount"
                }
              }
            }
          }
        }
      }
    };    

    let q = {
        'size': 0,
        'object': objectid
    };
    
    let data = await api.Activities.search(q, aggActivities)
    return data.aggregations.activities.buckets;    
}

async function getLists() {
    if (!isCached) {
        await buildLists();
    }
    return lists;
}

async function getStats() {
    if (!isCached) {
        await buildLists();
    }
    return stats; 
}

module.exports = {
    getLists: getLists, 
    getStats: getStats
};