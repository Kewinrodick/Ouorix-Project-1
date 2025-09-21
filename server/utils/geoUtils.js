/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if a point is inside a polygon
 * @param {number} lat - Latitude of the point
 * @param {number} lon - Longitude of the point
 * @param {Array} polygon - Array of [lat, lon] coordinates defining the polygon
 * @returns {boolean} True if point is inside polygon
 */
function isPointInPolygon(lat, lon, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (((polygon[i][0] > lat) !== (polygon[j][0] > lat)) &&
      (lon < (polygon[j][1] - polygon[i][1]) * (lat - polygon[i][0]) / (polygon[j][0] - polygon[i][0]) + polygon[i][1])) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Check if a point is inside a circular geofence
 * @param {number} pointLat - Latitude of the point
 * @param {number} pointLon - Longitude of the point
 * @param {number} centerLat - Latitude of circle center
 * @param {number} centerLon - Longitude of circle center
 * @param {number} radius - Radius in meters
 * @returns {boolean} True if point is inside circle
 */
function isPointInCircle(pointLat, pointLon, centerLat, centerLon, radius) {
  const distance = calculateDistance(pointLat, pointLon, centerLat, centerLon);
  return distance <= radius;
}

/**
 * Generate a grid of points for heatmap visualization
 * @param {Object} bounds - Bounding box with north, south, east, west coordinates
 * @param {number} gridSize - Number of grid cells per side
 * @returns {Array} Array of grid points with coordinates
 */
function generateGrid(bounds, gridSize = 20) {
  const grid = [];
  const latStep = (bounds.north - bounds.south) / gridSize;
  const lonStep = (bounds.east - bounds.west) / gridSize;
  
  for (let i = 0; i <= gridSize; i++) {
    for (let j = 0; j <= gridSize; j++) {
      grid.push({
        lat: bounds.south + (i * latStep),
        lon: bounds.west + (j * lonStep),
        weight: 0
      });
    }
  }
  
  return grid;
}

/**
 * Calculate bearing between two points
 * @param {number} lat1 - Latitude of start point
 * @param {number} lon1 - Longitude of start point
 * @param {number} lat2 - Latitude of end point
 * @param {number} lon2 - Longitude of end point
 * @returns {number} Bearing in degrees
 */
function calculateBearing(lat1, lon1, lat2, lon2) {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  return (θ * 180 / Math.PI + 360) % 360;
}

module.exports = {
  calculateDistance,
  isPointInPolygon,
  isPointInCircle,
  generateGrid,
  calculateBearing
};