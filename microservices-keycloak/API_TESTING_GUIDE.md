# Hotel Management System - API Testing Guide

## Quick Start Setup

### 1. Start Services in Order
```
1. Keycloak (port 8080)
2. MySQL Database
3. ms-discovery (Eureka - port 8761)
4. All Microservices (ms-user, ms-room, ms-booking, ms-review, ms-stock, ms-event)
5. ms-gateway (port 9090)
```

### 2. Verify Services
- **Eureka Dashboard:** http://localhost:8761
- **Keycloak Admin:** http://localhost:8080/admin (admin/admin)

---

## Authentication

### Get Access Token

**POST** `http://localhost:9090/realms/ecommerce-rta/protocol/openid-connect/token`

**Headers:**
```
Content-Type: application/x-www-form-urlencoded
```

**Body (x-www-form-urlencoded):**

#### For Admin Access:
```
grant_type=password
client_id=backend-client
client_secret=backend-secret
username=admin
password=admin123
```

#### For Manager Access:
```
grant_type=password
client_id=backend-client
client_secret=backend-secret
username=manager
password=manager123
```

#### For Staff Access:
```
grant_type=password
client_id=backend-client
client_secret=backend-secret
username=staff
password=staff123
```

#### For Client Access:
```
grant_type=password
client_id=backend-client
client_secret=backend-secret
username=client1
password=client123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "token_type": "Bearer"
}
```

**Important:** Copy the `access_token` value for use in subsequent requests.

---

## Using the Token

For all API requests below, add this header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Gateway Base URL:** `http://localhost:9090`

---

## MS-USER Endpoints

### 1. Get Current User (NEW - Auto-create)
**GET** `http://localhost:9090/api/users/me`

**Required Role:** Any authenticated user

**Description:** Gets or creates the current user from JWT token

**Response:**
```json
{
  "id": 1,
  "email": "admin@email.com",
  "firstName": "Admin",
  "lastName": "User",
  "phone": "",
  "role": "ADMIN",
  "active": true,
  "createdAt": "2026-02-27T10:30:00",
  "updatedAt": "2026-02-27T10:30:00"
}
```

---

### 2. List All Users
**GET** `http://localhost:9090/api/users`

**Required Role:** ADMIN, MANAGER, STAFF

**Response:**
```json
[
  {
    "id": 1,
    "email": "admin@email.com",
    "firstName": "Admin",
    "lastName": "User",
    "phone": "0123456789",
    "role": "ADMIN",
    "active": true,
    "createdAt": "2026-02-27T10:00:00",
    "updatedAt": "2026-02-27T10:00:00"
  }
]
```

---

### 3. Create User
**POST** `http://localhost:9090/api/users`

**Required Role:** ADMIN, MANAGER

**Body:**
```json
{
  "email": "john.doe@hotel.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "0612345678",
  "role": "STAFF",
  "active": true
}
```

**Response:** 201 Created
```json
{
  "id": 2,
  "email": "john.doe@hotel.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "0612345678",
  "role": "STAFF",
  "active": true,
  "createdAt": "2026-02-27T11:00:00",
  "updatedAt": "2026-02-27T11:00:00"
}
```

---

### 4. Get User by ID
**GET** `http://localhost:9090/api/users/{id}`

**Example:** `http://localhost:9090/api/users/1`

**Required Role:** ADMIN, MANAGER, STAFF

---

### 5. Get User by Email
**GET** `http://localhost:9090/api/users/email/{email}`

**Example:** `http://localhost:9090/api/users/email/john.doe@hotel.com`

**Required Role:** Any authenticated user

---

### 6. Get Users by Role
**GET** `http://localhost:9090/api/users/role/{role}`

**Example:** `http://localhost:9090/api/users/role/CLIENT`

**Required Role:** ADMIN, MANAGER, STAFF

**Valid Roles:** ADMIN, MANAGER, STAFF, CLIENT

---

### 7. Update User
**PUT** `http://localhost:9090/api/users/{id}`

