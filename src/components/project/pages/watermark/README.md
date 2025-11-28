# Watermark Settings Feature

## Overview

The watermark settings feature allows users to add watermarks to images in their events. Users can choose between image-based watermarks or text-based watermarks with full customization options.

## Features

### 1. Watermark Types

- **Image Watermark**: Upload a custom image (PNG, JPG, JPEG, SVG)
- **Text Watermark**: Create text-based watermarks with custom styling

### 2. Customization Options

- **Position**: Drag and drop to position the watermark
- **Opacity**: Adjust transparency (0-100%)
- **Scale**: Resize the watermark (5-50%)
- **Text Styling**: Font size, color, background color, bold, italic
- **Image Settings**: File upload with size and type validation

### 3. Preview

- Real-time preview with sample images
- Interactive drag and drop positioning
- Visual feedback for all changes

## API Endpoints

### Create Watermark Settings

```
POST /api/v1/water-mark-settings
```

### Get Watermark Settings

```
GET /api/v1/water-mark-settings?event={eventId}
```

### Update Watermark Settings

```
PUT /api/v1/water-mark-settings/{id}
```

### Delete Watermark Settings

```
DELETE /api/v1/water-mark-settings/{id}
```

## Data Structure

### Request Body Example

```json
{
  "mode": "Image",
  "event": "eventId",
  "appearance": {
    "opacity": 80,
    "scale": 20
  },
  "defaultPosition": {
    "left": 50,
    "top": 50
  },
  "imageSettings": {
    "imageUrl": "data:image/png;base64,...",
    "fileName": "watermark.png",
    "fileSize": 1024,
    "mimeType": "image/png"
  }
}
```

### Text Watermark Example

```json
{
  "mode": "Text",
  "event": "eventId",
  "appearance": {
    "opacity": 80,
    "scale": 20
  },
  "defaultPosition": {
    "left": 50,
    "top": 50
  },
  "textSettings": {
    "text": "Sample Watermark",
    "fontColor": "#ffffff",
    "fontSize": 24,
    "bgColor": "#6366f1",
    "bgAlpha": 80,
    "bold": true,
    "italic": false
  }
}
```

## Usage

1. Navigate to the watermark settings page
2. Choose between Image or Text watermark
3. Configure the settings:
   - For Image: Upload an image file
   - For Text: Enter text and customize styling
4. Adjust position by dragging the watermark on the preview
5. Set opacity and scale as needed
6. Click "Save Watermark Settings" to persist changes

## Integration

The watermark settings are automatically associated with events and can be used in:

- Event photos
- Badge generation
- Certificate creation
- Any image processing feature

## Technical Notes

- Supports drag and drop positioning
- Real-time preview updates
- Automatic saving with loading states
- Error handling and user feedback
- Responsive design for mobile and desktop
- File upload with validation
- Database persistence with timestamps
