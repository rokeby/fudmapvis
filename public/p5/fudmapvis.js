const key = 'pk.eyJ1Ijoicm9rZWJ5IiwiYSI6ImNrZWViMjYzdDBqcjUzMm1sZ2IzdmxvdXMifQ.ZQFCehPe0Z7IRpR3k6vlKQ';

const mappa = new Mappa('MapboxGL', key);
let myMap;
let canvas;
let hurricanes;
const geoJSONlatlong = []
const zoom = 8
let preJSON
let array = []
let latlong = []
let dim = 100
let stage = 1
let pitch = 50

//things below this line we are using
const interpNum = 50;
let interpCount = 1

let currentData = {}
let geojsonPoint = {
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

  let initialData = []

  for (var key in preJSON) {
     if (Array.isArray(preJSON) === false) {
        initialData.push(preJSON[key]);
     } else {
        console.log("already an array");
     }
  }

  console.log("initial coords", initialData[initialData.length - 1].geometry.coordinates)

  if (initialData.length > 2) { 
    bearing = bearingBetween(initialData[initialData.length - 2].geometry.coordinates, 
      initialData[initialData.length - 1].geometry.coordinates)
  } 

  else {
      bearing = 0
  }

  const options = {
    lat: initialData[initialData.length - 1].geometry.coordinates[1],
    lng: initialData[initialData.length - 1].geometry.coordinates[0],
    zoom: zoom,
    studio: true, // false to use non studio styles
    style: 'mapbox://styles/rokeby/ckfvgjjsy6vkw19mkij8g9v3c',
    pitch: pitch,
    bearing: bearing,
  }

  myMap = mappa.tileMap(options);
  myMap.overlay(canvas);

  // you can pass a callback that will execute when the map is loaded and the p5 canvas is ready.
  // myMap.overlay(canvas, updateHurricane);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function drawLine(x1, x2,y1,y2) {
  line(x1, x2,y1,y2)
  stroke("#00FF00")
}