**Example:** `http://localhost:9090/api/users/2`

**Required Role:** ADMIN, MANAGER

**Body:**
```json
{
  "email": "john.doe@hotel.com",
  "firstName": "John",
  "lastName": "Doe Updated",
  "phone": "0698765432",
  "role": "STAFF",
  "active": true
}
```

---

### 8. Delete User
**DELETE** `http://localhost:9090/api/users/{id}`

**Example:** `http://localhost:9090/api/users/2`

**Required Role:** ADMIN only

**Response:** 204 No Content

---

## MS-ROOM Endpoints

### 1. List All Rooms
**GET** `http://localhost:9090/api/rooms`

**Required Role:** Any authenticated user

**Response:**
```json
[
  {
    "id": 1,
    "roomNumber": "101",
    "type": "SINGLE",
    "floor": 1,
    "pricePerNight": 80.00,
    "status": "AVAILABLE",
    "capacity": 1,
    "amenities": "WiFi,TV,Minibar,Air Conditioning",
    "description": "Cozy single room with garden view",
    "createdAt": "2026-02-27T09:00:00",
    "updatedAt": "2026-02-27T09:00:00"
  }
]
```

---

### 2. Create Room
**POST** `http://localhost:9090/api/rooms`

**Required Role:** ADMIN

**Body:**
```json
{
  "roomNumber": "101",
  "type": "SINGLE",
  "floor": 1,
  "pricePerNight": 80.00,
  "status": "AVAILABLE",
  "capacity": 1,
  "amenities": "WiFi,TV,Minibar,Air Conditioning",
  "description": "Cozy single room with garden view"
}
```

**Valid Room Types:** SINGLE, DOUBLE, SUITE, DELUXE

**Valid Status:** AVAILABLE, OCCUPIED, MAINTENANCE, OUT_OF_SERVICE

---

### 3. Get Room by ID
**GET** `http://localhost:9090/api/rooms/{id}`

**Example:** `http://localhost:9090/api/rooms/1`

---

### 4. Get Room by Number
**GET** `http://localhost:9090/api/rooms/number/{roomNumber}`

**Example:** `http://localhost:9090/api/rooms/number/101`

---

### 5. Get Available Rooms
**GET** `http://localhost:9090/api/rooms/available`

**Response:** List of rooms with status AVAILABLE

---

### 6. Get Rooms by Type
**GET** `http://localhost:9090/api/rooms/type/{type}`

**Example:** `http://localhost:9090/api/rooms/type/DOUBLE`

---

### 7. Get Rooms by Status
**GET** `http://localhost:9090/api/rooms/status/{status}`

**Example:** `http://localhost:9090/api/rooms/status/AVAILABLE`

---

### 8. Get Rooms by Floor
**GET** `http://localhost:9090/api/rooms/floor/{floor}`

**Example:** `http://localhost:9090/api/rooms/floor/2`

---

### 9. Update Room
**PUT** `http://localhost:9090/api/rooms/{id}`

**Example:** `http://localhost:9090/api/rooms/1`

**Required Role:** ADMIN

**Body:**
```json
{
  "roomNumber": "101",
  "type": "SINGLE",
  "floor": 1,
  "pricePerNight": 85.00,
  "status": "AVAILABLE",
  "capacity": 1,
  "amenities": "WiFi,TV,Minibar,Air Conditioning,Safe",
  "description": "Renovated single room with garden view"
}
```

---

### 10. Update Room Status
**PATCH** `http://localhost:9090/api/rooms/{id}/status?status={newStatus}`

**Example:** `http://localhost:9090/api/rooms/1/status?status=OCCUPIED`

**Required Role:** ADMIN, MANAGER, STAFF

---

### 11. Delete Room
**DELETE** `http://localhost:9090/api/rooms/{id}`

**Example:** `http://localhost:9090/api/rooms/1`

**Required Role:** ADMIN only

---

## MS-BOOKING Endpoints

