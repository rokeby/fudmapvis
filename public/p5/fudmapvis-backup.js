const key = 'pk.eyJ1Ijoicm9rZWJ5IiwiYSI6ImNrZWViMjYzdDBqcjUzMm1sZ2IzdmxvdXMifQ.ZQFCehPe0Z7IRpR3k6vlKQ';

const mappa = new Mappa('MapboxGL', key);
let myMap;
let canvas;
let hurricanes;
const geoJSONlatlong = []
const zoom = 8

function preload() {

  // d3.json(
  //     'http://server.fud.global/hurricane',
  //     function (err, data) {
  //       if (err) throw err;
  //       var data = data
  //       console.log("setup", data)

  // })  


}

function setup() {

  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block')
  canvas.parent('mapvis');

  d3.json(
      'http://server.fud.global/hurricane',
      function (err, data) {
        if (err) throw err;
      console.log("setup", data)
  

      const options = {
        lat: data[0].geometry.coordinates[0],
        lng: data[0].geometry.coordinates[1],
        zoom: zoom,
        studio: true, // false to use non studio styles
        style: 'mapbox://styles/rokeby/ckfvgjjsy6vkw19mkij8g9v3c',
        pitch: 50,
        bearing: 0,
        // style: 'mapbox://styles/rokeby/ckfzdwcyi058w19s0w40c1i25',
        // style: 'mapbox.dark' //streets, outdoors, light, dark, satellite (for nonstudio)
        // style: 'mapbox://styles/mapbox/satellite-v9',
      };

      myMap = mappa.tileMap(options);
      console.log("setup", myMap)
      myMap.overlay(canvas);
      // you can pass a callback that will execute when the map is loaded and the p5 canvas is ready.
      myMap.overlay(canvas, initiateHurricane);

      let dim = 20;

  })
}

function initiateHurricane () {

  myMap.map.on('load', function () {

    d3.json(

      'http://server.fud.global/hurricane',
      function (err, data) {
        if (err) throw err;

        var coordinates = []
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
        myMap.map.easeTo({ 'center': data[0].geometry.coordinates, 'zoom': zoom });
        myMap.map.setPitch(50);
        myMap.map.dragPan.disable();
        myMap.map.scrollZoom.disable();
        myMap.map.doubleClickZoom.disable();
        myMap.map.touchZoomRotate.disable();
        myMap.map.touchPitch.disable();
        console.log( "initializing on", data[0].geometry.coordinates);
         
        // on a regular basis, add more coordinates from the saved list and update the map
        var i = 0;
        var timer = window.setInterval(function () {

          if (i < data.length) {
            console.log("length is: " + data.length)
            console.log("current coordinates: " + data[i].geometry.coordinates)
            coordinates.push(
              data[i].geometry.coordinates
            );

            // var switchZoom = zoom

            // if (i % 3 == 0) {
            //     // myMap.map.setPitch(50);
            //     switchZoom = 2
            //     console.log( "i is " + i + " and zoom is " + switchZoom)
            //   } else if (i % 4 == 0) {
            //     // myMap.map.setPitch(50);
            //     switchZoom = 8
            //     console.log( "i is " + i + " and zoom is " + switchZoom)
            //   }
              
            console.log(coordinates[i], coordinates[i+1]);

            myMap.map.getSource('trace').setData(data);
            myMap.map.setBearing(bearingBetween(coordinates[i], coordinates[i+1]));
            myMap.map.flyTo({ 'center' : coordinates[i], 'zoom' : zoom, 'speed' : '1', 'curve' : '1',' essential' : 'true',});
            
            const latitude = coordinates[i][0]
            const longitude = coordinates[i][1]
            append(geoJSONlatlong, coordinates[i])
            print(geoJSONlatlong.length)

            // it is necessary to re-calculate the latLngToPixel every step!
            clear()
            var n = 1 // visual thing at every 50th point

            for (let i = 0; i < geoJSONlatlong.length; i += 1) {

              if( i % n == 0) {
                const lat = Number(coordinates[i][0])
                const long = Number(coordinates[i][1])
                const latlong = myMap.latLngToPixel(long, lat)
                drawGradient(latlong.x, latlong.y)
              }    
            }
            i++;
          } else {
            window.clearInterval(timer);
          }
        }, 5000);
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
      fill (130, 100, 43, 0.5)
      ellipse(x, y, 5, 5);
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
