# Figma AI Design Prompt - Hotel Management System Frontend

## Project Overview
Design a comprehensive hotel management system web application that integrates 6 microservices (ms-user, ms-room, ms-booking, ms-review, ms-stock, ms-event) with role-based access control (ADMIN, MANAGER, STAFF, CLIENT). The frontend must allow testing all CRUD operations and business logic for each service through an intuitive, professional interface.

---

## Color Scheme & Branding
- **Primary Color:** #1F2937 (Dark Blue-Gray)
- **Secondary Color:** #059669 (Emerald Green)
- **Accent Color:** #F59E0B (Amber)
- **Success Color:** #10B981 (Bright Green)
- **Danger Color:** #EF4444 (Red)
- **Warning Color:** #F97316 (Orange)
- **Background:** #F9FAFB (Light Gray)
- **Text Primary:** #111827 (Almost Black)
- **Text Secondary:** #6B7280 (Medium Gray)
- **Border Color:** #E5E7EB (Light Border)

---

## Authentication & Navigation

### 1. Login Page
- **Layout:** Centered card (40% width) with hotel logo and "Hotel Management System" title
- **Fields:**
  - Username/Email input
  - Password input (with show/hide toggle)
  - "Remember Me" checkbox
  - "Forgot Password?" link
- **Button:** "Login" button (primary color, full width)
- **Info Panel:** Right side shows system features (icon + text):
  - Manage Rooms Efficiently
  - Handle Reservations
  - Guest Reviews & Ratings
  - Stock Management
  - Event Planning
  - Staff Management

### 2. Sidebar Navigation (Post-Login)
**Structure:** Collapsible left sidebar (250px expanded, 80px collapsed)
**Role-Based Menu Items:**
- **Dashboard** (visible to all)
- **Users Management** (ADMIN only)
  - List Users
  - Create User
  - User Roles
  - Audit Logs
- **Room Management** (ADMIN, MANAGER, STAFF)
  - Rooms List
  - Room Types
  - Room Status
  - Create Room (ADMIN, MANAGER only)
- **Bookings** (all roles)
  - My Bookings (CLIENT - own bookings only)
  - All Bookings (ADMIN, MANAGER, STAFF)
  - Create Booking (all roles)
  - Pending Confirmations (ADMIN, MANAGER, STAFF)
  - Cancelled Bookings (ADMIN, MANAGER, STAFF)
- **Reviews & Ratings** (all roles)
  - All Reviews (view all)
  - Room Ratings
  - Guest Feedback
  - My Reviews (CLIENT - own reviews only)
- **Inventory & Stock** (ADMIN, MANAGER, STAFF)
  - Stock List
  - Low Stock Alerts
  - Categories
  - Add Stock Item (ADMIN, MANAGER only)
  - Supplier Management (ADMIN, MANAGER only)
- **Events** (ADMIN, MANAGER, STAFF for view, CLIENT for public events)
  - All Events (ADMIN, MANAGER can edit)
  - Create Event (ADMIN, MANAGER only)
  - Event Calendar (all roles)
  - Venue Availability
  - Event Types (Seminars, Weddings, Parties)
  - Public Events (CLIENT can view and register)
- **Settings** (ADMIN only)
  - System Configuration
  - Backup & Restore
  - User Roles & Permissions

---

## Page 1: Dashboard
**Layout:** Grid-based with cards and charts
**Sections:**

### Header
- Welcome message: "Welcome {username}! Your role: {role}"
- Date/Time display
- Profile dropdown (avatar, name, settings, logout)
- Breadcrumb: Dashboard > Home

### Key Metrics Cards (4 columns)
1. **Total Rooms**
   - Large number (e.g., 45)
   - Icon: Building Icon
   - Subtext: "Active rooms"
   - Mini sparkline showing trend

2. **Bookings This Month**
   - Large number (e.g., 127)
   - Icon: Calendar Icon
   - Subtext: "Pending: 8"
   - Status indicators (Confirmed/Pending/Cancelled)

3. **Average Room Rating**
   - Star display (e.g., 4.8/5 with 5 stars)
   - Icon: Star Icon
   - Subtext: "Based on 342 reviews"
   - Growth percentage

4. **Stock Items Low**
   - Large number (e.g., 12)
   - Icon: Alert Icon
   - Subtext: "Require reordering"
   - Color: Warning color

