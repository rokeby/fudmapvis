/**
 * UI Controller for the FUD simulation
 * Modified to ensure map visualization works properly
 */

// UI Toggle Functions - Modified to preserve map visibility
const UIToggle = {
  // Toggle info panel
  toggleInfo: function() {
    if (UIState.infoActive) {
      // Hide info panel
      $("#info").fadeOut(200);
      $("#console").fadeIn(200);
      $("#back").fadeOut(200);
      
      // Show other elements if they were active
      if (UIState.marketActive) $("#market").fadeIn(200);
      if (UIState.chatActive) $("#chatContainer").fadeIn(200);
      
      UIState.setInfoActive(false);
    } else {
      // Show info panel
      $("#info").fadeIn(200);
      $("#console").fadeOut(200);
      $("#back").fadeIn(200);
      
      // Hide other elements
      $("#market").fadeOut(200);
      $("#chatContainer").fadeOut(200);
      
      UIState.setInfoActive(true);
    }
    
    // IMPORTANT: Never hide the map container
    ensureMapVisibility();
  },
  
  // Toggle market panel
  toggleMarket: function() {
    if (UIState.infoActive) return;
    
    $("#market").fadeToggle(200);
    UIState.toggleMarket();
    
    // IMPORTANT: Never hide the map container
    ensureMapVisibility();
  },
  
  // Toggle chat panel
  toggleChat: function() {
    if (UIState.infoActive) return;
    
    $("#chatContainer").fadeToggle(200);
    UIState.toggleChat();
    
    // IMPORTANT: Never hide the map container
    ensureMapVisibility();
  },
  
  // Toggle the entire interface
  toggleInterface: function() {
    UIState.toggleInterface();
    
    if (UIState.interfaceVisible) {
      $("#interface").fadeIn(200);
      $("#console").fadeIn(200);
      $("#hide").fadeIn(200);
      $("#show").fadeOut(200);
      if (UIState.infoActive) {
        $("#back").fadeIn(200);
      }
    } else {
      $("#interface").fadeOut(200);
      $("#console").fadeOut(200);
      $("#back").fadeOut(200);
      $("#hide").fadeOut(200);
      $("#show").fadeIn(200);
    }
    
    // IMPORTANT: Never hide the map container
    ensureMapVisibility();
  }
};

/**
 * Helper function to ensure map is always visible
 * This gets called after any UI toggle operation
 */
function ensureMapVisibility() {
  // Make sure map container is visible and properly positioned
  $("#mapvis").show();
  
  // Dispatch an event that the visualization.js can listen for
  window.dispatchEvent(new Event('mapVisRequired'));
}