function drawBlueLine(x1, x2,y1,y2) {
  line(x1, x2,y1,y2)
  stroke("#0000FF")
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

// function updateHurricane () {
// // runs the draw map function at long intervals. this updates data.
//   myMap.map.on('load', function () {
//     var timer = window.setInterval(function () {
//       drawMap();
//     }, 5000);
//   });
// }

function drawCanvas(startPoint, endPoint) {

  geojsonPoint.features[0].geometry.coordinates = [];

  const line = turf.lineString([startPoint, endPoint]);
  const lineCollection = turf.featureCollection([line]);
  const lineLength = turf.lineDistance(line);

  // create an empty feature collection
  let rectCollection = turf.featureCollection([]);

  // calculate the distance between each point on the path
  const segments = lineLength / interpNum;

  // based on the number of points...
  for(let i = 0; i <= interpNum; i++) {

      // calculate point location for each segment
      const pointOnLine = turf.along(line, (segments * i));

      // push these coordinates to the feature collection we created
      rectCollection.features.push(pointOnLine);
  }
     
      if (interpCount < rectCollection.features.length) {

          for(let j = 1; j < interpCount; j++) {

          var lat = rectCollection.features[j].geometry.coordinates[0]
          var long = rectCollection.features[j].geometry.coordinates[1]
          var prevlat = rectCollection.features[j-1].geometry.coordinates[0]
          var prevlong = rectCollection.features[j-1].geometry.coordinates[1]

          const latlong = myMap.latLngToPixel(long, lat)
          const prevlatlong = myMap.latLngToPixel(prevlong, prevlat)

          x1 = latlong.x
          x2 = prevlatlong.x
          y1 = latlong.y
          y2 = prevlatlong.y

          drawLine(x1, y1, x2, y2);
          // drawDots(x1,y1)
        }
      interpCount++
    } else {
      interpCount = 1
    }
}

function drawMap() {
  clear()
  let coordinates = []

  for (var i = 0; i < currentData.length; i++) {
    coordinates.push(currentData[i].geometry.coordinates)
  }

  if (currentData.length > 2) {
    var latestCoordinate = currentData[currentData.length - 1].geometry.coordinates
    var previousCoordinate = currentData[currentData.length - 2].geometry.coordinates
  }

  myMap.map.jumpTo({ 'center': latestCoordinate, 'speed' : '1' });
  myMap.map.setPitch(pitch);
  // console.log( "centering on", latestCoordinate, "in an array of", coordinates.length, ", the last point was", previousCoordinate);

  if(coordinates.length > 2) {
    myMap.map.setBearing(bearingBetween(previousCoordinate, latestCoordinate));
    // console.log(coordinates.length, previousCoordinate, latestCoordinate)
  } else {
    myMap.map.setBearing(0);
    // console.log(coordinates.length, previousCoordinate, latestCoordinate)
  } 
  myMap.map.jumpTo({ 'center' : latestCoordinate, 'speed' : '1', 'curve' : '1',' essential' : 'true'});

  // console.log(coordinates)

  // mapBounds = myMap.map.getBounds();
  // mylnglat = [40.6, -61.1]

  // console.log(mapBounds._ne.lng, mapBounds._ne.lat, inBounds(mapBounds, mylnglat));

  // pointNE = [bounds._ne.lat, bounds._ne.lng]
  // pointSW = [bounds._sw.lat, bounds._sw.lng]

  // var line = turf.lineString([pointNE, pointSW])
  // var bboxBound = turf.bbox(line)
  // var polygonBound = turf.bboxPolygon(bboxBound)
  // var polygonBoundPoints = turf.polygon([polygonBound.geometry.coordinates[0]])

  // console.log(coordinates[coordinates.length-1])
  // console.log(polygonBoundPoints)
  // console.log(polygonBound)
  // console.log(turf.booleanPointInPolygon(turf.point([40.6, -61.1]), polygonBoundPoints))
  // console.log(turf.booleanPointInPolygon(turf.point(coordinates[0]), polygonBoundPoints))
  // console.log(polygonBound.geometry.coordinates[0])

  // for (let k = 1; k < polygonBound.geometry.coordinates[0].length - 1; k ++) {
  //     const pointLat = polygonBound.geometry.coordinates[0][k][0]
  //     const pointLong = polygonBound.geometry.coordinates[0][k][1]
  //     const prevPointLat = polygonBound.geometry.coordinates[0][k-1][1]
  //     const prevPointLong = polygonBound.geometry.coordinates[0][k-1][1]

  //     const pointLatLong = myMap.latLngToPixel(pointLong, pointLat)
  //     const prevPointLatLong = myMap.latLngToPixel(prevPointLong, prevPointLat)
  //     drawLine(pointLatLong.x, pointLatLong.y, prevPointLatLong.x, prevPointLatLong.y)

  //   }

  let pointsToDraw = []

  for (let i = 1; i < (coordinates.length - 1); i += 1) {

    // if (turf.booleanPointInPolygon(turf.point(coordinates[i]), polygonBound) === true ) {
    //   pointsToDraw.push(coordinates[i])
    //   console.log("it's true!")
    //   // console.log(pointsToDraw)
    // }

      const pointLat = coordinates[i][0]
      const pointLong = coordinates[i][1]
      const prevPointLat = coordinates[i-1][0]
      const prevPointLong = coordinates[i-1][1]
      const pointLatLong = myMap.latLngToPixel(pointLong, pointLat)
      const prevPointLatLong = myMap.latLngToPixel(prevPointLong, prevPointLat)

      if (pointLatLong.x < 2000 && pointLatLong.y > -2000 && prevPointLatLong.x < 2000 && prevPointLatLong.y > -2000) {
            drawLine(pointLatLong.x, pointLatLong.y, prevPointLatLong.x, prevPointLatLong.y)
      } else {
        console.log( "this line is too long!" )
      }

      // console.log(pointLatLong.x, pointLatLong.y, prevPointLatLong.x, prevPointLatLong.y)
      // console.log(pointLat, pointLong)
  }

  if(coordinates.length > 2) {
    drawCanvas(previousCoordinate, latestCoordinate)
  }
}


// const inBounds = function (bounds, lnglat) {
//     let lng;

//     const multLng = (lnglat[0] - bounds['_ne']['lng']) * (lnglat[0] - bounds['_sw']['lng']);
//     if (bounds['_ne']['lng'] > bounds['_sw']['lng']) {
//         lng = multLng < 0;
//     } else {
//         lng = multLng > 0;
//     }

//     const lat = (lnglat[1] - bounds['_ne']['lat']) * (lnglat[1] - bounds['_sw']['lat']) < 0;
//     return lng && lat;
// };

function newHurricane() {
  console.log('time for a new hurricane')
}

function newPoint() {
  drawMap();
}

async function listenForNewPoints() {
  const res = await fetch('http://server.fud.global/hurricane')
  const data = await res.json()

  if(data !== currentData){
    if(data.length < currentData.length) {
      currentData = data;
      newHurricane();
    }
    else {
      currentData = data;
      newPoint();
    }
  }
}

window.setInterval( function() {
  listenForNewPoints()     
}, 500)
  



