let express = require('express');
let router = express.Router();
const HAM = require('@harvardartmuseums/ham');
const selected = require('../libs/selected');

let api = new HAM(process.env.HAM_APIKEY);
let lists;

router.get('/stats', async function(req, res, next) {
  stats = await selected.getStats();

  res.json(stats)
});

router.get('/facets', async function(req, res, next) {
  lists = await selected.getLists();

  res.json(lists.facets)
});

router.get('/selection', async function(req, res, next) {
  lists = await selected.getLists();

  res.json(lists.objects)
});

router.get('/activities', async function(req, res, next) {
  lists = await selected.getLists();
  let criteria = {
    'object': lists.objects.map(v => v.objectid).join("|"),
    'size': 0
  };
  
  let now = new Date();  
  let aggActivities = {
    "objects": {
      "terms": { 
        "field": "objectid",
        "size": 100
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

  let activities = await api.Activities.search(criteria, aggActivities);
  res.json(activities);
});

router.get('/:endpoint', async function(req, res, next) {
    let qs = {
        parameters: {},
        aggregations: {}
    };

    for (var param in req.query) {
        if (param == 'aggregation') {
            qs.aggregations = JSON.parse(req.query[param]);
        } else {
            qs.parameters[param] = req.query[param];
        }
    }

    let results = await api.search(req.params.endpoint, qs.parameters, qs.aggregations);
    res.json(results);
});

router.get('/:endpoint/:id', async function(req, res, next) {
    let results = await api.get(req.params.endpoint, req.params.id);
    res.json(results);
});

module.exports = router;