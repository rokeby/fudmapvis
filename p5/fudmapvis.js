// hellloAPI key for Mapbox. Get one here: https://www.mapbox.com/studio/account/tokens/
const key = 'pk.eyJ1Ijoicm9rZWJ5IiwiYSI6ImNrZWViMjYzdDBqcjUzMm1sZ2IzdmxvdXMifQ.ZQFCehPe0Z7IRpR3k6vlKQ';

// Create an instance of Mapbox
const mappa = new Mappa('MapboxGL', key);
let myMap;
let canvas;
let hurricanes;
const geoJSONlatlong = []
const zoom = 12

// function preload() {
// 	// Load the csv data
//   hurricanes = loadTable('../data/katrina_latLng_cleaned.csv', 'csv', 'header');
// }

function setup() {
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block')
  canvas.parent('mapvis');

  // establish lat and long for map options (starting position)
  // const startlatitude = Number(hurricanes.getString(1, 'lat'));
  // const startlongitude = Number(hurricanes.getString(1, 'long'));
  // print("first hurricane point is " + startlatitude, + ", " + startlongitude)

  // Options for map
  const options = {
    // all parameters here: https://docs.mapbox.com/mapbox-gl-js/api/map/
    // Then Mapbox GL JS initializes the map on the page and returns your Map object.
    lat: 0,
    lng: 0,
    zoom: zoom,
    studio: true, // false to use non studio styles
    style: 'mapbox://styles/rokeby/ckfvgjjsy6vkw19mkij8g9v3c',
    // style: 'mapbox://styles/rokeby/ckfzdwcyi058w19s0w40c1i25',
    pitch: 50,
    bearing: 0,
    //style: 'mapbox.dark' //streets, outdoors, light, dark, satellite (for nonstudio)
    // style: 'mapbox://styles/mapbox/satellite-v9',
    dragPan: false,
  };

  // Create a tile map and overlay the canvas on top.
  myMap = mappa.tileMap(options);
  myMap.overlay(canvas);

  // you can pass a callback that will execute when the map is loaded and the p5 canvas is ready.
  myMap.overlay(canvas, initiateHurricane);

  noStroke();
  colorMode(HSB, 360, 100, 100, 1)
  dim = 200;
  ellipseMode(RADIUS);

}

function initiateHurricane () {

  myMap.map.on('load', function () {

    d3.json(
      '../data/katrina.geojson',
      function (err, data) {
        if (err) throw err;
     
        // save full coordinate list for later
        var coordinates = data.features[0].geometry.coordinates;
        print(coordinates)
         
        // start by showing just the first coordinate
        coordinateOne = [coordinates[0]];
        coordinateTwo = [coordinates[1]];

        // add it to the map
        myMap.map.addSource('trace', { type: 'geojson', data: data });
        myMap.map.addLayer({
          'id': 'trace',
          'type': 'line',
          'source': 'trace',
          'paint': {
            'line-color': 'yellow',
            'line-opacity': 0.75,
            'line-width': 5
          }
        });

        // setup the viewport
        myMap.map.jumpTo({ 'center': coordinates[0], 'zoom': zoom });
        myMap.map.setPitch(50);
        // myMap.map.setBearing(bearingBetween(coordinates[0], coordinates[1]));
        // myMap.map.dragPan.disable();
        // myMap.map.scrollZoom.disable();
         
        // on a regular basis, add more coordinates from the saved list and update the map
        var i = 0;
        var timer = window.setInterval(function () {

          // drawCircle();

          if (i < coordinates.length) {
            data.features[0].geometry.coordinates.push(
              coordinates[i]
            );

            myMap.map.getSource('trace').setData(data);
            myMap.map.setBearing(bearingBetween(coordinates[i], coordinates[i+1]));
            myMap.map.panTo(coordinates[i]);
            console.log(coordinates[i])
            
            // const latitude = coordinates[i][0]
            // const longitude = coordinates[i][1]
            // append(geoJSONlatlong, coordinates[i])
            // print(geoJSONlatlong.length)

            //const pixellatlong = myMap.latLngToPixel(coordinates[i][1], coordinates[i][0])
            // it is necessary to re-calculate the latLngToPixel every step!
            clear()
            // var n = 10 // visual thing at every 50th point

            // for (let i = 0; i < geoJSONlatlong.length; i += 1) {
              
            //   // drawCircle();

            //   if( i % n == 0) {
            //     const lat = Number(coordinates[i][0])
            //     const long = Number(coordinates[i][1])
            //     const latlong = myMap.latLngToPixel(long, lat)
            //     drawGradient(latlong.x, latlong.y)
            //   }    
            // }
            i++;
          } else {
            window.clearInterval(timer);
          }
        }, 1000);
      }
    );
  });
}

function drawGradient(x, y) {
  let radius = dim / 2;
  n = 7;
  for (let r = radius; r > 0; --r) { 
    if( r % n == 0) {
      // from radius downwards, draw a circle and increase hue each time
      // you want to decrease alpha instead :)
      noStroke()
      fill (130, 100, 43, 0.02)
      ellipse(x, y, r*2, r*2);
    }
  }
}

function drawCircle() {
    noFill() 
    ellipse(windowWidth / 4, windowHeight / 2, windowHeight / 6, windowHeight / 6)
    stroke(120, 90, 90, 1)
    strokeWeight(2)  
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function bearingBetween(coordinate1, coordinate2) {
  var point1 = {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [coordinate1[0], coordinate1[1]]
    }
  };
  var point2 = {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [coordinate2[0], coordinate2[1]]
    }
  };
  return turf.bearing(point1, point2);
}
