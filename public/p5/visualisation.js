/**
 * Hurricane Path Visualization
 * 
 * This script visualizes hurricane paths from an API, including
 * - Animated paths with transition effects
 * - Dynamic camera angles based on data points
 * - Proximity indicators to nearby locations
 * - Time-of-day based map styling
 */

// Mapbox configuration
// Use this key for production
const key = "pk.eyJ1Ijoicm9rZWJ5IiwiYSI6ImNrZWViMjYzdDBqcjUzMm1sZ2IzdmxvdXMifQ.ZQFCehPe0Z7IRpR3k6vlKQ"
// const key = process.env.MAPKEY; // Alternative for environment variable

// Map configuration
const mappa = new Mappa('MapboxGL', key);
let myMap;
let canvas;
const zoom = 3;
let preJSON;
let pitch = 50;

// Map styles for different times of day
let mapStyles = {
  "dawn" : "mapbox://styles/rokeby/ckgbku2r52ar219qukmelh6dr",
  "day" : "mapbox://styles/rokeby/ckgbl5cah1wkv19o2asy4tjb1",
  "dusk" : "mapbox://styles/rokeby/ckgbjx2nd0qpj19k5b6tgl69l",
  "night" : "mapbox://styles/rokeby/ckfvgjjsy6vkw19mkij8g9v3c",
}

// Animation and data tracking variables
const interpNum = 20;  // Number of interpolation points between hurricane positions
let interpCount = 1;   // Current interpolation point (used for animation)

// Data storage
let currentData = {};  // Current hurricane data from the API

// GeoJSON template for tracking hurricane path
let geojsonPoint = {
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "geometry": {
      "type": "LineString",
      "coordinates": []
    }
  }]
};

/**
 * Preload hurricane data from API
 * Called automatically by p5.js before setup
 */
async function preload() {
  preJSON = await loadJSON('https://api.zhexi.info/fud/hurricane');
  setup(); // Call setup() only after data is loaded
}

/**
 * Initialize the visualization
 * Called automatically by p5.js after preload
 */
function setup() {
  console.log(preJSON); // Log the loaded data
  
  // Determine time of day for map styling
  var d = new Date();
  var hours = d.getHours();
  var dayPart;
  
  if (hours > 3 && hours < 10) {
    dayPart = 'dawn';
  } else if (hours >= 10 && hours < 16) { 
    dayPart = 'day';
  } else if (hours >= 16 && hours < 21) {
    dayPart = 'dusk';
  } else if (hours >= 21 || hours <= 3) {
    dayPart = 'night';
  }

  // Create canvas for visualization
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block');
  canvas.parent('mapvis');

  // Process the loaded data
  let initialData = [];
  
  // Convert object to array if needed
  for (var key in preJSON) {
    if (Array.isArray(preJSON) === false) {
      initialData.push(preJSON[key]);
    } else {
      console.log("already an array");
    }
  }

  // Set color mode for visualization
  colorMode(RGB, 100);  

  // Calculate initial bearing based on hurricane path
  let bearing = 0;
  if (initialData.length > 2) { 
    bearing = bearingBetween(
      initialData[initialData.length - 2].geometry.coordinates, 
      initialData[initialData.length - 1].geometry.coordinates
    );
  }

  // Configure map options
  const options = {
    lat: initialData[initialData.length - 1].geometry.coordinates[1],
    lng: initialData[initialData.length - 1].geometry.coordinates[0],
    zoom: zoom,
    studio: true,
    style: mapStyles[dayPart],
    pitch: pitch,
    bearing: bearing,
    worldCopyJump: false,
    noWrap: true,
    maxBounds: [[-180, -85], [180, 85]],
    touchPitch: false,
  }

  // Initialize map and overlay canvas
  myMap = mappa.tileMap(options);
  myMap.overlay(canvas);

  // Store initial data for visualization
  currentData = initialData;
}

/**
 * Handle window resize events
 * Adjusts canvas size when window is resized
 */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/**
 * Calculate bearing between two coordinates
 * Used to orient the map along the hurricane path
 * 
 * @param {Array} coordinate1 - Starting coordinate [lon, lat]
 * @param {Array} coordinate2 - Ending coordinate [lon, lat]
 * @return {number} - Bearing in degrees
 */
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