### Charts & Visualizations
- **Line Chart:** Bookings trend (last 30 days)
- **Bar Chart:** Rooms by type distribution
- **Pie Chart:** Booking statuses (Confirmed, Pending, Cancelled)
- **Recent Reviews:** Mini table with latest 5 reviews (Room, Rating, Comment, Date)

---

## Page 2: Users Management (ms-user)

### Layout: Master-Detail with List & Form
**Breadcrumb:** Dashboard > Users Management > Users List

### Left Panel: Users List (60%)
- **Visibility:** ADMIN only (MANAGER can only view list, no actions)
- **Search Bar:** Filter users by email, name, role
- **Filter Chips:** ADMIN | MANAGER | STAFF | CLIENT (clickable toggles)
- **Table Columns:**
  | Email | First Name | Last Name | Phone | Role | Status | Actions |
  - Each row has **Edit** (pencil icon) and **Delete** (trash icon) buttons (ADMIN only)
  - Hover effect: Light gray background
  - Pagination at bottom (10/25/50 per page dropdown)

### Right Panel: User Form (40%)
- **Visibility:** ADMIN only
- **Form Title:** "Create New User" or "Edit User [{email}]"
- **Fields:**
  - Email (text input, required) + validation
  - First Name (text input, required)
  - Last Name (text input, required)
  - Phone (tel input, pattern validation)
  - Role (dropdown: ADMIN, MANAGER, STAFF, CLIENT) - ADMIN only
  - Preferences (JSON textarea, optional) - example: `{"language": "fr", "smoking": false}`
  - Active Status (toggle switch) - ADMIN only
- **Buttons:**
  - "Save User" (primary, full width) - ADMIN only
  - "Reset" (secondary)
  - "Cancel" (ghost)

### Additional Features
- **Delete Modal:** "Are you sure? This action cannot be undone." (ADMIN only)
  - Buttons: "Delete" (danger red) | "Cancel"
  - Shows warning if user has active bookings or events
- **Success Toast:** "User created successfully!" (green, top-right, auto-dismiss in 3s)
- **Error Toast:** "Email already exists" (red, top-right)
- **Audit Log:** Track all user creation, modification, and deletion actions with timestamp and admin user

---

## Page 3: Room Management (ms-room)

### Layout: Grid View + List View Toggle
**Breadcrumb:** Dashboard > Room Management > Rooms

### Top Bar
- **View Toggle:** Grid icon (active) | List icon
- **Filter Dropdowns:**
  - Type: All | SINGLE | DOUBLE | SUITE
  - Status: All | AVAILABLE | OCCUPIED | MAINTENANCE
  - Price Range: Slider (0-1000€)
- **Search:** Room number or description
- **Button:** "+ Create Room" (primary, green) - ADMIN, MANAGER only

### Grid View (Default)
- **Card Layout:** 4 columns (responsive)
- **Each Card:**
  - Room image placeholder (light gray background)
  - Room Number (bold text): "101"
  - Type Badge: SINGLE (light blue)
  - Status Badge: AVAILABLE (green) | OCCUPIED (red) | MAINTENANCE (yellow)
  - Price: "80.00€ per night"
  - Info row: "Floor 1 • Capacity: 1"
  - Amenities: "WiFi, TV, Minibar..." (truncated with tooltip)
  - 3-dot Menu:
    - Edit Room (ADMIN, MANAGER only)
    - Change Status (ADMIN, MANAGER, STAFF)
    - Delete (ADMIN only)
  - Quick Actions: "Book Now" button (for AVAILABLE rooms, all roles)

### List View (Alternative)
- **Table Columns:**
  | Room # | Type | Floor | Price/Night | Status | Capacity | Amenities | Actions |
  - Status column uses colored badges
  - Actions dropdown menu

### Room Creation/Edit Modal
- **Title:** "Create New Room" or "Edit Room #101"
- **Form Fields (2 columns):**
  - Room Number (text, required)
  - Type (dropdown: SINGLE, DOUBLE, SUITE)
  - Floor (number input)
  - Price Per Night (currency, decimal)
  - Status (dropdown: AVAILABLE, OCCUPIED, MAINTENANCE)
  - Capacity (number input)
  - Amenities (multi-select tags: WiFi, TV, Minibar, AC, Balcony, Kitchen, Jacuzzi)
  - Description (textarea)
  - Image Upload (drag-and-drop area or file picker)
