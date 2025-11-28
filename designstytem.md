# EventHex Design System

## Overview
EventHex is a comprehensive event management platform with a clean, modern interface focused on usability and efficient event organization. This design system documents the visual and interaction patterns used throughout the application.

## Brand Identity

### Logo & Brand
- **Primary Brand**: EventHex with hexagonal logo mark
- **Visual Style**: Modern, professional, technology-focused
- **Tone**: Clean, efficient, trustworthy

## Color Palette

### Primary Colors
- **Primary Blue**: `#4F46E5` (Indigo-600)
  - Used for: Primary buttons, links, selected states, brand accents
- **Primary Blue Hover**: `#4338CA` (Indigo-700)
  - Used for: Button hover states, active elements

### Secondary Colors
- **Green Success**: `#10B981` (Emerald-500)
  - Used for: Success states, completed events, positive actions
- **Orange Warning**: `#F59E0B` (Amber-500)
  - Used for: Ongoing events, warning states, attention-grabbing elements
- **Red Error**: `#EF4444` (Red-500)
  - Used for: Error states, destructive actions, urgent notifications

### Neutral Colors
- **Gray 50**: `#F9FAFB` - Light backgrounds
- **Gray 100**: `#F3F4F6` - Card backgrounds, subtle borders
- **Gray 200**: `#E5E7EB` - Borders, dividers
- **Gray 400**: `#9CA3AF` - Placeholder text, disabled states
- **Gray 600**: `#4B5563` - Secondary text
- **Gray 900**: `#111827` - Primary text, headings

### Background Colors
- **Primary Background**: `#FFFFFF` (White)
- **Secondary Background**: `#F9FAFB` (Gray-50)
- **Card Background**: `#FFFFFF` with subtle shadow

## Typography

### Font Family
- **Primary**: Inter, -apple-system, BlinkMacSystemFont, sans-serif
- **Fallback**: System fonts for optimal performance

### Font Sizes & Weights
- **Heading 1**: 24px, Font-weight: 600 (Semibold)
- **Heading 2**: 20px, Font-weight: 600 (Semibold)
- **Heading 3**: 18px, Font-weight: 600 (Semibold)
- **Body Large**: 16px, Font-weight: 400 (Regular)
- **Body**: 14px, Font-weight: 400 (Regular)
- **Body Small**: 12px, Font-weight: 400 (Regular)
- **Label**: 14px, Font-weight: 500 (Medium)
- **Caption**: 12px, Font-weight: 400 (Regular)

### Text Colors
- **Primary Text**: Gray-900 (`#111827`)
- **Secondary Text**: Gray-600 (`#4B5563`)
- **Muted Text**: Gray-400 (`#9CA3AF`)
- **Link Text**: Primary Blue (`#4F46E5`)

### Page Headers (New Section or Enhancement to Titles)
- **Default Page Title**: Uses `Heading 2` or `Heading 3` style.
- **Page Title with Back Navigation (New)**:
  - **Layout**: Leading "Back" arrow icon (e.g., Lucide `arrow-left`), `8-12px` spacing, then the page title text (using `Heading 2` or `Heading 3` style).
  - **Icon**: `20-24px`, `Gray-600` or `Primary Blue`.
  - **Interaction**: The icon and/or title text typically acts as a navigation link to go back.
- **Page Header Actions (Common Placement)**:
  - Secondary page actions (e.g., "Save as Draft", "Cancel") are often styled as `Secondary Button` or `Text Button / Tertiary Button` (see below) and positioned in the top-right of the page header, opposite the main page title or back navigation group.

## Layout & Spacing

### Border Radius
- **Small**: 4px (form inputs, small buttons)
- **Medium**: 6px (cards, buttons)
- **Large**: 8px (modals, large containers)
- **Full**: 50% (circular elements, avatars)

## Shadows (New)

A systematic scale for "Regular Shadows" used throughout the application to create depth and hierarchy.

### X-Small
- **Usage**: Subtle emphasis for very light interactive elements or fine borders.
- **CSS**: `box-shadow: 0px 1px 2px 0px rgba(228, 229, 231, 0.24);`
- **Properties**:
  - Offset X: `0px`
  - Offset Y: `1px`
  - Blur: `2px`
  - Spread: `0px`
  - Color: `rgba(228, 229, 231, 0.24)` (Derived from `#E4E5E7` at 24%)

### Small
- **Usage**: Standard for cards, small popovers, default button elevation.
- **CSS**: `box-shadow: 0px 2px 4px 0px rgba(27, 28, 29, 0.04);`
- **Properties**:
  - Offset X: `0px`
  - Offset Y: `2px`
  - Blur: `4px`
  - Spread: `0px`
  - Color: `rgba(27, 28, 29, 0.04)` (Derived from `#1B1C1D` at 4%)

### Medium
- **Usage**: Modals, larger cards requiring more separation, dropdown menus.
- **CSS**: `box-shadow: 0px 16px 32px -12px rgba(88, 92, 95, 0.10);`
- **Properties**:
  - Offset X: `0px`
  - Offset Y: `16px`
  - Blur: `32px`
  - Spread: `-12px`
  - Color: `rgba(88, 92, 95, 0.10)` (Derived from `#585C5F` at 10%)

### Large
- **Usage**: Prominent modals, larger UI panels, significant floating elements.
- **CSS**: `box-shadow: 0px 16px 40px -8px rgba(88, 92, 95, 0.16);`
- **Properties**:
  - Offset X: `0px`
  - Offset Y: `16px`
  - Blur: `40px`
  - Spread: `-8px`
  - Color: `rgba(88, 92, 95, 0.16)` (Derived from `#585C5F` at 16%)

### X-Large
- **Usage**: Highly elevated elements, focus states for large panels, temporary large pop-ups.
- **CSS**: `box-shadow: 0px 24px 56px -4px rgba(88, 92, 95, 0.16);`
- **Properties**:
  - Offset X: `0px`
  - Offset Y: `24px`
  - Blur: `56px`
  - Spread: `-4px`
  - Color: `rgba(88, 92, 95, 0.16)` (Derived from `#585C5F` at 16%)

### 2X-Large
- **Usage**: Maximum elevation, typically for temporary, highly focused UI elements like critical alerts or large dialogs.
- **CSS**: `box-shadow: 0px 40px 96px -8px rgba(88, 92, 95, 0.20);`
- **Properties**:
  - Offset X: `0px`
  - Offset Y: `40px`
  - Blur: `96px`
  - Spread: `-8px`
  - Color: `rgba(88, 92, 95, 0.20)` (Derived from `#585C5F` at 20%)

## Components

## Dashboard & Analytics Components (New)

