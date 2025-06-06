const key = 'pk.eyJ1IjoiemhleGk5MyIsImEiOiJja2dmandndHMxaG9lMnhxYWF0YjNocnViIn0.gqUbZeC9pipfWHIGXMuh2w';

const mappa = new Mappa('MapboxGL', key);
let myMap;
let canvas;
let hurricanes;
const geoJSONlatlong = []
const zoom = 3
let preJSON
let array = []
let latlong = []
let dim = 100
let stage = 1
let pitch = 50
let mapStyles = {
  "dawn" : "mapbox://styles/zhexi93/ckgfkc4973db419pas4k33ood",
  "day" : "mapbox://styles/zhexi93/ckgfkc4973db419pas4k33ood",
  "dusk" : "mapbox://styles/zhexi93/ckgfkc4973db419pas4k33ood",
  "night" : "mapbox://styles/zhexi93/ckk1soweu2snl17np46j1jqmx",
}

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
  preJSON = loadJSON('https://api.zhexi.info/fud/hurricane');
}

function setup() {

  // must make this into a separate function but for now.. 
  var d = new Date(); // for now
  var hours = d.getHours(); // => 9
  var minutes = d.getMinutes(); // => 9
  // console.log("hours now", hours, "minutes now", minutes)

  var dayPart 

   if ( hours > 3 && hours < 10 ) {
      dayPart = 'dawn' } else if ( hours >= 10 && hours < 16) { 
        dayPart = 'day' } else if ( hours >= 16 && hours < 21 ) {
        dayPart = 'dusk' } else if (hours >= 21 || hours <= 3 ) {
          dayPart = 'night' }


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

  colorMode(RGB, 100);  

  // console.log("initial coords", initialData[initialData.length - 1].geometry.coordinates)

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
    // style: 'mapbox://styles/rokeby/ckfvgjjsy6vkw19mkij8g9v3c',
    style: mapStyles[dayPart],
    pitch: pitch,
    bearing: bearing,
    worldCopyJump: false,
    noWrap: true,
    maxBounds: [ [-180, -85], [180, 85] ],
    touchPitch: false,
  }

  myMap = mappa.tileMap(options);
  myMap.overlay(canvas);

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// function checkTime() {
//   var d = new Date(); // for now
//   var hours = d.getHours(); // => 9
//   var minutes = d.getMinutes(); // => 9
//   console.log("hours now", hours, "minutes now", minutes)

//   var dayPart 

//    if ( hours > 4 && hours < 10 ) {
//       dayPart = 'dawn' } else if ( hours >= 10 && hours < 16) { 
//         dayPart = 'day' } else if ( hours >= 16 && hours < 21 ) {
//         dayPart = 'dusk' } else if (hours >= 21 || hours <= 3 ) {
//           dayPart = 'night' }

//   console.log("the dayPart now is ", dayPart)
// }

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
  stroke(255, 0, 0);
  noFill()
}

function drawBlueLine(x1, x2,y1,y2) {
  line(x1, x2,y1,y2);
  stroke(255, 0, 0);
  noFill()
}

function drawYellowLine(x1, x2,y1,y2) {
  stroke(255, 255, 0);
  line(x1,x2,y1,y2);
  noFill()
}

function drawDots(iterator, x, y) {
  currentZoom = myMap.map.getZoom();
  ellipse(x, y, iterator*(currentZoom * 3), iterator*(currentZoom * 2));
  noFill()
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
        stroke(0, 0, 255);
        drawDots(j, x1,y1)

      }
      interpCount++
    } else {
      interpCount = 1
    }
}