- **Buttons:** "Save Room" (green) | "Cancel"

### Bulk Actions
- **Checkbox** on each room card (top-left corner)
- **Bulk Status Change:** Select multiple rooms → Dropdown to change status → "Apply" button

---

## Page 4: Bookings Management (ms-booking)

### Layout: Kanban/Board View + List View
**Breadcrumb:** Dashboard > Bookings

### Top Bar
- **View Toggle:** Kanban (active) | List | Calendar
- **Filter:**
  - Date Range Picker (From/To dates)
  - Guest Filter (search by guest name/email)
  - Room Filter (dropdown)
  - Status Filter: All | PENDING | CONFIRMED | CANCELLED
- **Button:** "+ New Booking" (primary)

### Kanban View (Default)
- **Four Columns:** PENDING | CONFIRMED | CHECKED_IN | CHECKED_OUT
- **Separate Section:** CANCELLED (collapsed by default)
- **Each Column:**
  - Column header with count badge
  - Cards represent bookings:
    - **Card Content:**
      - Guest Name (bold): "John Doe"
      - Room Info: "Room 101 (SINGLE)"
      - Dates: "Mar 10-13, 2026"
      - Status Badge
      - Guest Count: "1 guest"
      - Total Price: "240.00€"
      - 3-dot Menu:
        - View Details (all roles)
        - Edit (ADMIN, MANAGER only)
        - Cancel (ADMIN, MANAGER - any booking; CLIENT - own booking before check-in only)
        - Delete (ADMIN only)
    - Drag-and-drop enabled to move between columns (ADMIN, MANAGER, STAFF only)
    - CLIENT: View-only for own bookings, cannot drag
    - Click card to open detail modal

### Booking Detail Modal
- **Tab Navigation:** Details | Timeline | Payment | Notes (Notes tab: STAFF+ only)
- **Details Tab:**
  - Guest Name (linked to user profile - STAFF+ only)
  - Room (linked to room details)
  - Check-In Date & Time (date picker - editable by ADMIN, MANAGER before check-in)
  - Check-Out Date & Time (date picker - editable by ADMIN, MANAGER before check-in)
  - Number of Guests (number input - editable by ADMIN, MANAGER)
  - Special Requests (textarea - editable by guest and STAFF+)
  - Total Price (currency display - calculated automatically)
  - Status (dropdown - ADMIN, MANAGER, STAFF only; read-only for CLIENT)
  - Confirmation Code (copyable text)
  - Created By (user info) - STAFF+ only
- **Timeline Tab:** Booking history (Created, Confirmed, Checked In, Checked Out, Cancelled)
  - Shows who made each status change and when (STAFF+ only)
- **Payment Tab:** Payment method, amount, receipt (STAFF+ only)
- **Notes Tab:** Internal staff notes (STAFF+ only, not visible to CLIENT)
- **Buttons:**
  - "Update Booking" (ADMIN, MANAGER only)
  - "Check-In" (STAFF, MANAGER, ADMIN - only if status is CONFIRMED)
  - "Check-Out" (STAFF, MANAGER, ADMIN - only if status is CHECKED_IN)
  - "Confirm" (MANAGER, ADMIN - only if status is PENDING)
  - "Cancel Booking" (ADMIN, MANAGER - any booking; CLIENT - own booking before check-in)
  - "Close"

### List View (Alternative)
- **Table with columns:**
  | Guest | Room | Check-In | Check-Out | Status | Price | Actions |
  - Status as colored badges
  - Row click opens detail modal

### Calendar View (Alternative)
- **Month/Week/Day calendar**
- **Booking blocks** showing room bookings across dates
- **Color coding by status:** Green (Confirmed), Yellow (Pending), Red (Cancelled)
- **Mouse hover:** Shows booking details tooltip
- **Click:** Opens booking detail modal

---

## Page 5: Reviews & Ratings (ms-review)

### Layout: Reviews List + Statistics
**Breadcrumb:** Dashboard > Reviews & Ratings

