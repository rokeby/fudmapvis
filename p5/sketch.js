// hellloAPI key for Mapbox. Get one here: https://www.mapbox.com/studio/account/tokens/
const key = 'pk.eyJ1Ijoicm9rZWJ5IiwiYSI6ImNrZWViMjYzdDBqcjUzMm1sZ2IzdmxvdXMifQ.ZQFCehPe0Z7IRpR3k6vlKQ';
//



// Create an instance of Mapbox
const mappa = new Mappa('Mapbox', key);
let myMap;

let canvas;
let hurricanes;

function preload() {
	  // Load the data
  hurricanes = loadTable('../data/katrina_latLng_cleaned.csv', 'csv', 'header');
}

function setup() {
  canvas = createCanvas(1200, 700);

  const startlatitude = Number(hurricanes.getString(1, 'lat'));
  const startlongitude = Number(hurricanes.getString(1, 'long'));
  print("first hurricane point is " + startlatitude, + ", " + startlongitude)

  // Options for map
  const options = {
    lat: startlatitude,
    lng: startlongitude,
    zoom: 6,
    studio: true, // false to use non studio styles
    //style: 'mapbox.dark' //streets, outdoors, light, dark, satellite (for nonstudio)
    // style: 'mapbox://styles/rokeby/ckfvgjjsy6vkw19mkij8g9v3c',
    style: 'mapbox://styles/mapbox/satellite-v9',
  };

  // Create a tile map and overlay the canvas on top.
  myMap = mappa.tileMap(options);
  myMap.overlay(canvas);
  // Only redraw the meteorites when the map change and not every frame.
  myMap.onChange(drawHurricaneDots);

  fill('#FF0000');
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

    // Only draw them if the position is inside the current map bounds. We use a
    // Mapbox method to check if the lat and lng are contain inside the current
    // map. This way we draw just what we are going to see and not everything. See
    // getBounds() in https://www.mapbox.com/mapbox.js/api/v3.1.1/l-latlngbounds/
      // Transform lat/lng to pixel position
      const latlong = myMap.latLngToPixel(latitude, longitude);
      append(pos, latlong)
      // Get the size of the meteorite and map it. 60000000 is the mass of the largest
      // meteorite (https://en.wikipedia.org/wiki/Hoba_meteorite)
      //ellipse(latlong.x, latlong.y, 10, 10);
      if(i > 0) {
          line(pos[i].x, pos[i].y, pos[i-1].x, pos[i-1].y)
          strokeWeight(50)
          stroke('#F0F')
      }
  }

  //   for (let i = 0; i < pos.length; i += 1) {
  //   line(pos[i].x, pos[i].y, pos[i+1].x, pos[i+1].y)            
  // }

  

   print(pos)    

}
