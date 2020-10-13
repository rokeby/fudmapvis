const key = 'pk.eyJ1Ijoicm9rZWJ5IiwiYSI6ImNrZWViMjYzdDBqcjUzMm1sZ2IzdmxvdXMifQ.ZQFCehPe0Z7IRpR3k6vlKQ';

const mappa = new Mappa('MapboxGL', key);
let myMap;
let canvas;
let hurricanes;
const geoJSONlatlong = []
const zoom = 6
let preJSON
let a = []
let array = []
let latlong = []
let dim = 100
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

}


async function drawMap() {

  const response = await fetch('http://server.fud.global/hurricane')
  const data = await response.json();

  let coordinates = []

  for (var i = 0; i < data.length; i++) {
    coordinates.push(data[i].geometry.coordinates)
  }
  console.log("list of coords is", coordinates)

  var latestCoordinate = data[data.length - 1].geometry.coordinates
  var previousCoordinate = data[data.length - 2].geometry.coordinates

  let points = data.length

  // setup the viewport
  myMap.map.flyTo({ 'center': latestCoordinate, 'speed' : '1' });
  myMap.map.setPitch(50);
  console.log( "now centering to", latestCoordinate);

  // myMap.map.getSource('trace').setData(data);
  myMap.map.setBearing(bearingBetween(previousCoordinate, latestCoordinate));
  myMap.map.flyTo({ 'center' : latestCoordinate, 'speed' : '1', 'curve' : '1',' essential' : 'true', 'animate' : 'false'});

  for (var i = 0; i < data.length; i++) {
    const lat = Number(coordinates[i][0])
    const long = Number(coordinates[i][1])
    
    let prevLat = 0
    let prevLong = 0

    if (i > 0) {
      prevLat = Number(coordinates[i - 1][0])
      prevLong = Number(coordinates[i - 1][1])
    }

    latlong = myMap.latLngToPixel(long, lat)
    prevLatlong = myMap.latLngToPixel(prevLong, prevLat)


    lerpX = lerp(latlong.x, prevLatlong.x, 0.5);
    lerpY = lerp(latlong.y, prevLatlong.y, 0.5);

    drawLerpDots(lerpX, lerpY)
    drawDots(latlong.x, latlong.y)

  }
  console.log("lerp coords are", lerpX, lerpY)
  console.log("latlong coords are", latlong)
}


function drawLerpDots(x, y) {
    ellipse(x, y, 5, 5);
    fill (130, 100, 43, 1)
  }

function drawDots(x, y) {
  ellipse(x, y, 10, 10);
  fill (0, 100, 43, 1)

}


function initiateHurricane () {

  myMap.map.on('load', function () {

    var timer = window.setInterval(function () {
      drawMap();
      clear()
    }, 5000);

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