### Top Section: Rating Statistics
- **5 boxes in a row:**
  - Average Rating (large number): "4.8" with 5-star display
  - Total Reviews: "342"
  - 5-Star Reviews: "280 (82%)" with bar chart
  - 4-Star Reviews: "45 (13%)"
  - Lower Ratings: "17 (5%)" with warning color

### Filter & Search
- **Search:** Room number or guest name
- **Filter Dropdowns:**
  - Room (autocomplete dropdown)
  - Rating: All | 5 Stars | 4 Stars | 3 Stars | 2 Stars | 1 Star
  - Verified: All | Verified | Unverified
  - Date Range Picker
- **Sort:** Latest | Highest Rated | Lowest Rated | Most Helpful

### Reviews List
- **Each Review Card (vertical stack, full width):**
  - **Header:**
    - Guest Name (bold): "Sarah Johnson" (masked for CLIENT, full name for STAFF+)
    - Room Link: "Room 101 (SINGLE)"
    - Star Rating (5 stars, yellow/gray color)
    - Verified Badge: "✓ Verified" (green - only for completed bookings)
    - Date: "2 weeks ago"
  - **Body:**
    - Comment Text: (up to 500 chars visible, "Read More" link if longer)
    - Amenities mentioned (tags)
    - Business Response (if any - from ADMIN/MANAGER)
  - **Footer:**
    - Booking ID: "Booking #1234" (STAFF+ only)
    - Helpful Counter: "👍 24 found this helpful"
    - Actions Dropdown:
      - Edit (CLIENT - own review, within 24h after posting)
      - Respond (ADMIN, MANAGER - add business response)
      - Report (all users - report inappropriate content)
      - Delete (ADMIN - inappropriate content; CLIENT - own review within 24h)

### Pagination
- Previous | Page numbers | Next
- Rows per page: 10/25/50

### Room Rating Summary (Optional Preview)
- **Sidebar or expandable section:**
  - List of rooms with ratings
  - Click to filter reviews for that room

---

## Page 6: Inventory & Stock Management (ms-stock)

### Layout: Grid Cards + Form
**Breadcrumb:** Dashboard > Inventory > Stock

### Top Bar
- **View Toggle:** Grid (active) | List
- **Filter:**
  - Category (dropdown): All | LINEN | CLEANING | MINIBAR | FURNITURE | OTHER
  - Stock Status (dropdown): All | In Stock | Low Stock | Out of Stock
  - Search: Item code or name
  - Supplier Filter (autocomplete)
- **Alert Badge:** "12 Low Stock Items" (warning color, clickable)
- **Button:** "+ Add Stock Item" (primary) - ADMIN, MANAGER only

### Stock Items Grid
- **Each Card (3 columns layout):**
  - **Header:**
    - Item Code (bold): "LINEN-001"
    - Category Badge: "LINEN" (light blue)
    - Stock Status Badge:
      - Green: "In Stock"
      - Orange: "Low Stock" (if qty < minQty)
      - Red: "Out of Stock"
  - **Body:**
    - Item Name: "Draps blancs double"
    - Quantity Display: "200 / 50 (min)" with progress bar
    - Unit: "pièce"
    - Price: "12.50€ per unit"
    - Supplier: "Hotel Supplies France"
  - **Footer:**
    - "Total Value: 3,125.00€"
    - 3-dot Menu:
      - View Details (all roles)
      - Edit (ADMIN, MANAGER only)
      - Update Quantity (ADMIN, MANAGER, STAFF)
      - Reorder (ADMIN, MANAGER only)
      - Delete (ADMIN, MANAGER only)

### Stock Item Form (Modal or Side Panel)
- **Visibility:** Create/Edit - ADMIN, MANAGER only; Update Quantity - STAFF
- **Title:** "Create New Stock Item" or "Edit [{itemCode}]"
- **Fields (2 columns):**
  - Item Code (text, unique, required) - ADMIN, MANAGER only
  - Item Name (text, required) - ADMIN, MANAGER only
  - Category (dropdown: LINEN, CLEANING, MINIBAR, FURNITURE, OTHER) - ADMIN, MANAGER only
  - Quantity (number, required) - All roles with access
  - Minimum Quantity (number) - ADMIN, MANAGER only
  - Unit (text: pièce, litre, bouteille, kg, etc.) - ADMIN, MANAGER only
  - Unit Price (currency) - ADMIN, MANAGER only
  - Supplier (text or dropdown with existing suppliers) - ADMIN, MANAGER only
  - Reorder Level (number) - ADMIN, MANAGER only
  - Last Restocked (date, read-only) - All roles
  - Updated By (user info, read-only) - Shows who last updated
