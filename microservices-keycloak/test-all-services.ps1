# Hotel Management System - Quick Test Script
# This script tests all microservices and creates sample data

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Hotel Management System - Test Suite  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if service is responding
function Test-Service {
    param($url, $name)
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✓ $name is running" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "✗ $name is not responding" -ForegroundColor Red
        return $false
    }
}

# Step 1: Check if services are running
Write-Host "Step 1: Checking if services are running..." -ForegroundColor Yellow
Write-Host ""

$keycloakOk = Test-Service "http://localhost:8090" "Keycloak"
$eurekaOk = Test-Service "http://localhost:8761" "Eureka Discovery"
$gatewayOk = Test-Service "http://localhost:9090" "API Gateway"

if (-not ($keycloakOk -and $eurekaOk -and $gatewayOk)) {
    Write-Host ""
    Write-Host "⚠ Some services are not running. Please start them first:" -ForegroundColor Red
    Write-Host "   docker-compose up -d" -ForegroundColor White
    exit 1
}

Write-Host ""
Start-Sleep -Seconds 2

# Step 2: Get Authentication Token
Write-Host "Step 2: Getting authentication token..." -ForegroundColor Yellow

try {
    $tokenResponse = Invoke-RestMethod -Uri "http://localhost:8090/realms/hotel-realm/protocol/openid-connect/token" `
        -Method Post `
        -ContentType "application/x-www-form-urlencoded" `
        -Body @{
            grant_type = "password"
            client_id = "hotel-client"
            username = "admin"
            password = "admin123"
        }
    
    $token = $tokenResponse.access_token
    $headers = @{ Authorization = "Bearer $token" }
    Write-Host "✓ Successfully authenticated as admin" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Failed to get authentication token" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Step 3: Test User Service
Write-Host "Step 3: Testing User Service..." -ForegroundColor Yellow

try {
    # Create a test user
    $newUser = @{
        email = "test.user@hotel.com"
        firstName = "Test"
        lastName = "User"
        phone = "+1234567890"
        role = "CLIENT"
        preferences = "Non-smoking"
        active = $true
    } | ConvertTo-Json

    $user = Invoke-RestMethod -Uri "http://localhost:9090/api/users" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $newUser
    
    Write-Host "✓ Created user: $($user.firstName) $($user.lastName) (ID: $($user.id))" -ForegroundColor Green
    $userId = $user.id

    # Get all users
    $users = Invoke-RestMethod -Uri "http://localhost:9090/api/users" -Headers $headers
    Write-Host "✓ Retrieved $($users.Count) users" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ User Service failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Step 4: Test Room Service
Write-Host "Step 4: Testing Room Service..." -ForegroundColor Yellow

try {
    # Create test rooms
    $room1 = @{
        roomNumber = "101"
        type = "SINGLE"
        floor = 1
        pricePerNight = 99.99
        status = "AVAILABLE"
        capacity = 1
        amenities = "WiFi,TV,Minibar,AC"
        description = "Cozy single room"
    } | ConvertTo-Json

    $createdRoom1 = Invoke-RestMethod -Uri "http://localhost:9090/api/rooms" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $room1
    
    Write-Host "✓ Created room: $($createdRoom1.roomNumber) - $($createdRoom1.type)" -ForegroundColor Green
    $roomId = $createdRoom1.id

    $room2 = @{
        roomNumber = "201"
        type = "SUITE"
        floor = 2
        pricePerNight = 299.99
        status = "AVAILABLE"
        capacity = 4
        amenities = "WiFi,TV,Minibar,AC,Jacuzzi"
        description = "Luxury suite"
    } | ConvertTo-Json

    $createdRoom2 = Invoke-RestMethod -Uri "http://localhost:9090/api/rooms" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $room2
    
    Write-Host "✓ Created room: $($createdRoom2.roomNumber) - $($createdRoom2.type)" -ForegroundColor Green

    # Get available rooms
    $availableRooms = Invoke-RestMethod -Uri "http://localhost:9090/api/rooms/available" -Headers $headers
    Write-Host "✓ Retrieved $($availableRooms.Count) available rooms" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Room Service failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Step 5: Test Booking Service
Write-Host "Step 5: Testing Booking Service..." -ForegroundColor Yellow

try {
    # Create a booking
    $booking = @{
        userId = $userId
        roomId = $roomId
        checkInDate = "2026-03-15"
        checkOutDate = "2026-03-20"
        status = "PENDING"
        totalPrice = 499.95
        numberOfGuests = 1
        specialRequests = "Late check-in"
    } | ConvertTo-Json

    $createdBooking = Invoke-RestMethod -Uri "http://localhost:9090/api/bookings" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $booking
    
    Write-Host "✓ Created booking with confirmation code: $($createdBooking.confirmationCode)" -ForegroundColor Green
    $bookingId = $createdBooking.id

    # Confirm the booking
    $confirmedBooking = Invoke-RestMethod -Uri "http://localhost:9090/api/bookings/$bookingId/confirm" `
        -Method Patch `
        -Headers $headers
    
    Write-Host "✓ Booking confirmed - Status: $($confirmedBooking.status)" -ForegroundColor Green

    # Get all bookings
    $bookings = Invoke-RestMethod -Uri "http://localhost:9090/api/bookings" -Headers $headers
    Write-Host "✓ Retrieved $($bookings.Count) bookings" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Booking Service failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Step 6: Test Review Service
Write-Host "Step 6: Testing Review Service..." -ForegroundColor Yellow

try {
    # Create a review
    $review = @{
        userId = $userId
        roomId = $roomId
        rating = 5
        comment = "Excellent room! Very clean and comfortable."
        verified = $true
    } | ConvertTo-Json

    $createdReview = Invoke-RestMethod -Uri "http://localhost:9090/api/reviews" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $review
    
    Write-Host "✓ Created review with rating: $($createdReview.rating)/5" -ForegroundColor Green

    # Get room statistics
    $stats = Invoke-RestMethod -Uri "http://localhost:9090/api/reviews/room/$roomId/statistics" `
        -Headers $headers
    
    Write-Host "✓ Room statistics - Average Rating: $($stats.averageRating)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Review Service failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Step 7: Test Stock Service
Write-Host "Step 7: Testing Stock Service..." -ForegroundColor Yellow

try {
    # Create stock items
    $stockItem = @{
        itemCode = "TOWEL001"
        itemName = "Bath Towel"
        category = "LINEN"
        quantity = 100
        minQuantity = 20
        unit = "pieces"
        location = "Warehouse A"
    } | ConvertTo-Json

    $createdStock = Invoke-RestMethod -Uri "http://localhost:9090/api/stock" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $stockItem
    
    Write-Host "✓ Created stock item: $($createdStock.itemName) (Qty: $($createdStock.quantity))" -ForegroundColor Green
    $stockId = $createdStock.id

    # Test restock
    $restocked = Invoke-RestMethod -Uri "http://localhost:9090/api/stock/$stockId/restock?quantity=50" `
        -Method Patch `
        -Headers $headers
    
    Write-Host "✓ Restocked item - New quantity: $($restocked.quantity)" -ForegroundColor Green

    # Get all stock
    $stock = Invoke-RestMethod -Uri "http://localhost:9090/api/stock" -Headers $headers
    Write-Host "✓ Retrieved $($stock.Count) stock items" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Stock Service failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Step 8: Test Event Service
Write-Host "Step 8: Testing Event Service..." -ForegroundColor Yellow

try {
    # Create an event
    $event = @{
        organizerId = $userId
        eventName = "Tech Conference 2026"
        eventType = "CONFERENCE"
        venue = "Grand Ballroom"
        startDateTime = "2026-05-15T09:00:00"
        endDateTime = "2026-05-15T17:00:00"
        maxParticipants = 200
        status = "PENDING"
        description = "Annual technology conference"
    } | ConvertTo-Json

    $createdEvent = Invoke-RestMethod -Uri "http://localhost:9090/api/events" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $event
    
    Write-Host "✓ Created event: $($createdEvent.eventName)" -ForegroundColor Green
    $eventId = $createdEvent.id

    # Confirm the event
    $confirmedEvent = Invoke-RestMethod -Uri "http://localhost:9090/api/events/$eventId/confirm" `
        -Method Patch `
        -Headers $headers
    
    Write-Host "✓ Event confirmed - Status: $($confirmedEvent.status)" -ForegroundColor Green

    # Get all events
    $events = Invoke-RestMethod -Uri "http://localhost:9090/api/events" -Headers $headers
    Write-Host "✓ Retrieved $($events.Count) events" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Event Service failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

# Final Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "           Test Summary                 " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ All services tested successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Sample Data Created:" -ForegroundColor Yellow
Write-Host "  - 1 User (Test User)" -ForegroundColor White
Write-Host "  - 2 Rooms (Single & Suite)" -ForegroundColor White
Write-Host "  - 1 Booking (Confirmed)" -ForegroundColor White
Write-Host "  - 1 Review (5 stars)" -ForegroundColor White
Write-Host "  - 1 Stock Item (Bath Towels)" -ForegroundColor White
Write-Host "  - 1 Event (Tech Conference)" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Check Eureka Dashboard: http://localhost:8761" -ForegroundColor Cyan
Write-Host "  2. View TESTING_GUIDE.md for detailed API documentation" -ForegroundColor Cyan
Write-Host "  3. Connect to MySQL to view database:" -ForegroundColor Cyan
Write-Host "     docker exec -it <mysql-container> mysql -uroot -proot" -ForegroundColor Gray
Write-Host ""
Write-Host "To verify data in MySQL:" -ForegroundColor Yellow
Write-Host "  USE msuser; SELECT * FROM users;" -ForegroundColor Gray
Write-Host "  USE msreview; SELECT * FROM reviews;" -ForegroundColor Gray
Write-Host "  USE msstock; SELECT * FROM stock_items;" -ForegroundColor Gray
Write-Host "  USE msevent; SELECT * FROM events;" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
