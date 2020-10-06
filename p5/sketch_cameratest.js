// hellloAPI key for Mapbox. Get one here: https://www.mapbox.com/studio/account/tokens/
const key = 'pk.eyJ1Ijoicm9rZWJ5IiwiYSI6ImNrZWViMjYzdDBqcjUzMm1sZ2IzdmxvdXMifQ.ZQFCehPe0Z7IRpR3k6vlKQ';

// Create an instance of Mapbox
const mappa = new Mappa('MapboxGL', key);
let myMap;
let canvas;
let hurricanes;
const geoJSONlatlong = []

function preload() {
	// Load the csv data
  hurricanes = loadTable('../data/katrina_latLng_cleaned.csv', 'csv', 'header');
}

function setup() {
  canvas = createCanvas(1200, 700);

  // establish lat and long for map options (starting position)
  const startlatitude = Number(hurricanes.getString(1, 'lat'));
  const startlongitude = Number(hurricanes.getString(1, 'long'));
  print("first hurricane point is " + startlatitude, + ", " + startlongitude)

  // Options for map
  const options = {
    // all parameters here: https://docs.mapbox.com/mapbox-gl-js/api/map/
    // Then Mapbox GL JS initializes the map on the page and returns your Map object.
    lat: startlatitude,
    lng: startlongitude,
    zoom: 15.5,
    studio: true, // false to use non studio styles
    style: 'mapbox://styles/rokeby/ckfvgjjsy6vkw19mkij8g9v3c',
    pitch: 45,
    bearing: -30,
    //style: 'mapbox.dark' //streets, outdoors, light, dark, satellite (for nonstudio)
    // style: 'mapbox://styles/mapbox/satellite-v9',
    dragPan: false,
  };

  // Create a tile map and overlay the canvas on top.
  myMap = mappa.tileMap(options);
  myMap.overlay(canvas);

  // you can pass a callback that will execute when the map is loaded and the p5 canvas is ready.
  myMap.overlay(canvas, initiateHurricane);

  // fill('rgba(255,0,0, 0.1)');                
  noStroke();
  colorMode(HSB, 360, 100, 100, 1)
  dim = 300;
  ellipseMode(RADIUS);

  print(hurricanes.getRowCount() + " total rows in table");

}

function initiateHurricane () {

  myMap.map.on('load', function () {
  // We use D3 to fetch the JSON here so that we can parse and use it separately
  // from GL JS's use in the added source. You can use any request method (library
  // or otherwise) that you want.

    // d3.csv("../data/katrina_latLng_cleaned.csv",
    //   function (err, data) {
    //     if (err) throw err;
    //     //console.log(data)
        
    //     let pos = []

    //     for (let i = 0; i < hurricanes.getRowCount(); i += 1) {
    //       // Get the lat/lng of each meteorite
    //       const latitude = Number(hurricanes.getString(i, 'lat'));
    //       const longitude = Number(hurricanes.getString(i, 'long'));

    //       // Transform lat/lng to pixel position
    //       const latlong = myMap.latLngToPixel(latitude, longitude);
          
    //       // append pixel positions to an array pos
    //       append(pos, latlong)
              
    //       }
    //     })

    d3.json(
      'https://docs.mapbox.com/mapbox-gl-js/assets/hike.geojson',
      function (err, data) {
        if (err) throw err;
     
        // save full coordinate list for later
        var coordinates = data.features[0].geometry.coordinates;
         
        // start by showing just the first coordinate
        data.features[0].geometry.coordinates = [coordinates[0]];
         
        // add it to the map
        myMap.map.addSource('trace', { type: 'geojson', data: data });
        myMap.map.addLayer({
          'id': 'trace',
          'type': 'line',
          'source': 'trace',
          // 'paint': {
          //   'line-color': 'yellow',
          //   'line-opacity': 0.75,
          //   'line-width': 5
          // }
        });

        // setup the viewport
        myMap.map.jumpTo({ 'center': coordinates[0], 'zoom': 15.5 });
        myMap.map.setPitch(30);
        myMap.map.dragPan.disable();
         
        // on a regular basis, add more coordinates from the saved list and update the map
        var i = 0;
        var timer = window.setInterval(function () {
          if (i < coordinates.length) {
            data.features[0].geometry.coordinates.push(
            coordinates[i]
            );
            myMap.map.getSource('trace').setData(data);
            myMap.map.panTo(coordinates[i]);
            
            // append(geoJSONlatlong, pixellatlong)
            // print(geoJSONlatlong.length)
            const latitude = coordinates[i][0]
            const longitude = coordinates[i][1]
            append(geoJSONlatlong, coordinates[i])
            // print(geoJSONlatlong.length)

            //const pixellatlong = myMap.latLngToPixel(coordinates[i][1], coordinates[i][0])
            // it is necessary to re-calculate the latLngToPixel every step!
            clear()
            var n = 10 // visual thing at every 50th point

            for (let i = 0; i < geoJSONlatlong.length; i += 1) {
              if( i % n == 0) {
                const lat = Number(coordinates[i][0])
                const long = Number(coordinates[i][1])
                const latlong = myMap.latLngToPixel(long, lat)
                drawGradient(latlong.x, latlong.y)
              }
            }

            // why does this ellipse spawn at fixed location, not moving with map?
            // because it is being calculated once, not on change!

            i++;
          } else {
            window.clearInterval(timer);
          }
        }, 10);        
      }
    );
  });
}

function drawGradient(x, y) {
  let radius = dim / 2;
  n = 5;
  for (let r = radius; r > 0; --r) { 
    if( r % n == 0) {
      // from radius downwards, draw a circle and increase hue each time
      // you want to decrease alpha instead :)
      fill (0, 90, 90, 0.005)
      ellipse(x, y, r, r);
    }
  }
}
