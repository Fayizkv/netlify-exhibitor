# User Stories

## Album Management

### ✅ Album Favorite Feature
- **As a** user
- **I want to** mark albums as favorites
- **So that** I can easily identify and access my most important albums

**Acceptance Criteria:**
- [x] Star icon appears on album buttons when hovering
- [x] Clicking the star icon toggles the favorite status
- [x] Favorite albums show a filled yellow star
- [x] Non-favorite albums show an empty gray star
- [x] Favorite status is persisted in the backend
- [x] API call uses `putData({id, isFavourite: true}, 'album')` endpoint
- [x] UI updates immediately after toggling favorite status
- [x] Star icon is positioned in the top-right corner of album buttons
- [x] Star icon has proper hover effects and tooltips

**Technical Implementation:**
- Added `favoriteAlbums` state to track favorite album IDs
- Added `handleToggleAlbumFavorite` function to handle API calls
- Updated folder transformation to include `isFavourite` property
- Added star icon UI with conditional rendering based on favorite status
- Updated all relevant functions to maintain favorite status consistency 

## Poster Builder

### ✅ Background Image Loading Fix
- **As a** user
- **I want to** see background images load correctly after page reload
- **So that** I can continue working with my poster designs without losing visual context

**Acceptance Criteria:**
- [x] Background images load correctly after page reload
- [x] Background images are immediately available for printing after selection
- [x] Print functionality works consistently with background images
- [x] All URL types (blob, server, CDN) are handled properly
- [x] Background image changes are reflected immediately in print preview
- [x] No console errors related to background image loading

**Technical Implementation:**
- Fixed URL construction logic in initialization and data fetching
- Updated `handleFileChange` to immediately save background images to server
- Enhanced `getBackgroundImageUrl` in BadgeExport to handle different URL types
- Improved background image display logic across all components
- Added proper fallback mechanisms for different URL scenarios
- Updated `saveBadgeData` to ensure proper URL handling in builder data 