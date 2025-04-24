/**
 * UI Controller for the FUD simulation
 * Handles UI element toggling and user interactions
 */

// Configuration
const UI_CONFIG = {
  updateIntervals: {
    chat: 1000,    // Chat update interval in ms
    market: 2000,  // Market update interval in ms
    map: 1000      // Map update interval in ms
  },
  apiEndpoints: {
    base: 'https://api.zhexi.info/fud/',
    chat: 'chat',
    userChat: 'userchat',
    email: 'email',
    market: 'market',
    hurricane: 'hurricane'
  },
  colors: {
    agent: "MistyRose",
    weather: "#b2ebff",
    market: "yellow",
    oracle: "gold",
    person: "PaleGreen"
  }
};

/**
 * UI State Management
 * Tracks which UI components are currently active
 */
const UIState = {
  infoActive: false,
  marketActive: false,
  chatActive: false,
  interfaceVisible: true,
  
  // Reset state when info is shown
  setInfoActive: function(active) {
    this.infoActive = active;
    if (active) {
      this.marketActive = false;
      this.chatActive = false;
    }
    this.updateButtonStyles();
  },
  
  // Toggle market state
  toggleMarket: function() {
    if (this.infoActive) return;
    this.marketActive = !this.marketActive;
    this.updateButtonStyles();
  },
  
  // Toggle chat state
  toggleChat: function() {
    if (this.infoActive) return;
    this.chatActive = !this.chatActive;
    this.updateButtonStyles();
  },
  
  // Toggle overall interface visibility
  toggleInterface: function() {
    this.interfaceVisible = !this.interfaceVisible;
  },
  
  // Update button styles based on active state
  updateButtonStyles: function() {
    $("#infoBtn").toggleClass("active", this.infoActive);
    $("#infoBtn").toggleClass("inactive", !this.infoActive);
    
    $("#marketBtn").toggleClass("active", this.marketActive);
    $("#marketBtn").toggleClass("inactive", !this.marketActive);
    
    $("#chatBtn").toggleClass("active", this.chatActive);
    $("#chatBtn").toggleClass("inactive", !this.chatActive);
  }
};

/**
 * UI Toggle Functions
 * Handle showing/hiding different UI panels
 */
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
  },
  
  // Toggle market panel
  toggleMarket: function() {
    if (UIState.infoActive) return;
    
    $("#market").fadeToggle(200);
    UIState.toggleMarket();
  },
  
  // Toggle chat panel
  toggleChat: function() {
    if (UIState.infoActive) return;
    
    $("#chatContainer").fadeToggle(200);
    UIState.toggleChat();
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
  }
};

/**
 * Initialize UI event listeners
 */
function initUIListeners() {
  // Info panel toggle
  $("#infoBtn").click(UIToggle.toggleInfo);
  $("#backBtn").click(UIToggle.toggleInfo);
  
  // Market toggle
  $("#marketBtn").click(UIToggle.toggleMarket);
  
  // Chat toggle
  $("#chatBtn").click(UIToggle.toggleChat);
  
  // Interface visibility toggles
  $("#hide").click(UIToggle.toggleInterface);
  $("#show").click(UIToggle.toggleInterface);
  
  // Form submissions
  $('#userChat').submit(handleUserChatSubmit);
  $('#emailForm').submit(handleEmailSubmit);
}

/**
 * Chat System Functions
 */
const ChatSystem = {
  // Update the chat display with latest messages
  updateChat: async function() {
    try {
      const response = await fetch(`${UI_CONFIG.apiEndpoints.base}${UI_CONFIG.apiEndpoints.chat}`);
      const chat = await response.json();
      
      $("#chat").html('');
      
      chat.forEach(msg => {
        const entityColor = UI_CONFIG.colors[msg.entityType] || 'white';
        $("#chat").append(
          `<div class="chatLine">
            <span class="chatEntity" style="color: ${entityColor}">
              ${msg.agent}: 
            </span>
            <span class="chatEntity" style="color: ${entityColor}">
              ${msg.chat}
            </span>
          </div>`
        );
      });
      
      // Auto-scroll to bottom of chat
      $("#chat").scrollTop($("#chat")[0].scrollHeight);
    } catch (error) {
      console.error("Error updating chat:", error);
    }
  }
};

/**
 * Market System Functions
 */
const MarketSystem = {
  // Initialize with empty array - corrected from before
  bidList: [],
  
  // Update the market display with latest data
  updateMarket: async function() {
    try {
      const response = await fetch(`${UI_CONFIG.apiEndpoints.base}${UI_CONFIG.apiEndpoints.market}`);
      const market = await response.json();
      
      // Process bid list - using MarketSystem directly instead of this to avoid binding issues
      for (var i = 0; i < market.bid_list.length; i++) {
        if (!MarketSystem.bidList.includes(market.bid_list[i].price)) {
          MarketSystem.bidList.push(market.bid_list[i].price);
          if (MarketSystem.bidList.length >= 15) {
            MarketSystem.bidList.shift();
          }
        }
      }
      
      // Update UI
      $("#buy-list").html('');
      $("#price-value").html(market.price.toFixed(2));
      MarketSystem.bidList.forEach(bid => $("#buy-list").append(`$${bid.toFixed(2)}<br>`));
    } catch (error) {
      console.error("Error updating market:", error);
    }
  }
};

/**
 * Form Submission Handlers
 */
// Handle chat form submission
function handleUserChatSubmit(event) {
  event.preventDefault();
  $.ajax({
    url: `${UI_CONFIG.apiEndpoints.base}${UI_CONFIG.apiEndpoints.userChat}`,
    type: 'POST',
    data: $(this).serialize(),
    success: function(data) {
      console.log("Chat submitted:", data);
      $('#userChat')[0].reset();
    },
    error: function(error) {
      console.error("Error submitting chat:", error);
    }
  });
}

// Handle email form submission
function handleEmailSubmit(event) {
  event.preventDefault();
  $.ajax({
    url: `${UI_CONFIG.apiEndpoints.base}${UI_CONFIG.apiEndpoints.email}`,
    type: 'POST',
    data: $(this).serialize(),
    success: function(data) {
      console.log("Email submitted:", data);
      $('#emailForm')[0].reset();
      
      // Give user feedback
      const originalSubmitValue = $('#emailSubmit').val();
      $('#emailSubmit').val('submitted!');
      setTimeout(() => {
        $('#emailSubmit').val(originalSubmitValue);
      }, 2000);
    },
    error: function(error) {
      console.error("Error submitting email:", error);
      $('#emailSubmit').val('error!');
      setTimeout(() => {
        $('#emailSubmit').val('submit');
      }, 2000);
    }
  });
}

/**
 * Initialize the UI systems
 */
function initUI() {
  initUIListeners();
  
  // Set up periodic updates with proper context binding
  setInterval(function() { ChatSystem.updateChat(); }, UI_CONFIG.updateIntervals.chat);
  setInterval(function() { MarketSystem.updateMarket(); }, UI_CONFIG.updateIntervals.market);
  
  // Initialize default UI state
  $("#market").hide();
  $("#chatContainer").hide();
  $("#info").hide();
  $("#back").hide();
  
  console.log("UI system initialized");
}

// Initialize when document is ready
$(document).ready(function() {
  initUI();
});