- **Buttons:** "Save Item" | "Cancel"

### Low Stock Alert Section
- **Button at top:** "Low Stock Items (12)" with warning icon
- **Click expands:** List of items below minimum quantity
  - Table with columns: Item Code | Name | Current | Min | Status
  - "Order Now" button per item (opens supplier contact form)

### Bulk Operations
- **Checkboxes** on each card for bulk actions
- **Bulk Actions Bar** (appears when items selected):
  - "Change Category" (dropdown)
  - "Update Prices" (input + apply)
  - "Delete Selected"

---

## Page 7: Events Management (ms-event)

### Layout: Calendar + List
**Breadcrumb:** Dashboard > Events

### Top Bar
- **View Toggle:** Calendar (active) | List | Timeline
- **Filter:**
  - Event Type (dropdown): All | SEMINAR | WEDDING | PARTY | CONFERENCE | OTHER
  - Status (dropdown): All | PLANNED | CONFIRMED | CANCELLED | COMPLETED
  - Date Range Picker
  - Organizer Filter (autocomplete)
  - Public Events Toggle (CLIENT - show only public events)
- **Button:** "+ Create Event" (primary) - ADMIN, MANAGER only

### Calendar View (Default)
- **Month/Week view selector**
- **Large calendar grid**
- **Event blocks on dates:**
  - Color-coded by type (Wedding: Red, Seminar: Blue, Party: Purple)
  - Event name and time shown
  - Click to view details
- **Sidebar:** List of events for selected date

### Event Creation/Edit Modal
- **Visibility:** Create/Edit - ADMIN, MANAGER only; View - STAFF, CLIENT (public events)
- **Title:** "Create New Event" or "Edit [{eventName}]"
- **Tabs:** Details | Attendees | Services | Venue | Payment (Payment tab: ADMIN, MANAGER only)
- **Details Tab Fields (2 columns):**
  - Event Name (text, required)
  - Event Type (dropdown: SEMINAR, WEDDING, PARTY, etc., required)
  - Start Date & Time (datetime picker)
  - End Date & Time (datetime picker)
  - Organizer (user search/select)
  - Expected Attendees (number)
  - Venue (text, autocomplete - rooms/halls available)
  - Status (dropdown: PLANNED, CONFIRMED, CANCELLED, COMPLETED) - ADMIN, MANAGER only
  - Is Public Event (checkbox) - Mark if clients can register
  - Description (textarea)
  - Total Cost (currency) - ADMIN, MANAGER only
  - Created By (user info, read-only)
- **Services Tab:**
  - Multi-select tags: Catering | Decoration | Music | Photography | AV Equipment | Projector | Microphones | Lighting
  - Add custom service input
- **Venue Tab:**
  - Select venue (room/hall name, autocomplete)
  - Check availability (date range, shows conflicting bookings)
  - Display room capacity vs expected attendees (warning if over)
  - "Check Availability" button
- **Payment Tab:**
  - Payment method (dropdown: Cash, Card, Bank Transfer, Credit)
  - Amount (auto-calculated or manual)
  - Invoice generation
- **Buttons:** "Save Event" | "Cancel"

### Events List View (Alternative)
- **Table Columns:**
  | Event Name | Type | Venue | Start Date | End Date | Status | Attendees | Total Cost | Actions |
  - Type shown as badge with color
  - Status shown as colored badge
  - Hover shows quick info tooltip

### Timeline View (Alternative)
- **Vertical timeline** of events
- **Each event entry:**
  - Date & time (left side)
  - Event name, type, venue (center)
  - Status indicator (right)
  - Click to expand details

---

## Page 8: Feign Integration Test (Optional Advanced Page)
**For Technical Testing of Inter-Service Communication**
**Breadcrumb:** Dashboard > API Tests > Feign Integration

### Section 1: Available Rooms via Feign
- **Description:** "Fetches available rooms from ms-room via Feign client in ms-booking"
- **Button:** "Fetch Available Rooms"
- **Results Display:**
  - Response status (green 200, or error)
  - Response time (ms)
  - JSON response displayed in code block (monospace, dark background)
  - Table view option:
    | Room ID | Room # | Type | Floor | Price | Status |