function drawProperties() {
  // console.log(currentData)

  let hurricaneProperties = currentData[currentData.length - 1].properties

  let landfall = hurricaneProperties.landfall
  let verboseStatus = hurricaneProperties.report
  let riskValue = hurricaneProperties.risk
  let windspeed = hurricaneProperties.speed
  let highestRisk = hurricaneProperties.highest_risk

  if (hurricaneProperties.proximity[0] != undefined) {
    let proximateCountry = hurricaneProperties.proximity.country
    let proxLat = hurricaneProperties.proximity[0].lat
    let proxLng = hurricaneProperties.proximity[0].lon
    let proxPlaceName = hurricaneProperties.proximity[0].name

    const proxLatLongPixel = myMap.latLngToPixel(proxLat, proxLng)
    // console.log("there is a proximity to", proxPlaceName, "at", proxLatLongPixel)  
    stroke(255,215,0)
    fill(255,215,0)
    triangle(proxLatLongPixel.x + 5, proxLatLongPixel.y, proxLatLongPixel.x - 5, proxLatLongPixel.y, proxLatLongPixel.x, proxLatLongPixel.y + 5)
    }

    // $("#consoleData").html("current storm is a " + verboseStatus.toLowerCase() + " at " + windspeed + " knots...").css({ "display" : "block"})
    $("#consoleData").html("login")

}

function drawTrack(coordinates, previousCoordinate, latestCoordinate) {

  let pixelSnake = []

  for (let i = 1; i < (coordinates.length - 1); i += 1) {

    const pointLat = coordinates[i][0]
    const pointLong = coordinates[i][1]

    const pointLatLongPixel = myMap.latLngToPixel(pointLong, pointLat)
    // const prevPointLatLongPixel = await myMap.latLngToPixel(prevPointLong, prevPointLat)


    if (pointLatLongPixel.x > 0 && pointLatLongPixel.x < 2000 && pointLatLongPixel.y > 0 && pointLatLongPixel.y < 2000) {
      pixelSnake.push(pointLatLongPixel)
    } else {
      pixelSnake = []
    }
   }

   if (pixelSnake.length >= 1) {
      for(let i = 1; i < pixelSnake.length; i++) {        
        stroke(255, 0, 0);
       drawLine(pixelSnake[i].x, pixelSnake[i].y, pixelSnake[i-1].x, pixelSnake[i-1].y)
        stroke(0, 255, 0);
       ellipse(pixelSnake[0].x, pixelSnake[0].y, 3, 5)
      }}

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
  // myMap.map.dragPan.disable();
  // myMap.map.scrollZoom.disable();
  // myMap.map.doubleClickZoom.disable();
  // myMap.map.touchZoomRotate.disable();

  if(coordinates.length % 2 == 0) {
    updateBearing(coordinates, previousCoordinate, latestCoordinate)
    myMap.map.jumpTo({ 'center' : latestCoordinate });
    // console.log("switching!", coordinates.length)
  } 
  else if (coordinates.length == 1)  {
    updateBearing(coordinates, previousCoordinate, latestCoordinate)
    myMap.map.jumpTo({ 'center' : latestCoordinate });
      // console.log("switching!", coordinates.length)
  } 
  else if (coordinates.length % 3 == 0) {
    myMap.map.setBearing(0)
    myMap.map.jumpTo({ 'center' : latestCoordinate, 'zoom' : '5' });
      // console.log("zoom to 4!")
  } 
  else if (coordinates.length % 4 == 0) {
    myMap.map.setBearing(180)
    myMap.map.setPitch(0)
      myMap.map.jumpTo({ 'center' : latestCoordinate, 'zoom' : '4' });
    // console.log("switching!", "zoom to 2!")
  } 
  else if (coordinates.length % 5 == 0) {
    myMap.map.jumpTo({ 'center' : latestCoordinate, 'zoom' : '2' });
    // console.log("switching!", "zoom to default!")
    }

  drawTrack(coordinates, previousCoordinate, latestCoordinate)
  drawProperties()

}

function newHurricane() {
  // console.log('time for a new hurricane')
}

function newPoint() {
  drawMap();
}

async function listenForNewPoints() {
  const res = await fetch('https://api.zhexi.info/fud/hurricane')
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
}, 600)
  


