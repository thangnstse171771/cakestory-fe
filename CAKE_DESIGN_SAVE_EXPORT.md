# Cake Design Save & Export Functionality

## Overview

The Cake Design page now supports saving design data and exporting cake images to both local storage and backend database.

## Features

### 1. **Save Design** Button

- Saves complete design data including:
  - Base configuration (shape, tiers, dimensions)
  - Frosting type
  - Topping selection and position/scale
  - Decorations with quantities, positions, and scales
  - Selected flavors
- Primary: Attempts to save to backend database
- Fallback: Saves to localStorage if backend unavailable
- Shows loading state with "Saving..." text

### 2. **Export Image** Button

- Captures the cake design as exact display image (1:1 scale)
- Downloads image to user's computer with true-to-display proportions
- Optionally uploads image to backend server
- Shows loading state with "Exporting..." text
- Filename format: `cake-design-{shape}-{timestamp}.png`
- **Key Feature**: Image captures exactly what user sees on screen without distortion

### 3. **Save & Export** Button

- Combines both operations in sequence
- First saves design data, then exports image
- Unified operation for complete backup
- Shows "Processing..." during operation

## Technical Implementation

### Dependencies

- `html2canvas`: For capturing cake design as image
- Custom API functions in `src/api/cakeDesigns.js`

### Data Structure

```javascript
{
  name: "Round Cake - 8/6/2025",
  base: {
    shape: "Round",
    tiers: 3,
    diameter: 25,
    height: 15,
    width: 20
  },
  frosting: "Buttercream",
  topping: "Strawberries",
  decorations: {
    "CakeCandle": 2,
    "Flower": 1
  },
  flavors: ["Vanilla", "Chocolate"],
  positions: {
    topping: { x: 0, y: -40 },
    decorations: {
      "CakeCandle_0": { x: -10, y: -50 },
      "CakeCandle_1": { x: 15, y: -30 }
    }
  },
  scales: {
    topping: 1.2,
    decorations: {
      "CakeCandle_0": 0.8,
      "CakeCandle_1": 1.1
    }
  }
}
```

## Technical Details

### Image Capture Configuration

```javascript
const canvas = await html2canvas(cakeDesignRef.current, {
  backgroundColor: null,
  scale: 1, // 1:1 scale to match display exactly
  width: rect.width, // Use actual display width
  height: rect.height, // Use actual display height
  useCORS: true,
  allowTaint: false,
  logging: false,
  scrollX: 0,
  scrollY: 0,
});
```

- **scale: 1** ensures exported image matches screen display exactly
- **width/height** captured from actual element dimensions
- **No distortion**: Toppings and decorations maintain their visual proportions

### API Endpoints (Backend Required)

- `POST /api/cake-designs` - Save design data
- `POST /api/cake-designs/upload-image` - Upload design image
- `GET /api/cake-designs` - Get user designs
- `GET /api/cake-designs/:id` - Get specific design
- `PUT /api/cake-designs/:id` - Update design
- `DELETE /api/cake-designs/:id` - Delete design

### Error Handling

- Backend unavailable: Falls back to localStorage
- Image capture fails: Shows error toast
- Loading states prevent multiple simultaneous operations

## Usage

1. Design your cake using the various tabs (Base, Frosting, Toppings, Decor)
2. Adjust positions by dragging elements in the preview
3. Fine-tune scales using the sliders
4. Click "Save Design" to store data
5. Click "Export Image" to download PNG
6. Click "Save & Export" for both operations

## Storage Locations

- **Backend Database**: Primary storage (when available)
- **localStorage**: Fallback storage (key: 'cakeDesigns')
- **Local Computer**: Downloaded images
- **Server**: Uploaded images (optional)

## Future Enhancements

- Load saved designs functionality
- Share designs with other users
- Print-ready export formats
- Multiple image formats (JPG, SVG)
- Batch operations
