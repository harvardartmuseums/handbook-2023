document.addEventListener("DOMContentLoaded", event => { 
    // animation = new p5(forest);

    // spaceTimeContainer = document.getElementById("spacetime");    
    // spacetime = new SpaceTime(spaceTimeContainer);
    
    // timer = window.setInterval(() => {spacetime.populate();spacetime._eraseColors();},30000);
});

function sortDivsByDataField(dataField, sortDirection) {
    var divContainer = document.getElementById("records"); // Assuming there is a container element with id "div-container"
    var divs = Array.from(divContainer.getElementsByClassName("object")); // Get all the div elements inside the container
    
    // Sort the divs array based on the specified data field and sort direction
    divs.sort(function(a, b) {
      // var dataA = a.dataset[dataField];
      // var dataB = b.dataset[dataField];
      
      // if (sortDirection === 'asc') {
      //   if (dataA < dataB) {
      //     return -1;
      //   }
      //   if (dataA > dataB) {
      //     return 1;
      //   }
      //   return 0;
      // } else if (sortDirection === 'desc') {
      //   if (dataA > dataB) {
      //     return -1;
      //   }
      //   if (dataA < dataB) {
      //     return 1;
      //   }
      //   return 0;
      // }

      var dataA = parseInt(a.dataset[dataField]);
      var dataB = parseInt(b.dataset[dataField]);
      
      if (sortDirection === 'asc') {
        return dataA - dataB;
      } else if (sortDirection === 'desc') {
        return dataB - dataA;
      }
    });
  
    // Append the sorted divs back to the container
    divs.forEach(function(div) {
      divContainer.appendChild(div);
    });
}

sparkline = (w, h, data) => {
  let d = data[0].by_year.buckets.map(v => {return v.totals.value});

  return Plot.plot({
    style: {display: "inline", marginBottom: -1},
    marks: [
      Plot.lineY(d)
    ],
    height: h,
    width: w,
    x: {axis: null}, y: {axis: null},
    marginTop: 1, // 🌶 if you don't set the margins, the defaults flip the scales bottom-up
    marginBottom: 1,
    marginLeft: 1,
    marginRight: 1,
  })
};

multiseries = (w, h, data) => {
  let d = [];
  data.objects.buckets.forEach(bucket => (
      d = d.concat(bucket.by_year.buckets.map(b => (
            {object: bucket.key, year: parseInt(b.key_as_string), total: b.totals.value}
          )
        )
      )
  )
  );
// [{object: 2344, year: 2023, total: 1220}]
 
return Plot.plot({
    style: {display: "inline", marginBottom: -1},
    marks: [
      Plot.lineY(d, {x: "year", y: "total", z: "object"}),
    ],
    height: h,
    width: w,
    x: {}, 
    y: {},
    marginTop: 1, // 🌶 if you don't set the margins, the defaults flip the scales bottom-up
    marginBottom: 50,
    marginLeft: 50,
    marginRight: 1,
  })
};