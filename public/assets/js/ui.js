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
 * UI Toggle Functions
 * Handle showing/hiding different UI panels
 */
const UIToggle = {
  // Toggle info panel and related elements
  toggleInfo: function() {
    $("#info").toggle();
    $("#chatContainer").toggle();
    $("#back").toggle();
    $("#console").toggle();
    $("#market").toggle();
    $("#mapvis").toggle();
  },
  
  // Toggle the entire interface
  toggleInterface: function() {
    $("#interface").toggle();
    $("#hide").toggle();
    $("#show").toggle();
  },
  
  // Toggle between market and chat views
  toggleMarket: function() {
    $("#market").toggle();
    $("#chatContainer").toggle();
  }
};

/**
 * Initialize UI event listeners
 */
function initUIListeners() {
  // Info panel toggles
  $("#login").click(UIToggle.toggleInfo);
  $("#back").click(UIToggle.toggleInfo);
  
  // Interface visibility toggles
  $("#hide").click(UIToggle.toggleInterface);
  $("#show").click(UIToggle.toggleInterface);
  
  // Market/chat toggle
  $("#showMarket").click(UIToggle.toggleMarket);
  
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
    } catch (error) {
      console.error("Error updating chat:", error);
    }
  }
};

/**
 * Market System Functions
 */
const MarketSystem = {
  bidList: [],
  
  // Update the market display with latest data
  updateMarket: async function() {
    try {
      const response = await fetch(`${UI_CONFIG.apiEndpoints.base}${UI_CONFIG.apiEndpoints.market}`);
      const market = await response.json();
      
      // Process bid list
      for (var i = 0; i < market.bid_list.length; i++) {
        if (!this.bidList.includes(market.bid_list[i].price)) {
          this.bidList.push(market.bid_list[i].price);
          if (this.bidList.length >= 15) {
            this.bidList.shift();
          }
        }
      }
      
      // Update UI
      $("#buy-list").html('');
      $("#price-value").html(market.price.toFixed(2));
      this.bidList.forEach(bid => $("#buy-list").append(`$${bid.toFixed(2)}<br>`));
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
    },
    error: function(error) {
      console.error("Error submitting email:", error);
    }
  });
}

/**
 * Initialize the UI systems
 */
function initUI() {
  initUIListeners();
  
  // Set up periodic updates
  setInterval(ChatSystem.updateChat, UI_CONFIG.updateIntervals.chat);
  setInterval(MarketSystem.updateMarket, UI_CONFIG.updateIntervals.market);
  
  console.log("UI system initialized");
}

// Initialize when document is ready
$(document).ready(function() {
  initUI();
});