### Stat Card (New)
- **Usage**: Display key metrics (e.g., Total Registrations, Today's Registrations)
- **Icon**: 24px, centered in a colored circular background (Green, Blue, Red, Purple)
- **Icon Background**: 40px circle, color matches metric type (Success, Info, Error, etc.)
- **Number**: 24px, bold, Gray-900
- **Label**: 12–14px, medium, Gray-600
- **Card**: White background, border radius 8px, subtle shadow, 16–24px padding
- **Spacing**: 24px between stat cards

### Overview List (New)
- **Usage**: List of event stats (e.g., No. of Tickets, No. of Sessions)
- **Icon**: 20px, colored per status (Blue, Green, Orange, Red, Purple)
- **Label**: 14px, Gray-600
- **Value**: 16px, bold, Gray-900
- **Spacing**: 12px vertical between items

### Chart / Graph (New)
- **Usage**: Visualize data (e.g., Registration Timeline, Ticket Type Breakdown)
- **Card**: White background, border radius 8px, subtle shadow
- **Title**: 16px, bold, Gray-900, 16px bottom margin
- **Chart Area**: 200–300px height
- **Line Chart**: Primary Blue for lines
- **Pie/Donut Chart**: Use Primary Blue, Green, Orange, Red, Purple for segments

### Recent List (New)
- **Usage**: Show recent registrations or activity
- **Avatar**: 32px, circular, colored background (unique per user), white initial
- **Name**: 14px, Gray-900
- **Time**: 12px, Gray-400, right-aligned
- **Spacing**: 12px vertical between items

## Top Navigation (Update)
- **Search Icon/Button**: 24px, Gray-400, right-aligned, opens search input on click
- **Visit Website Button**: Secondary button style, right-aligned, 14px font, 6px radius, Gray-600 text, 1px Gray-200 border, 12px 20px padding
- **Utility Icon Button (e.g., Globe) (New)**:
  - **Style**: `Icon Button` style (see Components -> Buttons -> Icon Button).
  - **Icon**: Specific icon (e.g., Globe), `20-24px`, `Gray-600` or `Gray-500`.
  - **Usage**: Typically for global actions like localization, help, or public view toggle.
- **Text & Icon Buttons (Subtle/Secondary, e.g., "Edit Website", "Preview") (New)**:
  - **Style**: `Secondary Button` or a dedicated "Tertiary/Subtle Button" style.
  - **Icon**: `16-20px`, left-aligned, `Gray-600` or `Primary Blue` if highly interactive.
  - **Text**: `14px`, `Gray-600` or `Primary Blue`.
  - **Padding**: Approx. `8px 12px` (may be less than standard Secondary Button).
  - **Border**: `1px solid transparent` or `Gray-200` on hover/active.
  - **Hover**: `Gray-100` background.
- **Primary Button with Dropdown (e.g., "Publish") (New Variant)**:
  - **Base Style**: `Primary Button` (background, text color, padding, border radius).
  - **Layout**: Main button text or an action icon (e.g., Lucide `send` for a "Send" button) on the left. A visually separated section on the right containing a dropdown chevron icon (e.g., Lucide `chevron-down`, white color).
  - **Separator**: Thin vertical line (`1px solid` slightly darker shade of primary blue, or a subtle white/transparent divider) between the main button area and the chevron area.
  - **Chevron Area Padding**: Smaller padding around the chevron, e.g., `8px`.
- **Spacing**: 16–24px between top nav items, can be less (8-12px) for grouped items.

## Spacing & Iconography (Clarification)
- **Dashboard Cards/Sections**: 24px spacing between major cards/sections
- **Sidebar Icons**: 24px, outline style, 20px for sub-items
- **Stat Card Icon Backgrounds**: 40px circle, color-coded per metric

#### Sidebar Navigation
- **Width**: 200px (main sidebar)
- **Background**: White
- **Border**: 1px solid Gray-200 (right border for main sidebar)

#### Main Sidebar Item Styling (New)
- **Icon Style**: Outline icons, 24px, Gray-400 (default)
- **Text**: 14-16px, Gray-600 (default)
- **Default State Padding**: 12px 16px
- **Hover State**: Gray-50 background
- **Active State (Top Level, e.g., "InstaSnap")**: Primary Blue text and icon, background remains White or very subtle change. No chevron.

#### Secondary/Nested Navigation Menu (New - for items appearing after main selection)
- **Usage**: Typically appears in the main content area or as a slide-out/drill-down from the main sidebar.
- **Item Padding**: 12px 16px
- **Icon Style**: Outline icons, 20-24px, Gray-600 (default), Primary Blue (active).
- **Text**: 14-16px, Gray-600 (default), Primary Blue (active).
- **Active State (e.g., "Upload Photos" within InstaSnap)**: Light Primary Blue background (e.g., Indigo-100), Primary Blue text and icon, ">" (chevron-right) icon on the right.
- **Hover State**: Gray-50 background.
- **Expandable Sections (New)**: Menu items can feature a chevron-down icon (`Gray-600`, right-aligned) to indicate an expandable sub-menu. On click, the section expands, and the chevron may rotate (e.g., to chevron-up). Active state within expanded items follows standard nested item active rules.

#### Sidebar Section Headings (Main Sidebar)
- **Text**: All caps
- **Font**: 12px, Font-weight: 600 (Semibold)
- **Color**: Gray-500
- **Spacing**: 16px margin-top, 8px margin-bottom

#### Secondary Navigation Section Headings (New - for headings within a secondary menu)
- **Text**: All caps
- **Font**: 10px or 12px, Font-weight: 500 (Medium) or 600 (Semibold)
- **Color**: Gray-500 or Gray-400
- **Spacing**: 12px margin-top, 8px margin-bottom (or as observed)

### Filter/Search Bar
- **Note**: This describes a pill-shaped component. For individual action buttons above tables, see "Action Bar Buttons".
- **Background**: White
- **Border**: 1px solid Gray-200
- **Border Radius**: 24px (pill shape)
- **Icon**: 16px, Gray-400
- **Padding**: 8–12px vertical, 16px horizontal
- **Usage**: Used for filter, sort, and search controls above tables when a unified bar is desired.

### Action Bar Buttons (New)
- **Usage**: For a set of individual action buttons typically placed above tables or main content areas.
- **Layout**: Can be a mix of icon-only, text+icon buttons, and primary action buttons. Typically grouped left and right.
- **Icon-only Button (e.g., Search Icon in Bar)**:
  - **Style**: `Icon Button`.
  - **Icon**: `20-24px`.
- **Filter Button (Text + Icon)** / **Sort By Button (Text + Icon)** / **Screen Options Button (Text+Icon)** / **Import/Export Buttons (Text+Icon)**:
  - **Style**: `Secondary Button`.
  - **Icon**: `16-20px`, left-aligned.
  - **Text**: `14px`, Gray-600.
  - **Padding**: Approx. `8px 16px` or `10px 20px`.
- **Spacing**: 8-12px between buttons in the bar.

### Tag / Capsule (New)
- **Background**: Gray-50 or status color (see below)
- **Border**: 1px solid Gray-200 or status color border
- **Border Radius**: 999px (full pill)
- **Font**: 12px, semibold
- **Padding**: 4px 12px
- **Text Color**: Default Gray-600. Varies with status:
  - **Default/Info**: Primary Blue text with Gray-50 background.
  - **Success**: `Green Success (#10B981)` background, `Emerald-700` or `Gray-900` text.
  - **Warning**: `Orange Warning (#F59E0B)` background, `Amber-700` or `Gray-900` text.
  - **Error**: `Red Error (#EF4444)` background, White text.
  - **Default Tag (New)**: Background `Gray-100 (#F3F4F6)`, Text `Gray-700 (#374151)`, Border `1px solid Gray-200 (#E5E7EB)`.
  - **User Added / Custom Tag (New Example - Green)**: Background `Green-100 (#D1FAE5)`, Text `Green-700 (#047857)`, Border `1px solid Green-200 (e.g., #A7F3D0)`.

#### Table Action Buttons
- **Style**: Secondary Button appearance (transparent background, 1px solid Gray-200 border, Gray-600 text)
- **Icon**: 16px, Gray-400/Gray-600, left-aligned
- **Label**: 14px, Gray-600
- **Padding**: Approx. 6px 10px
- **Border Radius**: 6px
- **Spacing**: 8px between icon and label, and 8px between multiple action buttons.
- **Hover**: Gray-50 background

### Upload Image Card (New)
- **Usage**: For a compact, card-like interface for uploading a single image or a small batch, often within a form or settings page. Typically larger and more distinct than a simple form file input.
- **Background**: White

### File Dropzone Area (New)
- **Usage**: For a large, dedicated area for users to drag and drop files or browse to upload, typically for main page actions like gallery uploads.
- **Container**: Large rectangular area.
- **Background**: Gray-50 (`#F9FAFB`).
- **Border**: 2px dashed Gray-300 (`#D1D5DB`).
- **Border Radius**: 8px or 12px.
- **Padding**: 32px or 48px.
- **Content Layout**: Centered vertically and horizontally.
- **Icon**: Upload cloud icon (e.g., Lucide `upload-cloud`), 40-48px, Gray-400 (`#9CA3AF`).
- **Primary Text ("Choose a file...")**: 16px, Font-weight: 500 (Medium), Gray-900 (`#111827`).
- **Secondary Text (File info/constraints)**: 12px or 14px, Font-weight: 400 (Regular), Gray-600 (`#4B5563`).
- **Button ("Browse Images")**: Uses `Secondary Button` style. Padding may be slightly adjusted (e.g., 10px 20px) based on visual balance within the dropzone.

### Compact File Input / Form File Upload (New)
- **Usage**: A simpler file input, often for a single file within a form row, like a thumbnail.
- **Label**: Standard form label (`Label` style).
- **Layout**: Typically an upload area on the left and descriptive text on the right.
- **Upload Area**:
  - **Size**: Small square area (e.g., `48px x 48px` to `60px x 60px`).
  - **Border**: `1px dashed Gray-300 (#D1D5DB)`.
  - **Background**: `Gray-50 (#F9FAFB)` or `White (#FFFFFF)`.
  - **Icon**: Centered upload icon (e.g., Lucide `upload`), `20-24px`, `Gray-400 (#9CA3AF)`.
  - **Hover**: Border color may change (e.g., to `Primary Blue`).
- **Descriptive Text (Right of Upload Area)**:
  - **Content**: File size limits, supported file types.
  - **Font**: `Caption` style (12px), `Gray-600`.
  - **Color**: `Gray-600 (#4B5563)`.
  - **Spacing**: Aligned vertically with the upload area, with `8-12px` left margin from it.

### Modals

#### Modal Container

#### Sidesheet / Slide-out Panel (New)
- **Usage**: For forms, detailed views, or contextual information appearing from the side (typically right) of the screen, overlaying part of the main content.
- **Position**: Fixed to right (or left) edge of the viewport.
- **Width**: Approx. 400px - 480px (can vary based on content).
- **Background**: White (`#FFFFFF`).
- **Shadow**: Standard modal shadow (e.g., `0 8px 32px rgba(0,0,0,0.16)`).
- **Header**:
  - **Padding**: `16px 24px`.
  - **Title**: Uses `Modal Header -> Title` style (20px, Font-weight 600).
  - **Close Button**: `

### Segmented Control / Option Card (New)
- **Background**: White
- **Border**: 2px solid Primary Blue (selected), 1px solid Gray-200 (unselected)
- **Border Radius**: 12px
- **Padding**: 16px 24px
- **Icon (Optional Left)**: Can include a left-aligned icon (`20-24px`, `Gray-500` or `Primary Blue` if active) next to the Label/Title. Icon spacing `8-12px` to the right.
- **Selected State**: Primary Blue border, radio filled, bold label, icon (if present) turns Primary Blue.

### Link with Trailing Icon (New Pattern)
- **Usage**: For links that require an accompanying icon, typically indicating an external link or a specific action.
- **Base Style**: Standard link styling (see Typography -> Link Text).
- **Icon**: `12-16px` icon (e.g., Lucide `external-link`), positioned to the immediate right of the link text.
- **Icon Color**: Inherits link color or can be `Gray-500`.
- **Spacing**: `4px` between link text and icon.
- **Hover**: Both text and icon should reflect hover state (e.g., underline, color change).

#### Form Row with Toggle (Usage Pattern - New)
- **Layout**: A common form row pattern. Left side contains text labels (and optional icon), right side contains the toggle switch.
- **Left Content**:
  - **Icon (Optional Leading)**: `18-20px`, `Gray-500` or related color, `8px` spacing to the right of the icon.
  - **Main Label**: `Label` style (14px, Medium, `Gray-900` or `Gray-600`).

#### Form Row with Compact File Input (New Pattern)
- **Usage**: For embedding a compact file input within a form, typically for single file uploads like avatars or thumbnails.
- **Layout**: Label above the component, or label to the left and component to the right.
- **Label**: Standard form label (`Label` style, including required indicator if applicable).
- **Component**: `Compact File Input / Form File Upload` (see definition under File Upload Components).
- **Spacing**: Standard form field spacing.

### Rich Text Editor (New)
- **Toolbar**: Bold, Italic, Underline, List, Link, etc.
- **Font**: 14px, Gray-900
- **Border**: 1px solid Gray-200, 6px radius
- **Toolbar Icons**: 20px, Gray-400
- **Background**: White
- **Padding**: 12px 16px
- **Character Count (Optional)**: Displays current/max character count (e.g., "0/5000").
  - **Position**: Bottom-right, either inside or just outside the editor's border.
  - **Font**: `Caption` style (12px), `Gray-500`.

### Form Row Layouts (General Clarification - New)
- **Multi-field Rows**: Forms may contain rows with multiple input fields arranged horizontally (e.g., Start Date, Start Time, End Time). These fields should maintain consistent vertical alignment and have appropriate spacing (`12-16px`) between them.
- **Alignment in Multi-field Rows**: Elements like checkboxes or secondary actions (e.g., "Multi Day Event" checkbox) associated with a multi-field row should be clearly aligned with the entire row, often to the far right.
- **Responsive Behavior**: Multi-field rows should stack vertically on smaller screens, with each field taking up full width or a logical portion of the available width.

#### Checkboxes
- **Size**: 16px
- **Selected**: Primary blue background with white checkmark
- **Unselected**: White with gray border
- **Label Position**: Typically to the right of the checkbox. Can also be to the left. Maintain consistent alignment and `8px` spacing between checkbox and label text.
- **Label Style**: Uses `Label` typography (14px).

### Form Field with Adjacent Info (New Pattern)
- **Usage**: When a form field needs to display related, non-interactive information or a statistic alongside it.
- **Layout**: Form field (e.g., `Dropdown/Select`, `Input Field`) on the left. Informational text/stat on the right.
- **Form Field Width**: Can be full-width with info text wrapping below, or a percentage of width (e.g., 60-70%) allowing info text to sit beside it on larger screens.
- **Info Text Style**: `Caption` or `Body Small` (12px), `Gray-600` or `Gray-500`. Font-weight: `Medium` or `Regular`. Can include a small leading icon if appropriate.
- **Alignment**: Info text should be vertically centered with the form field it relates to.
- **Spacing**: `16-24px` horizontal space between the form field and the info text if side-by-side.

### Tabs (Horizontal) (New)
- **Layout**: Horizontal row, equal spacing or proportionally spaced.
- **Active Tab**: `Primary Blue` text, `Font-weight: 600 (Semibold)` or `bold`, `2-3px border-bottom` using `Primary Blue`.
- **Inactive Tab**: `Gray-400` or `Gray-500` text.
- **Font**: `14-16px`, `Font-weight: 500 (Medium)` for inactive, `Semibold` for active.
- **Spacing**: `24-32px` between tabs.
- **Hover (Inactive Tab)**: Text color may change to `Gray-600` or `Primary Blue` (subtle).

#### Secondary Button
- **Hover**: Gray-50 background

#### Text Button / Tertiary Button (New or Refined)
- **Usage**: For less prominent actions, often used for inline actions, minor options, or in tight spaces where a bordered button would be too heavy.
- **Background**: Transparent by default.
- **Border**: None by default.
- **Text Color**: `Primary Blue` (for primary-like actions) or `Gray-600` (for secondary/neutral actions).
- **Font Size**: `14px` (can be `12px` for very subtle actions).
- **Font Weight**: `500 (Medium)`.
- **Padding**: Minimal, e.g., `4px 8px` or `6px 10px`.
- **Icon (Optional)**: Can include a leading or trailing icon (`14-18px`), color matches text.
  - **Icon Spacing**: `4-8px` from text.
- **Hover**: Subtle background (`Gray-100` for gray text, `Primary Blue` at 10-15% opacity for blue text) or text underline.
- **Focus**: Visible focus ring (standard system focus or subtle outline).

### Footer Action Group with Schedule Info (New Pattern)
- **Usage**: Typically found at the bottom of a form or page where a primary action is coupled with scheduling information or a secondary related link.
- **Layout**: Content is typically split. Left side has informational text (e.g., schedule details). Right side has the primary action button(s).
- **Alignment**: Vertically centered content within the group.
- **Schedule Info Text (Left)**:
  - **Font**: `Body Small` or `Caption` (12px).
  - **Color**: `Gray-600`.
  - **Contents**: Can include dynamic date/time, status information.
- **"Edit" Link (Inline with Schedule Info)**:
  - **Style**: Uses `Link Text` style, `12px` or `14px`.
  - **Color**: `Primary Blue`.
  - **Usage**: To modify the schedule information.
- **Primary Action Button(s) (Right)**:
  - Typically a `Primary Button` or `Primary Button with Dropdown`.
  - Example: A "Send" button with a paper plane icon and dropdown chevron.
- **Spacing**: Adequate spacing between left and right content groups (e.g., `flex justify-between`).

### Additional UI Patterns
- **Empty States**: Use illustration or icon, headline, and supporting text. Centered in container.
  - **Layout**: Vertically stacked and centered within its container.
  - **Illustration/Icon**: Prominent, centered graphic or icon (e.g., `64px` to `128px` in size, can be duotone or outline style). `24-48px` bottom margin from illustration to headline.
  - **Headline**: `Heading 2` (e.g., 20px, Semibold, `Gray-900`) or `Heading 3`. `12-16px` bottom margin from headline to supporting text.
  - **Supporting Text**: `Body Large` (e.g., 16px, Regular, `Gray-600`) or `Body`. `24-32px` bottom margin from supporting text to action button.
  - **Action Button (Optional)**: Standard `Primary Button` if a direct action can be taken from the empty state.

### Accordion (New)
- **Usage**: Accordions allow users to toggle the visibility of sections of content. They are useful for progressively disclosing information and managing complex content in a limited space, such as FAQs, navigation menus, or settings panels.

#### Accordion Item Structure
- Each accordion item consists of a clickable **Header** and a **Content Panel** that expands or collapses when the header is interacted with.

#### Accordion Item Header
- **Layout**: Contains a title, an optional leading icon (e.g., for categorization or status), and an expand/collapse icon.
- **Padding**: Typically `16px 24px`. For a more compact version, `12px 20px` can be used.
- **Background**: `White (#FFFFFF)` by default.
- **Border**: `1px solid Gray-200 (#E5E7EB)` is common, especially for distinct items or when items are flush.
- **Border Radius**: `Medium (6px)` or `Large (8px)`. See "Accordion Grouping & Variations" for specific radius handling in contained groups.
- **Title Text**:
  - Font: `Body Large` (16px) or `Body` (14px).
  - Weight: `500 (Medium)` or `600 (Semibold)`.
  - Color: `Gray-900 (#111827)`.
- **Leading Icon (Optional)**:
  - Size: `18-20px`.
  - Color: `Gray-500 (#6B7280)` or can be thematic (e.g., `Primary Blue`).
  - Spacing: `8-12px` to the right of the icon, before the title text.
- **Expand/Collapse Icon (Flip Icon)**:
  - Size: `20-24px`.
  - Icons: Commonly `+` (e.g., Lucide `plus`) when collapsed, and `-` (e.g., Lucide `minus`) or a chevron pointing down/up when expanded.
  - Color: `Gray-500 (#6B7280)` or `Primary Blue`.
  - Position: Default is right-aligned. A "Flip Icon" option allows it to be moved to the left-aligned position (typically before the Leading Icon or Title).
- **States**:
  - **Hover**: Background changes to `Gray-50 (#F9FAFB)`.
  - **Focus**: Standard visible focus ring (e.g., `Primary Blue` outline, 2px offset).
  - **Active/Expanded Header**: The background might remain `White` or change to `Gray-50`. The expand/collapse icon changes to its expanded state. Title text weight might become bolder or color change to `Primary Blue` if not already.

#### Accordion Item Content Panel
- **Padding**: `16px 24px`. Vertical padding might be adjusted (e.g., `16px` top/bottom, `24px` left/right). Should align with header padding for consistency.
- **Background**: `White (#FFFFFF)` or `Gray-50 (#F9FAFB)` if a subtle visual separation from the header is desired when expanded.
- **Content Typography**: Uses standard `Body` text styles, lists, etc.
- **Border**: If items are visually distinct and not flush, the content panel is contained within the item's overall border. For flush items, there might be no specific border for the content panel itself, relying on the next header's top border.

#### Accordion Grouping & Variations
- **Spaced Items (Card-like)**:
  - Each accordion item is a distinct visual block, like a card.
  - Spacing: `8px` or `12px` vertical margin between individual accordion items.
  - Shadow: Each item may have a `Small` or `X-Small` shadow to enhance separation.
  - Border Radius: Each item has its own rounded corners (e.g., `Medium (6px)` or `Large (8px)`).
- **Contained/Flush Items (List-like)**:
  - Accordion items are stacked directly on top of each other, appearing as part of a single continuous group or panel.
  - Borders: Only a single `1px solid Gray-200` line typically separates one item's header from the previous item's content (or header, if collapsed). The first item has a top border, and the last item has a bottom border if it's the end of the group.
  - Overall Container (Optional): The entire group might be wrapped in an outer container with its own border and/or shadow.
  - Item Border Radius: Only the first item's header (top-left, top-right) and the last item's content panel (bottom-left, bottom-right, when expanded) might have rounded corners if the group is contained. Alternatively, all internal items have `0px` radius, and only the overall container has a border radius.

#### Interaction
- Clicking an accordion item header toggles the visibility (expand/collapse) of its associated content panel.
- The expand/collapse icon visually changes to reflect the current state (e.g., `+` to `-`, chevron right to chevron down).
- Behavior for multiple open items:
  - **Single Open**: Expanding one item collapses any other currently open item (default for many accordions).
  - **Multiple Open**: Users can expand multiple items independently. This should be a configurable option.

### Alerts, Notifications & Toasts (New)

These components are vital for user communication, providing feedback, warnings, and important updates.

#### General Properties for Alerts, Notifications & Toasts:
- **Status Icons**: Typically used to visually reinforce the message type:
  - **Success**: Checkmark icon (e.g., Lucide `check-circle-2`).
  - **Error**: Error/cross icon (e.g., Lucide `x-circle`).
  - **Warning**: Warning triangle/icon (e.g., Lucide `alert-triangle`).
  - **Info**: Information icon (e.g., Lucide `info`).
- **Dismissal**: Most should include a close button (`x` icon, e.g., Lucide `x`, `16-20px`, `Gray-500` or context-appropriate color).
- **Accessibility**: Ensure appropriate ARIA roles (`alert`, `status`, `alertdialog`) and live regions are used.

#### Alerts
- **Usage**: For contextual messages embedded within a page, providing persistent information or requiring user attention. Not suitable for auto-expiring messages.
- **Structure**:
  - **Icon (Optional but Recommended)**: Status icon, `20-24px`.
  - **Title (Optional)**: `Body` or `Label` style, `Font-weight: 600 (Semibold)`.
  - **Description**: `Body` style.
  - **Actions (Optional)**: `Link Text` or `Text Button / Tertiary Button` style.
  - **Close Button (Optional)**.
- **Layout**: Icon on the left, text content (title + description) in the middle, actions below text or to the right, close button top-right.
- **Padding**: `12px 16px` or `16px 24px`.
- **Border Radius**: `Medium (6px)`.
- **Styles & Statuses**:
  - **Filled Success**:
    - Background: `Green Success (#10B981)`.
    - Text/Icon: `White` or `Green-900` for high contrast.
  - **Filled Error**:
    - Background: `Red Error (#EF4444)`.
    - Text/Icon: `White`.
  - **Filled Warning**:
    - Background: `Orange Warning (#F59E0B)`.
    - Text/Icon: `Gray-900` or `Amber-900`.
  - **Filled Info**:
    - Background: `Primary Blue (#4F46E5)` or a lighter shade like `Indigo-400`.
    - Text/Icon: `White`.
  - **Light/Subtle Style (Alternative)**:
    - Background: `Gray-50 (#F9FAFB)` or `White`.
    - Border: `1px solid` corresponding status color (e.g., `Green Success` border for success).
    - Icon & Title Color: Corresponding status color.
    - Description Color: `Gray-600` or `Gray-900`.

#### Toasts
- **Usage**: For brief, non-modal, often auto-expiring messages providing feedback on an action or a minor system event. Typically appear in a corner of the screen (e.g., bottom-right, top-right) and can stack.
- **Structure**:
  - **Icon**: Status icon, `18-20px`.
  - **Message**: Short text, `Body` style, `Font-weight: 500 (Medium)`.
  - **Actions (Optional, Rare)**: Single, very subtle link (e.g., "Undo", "View").
  - **Close Button (Recommended if not auto-expiring quickly)**.
- **Layout**: Icon on the left, message to the right. Actions/Close button on the far right.
- **Padding**: `12px 16px`.
- **Border Radius**: `Medium (6px)`.
- **Shadow**: `Medium` or `Large` shadow to lift it off the page content.
- **Animation**: Enter/exit animations (e.g., slide in, fade out).
- **Auto-dismiss**: Typically after 3-7 seconds. Provide a way to pause on hover.
- **Styles & Statuses** (Usually filled or a distinct card style):
  - **Success**: Background `Green Success` or `Gray-900`; Icon/Text `White` or `Green Success`.
  - **Error**: Background `Red Error` or `Gray-900`; Icon/Text `White` or `Red Error`.
  - **Warning**: Background `Orange Warning` or `Gray-900`; Icon/Text `Gray-900` or `Orange Warning`.
  - **Info**: Background `Primary Blue` or `Gray-900`; Icon/Text `White` or `Primary Blue`.

#### Notifications (Floating/Growl-style)
- **Usage**: For timely updates, information, or non-critical alerts that don't need to interrupt the user's flow but should be noticeable. Appear in a corner, can stack, and may persist until dismissed. More content-rich than Toasts.
- **Structure**:
  - **Icon (Optional)**: App/feature icon (e.g., Lucide `bell`) or status icon, `20-24px`.
  - **Title**: `Body` or `Label` style, `Font-weight: 600 (Semibold)`.
  - **Description**: `Body Small` or `Body` style.
  - **Actions (Optional)**: `Link Text` (can use `Link with Trailing Icon`) or `Text Button / Tertiary Button`.
  - **Timestamp (Optional)**: `Caption` style, `Gray-400`.
  - **Close Button**.
- **Layout**: Icon left, Title and Description stacked, Actions below or right, Timestamp subtle, Close button top-right.
- **Container Style**:
  - **Background**: `Gray-800` or `Gray-900` (for dark notifications) or `White` (for light notifications).
  - **Text/Icon Colors**: `White` or light grays on dark backgrounds; `Gray-900`/`Gray-600` on light backgrounds.
  - **Padding**: `16px`.
  - **Border Radius**: `Large (8px)`.
  - **Shadow**: `Large` or `X-Large` shadow.
- **Status Indication**: Can be via a colored left border, a status icon, or color of the title/main icon.

### Badge / Status Badge (New)
- **Usage**: Badges are small, inline elements used to display concise information, counts, status, or highlights. They are often used to draw attention to specific items or attributes without disrupting the layout.

#### Core Properties
- **Shape**: 
  - **Pill**: Fully rounded ends (e.g., `border-radius: 999px`). Common for short text or numbers.
  - **Rounded Rectangle**: Slightly rounded corners (e.g., `Small (4px)` or `Medium (6px)` border radius).
- **Size**: Determined by padding and font size. Typically kept compact.
  - **Small**: Minimal padding, smaller font (e.g., 10-12px).
  - **Medium**: Slightly more padding, standard small font (e.g., 12-14px).
- **Text Styling**:
  - **Font Size**: `Body Small (12px)` or `Caption (10px)`. Can be `14px` for medium sized badges.
  - **Font Weight**: `500 (Medium)` or `600 (Semibold)`.
  - **Color**: Must have strong contrast with the badge background.
- **Padding**:
  - **Horizontal**: `6px` to `12px` (e.g., `4px 8px` for small, `6px 12px` for medium).
  - **Vertical**: `2px` to `6px` (e.g., `2px 4px` for small, `4px 6px` for medium).
- **Icon (Optional)**:
  - **Position**: Leading (before text) or trailing (after text).
  - **Size**: Small, typically `12-16px`, to match text size.
  - **Color**: Contrasts with background, often matches text color or is a subtle gray.
  - **Spacing**: `4-6px` between icon and text.

#### Styling Variations & Colors
- **Subtle/Light Style**:
  - **Background**: Light tint of a status or brand color (e.g., `Gray-100`, `Blue-100`, `Green-100`).
  - **Text/Icon Color**: Darker shade of the corresponding status/brand color (e.g., `Gray-700`, `Blue-700`, `Green-700`).
  - **Border**: Optional, `1px solid` matching the text color or a slightly lighter shade.
- **Solid/Filled Style**:
  - **Background**: Solid status or brand color (e.g., `Primary Blue`, `Green Success`, `Red Error`, `Gray-500`).
  - **Text/Icon Color**: `White` or a very light color for high contrast.
- **Outline Style**:
  - **Background**: Transparent or `White`.
  - **Border**: `1px solid` using a status or brand color.
  - **Text/Icon Color**: Matches the border color.
- **Color Palette**: Supports a range of predefined colors (e.g., various grays, blues, greens, yellows, reds, purples) in addition to semantic status colors:
  - **Success**: Green shades.
  - **Warning**: Orange/Yellow shades.
  - **Error**: Red shades.
  - **Info**: Blue shades.
  - **Neutral/Default**: Gray shades.

#### Types & Features
- **Text-only Badge**: Displays a short string of text.
- **Icon + Text Badge**: Combines an icon with text for added visual context.
- **Number/Count Badge**: Typically displays a number (e.g., notification count). Often uses the pill shape or a small circle if just a number. Text is usually centered.
- **Status Badge**: Uses semantic colors and often text/icons to indicate a state (e.g., "Active", "Pending", "PRO", "Absent").
- **Dismissible Badge (Optional)**:
  - Includes a small `x` icon (e.g., Lucide `x`, `12-14px`) on the trailing side.
  - **Interaction**: Clicking the `x` icon removes or deactivates the badge.
  - **Padding**: May require slightly more trailing padding to accommodate the close icon.
- **Usage Example (Voucher Tip)**: A Medium sized badge (e.g., with text at 14px or slightly larger if "20px" refers to overall height including padding) using capitalized typography can be effective for displaying "VOUCHER" codes or similar highlights. Ensure text remains clear and legible.

#### Accessibility
- If a badge contains only an icon or a number that isn't self-explanatory, provide an accessible name via `aria-label` or an equivalent attribute to ensure screen reader users understand its meaning.
- Ensure sufficient color contrast between the badge text/icon and its background.

### Buttons (Overhauled Section)

Buttons are interactive elements used to trigger actions. They communicate actions that users can take and are typically placed throughout the UI in forms, dialogs, toolbars, and cards.

#### A. General Button Properties
These properties can apply to most button types and styles.

- **States**:
  - **Default**: The normal, resting state of the button.
  - **Hover**: When the user's cursor is over the button. Typically involves a change in background color, border color, or shadow.
  - **Focused**: When the button has been navigated to via keyboard or clicked. Indicated by a visible focus ring (e.g., `Primary Blue` outline, 2px width, 2px offset).
  - **Pressed/Active**: While the button is being clicked or activated. Often shows a darker background or an inset effect.
  - **Disabled**: When the button is not interactive. Visuals should clearly indicate this (e.g., muted colors, `not-allowed` cursor).
- **Sizes** (Examples, adjust based on base font size and padding scale):
  - **Small (sm)**: For less prominent actions or tight spaces.
    - Padding: `6px 12px`. Font Size: `Body Small (12px)` or `14px`.
  - **Medium (md)**: Default size for most buttons.
    - Padding: `10px 20px` or `12px 24px`. Font Size: `Body (14px)` or `16px`. (Corresponds to "Medium 40" if 40px is total height).
  - **Large (lg)**: For prominent calls to action.
    - Padding: `14px 28px`. Font Size: `Body Large (16px)` or `18px`.
- **Icon Integration**:
  - **No Icon**: Text only.
  - **Left Icon + Text**: Icon aligned to the left of the text. Standard spacing `8-12px`.
  - **Right Icon + Text**: Icon aligned to the right of the text. Standard spacing `8-12px`.
  - **Double Icons (New)**: Icon on the left and icon on the right of the text.
  - **Icon Only**: No text, only an icon. See `Icon Button / Compact Button`.
  - **Icon Size**: Typically `16px`, `20px`, or `24px`, scaling appropriately with button size.
- **Content**: Button label (text) and optional icons. Text should be clear and concise.
- **Border Radius**: Generally `Medium (6px)`. Can be `Small (4px)` for smaller buttons or `Large (8px)` for larger ones. Full pill shape for some icon-only buttons.

#### B. Core Button Types (Semantic Purpose)

Each core type can adopt various visual styles (see Section C).

- **Primary Button**:
  - **Usage**: For the most important call to action on a page or in a flow.
  - **Default Style**: Typically `Filled`.
- **Secondary / Neutral Button**:
  - **Usage**: For actions of secondary importance, often used alongside a primary button. ("Neutral" in property shots).
  - **Default Style**: Typically `Stroke/Outline` or `Lighter`.
- **Error Button (New Semantic Type)**:
  - **Usage**: For actions with potentially destructive or error-related consequences (e.g., "Delete", "Cancel Subscription").
  - **Default Style**: Typically `Filled` (Red) or `Stroke/Outline` (Red).
- **Success Button (New Semantic Type, Implied)**:
  - **Usage**: For positive confirmation actions (e.g., "Confirm", "Complete").
  - **Default Style**: Typically `Filled` (Green) or `Stroke/Outline` (Green).

#### C. Button Visual Styles

These styles can be applied to the Core Button Types defined above.

- **Filled Style**:
  - **Background**: Solid color based on semantic type:
    - Primary: `Primary Blue (#4F46E5)`. Hover: `Primary Blue Hover (#4338CA)`.
    - Secondary/Neutral: `Gray-200 (#E5E7EB)` or a subtle gray. Hover: `Gray-300`.
    - Error: `Red Error (#EF4444)`. Hover: Darker Red.
    - Success: `Green Success (#10B981)`. Hover: Darker Green.
  - **Text/Icon Color**: `White` (for Primary, Error, Success) or `Gray-900` (for Neutral filled with light gray).
  - **Border**: None, or `1px solid` matching the background for consistency.
  - **Disabled**: Background `Gray-200`, Text `Gray-400`.
- **Stroke/Outline Style**:
  - **Background**: Transparent. Hover: Light tint of semantic color (e.g., `Primary Blue` at 10% opacity) or `Gray-50`.
  - **Border**: `1px solid` (or `2px`) colored by semantic type.
    - Primary: `Primary Blue`.
    - Secondary/Neutral: `Gray-400` or `Gray-600`.
    - Error: `Red Error`.
    - Success: `Green Success`.
  - **Text/Icon Color**: Matches border color.
  - **Disabled**: Border and Text `Gray-300` or `Gray-400`.
- **Lighter Style (New)**:
  - **Background**: Very light tint of the semantic color.
    - Primary: `Indigo-100` (e.g., `#E0E7FF`). Hover: `Indigo-200`.
    - Secondary/Neutral: `Gray-100`. Hover: `Gray-200`.
    - Error: Light Red (e.g., `#FEE2E2`). Hover: Darker light Red.
    - Success: Light Green (e.g., `#D1FAE5`). Hover: Darker light Green.
  - **Text/Icon Color**: Darker shade of the semantic color (e.g., `Primary Blue` for Primary Lighter, `Gray-700` for Neutral Lighter).
  - **Border**: Optional, `1px solid transparent` or matching background.
  - **Disabled**: Background `Gray-100`, Text `Gray-400`.
- **Ghost Style (Refined from Text Button)**:
  - **Background**: Transparent. Hover: Light tint of semantic color or `Gray-50`/`Gray-100`.
  - **Border**: None by default.
  - **Text/Icon Color**: Semantic color (e.g., `Primary Blue`, `Gray-600`, `Red Error`).
  - **Padding**: Consistent with other button sizes (Small, Medium, Large).
  - **Disabled**: Text `Gray-400`.
  - *Note: Replaces most uses of the previous `Text Button / Tertiary Button` when sized like other buttons. `Text Button` can still be used for very minimal, link-like actions if needed distinctly.*

#### D. Specialized Button Components

- **Icon Button / Compact Button (Refined)**:
  - **Usage**: For actions where an icon is sufficient, often in toolbars, data tables, or tight spaces. "Compact Button" properties map here.
  - **Content**: Icon only.
  - **Sizes (Square/Circular)**:
    - Small (e.g., `32px x 32px` container, `18-20px` icon).
    - Medium (e.g., `40px x 40px` container, `20-24px` icon). (Corresponds to "Pick Icon" size from Badge properties, and "Large (24)" icon in Compact Button Properties).
  - **Styles**: `Filled`, `Stroke/Outline`, `Lighter`, `Ghost`. Also a specific `White` style (White icon/border on transparent, for dark backgrounds).
  - **Modifiable Style (New)**: Allows custom color selection for background/icon/border (implementation detail).
  - **Border Radius**: Standard (e.g., `6px`) or `Full` (circular/pill shape).
  - **States**: Standard hover, focus, pressed, disabled states apply, adapting the chosen style.
- **Link Button (New)**:
  - **Usage**: Actions styled to look like hyperlinks but with button behaviors, states, and potentially more defined structure than simple text links.
  - **Appearance**: Primarily text-based, can include icons.
  - **Styles/Colors**:
    - `Gray`: `Gray-600` text.
    - `Black`: `Gray-900` text.
    - `Primary`: `Primary Blue` text.
    - `Error`: `Red Error` text.
    - `Modifiable`: Allows custom color selection.
  - **Underline**: Toggleable (default on, or on hover/focus).
  - **Icon Integration**: Supports leading and/or trailing icons.
  - **Size**: Font size based (e.g., `14px`, `16px`). Padding minimal or none.
  - **States**:
    - Default: Styled text.
    - Hover: Underline (if not default), slight color change.
    - Focus: Visible focus ring.
    - Pressed: Subtle color change.
    - Disabled: Muted text color (`Gray-400`), non-interactive.
- **Social Buttons (New)**:
  - **Usage**: For "Sign in with..." or linking to social profiles.
  - **Brands**: Predefined styles for Apple, Google, Twitter, Facebook, LinkedIn.
    - **Apple**: Background `#000000` (Filled) or Border `#000000` (Stroke). Icon: Apple logo (White).
    - **Google**: Background `#FFFFFF` with colored Google logo (Filled with border) or Border `#E0E0E0` (Stroke). Icon: Google logo.
    - **Twitter (X)**: Background `#000000` (Filled) or Border `#000000` (Stroke). Icon: X logo (White).
    - **Facebook**: Background `#1877F2` (Filled) or Border `#1877F2` (Stroke). Icon: Facebook logo (White).
    - **LinkedIn**: Background `#0A66C2` (Filled) or Border `#0A66C2` (Stroke). Icon: LinkedIn logo (White).
  - **Styles**:
    - **Filled**: Solid brand color background, contrasting text/icon (usually White or brand's official text color).
    - **Stroke/Outline**: Transparent or White background, brand color border and text/icon.
  - **Content**: Brand Icon + "Sign in with [Brand]" or similar text. Option for "Icon Only".
  - **Size**: Consistent with other button sizes (e.g., Medium).
  - **States**: Standard hover, focus, pressed, disabled states apply.

### Tables (New or Overhauled Section)

#### 1. Overview & Usage
Tables are used to organize and display large sets of structured data in a scannable, sortable, and filterable format. They are fundamental for presenting information clearly and allowing users to find and work with data efficiently.
Key features include column customization (width, visibility), row selection, inline actions, various cell content types, sorting, and filtering.

#### 2. Table Structure (Anatomy)
- **Table Container**: Wraps the entire table component. May include a title, global table actions (like Add New, Export), and filters above the table itself. Often has a card-like appearance with a border (`Gray-200`) and a `Small` or `Medium` shadow.
- **Table Header (`<thead>`)**: Contains one or more `Table Header Rows` (typically one).
  - **Table Header Row (`<tr>`)**: Contains `Table Header Cells (<th>)`.
- **Table Body (`<tbody>`)**: Contains `Table Rows (<tr>)` representing the data.
- **Table Row (`<tr>`)**: Contains `Table Data Cells (<td>)`.
- **Table Footer (`<tfoot>`) (Optional)**: Can be used for column summaries (e.g., totals) or for placing pagination controls.
- **Pagination**: If pagination is used with a table, it should follow the styles defined in a separate `Pagination` component (to be defined if not present, but typically includes page numbers, next/prev buttons). Usually placed below the table body, either within the table container's footer area or as a separate bar.

#### 3. Table Header Cell (`<th>`)
- **Purpose**: Displays the title of a data column and often provides controls for sorting.
- **Content**: Column title text.
- **Text Styling**: `Gray-600 (#4B5563)`, `Font-size: Body Small (12px)` or `Body (14px)`, `Font-weight: 500 (Medium)` or `600 (Semibold)`.
- **Padding**: Typically `12px 16px`. Vertical padding (e.g., `10px`, `14px`, `18px`) can be adjusted to achieve different row heights/table densities (Small ~32px, Medium ~40px, Large ~48px total row height, accounting for borders).
- **Background**: `Gray-50 (#F9FAFB)`.
- **Border**: `1px solid Gray-200 (#E5E7EB)` on the bottom. Optional right border `1px solid Gray-200` if vertical cell dividers are used throughout the table.
- **Text Alignment**: Typically left-aligned for text-based columns. Can be right-aligned for numerical data or centered if appropriate for the content.
- **States** (as per "Table Header Cell Properties"):
  - **Default**: Standard appearance.
  - **Disabled**: Text color `Gray-400 (#9CA3AF)`, sorting/interaction disabled.
  - **Empty**: No text, may be used for a column of checkboxes or actions if a header title isn't needed for that column.
- **Checkbox Integration (Optional)**:
  - For "select all/none" functionality for table rows.
  - Position: Typically left-aligned within the header cell, before any text label.
  - Style: Uses standard `Checkbox` component style.
- **Sorting Integration (Optional)**:
  - **Indicator**: Sorting icons (e.g., Lucide `arrow-up`, `arrow-down`, or a neutral two-way arrow/chevron icon for unsorted but sortable columns).
  - **Icon Types** (as per "Sorting Icons Properties"):
    - **Default/Unsorted**: A neutral icon (e.g., Lucide `chevrons-up-down` or `unfold-vertical`) indicating sortability.
    - **Up/Ascending**: Upward pointing arrow/chevron (e.g., Lucide `arrow-up`).
    - **Down/Descending**: Downward pointing arrow/chevron (e.g., Lucide `arrow-down`).
  - **Position**: Placed to the right of the column title text, with `4-8px` spacing.
  - **Icon Size**: `14-16px`.
  - **Icon Color**: `Gray-400 (#9CA3AF)` (inactive/unsorted), `Gray-600 (#4B5563)` or `Primary Blue (#4F46E5)` (active/sorted column).
  - **Interaction**: Clicking the header text and/or sort icon cycles through sort states (e.g., unsorted -> ascending -> descending -> unsorted).

#### 4. Table Row (`<tr>`)
- **Purpose**: Represents a single record or item in the dataset.
- **Background**: `White (#FFFFFF)` by default.
- **Hover State**: `Gray-50 (#F9FAFB)` background. Cursor changes to `pointer` if the entire row is interactive (e.g., navigates to a detail view).
- **Border**: `1px solid Gray-200 (#E5E7EB)` on the bottom, separating rows.
- **Selected State (Optional)**:
  - For tables with row selection functionality (e.g., via checkboxes in cells).
  - Background: `Indigo-50` (a light shade of `Primary Blue`, e.g., `#EEF2FF`) or `Primary Blue` at 5-10% opacity.
- **Row Height/Density**: Can be influenced by cell padding to achieve Small (~32px), Medium (~40px), or Large (~48px) effective row heights.

#### 5. Table Data Cell (`<td>`)
- **Purpose**: Contains individual pieces of data for a record, corresponding to a column header.
- **Padding**: Mirrors `Table Header Cell` padding for alignment (e.g., `12px 16px`). Vertical padding contributes to overall row height.
- **Text Styling (Default)**: `Gray-900 (#111827)` for primary data. Font size `Body (14px)`. Can be `Body Small (12px)` for denser tables or secondary text.
- **Vertical Alignment**: Default is middle. Consistent across cells in a row.
- **Text Alignment**: Typically left-aligned for text. Right-aligned for numbers, currency, or dates that benefit from it (improves scannability of numerical data).
- **Cell Content Types & Examples** (incorporating "Widget" property as cell type):
  - **Plain Text**: Standard text display.
  - **Text with Secondary Line/Description**: Main text `Gray-900` (`Font-weight: 500 (Medium)` if emphasized). Description below using `Body Small (12px)` or `Caption (10px)`, color `Gray-500`.
  - **Link**: `Primary Blue (#4F46E5)` text, `Font-weight: 500 (Medium)`. Hover: Underline appears. (Refers to `Clickable Links in Table` or `Link Button` component).
  - **Avatar / Avatar with Text**: Circular `Avatar` component. If with text: Avatar on left (`32px` or `40px`), Name (`Gray-900`, `Font-weight: 500`), optional secondary line (email, role - `Body Small`, `Gray-500`). Spacing `8-12px` between avatar and text.
  - **Image with Text (e.g., Project Logo)**: Small image/logo (`24-40px` height) on the left, with primary and optional secondary text to the right, similar to Avatar with Text.
  - **Checkbox**: For row-specific selection. Uses standard `Checkbox` component style. Typically the first cell in a row if used, with minimal padding around it.
  - **Badge / Status Badge**: Uses the `Badge / Status Badge` component styles (e.g., for statuses like "Active", "Pending", "PRO", or for tags and counts).
  - **Icon with Text**: Small leading icon (`16-18px`) before text content (e.g., file type icons like PDF, DOCX before a filename). Icon color `Gray-400` or thematic.
  - **Progress Bar**:
    - **Container**: Full width of cell or a defined max-width.
    - **Bar Background**: `Gray-200 (#E5E7EB)`.
    - **Progress Fill**: `Primary Blue (#4F46E5)` (default). Can use status colors (`Green Success`, `Orange Warning`, `Red Error`) for status-related progress.
    - **Height**: `8px` to `12px`.
    - **Border Radius**: `4px` to `6px` (pill shape if height allows).
    - **Percentage Text (Optional)**: Small text (`Caption`, `10-12px`, `Gray-600`) indicating percentage, can be overlaid on the bar (right-aligned) or adjacent to it.
  - **Rating (e.g., Stars)**:
    - **Icons**: Series of star icons (e.g., Lucide `star`), typically 5.
    - **Filled Star Color**: `Amber-400` or `Amber-500 (#F59E0B)`.
    - **Empty/Unfilled Star Color**: `Gray-300 (#D1D5DB)` or an outline style of the star icon.
    - **Icon Size**: `16-20px`.
    - **Spacing**: `2-4px` between stars.
  - **Payment Method Icons**: Small, recognizable logos for payment providers (e.g., Visa, PayPal, Mastercard). Size approx. `20-24px` height, width auto. Often displayed as a group if multiple apply.
  - **Action Buttons / Menu (Typically last cell, right-aligned)**:
    - One or more `Table Row Action Buttons` (e.g., "Edit" styled as `Ghost Button` or `Secondary Button` with an icon). See `Buttons` section.
    - A `Table Row Menu (Ellipsis)` icon button (`Icon Button / Compact Button` style) opening a contextual dropdown menu for more actions.
    - Spacing: `8px` between multiple action items if displayed horizontally.

#### 6. Column Widths & Layout
- **Column Sizing Strategies**:
  - **Fixed Width**: Assign a specific pixel width (e.g., `80px`, `120px`, `200px`) to columns with predictable content size (e.g., checkboxes, icons, avatars, dates, status badges, action buttons).
  - **Fluid/Fill Width ("Auto" or Flex-grow)**: Allow columns with variable-length text (e.g., names, descriptions, titles) to expand and use the remaining available space. Often one or two columns are set to fill.
  - **Percentage Width**: Columns can be assigned percentage widths of the total table width.
- **Minimum Width**: Define minimum widths (e.g., `min-width: 100px`) for fluid columns to prevent content from becoming unreadable or breaking the layout on smaller table views or when resizing.
- **Gutter/Spacing Tip**: For dashboard screens (e.g., 1440px width), a visual gutter of `~10px` can be considered between the content areas of fixed-width columns when designing the overall page layout containing the table. This is more about page composition than table cell spacing itself, which is handled by padding.

#### 7. Table Actions & Filters (Above Table)
- Controls for searching, filtering, sorting (if not per-column), managing screen options (column visibility), and global actions like "Import", "Export", or "Add New Item" are typically placed in an `Action Bar` above the table.
- These buttons and controls should follow styles defined in `Action Bar Buttons` and relevant form component sections (e.g., `Input Fields` for search, `Dropdown/Select` for filters).

#### 8. Accessibility
- Use a `<caption>` element as the first child of `<table>` to provide a descriptive title for the table, visible or screen-reader only.
- Ensure `<th>` elements have the correct `scope="col"` (or `scope="row"` for row headers if used) attribute for associating header cells with data cells.
- Interactive elements within cells (links, buttons, checkboxes) must be keyboard navigable (tabbable) and have clear, visible focus states.
- For complex tables, or tables where relationships are not obvious, consider using `aria-describedby` or other ARIA attributes to enhance understanding for screen reader users.
- Ensure sufficient color contrast for text, icons, and borders within the table.