### Section 2: Get Room by ID
- **Input:** Room ID (number input)
- **Button:** "Get Room Details"
- **Results:** Similar to above, single room details

### Section 3: Create Booking with Room Validation
- **Description:** "Tests Feign call inside BookingService.createBooking() to verify room status"
- **Form Fields:**
  - User ID (dropdown, populated from users)
  - Room ID (dropdown, populated from available rooms)
  - Check-In Date (date picker)
  - Check-Out Date (date picker)
  - Special Requests (textarea)
- **Button:** "Create Booking with Validation"
- **Results:**
  - Success: Booking created response
  - Failure: Shows error reason (room not available, date conflict, etc.)
  - Raw API response in JSON viewer

### Section 4: Test Room Status Unavailable
- **Description:** "Change room status to OCCUPIED and attempt booking - should fail"
- **Steps:**
  1. "Step 1: Check Room Status" (shows current status)
  2. "Step 2: Set to OCCUPIED" (button to change status)
  3. "Step 3: Try Booking" (form to create booking with same room)
  4. "Observe Error" (displays expected rejection)

---

## Page 9: Settings & Configuration (ADMIN only)

### Layout: Tabs
**Breadcrumb:** Dashboard > Settings

### **Tab 1: System Settings**
- API Base URL (text input, info text: "http://localhost:9090")
- Keycloak URL (text)
- Realm Name (text)
- Environment (dropdown: Development | Staging | Production)
- Debug Mode (toggle)
- Backup location folder picker
- "Save Settings" button

### **Tab 2: User Roles & Permissions**
- **Role management table:**
  | Role | Users Count | Permissions | Actions |
  - Permissions column: Shows checkboxes for: Create, Read, Update, Delete, Approve
- "Add Role" button (modal form)
- Edit/Delete buttons per role

### **Tab 3: Email Notifications**
- Toggle: Send email on booking confirmation
- Toggle: Send review reminders
- Toggle: Low stock alerts
- Toggle: Event reminders
- Email Template editor (for each notification type)

### **Tab 4: Backup & Restore**
- Last Backup: "26 Feb 2026 14:30"
- "Backup Now" button
- "Download Backup" button
- "Restore from Backup" file picker
- Backup history table

---

## Common UI Components (Across All Pages)

### 1. Header/Top Navigation Bar
- **Left Side:**
  - Logo/Application name
  - Breadcrumb navigation
- **Right Side:**
  - Current user role badge
  - Notifications icon (bell, with red badge for count)
  - Theme toggle (light/dark mode icon)
  - User profile dropdown:
    - Avatar
    - Name
    - Email
    - "My Profile" link
    - "Settings" link
    - "Logout" button

### 2. Modals/Dialogs
- **Standard Modal:**
  - Semi-transparent dark overlay (backdrop)
  - White card centered on screen
  - Title at top with close (X) button
  - Body content (scrollable if long)
  - Footer with action buttons (primary on right, secondary/cancel on left)

### 3. Toast Notifications
- **Position:** Top-right corner
- **Types:**
  - Success (green background, checkmark icon)
  - Error (red background, X icon)
  - Warning (orange background, exclamation icon)
  - Info (blue background, info icon)
- **Auto-dismiss:** 3 seconds
- **Manual close:** X button on toast

### 4. Data Tables
- **Features:**
  - Sticky header (stays visible when scrolling)
  - Sortable columns (click header, arrow indicates direction)
  - Hoverable rows (light gray background on hover)
  - Checkbox column for bulk operations
  - Responsive (horizontal scroll on mobile)
  - Pagination controls at bottom

### 5. Forms
- **Input Fields:**
  - Label (above input, bold, required indicator *)
  - Input or select element
  - Helper text (small, gray, below input)
  - Error message (red, below input, if validation fails)
  - Focus state (light blue border)
- **Dropdowns:**
  - Search functionality for long lists
  - Multi-select capability where applicable
  - Placeholder text
- **Date Pickers:**
  - Calendar popup
  - Time input for datetime fields
  - Today/Tomorrow quick buttons
  - Clear button
