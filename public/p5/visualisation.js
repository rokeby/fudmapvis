/**
 * Hurricane Visualization for "The First 10,000 Years"
 * A catastrophe market simulation by Gary Zhexi Zhang and Agnes Cameron
 */

// Configuration options
const VIS_CONFIG = {
  mapboxKey: "pk.eyJ1Ijoicm9rZWJ5IiwiYSI6ImNrZWViMjYzdDBqcjUzMm1sZ2IzdmxvdXMifQ.ZQFCehPe0Z7IRpR3k6vlKQ",
  defaultZoom: 3,
  defaultPitch: 50,
  updateInterval: 1000,
  interpNum: 20, // Number of interpolation points for smooth line drawing
  mapStyles: {
    "dawn": "mapbox://styles/rokeby/ckk1t6qc01c5i17mzvcxt6wvy",
    "day": "mapbox://styles/rokeby/ckgbl5cah1wkv19o2asy4tjb1",
    "dusk": "mapbox://styles/rokeby/ckfvgjjsy6vkw19mkij8g9v3c",
    "night": "mapbox://styles/rokeby/ckfvgjjsy6vkw19mkij8g9v3c"
  },
  apiEndpoint: 'https://api.zhexi.info/fud/hurricane'
};

// Global state variables
let myMap;
let canvas;
let currentData = {};
let interpCount = 1;

// Initialize Mappa
const mappa = new Mappa('MapboxGL', VIS_CONFIG.mapboxKey);

/**
 * Preload hurricane data and initialize visualization
 */
async function preload() {
  try {
    const response = await loadJSON(VIS_CONFIG.apiEndpoint);
    currentData = response;
    setup();
  } catch (error) {
    console.error("Error loading hurricane data:", error);
  }
}

/**
 * Setup the map and canvas
 */
function setup() {
  // Determine time of day for map style
  const dayPart = getTimeOfDay();
  
  // Create canvas and attach to container
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block');
  canvas.parent('mapvis');
  
  // Format data for initial display
  let initialData = formatInitialData();
  
  // Set color mode
  colorMode(RGB, 100);
  
  // Calculate initial bearing
  let bearing = 0;
  if (initialData.length > 2) {
    bearing = bearingBetween(
      initialData[initialData.length - 2].geometry.coordinates,
      initialData[initialData.length - 1].geometry.coordinates
    );
  }
  
  // Set up map options
  const mapOptions = {
    lat: initialData[initialData.length - 1].geometry.coordinates[1],
    lng: initialData[initialData.length - 1].geometry.coordinates[0],
    zoom: VIS_CONFIG.defaultZoom,
    studio: true,
    style: VIS_CONFIG.mapStyles[dayPart],
    pitch: VIS_CONFIG.defaultPitch,
    bearing: bearing,
    worldCopyJump: false,
    noWrap: true,
    maxBounds: [[-180, -85], [180, 85]],
    touchPitch: false
  };
  
  // Create map and overlay canvas
  myMap = mappa.tileMap(mapOptions);
  myMap.overlay(canvas);
}

/**
 * Handle window resize
 */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/**
 * Determine time of day for map styling
 * @returns {string} Time of day: dawn, day, dusk, or night
 */
function getTimeOfDay() {
  const hours = new Date().getHours();
  
  if (hours > 3 && hours < 10) {
    return 'dawn';
  } else if (hours >= 10 && hours < 16) {
    return 'day';
  } else if (hours >= 16 && hours < 21) {
    return 'dusk';
  } else {
    return 'night';
  }
}

/**
 * Format initial data for visualization
 * @returns {Array} Formatted initial data
 */
function formatInitialData() {
  let initialData = [];
  
  if (Array.isArray(currentData)) {
    return currentData;
  }
  
  for (const key in currentData) {
    initialData.push(currentData[key]);
  }
  
  return initialData;
}

/**
 * Calculate bearing between two coordinates
 * @param {Array} coordinate1 Starting coordinate [lng, lat]
 * @param {Array} coordinate2 Ending coordinate [lng, lat]
 * @returns {number} Bearing in degrees
 */
