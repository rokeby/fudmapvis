const key = 'pk.eyJ1Ijoicm9rZWJ5IiwiYSI6ImNrZWViMjYzdDBqcjUzMm1sZ2IzdmxvdXMifQ.ZQFCehPe0Z7IRpR3k6vlKQ';

const mappa = new Mappa('MapboxGL', key);
let myMap;
let canvas;
let hurricanes;
const geoJSONlatlong = []
const zoom = 7

function setup() {

  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block')
  canvas.parent('mapvis');

  const options = {
    lat: 0,
    lng: 0,
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

}

function initiateHurricane () {

  myMap.map.on('load', function () {

    var timer = window.setInterval(function () {

      d3.json(
        'http://server.fud.global/hurricane',
        function (err, data) {
          if (err) throw err;

          var coordinates = []
          // myMap.map.addSource('trace', { type: 'geojson', data: data });
          // myMap.map.addLayer({
          //   'id': 'trace',
          //   'type': 'line',
          //   'source': 'trace',
          //   'paint': {
          //     'line-color': 'yellow',
          //     'line-opacity': 0.75,
          //     'line-width': 5
          //   }
          // });

          let points = data.length
          console.log("length is: " + points)

          // setup the viewport
          myMap.map.easeTo({ 'center': data[data.length - 1].geometry.coordinates, 'zoom': zoom, 'speed' : '1' });
          myMap.map.setPitch(50);

          console.log( "centering to", data[data.length - 1].geometry.coordinates);
           
          // on a regular basis, add more coordinates from the saved list and update the map


              // myMap.map.getSource('trace').setData(data);
              myMap.map.setBearing(bearingBetween(data[data.length - 2].geometry.coordinates, data[data.length - 1].geometry.coordinates));
              myMap.map.flyTo({ 'center' : data[data.length - 1].geometry.coordinates, 'speed' : '1', 'curve' : '1',' essential' : 'true', 'animate' : 'false'});
              
              // const latitude = coordinates[i][0]
              // const longitude = coordinates[i][1]
              // append(geoJSONlatlong, coordinates[i])
              // print(geoJSONlatlong.length)

              // it is necessary to re-calculate the latLngToPixel every step!
              clear()
            
        }
      );
    }, 1000);

  });
}

// function drawGradient(x, y) {
//   let radius = dim / 2;
//   n = 7;
//   for (let r = radius; r > 0; --r) { 
//     if( r % n == 0) {
//       // from radius downwards, draw a circle and increase hue each time
//       // you want to decrease alpha instead :)
//       noStroke()
//       fill (130, 100, 43, 0.5)
//       ellipse(x, y, 5, 5);
//     }
//   }
// }

// function drawCircle() {
//     noFill() 
//     ellipse(windowWidth / 4, windowHeight / 2, windowHeight / 6, windowHeight / 6)
//     stroke(120, 90, 90, 1)
//     strokeWeight(2)  
// }

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