/**
 * Draw a red line between two points
 */
function drawLine(x1, x2, y1, y2) {
  line(x1, x2, y1, y2);
  stroke(255, 0, 0);
  noFill()
}

/**
 * Draw a blue line between two points
 */
function drawBlueLine(x1, x2, y1, y2) {
  line(x1, x2, y1, y2);
  stroke(255, 0, 0);
  noFill()
}

/**
 * Draw a yellow line between two points
 */
function drawYellowLine(x1, x2, y1, y2) {
  stroke(255, 255, 0);
  line(x1, x2, y1, y2);
  noFill()
}

/**
 * Draw circular dots with size based on map zoom level
 * 
 * @param {number} iterator - Current iteration count (affects size)
 * @param {number} x - X position
 * @param {number} y - Y position
 */
function drawDots(iterator, x, y) {
  currentZoom = myMap.map.getZoom();
  ellipse(x, y, iterator*(currentZoom * 3), iterator*(currentZoom * 2));
  noFill()
}

/**
 * Update map bearing based on hurricane path
 * 
 * @param {Array} coordinates - Array of all coordinates
 * @param {Array} previousCoordinate - Previous hurricane position
 * @param {Array} latestCoordinate - Latest hurricane position
 */
function updateBearing(coordinates, previousCoordinate, latestCoordinate) {
  if(coordinates.length > 2) {
    myMap.map.setBearing(bearingBetween(previousCoordinate, latestCoordinate));
  } else {
    myMap.map.setBearing(0);
  } 
}

/**
 * Draw interpolated animation between hurricane positions
 * Creates the fan-out effect of circles between points
 * 
 * @param {Array} startPoint - Starting coordinate [lon, lat]
 * @param {Array} endPoint - Ending coordinate [lon, lat]
 */
function drawCanvas(startPoint, endPoint) {
  // Reset coordinates
  geojsonPoint.features[0].geometry.coordinates = [];

  // Create a line between start and end points
  const line = turf.lineString([startPoint, endPoint]);
  const lineCollection = turf.featureCollection([line]);
  const lineLength = turf.lineDistance(line);

  // Create an empty feature collection for interpolated points
  let rectCollection = turf.featureCollection([]);

  // Calculate the distance between each interpolated point
  const segments = lineLength / interpNum;

  // Generate evenly spaced points along the path
  for(let i = 0; i <= interpNum; i++) {
    // Calculate point location for each segment
    const pointOnLine = turf.along(line, (segments * i));

    // Add these coordinates to the feature collection
    rectCollection.features.push(pointOnLine);
  }

  // Draw the circles with animation based on interpCount
  if (interpCount < rectCollection.features.length) {
    // Draw up to the current interpolation count
    for(let j = 1; j < interpCount; j++) {
      // Get coordinates for current and previous points
      var lat = rectCollection.features[j].geometry.coordinates[0]; 
      var long = rectCollection.features[j].geometry.coordinates[1];
      var prevlat = rectCollection.features[j-1].geometry.coordinates[0];
      var prevlong = rectCollection.features[j-1].geometry.coordinates[1];

      // Convert to pixel coordinates
      const latlong = myMap.latLngToPixel(long, lat);
      const prevlatlong = myMap.latLngToPixel(prevlong, prevlat);

      x1 = latlong.x;
      x2 = prevlatlong.x;
      y1 = latlong.y;
      y2 = prevlatlong.y;

      // Draw yellow lines between points and red circles
      drawYellowLine(x1, y1, x2, y2);
      stroke(255, 40, 0);
      drawDots(j, x1, y1);
    }
    interpCount++; // Increment for animation
  } else {
    interpCount = 1; // Reset animation when complete
  }
}

/**
 * Draw hurricane properties and proximity indicators
 * Shows information about nearby locations
 */