### 1. List All Bookings
**GET** `http://localhost:9090/api/bookings`

**Required Role:** ADMIN, MANAGER, STAFF

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "roomId": 1,
    "checkInDate": "2026-03-10",
    "checkOutDate": "2026-03-13",
    "status": "CONFIRMED",
    "totalPrice": 240.00,
    "numberOfGuests": 1,
    "specialRequests": "Late check-in after 10 PM",
    "createdAt": "2026-02-27T12:00:00",
    "updatedAt": "2026-02-27T12:30:00"
  }
]
```

---

### 2. Create Booking
**POST** `http://localhost:9090/api/bookings`

**Required Role:** Any authenticated user

**Body:**
```json
{
  "userId": 1,
  "roomId": 1,
  "checkInDate": "2026-03-10",
  "checkOutDate": "2026-03-13",
  "status": "PENDING",
  "totalPrice": 240.00,
  "numberOfGuests": 1,
  "specialRequests": "Late check-in after 10 PM"
}
```

**Valid Status:** PENDING, CONFIRMED, CANCELLED, COMPLETED

---

### 3. Get Booking by ID
**GET** `http://localhost:9090/api/bookings/{id}`

**Example:** `http://localhost:9090/api/bookings/1`

---

### 4. Get Bookings by User
**GET** `http://localhost:9090/api/bookings/user/{userId}`

**Example:** `http://localhost:9090/api/bookings/user/1`

**Required Role:** CLIENT can only see own bookings, others see all

---

### 5. Get Bookings by Room
**GET** `http://localhost:9090/api/bookings/room/{roomId}`

**Example:** `http://localhost:9090/api/bookings/room/1`

**Required Role:** ADMIN, MANAGER, STAFF

---

### 6. Get Active Bookings
**GET** `http://localhost:9090/api/bookings/active`

**Required Role:** ADMIN, MANAGER, STAFF

**Description:** Returns CONFIRMED bookings with future check-out dates

---

### 7. Update Booking
**PUT** `http://localhost:9090/api/bookings/{id}`

**Example:** `http://localhost:9090/api/bookings/1`

**Required Role:** ADMIN, MANAGER

**Body:**
```json
{
  "userId": 1,
  "roomId": 1,
  "checkInDate": "2026-03-10",
  "checkOutDate": "2026-03-14",
  "status": "CONFIRMED",
  "totalPrice": 320.00,
  "numberOfGuests": 1,
  "specialRequests": "Late check-in after 11 PM"
}
```

---

### 8. Confirm Booking
**PATCH** `http://localhost:9090/api/bookings/{id}/confirm`

**Example:** `http://localhost:9090/api/bookings/1/confirm`

**Required Role:** ADMIN, MANAGER

**Description:** Changes status to CONFIRMED

---

### 9. Cancel Booking
**PATCH** `http://localhost:9090/api/bookings/{id}/cancel`

**Example:** `http://localhost:9090/api/bookings/1/cancel`

**Required Role:** ADMIN, MANAGER, or the booking owner (CLIENT)

**Description:** Changes status to CANCELLED

---

### 10. Delete Booking
**DELETE** `http://localhost:9090/api/bookings/{id}`

**Example:** `http://localhost:9090/api/bookings/1`

**Required Role:** ADMIN only

---

## MS-REVIEW Endpoints

### 1. List All Reviews
**GET** `http://localhost:9090/api/reviews`

**Required Role:** Any authenticated user

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "roomId": 1,
    "bookingId": 1,
    "rating": 5,
    "comment": "Excellent stay! Clean room and friendly staff.",
    "verified": true,
    "createdAt": "2026-02-27T14:00:00",
    "updatedAt": "2026-02-27T14:00:00"
  }
]
```

---

### 2. Create Review
**POST** `http://localhost:9090/api/reviews`

**Required Role:** CLIENT (must have completed booking)