function bearingBetween(coordinate1, coordinate2) {
  const point1 = {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [coordinate1[0], coordinate1[1]]
    }
  };
  
  const point2 = {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [coordinate2[0], coordinate2[1]]
    }
  };
  
  return turf.bearing(point1, point2);
}

/**
 * Draw a red line
 */
function drawLine(x1, y1, x2, y2) {
  stroke(255, 0, 0);
  line(x1, y1, x2, y2);
  noFill();
}

/**
 * Draw a yellow line
 */
function drawYellowLine(x1, y1, x2, y2) {
  stroke(255, 255, 0);
  line(x1, y1, x2, y2);
  noFill();
}

/**
 * Draw dots with size scaled by zoom level
 */
function drawDots(iterator, x, y) {
  const currentZoom = myMap.map.getZoom();
  ellipse(x, y, iterator * (currentZoom * 3), iterator * (currentZoom * 2));
  noFill();
}

/**
 * Update map bearing based on hurricane movement
 */
function updateBearing(coordinates, previousCoordinate, latestCoordinate) {
  if (coordinates.length > 2) {
    myMap.map.setBearing(bearingBetween(previousCoordinate, latestCoordinate));
  } else {
    myMap.map.setBearing(0);
  }
}

/**
 * Draw interpolated canvas between points
 */
function drawCanvas(startPoint, endPoint) {
  // Create a line between the two points
  const line = turf.lineString([startPoint, endPoint]);
  const lineLength = turf.lineDistance(line);
  
  // Create points along the line for interpolation
  const segments = lineLength / VIS_CONFIG.interpNum;
  let interpolatedPoints = [];
  
  // Generate interpolated points
  for (let i = 0; i <= VIS_CONFIG.interpNum; i++) {
    const pointOnLine = turf.along(line, (segments * i));
    interpolatedPoints.push(pointOnLine);
  }
  
  // Draw the interpolated points
  if (interpCount < interpolatedPoints.length) {
    for (let j = 1; j < interpCount; j++) {
      const lat = interpolatedPoints[j].geometry.coordinates[0];
      const long = interpolatedPoints[j].geometry.coordinates[1];
      const prevLat = interpolatedPoints[j-1].geometry.coordinates[0];
      const prevLong = interpolatedPoints[j-1].geometry.coordinates[1];
      
      const latLong = myMap.latLngToPixel(long, lat);
      const prevLatLong = myMap.latLngToPixel(prevLong, prevLat);
      
      const x1 = latLong.x;
      const y1 = latLong.y;
      const x2 = prevLatLong.x;
      const y2 = prevLatLong.y;
      
      drawYellowLine(x1, y1, x2, y2);
      stroke(255, 40, 0);
      drawDots(j, x1, y1);
    }
    interpCount++;
  } else {
    interpCount = 1;
  }
}

/**
 * Draw hurricane properties visualization
 */
function drawProperties() {
  if (!currentData || currentData.length === 0) return;
  
  const hurricaneProperties = currentData[currentData.length - 1].properties;
  
  // Display nearby locations if available
  if (hurricaneProperties.proximity && hurricaneProperties.proximity[0]) {
    const proximity = hurricaneProperties.proximity[0];
    const proxLatLongPixel = myMap.latLngToPixel(
      proximity.lat, 
      proximity.lon
    );
    
    // Draw proximity marker
    stroke(255, 215, 0);
    fill(255, 215, 0);
    triangle(
      proxLatLongPixel.x + 5, proxLatLongPixel.y,
      proxLatLongPixel.x - 5, proxLatLongPixel.y,
      proxLatLongPixel.x, proxLatLongPixel.y + 5
    );
  }
}

/**
 * Draw hurricane track
 */
