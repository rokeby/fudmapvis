// hellloAPI key for Mapbox. Get one here: https://www.mapbox.com/studio/account/tokens/
const key = 'pk.eyJ1Ijoicm9rZWJ5IiwiYSI6ImNrZWViMjYzdDBqcjUzMm1sZ2IzdmxvdXMifQ.ZQFCehPe0Z7IRpR3k6vlKQ';

// Create an instance of Mapbox
const mappa = new Mappa('MapboxGL', key);
let myMap;

let canvas;
let hurricanes;

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
    lat: startlatitude,
    lng: startlongitude,
    zoom: 10,
    studio: true, // false to use non studio styles
    style: 'mapbox://styles/rokeby/ckfvgjjsy6vkw19mkij8g9v3c',
    pitch: 45,
    bearing: -30,
    //style: 'mapbox.dark' //streets, outdoors, light, dark, satellite (for nonstudio)
    // style: 'mapbox://styles/mapbox/satellite-v9',
  };

  // Create a tile map and overlay the canvas on top.
  myMap = mappa.tileMap(options);
  myMap.overlay(canvas);
  // Only redraw the meteorites when the map change and not every frame.
  myMap.onChange(drawHurricaneDots);

  fill('rgba(255,0,0, 0.5)');
  stroke(10);

  print(hurricanes.getRowCount() + " total rows in table");
}

// The draw loop is fully functional but we are not using it for now.
function draw() {}

function drawHurricaneDots() {
  // Clear the canvas
  clear();
  
  let pos = []

  for (let i = 0; i < hurricanes.getRowCount(); i += 1) {
    // Get the lat/lng of each meteorite
    const latitude = Number(hurricanes.getString(i, 'lat'));
    const longitude = Number(hurricanes.getString(i, 'long'));

      // Transform lat/lng to pixel position
      const latlong = myMap.latLngToPixel(latitude, longitude);
      
      // append pixel positions to an array pos
      append(pos, latlong)
      
       ellipse(latlong.x, latlong.y, 50, 50);
      //rect((latlong.x), (latlong.y), (latlong.x + 5), (latlong.y + 5),)
     
      // if(i > 0) {
      //     line(pos[i].x, pos[i].y, pos[i-1].x, pos[i-1].y)
      //     strokeWeight(20)
      //     stroke('#F0F')
      //     smooth()
      // }
  }

   print(pos)    

}
