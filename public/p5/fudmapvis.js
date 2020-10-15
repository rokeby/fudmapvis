const key = 'pk.eyJ1Ijoicm9rZWJ5IiwiYSI6ImNrZWViMjYzdDBqcjUzMm1sZ2IzdmxvdXMifQ.ZQFCehPe0Z7IRpR3k6vlKQ';

const mappa = new Mappa('MapboxGL', key);
let myMap;
let canvas;
let hurricanes;
const geoJSONlatlong = []
const zoom = 6
let preJSON
let array = []
let latlong = []
let dim = 100
let stage = 1
let pitch = 60

//things below this line we are using
const interpNum = 20;
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
  } else {
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
    worldCopyJump: false,
    noWrap: true,
    maxBounds: [ [-180, -85], [180, 85] ],
  }

  myMap = mappa.tileMap(options);
  myMap.overlay(canvas);
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

function drawLine(x1, x2, y1, y2) {
  line(x1, x2,y1,y2);
  colorMode(HSB, 100);  
  stroke(120, 100, 100);
}

function drawBlueLine(x1, x2,y1,y2) {
  line(x1, x2,y1,y2);
  colorMode(RGB, 100);  
  stroke("#00FF00");
}

function drawYellowLine(x1, x2,y1,y2) {
  colorMode(HSB, 100);  
  stroke(60, 100, 100);
  line(x1,x2,y1,y2);
}

function drawDots(iterator, x, y) {
  ellipse(x, y, iterator*30, iterator*25);
  noFill()
  stroke("#00FF00");
}

function updateBearing(coordinates, previousCoordinate, latestCoordinate) {
    if(coordinates.length > 2) {
      myMap.map.setBearing(bearingBetween(previousCoordinate, latestCoordinate));
      // console.log(bearingBetween(previousCoordinate, latestCoordinate));
      // console.log(coordinates.length, previousCoordinate, latestCoordinate)
    } else {
      myMap.map.setBearing(0);
      // console.log(coordinates.length, previousCoordinate, latestCoordinate)
    } 
}

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

        drawYellowLine(x1, y1, x2, y2);
        drawDots(j, x1,y1)
      }
      interpCount++
    } else {
      interpCount = 1
    }
}

function drawTrack(coordinates, previousCoordinate, latestCoordinate) {

  let pixelSnake = []

  for (let i = 1; i < (coordinates.length - 1); i += 1) {

    const pointLat = coordinates[i][0]
    const pointLong = coordinates[i][1]
    // const prevPointLat = coordinates[i-1][0]
    // const prevPointLong = coordinates[i-1][1]

    const pointLatLongPixel = myMap.latLngToPixel(pointLong, pointLat)
    // const prevPointLatLongPixel = await myMap.latLngToPixel(prevPointLong, prevPointLat)


    if (pointLatLongPixel.x > 0 && pointLatLongPixel.x < 2000 && pointLatLongPixel.y > 0 && pointLatLongPixel.y < 2000) {
      pixelSnake.push(pointLatLongPixel)
    } else {
      pixelSnake = []
    }
   }

   for(let i = 1; i < pixelSnake.length; i++) {        
        drawLine(pixelSnake[i].x, pixelSnake[i].y, pixelSnake[i-1].x, pixelSnake[i-1].y)
   }

  if(coordinates.length > 2) {
    drawCanvas(previousCoordinate, latestCoordinate)
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

  myMap.map.setPitch(pitch);
  // console.log( "centering on", latestCoordinate, "in an array of", coordinates.length, ", the last point was", previousCoordinate);
  myMap.map.dragPan.disable();
  myMap.map.scrollZoom.disable();


  if(coordinates.length % 2 == 0) {
    updateBearing(coordinates, previousCoordinate, latestCoordinate)
    myMap.map.jumpTo({ 'center' : latestCoordinate, 'speed' : '1', 'curve' : '1',' essential' : 'true'});
    console.log("switching!", coordinates.length)
  } else if (coordinates.length == 1)  {
    updateBearing(coordinates, previousCoordinate, latestCoordinate)
    myMap.map.jumpTo({ 'center' : latestCoordinate, 'speed' : '1', 'curve' : '1',' essential' : 'true'});
    console.log("switching!", coordinates.length)
  } else if(coordinates.length % 3 == 0) {
    myMap.map.setBearing(0)
    myMap.map.jumpTo({ 'center' : latestCoordinate, 'zoom' : '4', 'essential' : 'true'});
    console.log("zoom to 4!")
  } else if(coordinates.length % 4 == 0) {
    myMap.map.setBearing(180)
    myMap.map.setPitch(0)
    myMap.map.jumpTo({ 'center' : latestCoordinate, 'zoom' : '2', 'essential' : 'true'});
    console.log("switching!", "zoom to 2!")
  } else if(coordinates.length % 5 == 0) {
    myMap.map.jumpTo({ 'center' : latestCoordinate, 'zoom' : zoom, 'essential' : 'true'});
    console.log("switching!", "zoom to default!")
  }

  drawTrack(coordinates, previousCoordinate, latestCoordinate)

}

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
}, 500) // drawMap runs at this interval atm.
  