function drawTrack(coordinates, previousCoordinate, latestCoordinate) {
  let pixelCoordinates = [];
  
  // Convert geographic coordinates to pixel coordinates
  for (let i = 1; i < (coordinates.length - 1); i += 1) {
    const pointLat = coordinates[i][0];
    const pointLong = coordinates[i][1];
    const pointPixel = myMap.latLngToPixel(pointLong, pointLat);
    
    // Only include visible points
    if (pointPixel.x > 0 && pointPixel.x < 2000 && 
        pointPixel.y > 0 && pointPixel.y < 2000) {
      pixelCoordinates.push(pointPixel);
    }
  }
  
  // Draw track line
  if (pixelCoordinates.length >= 1) {
    for (let i = 1; i < pixelCoordinates.length; i++) {
      stroke(255, 0, 0);
      drawLine(
        pixelCoordinates[i].x, 
        pixelCoordinates[i].y, 
        pixelCoordinates[i-1].x, 
        pixelCoordinates[i-1].y
      );
      
      // Draw starting point
      stroke(0, 255, 0);
      ellipse(pixelCoordinates[0].x, pixelCoordinates[0].y, 3, 5);
    }
  }
  
  // Draw the interpolated path between the last two points
  if (coordinates.length > 2) {
    drawCanvas(previousCoordinate, latestCoordinate);
  }
}

/**
 * Update and draw the map visualization
 */
function drawMap() {
  clear();
  
  if (!currentData || currentData.length === 0) return;
  
  // Extract coordinates
  let coordinates = [];
  for (let i = 0; i < currentData.length; i++) {
    coordinates.push(currentData[i].geometry.coordinates);
  }
  
  // Get latest and previous coordinates
  let latestCoordinate, previousCoordinate;
  if (currentData.length > 2) {
    latestCoordinate = currentData[currentData.length - 1].geometry.coordinates;
    previousCoordinate = currentData[currentData.length - 2].geometry.coordinates;
  }
  
  // Set up map view
  myMap.map.setPitch(VIS_CONFIG.defaultPitch);
  disableMapInteractions();
  
  // Update map position based on coordinates count
  updateMapPosition(coordinates, latestCoordinate, previousCoordinate);
  
  // Draw the hurricane track
  drawTrack(coordinates, previousCoordinate, latestCoordinate);
  
  // Draw additional properties
  drawProperties();
}

/**
 * Disable map interactions to prevent user manipulation
 */
function disableMapInteractions() {
  myMap.map.dragPan.disable();
  myMap.map.scrollZoom.disable();
  myMap.map.doubleClickZoom.disable();
  myMap.map.touchZoomRotate.disable();
}

/**
 * Update map position based on coordinate count
 * Creates interesting camera movements at different points in the hurricane path
 */
function updateMapPosition(coordinates, latestCoordinate, previousCoordinate) {
  if (!latestCoordinate) return;
  
  // Different camera behaviors based on coordinate count
  if (coordinates.length % 2 === 0) {
    // Even count - update bearing and center
    updateBearing(coordinates, previousCoordinate, latestCoordinate);
    myMap.map.jumpTo({ 'center': latestCoordinate });
  } 
  else if (coordinates.length === 1) {
    // First point - initial view
    updateBearing(coordinates, previousCoordinate, latestCoordinate);
    myMap.map.setPitch(30);
    myMap.map.jumpTo({ 'center': latestCoordinate });
  } 
  else if (coordinates.length % 3 === 0) {
    // Every third point - zoom in
    myMap.map.setBearing(0);
    myMap.map.jumpTo({ 'center': latestCoordinate, 'zoom': 7 });
  } 
  else if (coordinates.length % 4 === 0) {
    // Every fourth point - top-down view, zoomed out
    myMap.map.setBearing(180);
    myMap.map.setPitch(0);
    myMap.map.jumpTo({ 'center': latestCoordinate, 'zoom': 4 });
  } 
  else if (coordinates.length % 5 === 0) {
    // Every fifth point - steep angle, medium zoom
    myMap.map.setPitch(60);
    myMap.map.jumpTo({ 'center': latestCoordinate, 'zoom': 5 });
  }
}