const key = 'pk.eyJ1Ijoicm9rZWJ5IiwiYSI6ImNrZWViMjYzdDBqcjUzMm1sZ2IzdmxvdXMifQ.ZQFCehPe0Z7IRpR3k6vlKQ';

const mappa = new Mappa('MapboxGL', key);
let myMap;
let canvas;
let hurricanes;
const geoJSONlatlong = []
const zoom = 8
let preJSON
let a = []
let array = []
let latlong = []
let dim = 100
var stage = 1
  var geojsonPoint = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
        
            ]
        }
    }]
  };

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

  // console.log("a is", a)
  console.log("initial coords", a[a.length - 1].geometry.coordinates)
  // console.log("a length", a.length)

  if( a.length > 2) { 
    bearing = bearingBetween(a[a.length - 2].geometry.coordinates, a[a.length - 1].geometry.coordinates)
    } else {
      bearing = 0
    }

  const options = {
    lat: a[a.length - 1].geometry.coordinates[1],
    lng: a[a.length - 1].geometry.coordinates[0],
    zoom: zoom,
    studio: true, // false to use non studio styles
    style: 'mapbox://styles/rokeby/ckfvgjjsy6vkw19mkij8g9v3c',
    pitch: 50,
    bearing: bearing,
  }

  myMap = mappa.tileMap(options);
  // console.log("setup", myMap)
  myMap.overlay(canvas);
  // you can pass a callback that will execute when the map is loaded and the p5 canvas is ready.
  myMap.overlay(canvas, updateHurricane);
}

function updateHurricane () {
// runs the draw map function at long intervals. this updates data.
  myMap.map.on('load', function () {
    var timer = window.setInterval(function () {
      drawMap();
    }, 5000);
  });
}

async function drawMap() {

  clear()

  const response = await fetch('http://server.fud.global/hurricane')
  const data = await response.json();

  let coordinates = []

  for (var i = 0; i < data.length; i++) {
    coordinates.push(data[i].geometry.coordinates)
  }

  if (data.length > 2) {
    var latestCoordinate = data[data.length - 1].geometry.coordinates
    var previousCoordinate = data[data.length - 2].geometry.coordinates
  }

  myMap.map.easeTo({ 'center': latestCoordinate, 'speed' : '1' });
  myMap.map.setPitch(50);
  console.log( "now centering to", latestCoordinate, "in an array of", data.length, ", the last coordinate was", previousCoordinate);

  // myMap.map.getSource('trace').setData(data);
  myMap.map.setBearing(bearingBetween(previousCoordinate, latestCoordinate));
  myMap.map.easeTo({ 'center' : latestCoordinate, 'speed' : '1', 'curve' : '1',' essential' : 'true'});

  createLine(coordinates)
  // ? createLine() takes data and gets the interpolated points but need a good way for it to draw them. 
  // Should this run outside of drawMap()?
}

function createLine(stuff) {

  geojsonPoint.features[0].geometry.coordinates = [];
  let extentArray = stuff;

  // create a turf linestring based on the polygon coordinates
  const line = turf.lineString(extentArray);

  // convert into a feature collection
  const lineCollection = turf.featureCollection([line]);

  // calculate the total length of the line
  const lineDistance = turf.lineDistance(line);

  // create an empty feature collection
  rectCollection = turf.featureCollection([]);

  // how many points you want along the path (more = smoother animation)
  const rects = 500;

  // calculate the distance between each point on the path
  const segments = lineDistance / rects;

  // what units do you want to use?
  const units = 'kilometers';

  // how quickly do you want to iterate through the points?
  const speedunits = 100;

  // get speed
  const speed = segments*speedunits;

  // based on the number of points...
  for(let i = 0; i <= rects; i++) {

      // calculate point location for each segment
      const pointonline = turf.along(line, (segments * i));

      // push these coordinates to the feature collection we created
      rectCollection.features.push(pointonline);

      // once 'i' equals the number of points then we're done building our line 
      if (i == rects) {
          // console.log('animate');
          console.log("rectCollection is", rectCollection)
      }

      var n = 2;

      // for (var n = 2; n < rectCollection.features.length; n++) {

       var timer = window.setInterval(function () {
               
           if (n < rectCollection.features.length) {

                var lat = rectCollection.features[n].geometry.coordinates[0]
                var long = rectCollection.features[n].geometry.coordinates[1]
                var prevlat = rectCollection.features[n-1].geometry.coordinates[0]
                var prevlong = rectCollection.features[n-1].geometry.coordinates[1]
        
                const latlong = myMap.latLngToPixel(long, lat)
                const prevlatlong = myMap.latLngToPixel(prevlong, prevlat)
        
                x1 = latlong.x
                x2 = prevlatlong.x
                y1 = latlong.y
                y2 = prevlatlong.y
        
                // console.log(x1);
                drawLine(x1, y1, x2, y2)
                // console.log("what the fuck?", latlong, prevlatlong)}
              }
              n++
        }, 100 );
  }

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function drawLine(x1, x2,y1,y2) {
  line(x1, x2,y1,y2)
  stroke("#FF0000")
}

function drawDots(x, y) {
  ellipse(x, y, 10, 10);
  fill (0, 100, 43, 1)
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
