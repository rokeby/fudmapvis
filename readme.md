# FUD: The First 10,000 Years

A catastrophe market simulation visualizing speculative hurricane patterns in the North Atlantic.

## Project Structure

The codebase has been organized as follows:

```
public/
├── assets/
│   ├── css/
│   │   └── styles.css      # Consolidated CSS with CSS variables
│   └── js/
│       └── ui.js           # Consolidated UI functions (formerly buttons.js, chat.js, market.js)
├── libraries/              # Third-party libraries
│   ├── jquery-3.5.1.min.js
│   ├── mappa.js
│   ├── p5.js
│   └── turf.min.js
├── p5/
│   └── visualization.js    # Hurricane visualization logic
└── index.html             # Main HTML file
```

## Code Organization

### 1. CSS (styles.css)

The CSS has been reorganized with:
- CSS variables for consistent styling
- Logical grouping of related styles
- Improved comments for better code navigation
- Standardized formatting

### 2. UI Management (ui.js)

All UI functionality has been consolidated into a single file with:
- Configuration object for easy customization
- Modular functions for different aspects of the UI
- Consistent event handling
- Chat and market system management
- Clearer separation of concerns

### 3. Visualization (visualization.js)

The visualization code has been cleaned up with:
- Configuration object for easy customization
- Better function organization
- Improved commenting
- Clearer variable naming
- More structured map interaction

### 4. HTML (index.html)

The HTML has been reorganized with:
- Logical grouping of UI elements
- Cleaner structure with better comments
- Simplified script loading

## Key Improvements

1. **Maintainability**: Code is now more maintainable with clearer organization and documentation.
2. **Configuration**: Common values are extracted into configuration objects for easier updates.
3. **Readability**: Better commenting and naming conventions make the code easier to understand.
4. **Consolidation**: Redundant code has been eliminated, with UI functions consolidated into logical modules.
5. **Styling**: CSS now uses variables, making visual theme changes much simpler.

## API Endpoints

The application uses the following API endpoints:

- `/fud/chat` - Retrieves chat messages
- `/fud/userchat` - Submits user chat messages
- `/fud/email` - Submits user email for updates
- `/fud/market` - Retrieves market data
- `/fud/hurricane` - Retrieves hurricane simulation data

All endpoints are accessed through the base URL: `https://api.zhexi.info`

## Future Improvements

Potential areas for further cleanup and enhancement:

1. Implement a proper module system (ES modules)
2. Add error handling for API requests
3. Implement loading states for UI elements
4. Add responsive design improvements for mobile devices
5. Optimize rendering performance for the visualization
6. Add unit tests for critical functionality