- **Buttons:**
  - Primary (green background, white text)
  - Secondary (white background, dark border)
  - Danger (red background, white text)
  - Ghost (transparent, colored text)
  - Disabled state (grayed out)
  - Loading state (spinner icon)

### 6. Search & Filter Patterns
- **Search Bar:**
  - Icon (magnifying glass)
  - Placeholder text showing what to search
  - Clear button (X) appears when text entered
- **Filter Chips:**
  - Clickable tags
  - Selected state (filled background)
  - Unselected state (bordered)
  - Clear all button

### 7. Status Indicators & Badges
- **Badges:**
  - Small rounded rectangles
  - Color-coded: Success (green), Warning (orange), Danger (red), Info (blue)
  - Can contain icons
- **Progress Bars:**
  - Rectangular bars showing percentage
  - Color changes based on threshold (0-33% green, 34-66% yellow, 67-100% red)

### 8. Icons
- **Consistent icon style** (outlined, medium stroke weight)
- **Common icons:**
  - House (Dashboard)
  - People (Users)
  - Door (Rooms)
  - Calendar (Bookings)
  - Star (Reviews)
  - Box (Stock)
  - Megaphone (Events)
  - Gear (Settings)
  - Logout, Profile, Search, etc.

---

## Responsive Design Guidelines
- **Desktop (1920px):** Full sidebar, multi-column layouts
- **Tablet (768px):** Collapsible sidebar, 2-column layouts, responsive cards
- **Mobile (375px):** Hidden sidebar (menu icon), 1-column layout, stack all elements

---

## Additional Features & Flow Highlights

### 1. Role-Based Permissions Display

#### **ADMIN (Super Administrator)**
- **Users:** Full CRUD + assign roles + audit logs
- **Rooms:** Full CRUD
- **Bookings:** Full CRUD + force cancel + delete + change any status
- **Reviews:** View all + delete inappropriate + respond
- **Stock:** Full CRUD + supplier management
- **Events:** Full CRUD
- **Settings:** System configuration, backup/restore, roles & permissions

#### **MANAGER (Operational Manager)**
- **Users:** View only (NO create/edit/delete)
- **Rooms:** Full CRUD
- **Bookings:** Create, view all, update status (confirm/check-in/check-out/cancel), NO delete
- **Reviews:** View all + respond to reviews
- **Stock:** Full CRUD + reorder alerts
- **Events:** Full CRUD
- **Settings:** No access

#### **STAFF (Front Desk/Housekeeping)**
- **Users:** No access
- **Rooms:** View + update room status only (available/occupied/maintenance)
- **Bookings:** Create, view all, check-in/check-out only (cannot cancel without approval)
- **Reviews:** View only
- **Stock:** View + update quantities (usage/restocking)
- **Events:** View only (for room preparation)
- **Settings:** No access

#### **CLIENT (Guest/Customer)**
- **Users:** View/edit own profile only
- **Rooms:** View available rooms only
- **Bookings:** Create own, view own, cancel own (before check-in only)
- **Reviews:** Create/edit own reviews (within 24h), view all reviews
- **Stock:** No access
- **Events:** View public events, register for events
- **Settings:** No access

### 2. Workflows to Test

#### **Workflow 1: Complete Booking Flow (CLIENT)**
1. CLIENT logs in and views dashboard
2. Navigates to Rooms → views only AVAILABLE rooms
3. Clicks "Book Now" on Room 101
4. System calls ms-room via Feign to validate room availability
5. CLIENT fills booking form (dates, guests, special requests)
6. System validates dates don't conflict with existing bookings
7. Booking created with status PENDING
8. MANAGER/STAFF reviews and changes status to CONFIRMED
9. On check-in date, STAFF changes status to CHECKED_IN
10. On check-out date, STAFF changes status to CHECKED_OUT
11. CLIENT can now submit a review

#### **Workflow 2: Booking Status Changes**
- **CLIENT:** Can only cancel own PENDING/CONFIRMED bookings (before check-in)
- **STAFF:** Can check-in (CONFIRMED → CHECKED_IN) and check-out (CHECKED_IN → CHECKED_OUT)
- **MANAGER:** Can confirm (PENDING → CONFIRMED), cancel any booking
- **ADMIN:** Full control over all status changes + can delete bookings