**Body:**
```json
{
  "userId": 1,
  "roomId": 1,
  "bookingId": 1,
  "rating": 5,
  "comment": "Excellent stay! Clean room and friendly staff.",
  "verified": true
}
```

**Rating:** 1-5 (integer)

---

### 3. Get Review by ID
**GET** `http://localhost:9090/api/reviews/{id}`

**Example:** `http://localhost:9090/api/reviews/1`

---

### 4. Get Reviews by Room
**GET** `http://localhost:9090/api/reviews/room/{roomId}`

**Example:** `http://localhost:9090/api/reviews/room/1`

**Description:** All reviews for a specific room

---

### 5. Get Reviews by User
**GET** `http://localhost:9090/api/reviews/user/{userId}`

**Example:** `http://localhost:9090/api/reviews/user/1`

**Required Role:** CLIENT can see own reviews, others see all

---

### 6. Get Verified Reviews
**GET** `http://localhost:9090/api/reviews/verified`

**Description:** Only reviews from verified bookings

---

### 7. Get Room Statistics
**GET** `http://localhost:9090/api/reviews/room/{roomId}/statistics`

**Example:** `http://localhost:9090/api/reviews/room/1/statistics`

**Response:**
```json
{
  "roomId": 1,
  "totalReviews": 10,
  "averageRating": 4.5,
  "fiveStars": 6,
  "fourStars": 3,
  "threeStars": 1,
  "twoStars": 0,
  "oneStars": 0
}
```

---

### 8. Update Review
**PUT** `http://localhost:9090/api/reviews/{id}`

**Example:** `http://localhost:9090/api/reviews/1`

**Required Role:** Review owner or ADMIN

**Body:**
```json
{
  "userId": 1,
  "roomId": 1,
  "bookingId": 1,
  "rating": 5,
  "comment": "Excellent stay! Clean room and very friendly staff. Highly recommend!",
  "verified": true
}
```

---

### 9. Delete Review
**DELETE** `http://localhost:9090/api/reviews/{id}`

**Example:** `http://localhost:9090/api/reviews/1`

**Required Role:** ADMIN only

---

## MS-STOCK Endpoints

### 1. List All Stock Items
**GET** `http://localhost:9090/api/stock`

**Required Role:** ADMIN, MANAGER, STAFF

**Response:**
```json
[
  {
    "id": 1,
    "itemCode": "LINEN-001",
    "name": "White Double Bed Sheets",
    "category": "LINEN",
    "quantity": 200,
    "minQuantity": 50,
    "unit": "piece",
    "unitPrice": 12.50,
    "supplier": "Hotel Supplies France",
    "createdAt": "2026-02-27T08:00:00",
    "updatedAt": "2026-02-27T08:00:00"
  }
]
```

---

### 2. Create Stock Item
**POST** `http://localhost:9090/api/stock`

**Required Role:** ADMIN

**Body:**
```json
{
  "itemCode": "LINEN-001",
  "name": "White Double Bed Sheets",
  "category": "LINEN",
  "quantity": 200,
  "minQuantity": 50,
  "unit": "piece",
  "unitPrice": 12.50,
  "supplier": "Hotel Supplies France"
}
```

**Valid Categories:** LINEN, CLEANING, MINIBAR, TOILETRIES, KITCHEN, MAINTENANCE, OTHER

---

### 3. Get Stock Item by ID
**GET** `http://localhost:9090/api/stock/{id}`

**Example:** `http://localhost:9090/api/stock/1`

---

### 4. Get Stock by Item Code
**GET** `http://localhost:9090/api/stock/code/{itemCode}`

**Example:** `http://localhost:9090/api/stock/code/LINEN-001`

---

### 5. Get Stock by Category
**GET** `http://localhost:9090/api/stock/category/{category}`

**Example:** `http://localhost:9090/api/stock/category/LINEN`

---

### 6. Get Low Stock Items
**GET** `http://localhost:9090/api/stock/low-stock`

**Description:** Items where quantity <= minQuantity

