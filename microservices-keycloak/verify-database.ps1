# Database Verification Script
# Run this script to check data in all MySQL databases

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Database Verification Script          " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get MySQL container ID
Write-Host "Finding MySQL container..." -ForegroundColor Yellow
$containerInfo = docker ps --filter "ancestor=mysql:8.0" --format "{{.ID}} {{.Names}}"

if (-not $containerInfo) {
    Write-Host "✗ MySQL container not found. Please start it:" -ForegroundColor Red
    Write-Host "  docker-compose up -d mysql" -ForegroundColor White
    exit 1
}

$containerId = $containerInfo.Split()[0]
Write-Host "✓ Found MySQL container: $containerId" -ForegroundColor Green
Write-Host ""

# Function to execute SQL and display results
function Execute-MySQL {
    param($database, $query, $description)
    
    Write-Host "[$database] $description" -ForegroundColor Cyan
    Write-Host "Query: $query" -ForegroundColor Gray
    
    $result = docker exec $containerId mysql -uroot -proot -e "USE $database; $query" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host $result -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "Note: Database or table may not exist yet (this is normal if no data created)" -ForegroundColor Yellow
        Write-Host ""
    }
}

# Show all databases
Write-Host "=== Available Databases ===" -ForegroundColor Yellow
docker exec $containerId mysql -uroot -proot -e "SHOW DATABASES;" 2>&1 | Write-Host
Write-Host ""

Start-Sleep -Seconds 1

# User Service Database
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  User Service Database (msuser)        " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Execute-MySQL "msuser" "SHOW TABLES;" "Tables in msuser database"
Execute-MySQL "msuser" "SELECT COUNT(*) as total_users FROM users;" "Total users count"
Execute-MySQL "msuser" "SELECT id, email, firstName, lastName, role, active FROM users ORDER BY id;" "All users"
Execute-MySQL "msuser" "SELECT role, COUNT(*) as count FROM users GROUP BY role;" "Users by role"
Execute-MySQL "msuser" "SELECT COUNT(*) as total_logs FROM activity_logs;" "Total activity logs"

# Review Service Database
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Review Service Database (msreview)    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Execute-MySQL "msreview" "SHOW TABLES;" "Tables in msreview database"
Execute-MySQL "msreview" "SELECT COUNT(*) as total_reviews FROM reviews;" "Total reviews count"
Execute-MySQL "msreview" "SELECT id, userId, roomId, rating, comment, verified FROM reviews ORDER BY id;" "All reviews"
Execute-MySQL "msreview" "SELECT roomId, AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews GROUP BY roomId;" "Average rating by room"
Execute-MySQL "msreview" "SELECT rating, COUNT(*) as count FROM reviews GROUP BY rating ORDER BY rating DESC;" "Reviews by star rating"

# Stock Service Database
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Stock Service Database (msstock)      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Execute-MySQL "msstock" "SHOW TABLES;" "Tables in msstock database"
Execute-MySQL "msstock" "SELECT COUNT(*) as total_items FROM stock_items;" "Total stock items count"
Execute-MySQL "msstock" "SELECT id, itemCode, itemName, category, quantity, minQuantity, unit FROM stock_items ORDER BY id;" "All stock items"
Execute-MySQL "msstock" "SELECT category, COUNT(*) as count, SUM(quantity) as total_qty FROM stock_items GROUP BY category;" "Stock by category"
Execute-MySQL "msstock" "SELECT id, itemCode, itemName, quantity, minQuantity FROM stock_items WHERE quantity <= minQuantity;" "Low stock items"

# Event Service Database
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Event Service Database (msevent)      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Execute-MySQL "msevent" "SHOW TABLES;" "Tables in msevent database"
Execute-MySQL "msevent" "SELECT COUNT(*) as total_events FROM events;" "Total events count"
Execute-MySQL "msevent" "SELECT id, eventName, eventType, venue, status, maxParticipants FROM events ORDER BY id;" "All events"
Execute-MySQL "msevent" "SELECT eventType, COUNT(*) as count FROM events GROUP BY eventType;" "Events by type"
Execute-MySQL "msevent" "SELECT status, COUNT(*) as count FROM events GROUP BY status;" "Events by status"
Execute-MySQL "msevent" "SELECT venue, COUNT(*) as bookings FROM events GROUP BY venue;" "Venue usage"

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "           Summary                      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get counts
$userCount = docker exec $containerId mysql -uroot -proot -se "USE msuser; SELECT COUNT(*) FROM users WHERE 1=1;" 2>$null
$reviewCount = docker exec $containerId mysql -uroot -proot -se "USE msreview; SELECT COUNT(*) FROM reviews WHERE 1=1;" 2>$null
$stockCount = docker exec $containerId mysql -uroot -proot -se "USE msstock; SELECT COUNT(*) FROM stock_items WHERE 1=1;" 2>$null
$eventCount = docker exec $containerId mysql -uroot -proot -se "USE msevent; SELECT COUNT(*) FROM events WHERE 1=1;" 2>$null

Write-Host "Database Records Summary:" -ForegroundColor Yellow
Write-Host "  Users:        $userCount" -ForegroundColor White
Write-Host "  Reviews:      $reviewCount" -ForegroundColor White
Write-Host "  Stock Items:  $stockCount" -ForegroundColor White
Write-Host "  Events:       $eventCount" -ForegroundColor White
Write-Host ""

Write-Host "Notes:" -ForegroundColor Yellow
Write-Host "  - Room and Booking data are in H2 (in-memory) databases" -ForegroundColor Gray
Write-Host "  - To access H2 console, enable it in application.yml" -ForegroundColor Gray
Write-Host "  - Or use the API to query Room and Booking data" -ForegroundColor Gray
Write-Host ""

Write-Host "To connect manually to MySQL:" -ForegroundColor Yellow
Write-Host "  docker exec -it $containerId mysql -uroot -proot" -ForegroundColor Cyan
Write-Host ""

Write-Host "To run specific queries:" -ForegroundColor Yellow
Write-Host "  docker exec $containerId mysql -uroot -proot -e 'USE msuser; SELECT * FROM users;'" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