#### **Workflow 3: Review Submission & Response**
1. CLIENT completes stay (booking status = CHECKED_OUT)
2. CLIENT creates review with rating and comment
3. Review marked as "✓ Verified" (linked to real booking)
4. MANAGER sees review and adds business response
5. Rating automatically updates room average rating
6. CLIENT can edit review within 24h, then locked

#### **Workflow 4: Stock Management**
1. STAFF uses minibar items from Room 101
2. STAFF updates stock quantity (50 → 45)
3. System detects quantity < minimum (50 < 50)
4. Alert created: "MINIBAR-WATER Low Stock"
5. MANAGER sees alert and clicks "Reorder"
6. MANAGER creates reorder request to supplier
7. When stock arrives, STAFF updates quantity back to 200

#### **Workflow 5: Event Creation & Room Assignment**
1. MANAGER creates new event "Summer Wedding"
2. Selects event type WEDDING, dates, expected 100 attendees
3. Searches for venue (calls ms-room via Feign)
4. System shows available rooms/halls with capacity ≥ 100
5. MANAGER selects "Grand Hall" (capacity 150)
6. System validates no conflicting events for those dates
7. MANAGER adds services (catering, decoration, music)
8. Total cost calculated automatically
9. Event created with status PLANNED
10. MANAGER confirms payment and changes to CONFIRMED
11. STAFF views event calendar to prepare rooms

#### **Workflow 6: User Management (ADMIN Only)**
1. ADMIN creates new STAFF user
2. Assigns role STAFF (limited permissions auto-applied)
3. New user receives login credentials
4. ADMIN can view audit log of all user actions
5. If user leaves, ADMIN deactivates (not delete) to preserve history

### 3. Search & Autocomplete Examples
- User search: Type name → Dropdown shows matching users
- Room search: Type room number → Suggestions
- Organizer search: Type name → Suggestions with roles
- Supplier autocomplete: Type supplier name → Previous suppliers with auto-complete

### 4. Real-Time Updates (Nice-to-Have)
- Booking status changes reflected immediately
- Stock level updates when items added/removed
- Room status changes shown across all pages
- Review count auto-updates on room cards

---

## Design Consistency Notes
- **Font:** Use modern sans-serif (Helvetica, Segoe UI, or similar)
- **Spacing:** 8px base unit (8, 16, 24, 32, 48px padding/margins)
- **Border Radius:** 8px for cards, 4px for buttons/inputs
- **Shadows:** Subtle shadows for depth on cards and modals
- **Transitions:** Smooth 200ms transitions on hover/focus states
- **Accessibility:** Ensure sufficient color contrast, labels for all inputs, keyboard navigation support

---

## Technology Stack Recommendations
- **Framework:** React or Vue.js
- **UI Library:** Tailwind CSS or Material-UI
- **State Management:** Redux or Vuex
- **HTTP Client:** Axios with interceptors for Bearer token
- **Form Handling:** React Hook Form or Formik
- **Date Handling:** Day.js or Moment.js
- **Charts:** Chart.js or Recharts
- **Icons:** Feather Icons or Heroicons

---

## Deliverables Expected from Figma AI
1. **Homepage/Dashboard** - Complete design with all metrics and charts
2. **Users Management** - Master-detail layout with create/edit forms
3. **Room Management** - Grid view with cards, list view alternative, create/edit modal
4. **Bookings** - Kanban board view with detail modal, calendar view alternative
5. **Reviews** - Reviews list with statistics sidebar, rating breakdown
6. **Stock Management** - Grid cards with form, low stock alerts
7. **Events** - Calendar view with event creation form, details modal
8. **Settings** - Admin panel with multiple tabs
9. **Responsive Variants** - Show tablet and mobile layouts for 2-3 key pages
10. **Component Library** - Buttons, inputs, modals, tables, badges, notifications
11. **Color Specifications** - Export color palette with hex codes
12. **Typography Scale** - Heading levels, body text, small text sizes
13. **Navigation Flows** - User journey diagrams showing interactions between pages
14. **Interaction States** - Hover, active, disabled, loading, error states for key components

---

## Optional Enhancements
- Dark mode variant designs
- Loading skeleton screens for data-heavy pages
- Empty state designs (no users, no bookings, etc.)
- Error page designs (404, 500)
- Print layouts for bookings and invoices
- Mobile app wireframes (if expanding to mobile native)