**Response:**
```json
[
  {
    "id": 2,
    "itemCode": "CLEAN-001",
    "name": "Multi-surface cleaner",
    "category": "CLEANING",
    "quantity": 8,
    "minQuantity": 10,
    "unit": "liter",
    "unitPrice": 8.90,
    "supplier": "ProClean SARL",
    "createdAt": "2026-02-27T08:00:00",
    "updatedAt": "2026-02-27T09:00:00"
  }
]
```

---

### 7. Update Stock Item
**PUT** `http://localhost:9090/api/stock/{id}`

**Example:** `http://localhost:9090/api/stock/1`

**Required Role:** ADMIN

**Body:**
```json
{
  "itemCode": "LINEN-001",
  "name": "White Double Bed Sheets",
  "category": "LINEN",
  "quantity": 250,
  "minQuantity": 50,
  "unit": "piece",
  "unitPrice": 12.50,
  "supplier": "Hotel Supplies France"
}
```

---

### 8. Delete Stock Item
**DELETE** `http://localhost:9090/api/stock/{id}`

**Example:** `http://localhost:9090/api/stock/1`

**Required Role:** ADMIN only

---

## MS-EVENT Endpoints

### 1. List All Events
**GET** `http://localhost:9090/api/events`

**Required Role:** Any authenticated user

**Response:**
```json
[
  {
    "id": 1,
    "name": "TechCorp Annual Seminar",
    "type": "SEMINAR",
    "startDateTime": "2026-03-20T09:00:00",
    "endDateTime": "2026-03-20T17:00:00",
    "venue": "Conference Room A",
    "expectedAttendees": 120,
    "organizerId": 1,
    "status": "CONFIRMED",
    "totalCost": 1500.00,
    "description": "Annual company seminar with lunch included",
    "services": "Catering,AV Equipment,Projector,Microphones",
    "createdAt": "2026-02-27T10:00:00",
    "updatedAt": "2026-02-27T11:00:00"
  }
]
```

---

### 2. Create Event
**POST** `http://localhost:9090/api/events`

**Required Role:** MANAGER, CLIENT

**Body:**
```json
{
  "name": "TechCorp Annual Seminar",
  "type": "SEMINAR",
  "startDateTime": "2026-03-20T09:00:00",
  "endDateTime": "2026-03-20T17:00:00",
  "venue": "Conference Room A",
  "expectedAttendees": 120,
  "organizerId": 1,
  "status": "PLANNED",
  "totalCost": 1500.00,
  "description": "Annual company seminar with lunch included",
  "services": "Catering,AV Equipment,Projector,Microphones"
}
```

**Valid Types:** CONFERENCE, SEMINAR, WEDDING, PARTY, MEETING, OTHER

**Valid Status:** PLANNED, CONFIRMED, CANCELLED, COMPLETED

---

### 3. Get Event by ID
**GET** `http://localhost:9090/api/events/{id}`

**Example:** `http://localhost:9090/api/events/1`

---

### 4. Get Events by Organizer
**GET** `http://localhost:9090/api/events/organizer/{organizerId}`

**Example:** `http://localhost:9090/api/events/organizer/1`

---

### 5. Get Events by Type
**GET** `http://localhost:9090/api/events/type/{type}`

**Example:** `http://localhost:9090/api/events/type/WEDDING`

---

### 6. Get Events by Status
**GET** `http://localhost:9090/api/events/status/{status}`

**Example:** `http://localhost:9090/api/events/status/CONFIRMED`

---

### 7. Check Venue Availability
**GET** `http://localhost:9090/api/events/venue-availability?venue={venueName}&start={startDateTime}&end={endDateTime}`

**Example:** 
```
http://localhost:9090/api/events/venue-availability?venue=Conference Room A&start=2026-03-20T09:00:00&end=2026-03-20T17:00:00
```

**Response:**
```json
{
  "available": false,
  "conflictingEvents": [
    {
      "id": 1,
      "name": "TechCorp Annual Seminar",
      "startDateTime": "2026-03-20T09:00:00",
      "endDateTime": "2026-03-20T17:00:00"
    }
  ]
}
```

