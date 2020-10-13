const key = 'pk.eyJ1Ijoicm9rZWJ5IiwiYSI6ImNrZWViMjYzdDBqcjUzMm1sZ2IzdmxvdXMifQ.ZQFCehPe0Z7IRpR3k6vlKQ';

const mappa = new Mappa('MapboxGL', key);
let myMap;
let canvas;
let hurricanes;
const geoJSONlatlong = []
const zoom = 4
let preJSON
let a = []
let array = []

function preload() {

  preJSON = loadJSON('http://server.fud.global/hurricane');

}

function setup() {

  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block');
  canvas.parent('mapvis');

  for (var key in preJSON) {
     if (Array.isArray(preJSON) === false) {
        a.push(preJSON[key]);
     } else {
        console.log("already an array");
     }
  }

  console.log("a is", a)
  console.log("initial coords", a[a.length - 1].geometry.coordinates)
  console.log("a length", a.length)

  const options = {
    lat: a[a.length - 1].geometry.coordinates[1],
    lng: a[a.length - 1].geometry.coordinates[0],
    zoom: zoom,
    studio: true, // false to use non studio styles
    style: 'mapbox://styles/rokeby/ckfvgjjsy6vkw19mkij8g9v3c',
    pitch: 50,
    bearing: bearingBetween(a[a.length - 2].geometry.coordinates, a[a.length - 1].geometry.coordinates),
  };

  myMap = mappa.tileMap(options);
  console.log("setup", myMap)
  myMap.overlay(canvas);
  // you can pass a callback that will execute when the map is loaded and the p5 canvas is ready.
  myMap.overlay(canvas, initiateHurricane);

  let dim = 20;

}

function initiateHurricane () {

  myMap.map.on('load', function () {

    var timer = window.setInterval(function () {

      d3.json(
        'http://server.fud.global/hurricane',
        function (err, data) {
          if (err) throw err;

          var coordinates = []

          let points = data.length
          console.log("length is: " + points)

          // setup the viewport
          myMap.map.jumpTo({ 'center': data[data.length - 1].geometry.coordinates, 'speed' : '1' });
          myMap.map.setPitch(50);

          console.log( "centering to", data[data.length - 1].geometry.coordinates);
           
          // on a regular basis, add more coordinates from the saved list and update the map


              // myMap.map.getSource('trace').setData(data);
              myMap.map.setBearing(bearingBetween(data[data.length - 2].geometry.coordinates, data[data.length - 1].geometry.coordinates));
              myMap.map.jumpTo({ 'center' : data[data.length - 1].geometry.coordinates, 'speed' : '1', 'curve' : '1',' essential' : 'true', 'animate' : 'false'});

              // it is necessary to re-calculate the latLngToPixel every step!
              clear()
            
        }
      );
    }, 1000);

  });
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