function drawProperties() {
  // Skip if no data
  if (!currentData || currentData.length === 0) return;

  // Get properties from the most recent hurricane position
  let hurricaneProperties = currentData[currentData.length - 1].properties;

  // Extract hurricane information
  let landfall = hurricaneProperties.landfall;
  let verboseStatus = hurricaneProperties.report;
  let riskValue = hurricaneProperties.risk;
  let windspeed = hurricaneProperties.speed;
  let highestRisk = hurricaneProperties.highest_risk;

  // Draw proximity indicators if available
  if (hurricaneProperties.proximity && hurricaneProperties.proximity[0] != undefined) {
    let proxCountry = hurricaneProperties.proximity[0].country;
    let proxLat = hurricaneProperties.proximity[0].lat;
    let proxLng = hurricaneProperties.proximity[0].lon;
    let proxPlaceName = hurricaneProperties.proximity[0].name;
    let proxDistance = hurricaneProperties.proximity[0].distance;
    let proxPop = hurricaneProperties.proximity[0].pop;

    // Convert to pixel coordinates
    const proxLatLongPixel = myMap.latLngToPixel(proxLat, proxLng);
    
    // Draw a yellow triangle at the location
    stroke(255, 215, 0);
    fill(255, 215, 0);
    triangle(
      proxLatLongPixel.x + 5, proxLatLongPixel.y, 
      proxLatLongPixel.x - 5, proxLatLongPixel.y, 
      proxLatLongPixel.x, proxLatLongPixel.y + 5
    );

    // Add city name text
    noStroke();
    fill(255, 255, 255);  // White text
    textSize(13);
    textAlign(CENTER, TOP);
    textFont('Courier');
    text(proxPlaceName, proxLatLongPixel.x, proxLatLongPixel.y + 10);

    // Add distance information
    textSize(13);
    text(Math.round(proxDistance) + " km", proxLatLongPixel.x, proxLatLongPixel.y + 25);

    if (proxDistance < 1000 && proxDistance > 200) {
    $("#consoleData").html(proxPlaceName + ', ' + proxCountry.toUpperCase() + ' is only ' + proxDistance.toFixed(0) + 'km away...');
    // ...
    }


    // Commented out code for displaying location information in console
    // Can be re-enabled if needed
    /*
    if (proxDistance < 400 && proxDistance > 200) {
      $("#consoleData").html(proxPlaceName + ', ' + proxCountry.toUpperCase() + ' is only ' + proxDistance.toFixed(0) + 'km away...');
      setTimeout(function() { 
        setTimeout(function() {
          $("#consoleData").html('');
          }, 5000); 
      }, 3000);
    } else if (proxDistance <= 200 && proxDistance > 0) {
      $("#consoleData").html('only ' + proxDistance.toFixed(0) + "km from " + proxPlaceName + ', ' + proxCountry.toUpperCase() + '...');
      setTimeout(function() { 
        setTimeout(function() {
          $("#consoleData").html('');
          }, 5000);
      }, 3000);
    } else if (landfall == true) {
      $("#consoleData").html('LANDFALL at ' + proxPlaceName + ', ' + proxCountry.toUpperCase() + '!');
      setTimeout(function() { 
        setTimeout(function() {
          $("#consoleData").html('');
          }, 5000); 
      }, 3000);
    }
    */
  }

  // Commented out code for displaying storm information in console
  // $("#consoleData").html("current storm is a " + verboseStatus.toLowerCase() + " at " + windspeed + " knots...").css({ "display" : "block"})
  // $("#console #login").html("info")
}

/**
 * Draw the hurricane track on the map
 * 
 * @param {Array} coordinates - Array of all hurricane coordinates
 * @param {Array} previousCoordinate - Previous hurricane position
 * @param {Array} latestCoordinate - Latest hurricane position
 */
function drawTrack(coordinates, previousCoordinate, latestCoordinate) {
  // Array to store pixel coordinates for drawing
  let pixelSnake = [];

  // Convert geographic coordinates to pixel coordinates
  for (let i = 1; i < (coordinates.length - 1); i += 1) {
    const pointLat = coordinates[i][0];
    const pointLong = coordinates[i][1];
    const pointLatLongPixel = myMap.latLngToPixel(pointLong, pointLat);

    // Only include points that are visible on screen
    if (pointLatLongPixel.x > 0 && pointLatLongPixel.x < 2000 && 
        pointLatLongPixel.y > 0 && pointLatLongPixel.y < 2000) {
      pixelSnake.push(pointLatLongPixel);
    } else {
      pixelSnake = []; // Reset if out of bounds
    }
  }

  // Draw the track if we have points
  if (pixelSnake.length >= 1) {
    for(let i = 1; i < pixelSnake.length; i++) {        
      stroke(255, 0, 0);
      drawLine(pixelSnake[i].x, pixelSnake[i].y, pixelSnake[i-1].x, pixelSnake[i-1].y);
      stroke(0, 255, 0);
      ellipse(pixelSnake[0].x, pixelSnake[0].y, 3, 5);
    }
  }

  // Draw interpolated animation if we have enough points
  if(coordinates.length > 2) {
    drawCanvas(previousCoordinate, latestCoordinate);
  }
}