---

### 8. Update Event
**PUT** `http://localhost:9090/api/events/{id}`

**Example:** `http://localhost:9090/api/events/1`

**Required Role:** MANAGER or event organizer

**Body:**
```json
{
  "name": "TechCorp Annual Seminar - Updated",
  "type": "SEMINAR",
  "startDateTime": "2026-03-20T09:00:00",
  "endDateTime": "2026-03-20T18:00:00",
  "venue": "Conference Room A",
  "expectedAttendees": 150,
  "organizerId": 1,
  "status": "CONFIRMED",
  "totalCost": 1800.00,
  "description": "Annual company seminar with lunch and coffee breaks",
  "services": "Catering,AV Equipment,Projector,Microphones,WiFi"
}
```

---

### 9. Confirm Event
**PATCH** `http://localhost:9090/api/events/{id}/confirm`

**Example:** `http://localhost:9090/api/events/1/confirm`

**Required Role:** ADMIN, MANAGER

---

### 10. Cancel Event
**PATCH** `http://localhost:9090/api/events/{id}/cancel`

**Example:** `http://localhost:9090/api/events/1/cancel`

**Required Role:** ADMIN, MANAGER, or event organizer

---

### 11. Delete Event
**DELETE** `http://localhost:9090/api/events/{id}`

**Example:** `http://localhost:9090/api/events/1`

**Required Role:** ADMIN only

---

## Common Testing Scenarios

### Scenario 1: Complete Booking Flow

1. **Get token as CLIENT**
2. **Get current user:** `GET /api/users/me`
3. **List available rooms:** `GET /api/rooms/available`
4. **Create booking:** `POST /api/bookings` with selected room
5. **Check booking status:** `GET /api/bookings/user/{userId}`

---

### Scenario 2: Manager Approves Booking

1. **Get token as MANAGER**
2. **List all bookings:** `GET /api/bookings`
3. **Confirm booking:** `PATCH /api/bookings/{id}/confirm`
4. **Update room status:** `PATCH /api/rooms/{id}/status?status=OCCUPIED`

---

### Scenario 3: Client Leaves Review

1. **Get token as CLIENT**
2. **Check completed bookings:** `GET /api/bookings/user/{userId}`
3. **Create review:** `POST /api/reviews` (for completed booking)
4. **View own reviews:** `GET /api/reviews/user/{userId}`

---

### Scenario 4: Admin Manages Stock

1. **Get token as ADMIN**
2. **Check low stock:** `GET /api/stock/low-stock`
3. **Update quantity:** `PUT /api/stock/{id}` with increased quantity
4. **Create new item:** `POST /api/stock`

---

### Scenario 5: Event Planning

