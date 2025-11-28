# Company Profile - Media & Assets

## Overview

The Media & Assets tab in the Company Profile page allows exhibitors to upload and manage their company logo, banner image, and company brochure.

## Features

### File Upload Support

- **Company Logo**: PNG, JPG files up to 5MB
- **Banner Image**: PNG, JPG files up to 5MB
- **Company Brochure**: PDF files up to 10MB

### Functionality

- File validation (type and size)
- Image preview for logo and banner
- File name display for brochure
- Change/Remove file options
- Automatic cleanup of temporary file URLs

## Implementation Details

### Frontend (React)

- File state management with `useState`
- File validation before upload
- Preview generation for images
- FormData handling for API calls
- Error handling and user feedback

### Backend (Node.js/Express)

- Multer middleware for file uploads
- S3 integration for file storage
- File processing and compression
- Database storage in `formData.companyProfile`

## API Endpoints

### Update Exhibitor

```
PUT /api/v1/ticket-registration/exhibitor
```

**Request Body:**

```javascript
{
  "id": "exhibitor_id",
  "logo": File, // Optional
  "banner": File, // Optional
  "brochure": File, // Optional
  "formData[companyProfile][industry]": "string",
  "formData[companyProfile][description]": "string",
  // ... other fields
}
```

**Response:**

```javascript
{
  "success": true,
  "message": "Exhibitor updated successfully",
  "data": {
    "formData": {
      "companyProfile": {
        "logo": "https://s3-url/logo.jpg",
        "banner": "https://s3-url/banner.jpg",
        "brochure": "https://s3-url/brochure.pdf"
      }
    }
  }
}
```

## File Storage

Files are uploaded to AWS S3/DigitalOcean Spaces and stored with the following structure:

- `uploads/exhibitor/` - Base directory
- Files are processed with compression and thumbnails where applicable
- Public URLs are stored in the database

## Usage

1. Navigate to the Media & Assets tab
2. Click on upload areas or "Change" buttons
3. Select files (images for logo/banner, PDF for brochure)
4. Preview uploaded files
5. Click "Save Changes" to upload to server
6. Files are automatically processed and stored in S3

## Error Handling

- File size validation
- File type validation
- Upload error messages
- Network error handling
- Automatic cleanup on component unmount