/**
 * Main function to draw the map and hurricane visualization
 * Called when new data is received
 */
function drawMap() {
  // Clear previous drawing
  clear();

  // Skip if no data
  if (!currentData || currentData.length === 0) return;

  // Extract coordinates from current data
  let coordinates = [];
  for (var i = 0; i < currentData.length; i++) {
    coordinates.push(currentData[i].geometry.coordinates);
  }

  // Get latest and previous coordinates if available
  let latestCoordinate, previousCoordinate;
  if (currentData.length > 2) {
    latestCoordinate = currentData[currentData.length - 1].geometry.coordinates;
    previousCoordinate = currentData[currentData.length - 2].geometry.coordinates;
  }

  // Set map pitch and disable interactions
  myMap.map.setPitch(pitch);
  myMap.map.dragPan.disable();
  myMap.map.scrollZoom.disable();
  myMap.map.doubleClickZoom.disable();
  myMap.map.touchZoomRotate.disable();

  // Update map view based on data point count (creates different camera effects)
  if(coordinates.length % 2 == 0) {
    // Even number of points: Update bearing and center
    updateBearing(coordinates, previousCoordinate, latestCoordinate);
    myMap.map.jumpTo({ 'center': latestCoordinate });
  } 
  else if (coordinates.length == 1)  {
    // Single point: Lower pitch and center
    updateBearing(coordinates, previousCoordinate, latestCoordinate);
    myMap.map.setPitch(30);
    myMap.map.jumpTo({ 'center': latestCoordinate });
  } 
  else if (coordinates.length % 3 == 0) {
    // Divisible by 3: Reset bearing and zoom in
    myMap.map.setBearing(0);
    myMap.map.jumpTo({ 'center': latestCoordinate, 'zoom': '7' });
  } 
  else if (coordinates.length % 4 == 0) {
    // Divisible by 4: Rotate 180 degrees, flatten, and zoom out
    myMap.map.setBearing(180);
    myMap.map.setPitch(0);
    myMap.map.jumpTo({ 'center': latestCoordinate, 'zoom': '4' });
  } 
  else if (coordinates.length % 5 == 0) {
    // Divisible by 5: Steep pitch and medium zoom
    myMap.map.setPitch(60);
    myMap.map.jumpTo({ 'center': latestCoordinate, 'zoom': '5' });
  }

  // Draw the hurricane track and properties
  drawTrack(coordinates, previousCoordinate, latestCoordinate);
  drawProperties();
}

/**
 * Handle creation of a new hurricane
 * Called when data length decreases (indicating a new storm)
 */
function newHurricane() {
  console.log('A new storm has begun');
  
  // Commented out code for showing notification
  // setTimeout(function() {
  //   $("#consoleData").html('a new storm has begun...');
  //   }, 5000);
}

/**
 * Handle addition of a new data point
 * Called when new hurricane position is received
 */
function newPoint() {
  drawMap();
}

/**
 * Check for updates to hurricane data
 * Polls the API and updates visualization when data changes
 */
async function listenForNewPoints() {
  try {
    const res = await fetch('https://api.zhexi.info/fud/hurricane');
    const data = await res.json();

    // Check if data has changed
    if(data !== currentData){
      if(data.length < currentData.length) {
        // Length decrease indicates new hurricane
        currentData = data;
        newHurricane();
      }
      else {
        // Otherwise, new point added to existing hurricane
        currentData = data;
        newPoint();
      }
    }
  } catch (error) {
    console.error("Error fetching hurricane data:", error);
  }
}

// Start polling for data updates every second
window.setInterval(function() {
  listenForNewPoints();     
}, 1000);