1. **Get token as MANAGER or CLIENT**
2. **Check venue availability:** `GET /api/events/venue-availability`
3. **Create event:** `POST /api/events`
4. **Confirm event (MANAGER):** `PATCH /api/events/{id}/confirm`

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "unauthorized",
  "error_description": "Full authentication is required"
}
```
**Solution:** Check if Bearer token is included in Authorization header

---

### 403 Forbidden
```json
{
  "error": "access_denied",
  "error_description": "Access is denied"
}
```
**Solution:** User doesn't have required role for this endpoint

---

### 404 Not Found
```json
{
  "timestamp": "2026-02-27T15:00:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Resource not found",
  "path": "/api/users/999"
}
```

---

### 500 Internal Server Error
```json
{
  "timestamp": "2026-02-27T15:00:00.000+00:00",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/api/users"
}
```
**Solution:** Check service logs, database connection, and Eureka registration

---

## Testing Checklist

### Pre-Flight Checks
- [ ] All services running and registered in Eureka
- [ ] Keycloak accessible at http://localhost:8080
- [ ] Gateway accessible at http://localhost:9090
- [ ] Database connections working

### Authentication
- [ ] Can get token for ADMIN
- [ ] Can get token for MANAGER
- [ ] Can get token for STAFF
- [ ] Can get token for CLIENT

### ms-user
- [ ] GET /users/me works
- [ ] GET /users returns list
- [ ] POST /users creates user
- [ ] PUT /users/{id} updates user
- [ ] DELETE /users/{id} deletes user (ADMIN only)

### ms-room
- [ ] GET /rooms returns list
- [ ] GET /rooms/available filters correctly
- [ ] POST /rooms creates room (ADMIN only)
- [ ] PATCH /rooms/{id}/status updates status
- [ ] PUT /rooms/{id} updates room

### ms-booking
- [ ] GET /bookings returns all (ADMIN/MANAGER/STAFF)
- [ ] GET /bookings/user/{id} filters by user
- [ ] POST /bookings creates booking
- [ ] PATCH /bookings/{id}/confirm works (MANAGER)
- [ ] PATCH /bookings/{id}/cancel works

### ms-review
- [ ] GET /reviews returns all
- [ ] GET /reviews/room/{id} filters by room
- [ ] POST /reviews creates review (CLIENT)
- [ ] GET /reviews/room/{id}/statistics calculates correctly
- [ ] PUT /reviews/{id} updates review

### ms-stock
- [ ] GET /stock returns all (ADMIN/MANAGER/STAFF)
- [ ] GET /stock/low-stock filters correctly
- [ ] POST /stock creates item (ADMIN only)
- [ ] PUT /stock/{id} updates item
- [ ] GET /stock/category/{category} filters

### ms-event
- [ ] GET /events returns all
- [ ] GET /events/venue-availability checks conflicts
- [ ] POST /events creates event (MANAGER/CLIENT)
- [ ] PATCH /events/{id}/confirm works
- [ ] PUT /events/{id} updates event

### Integration Tests
- [ ] CORS works from frontend (http://localhost:8091)
- [ ] Token refresh works before expiration
- [ ] Role-based access control works correctly
- [ ] Gateway routes all requests properly
- [ ] Eureka service discovery works

---

## Quick Reference

### User Roles & Permissions

| Endpoint | ADMIN | MANAGER | STAFF | CLIENT |
|----------|-------|---------|-------|--------|
| GET /users/me | ✅ | ✅ | ✅ | ✅ |
| GET /users | ✅ | ✅ | ✅ | ❌ |
| POST /users | ✅ | ✅ | ❌ | ❌ |
| DELETE /users/{id} | ✅ | ❌ | ❌ | ❌ |
| POST /rooms | ✅ | ❌ | ❌ | ❌ |
| PATCH /rooms/{id}/status | ✅ | ✅ | ✅ | ❌ |
| POST /bookings | ✅ | ✅ | ✅ | ✅ |
| PATCH /bookings/{id}/confirm | ✅ | ✅ | ❌ | ❌ |
| POST /reviews | ❌ | ❌ | ❌ | ✅ |
| POST /stock | ✅ | ❌ | ❌ | ❌ |
| GET /stock | ✅ | ✅ | ✅ | ❌ |
| POST /events | ✅ | ✅ | ❌ | ✅ |
| DELETE /events/{id} | ✅ | ❌ | ❌ | ❌ |

---

## Notes

1. **Token Expiration:** Access tokens expire after 300 seconds (5 minutes). Get a new token if requests fail with 401.

2. **Date Format:** Use ISO 8601 format for dates: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss`

3. **IDs:** Replace placeholder IDs in examples with actual IDs from your responses.

4. **CORS:** If testing from browser/Postman web, ensure CORS is configured correctly in gateway.

5. **Database:** Ensure MySQL is running and all services can connect before testing.

6. **Service Discovery:** If getting 503 errors, check Eureka dashboard to verify all services are registered.

---

**Last Updated:** 2026-02-27  
**Gateway Version:** 1.0  
**API Base URL:** http://localhost:9090
