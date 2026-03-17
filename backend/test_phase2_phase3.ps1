# VFMS Phase 2 & 3 Comprehensive Test Suite
# Tests cover: User Management, Authentication, File Upload, Exception Handling, Email Templates, Password Validation

$baseUrl = "http://localhost:8080"
$results = @()

function Test-Endpoint {
    param(
        [string]$name,
        [string]$method,
        [string]$endpoint,
        [object]$body = $null,
        [string]$token = $null,
        [int]$expectedStatus = 200
    )
    
    try {
        $headers = @{"Content-Type" = "application/json"}
        if ($token) {
            $headers["Authorization"] = "Bearer $token"
        }
        
        $params = @{
            Uri = "$baseUrl$endpoint"
            Method = $method
            Headers = $headers
        }
        
        if ($body) {
            $params["Body"] = ($body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params
        $status = [int]$response.StatusCode
        
        $success = $status -eq $expectedStatus
        $color = if ($success) { "Green" } else { "Red" }
        
        Write-Host "[$status] $name" -ForegroundColor $color
        
        return @{
            Test = $name
            Status = $status
            Expected = $expectedStatus
            Success = $success
            Response = $response.Content
        }
    } catch [System.Net.WebException] {
        $response = $_.Exception.Response
        if ($response) {
            $statusCode = [int]$response.StatusCode
            $streamReader = New-Object System.IO.StreamReader($response.GetResponseStream())
            $content = $streamReader.ReadToEnd()
            
            $success = $statusCode -eq $expectedStatus
            $color = if ($success) { "Green" } else { "Red" }
            
            Write-Host "[$statusCode] $name" -ForegroundColor $color
            
            return @{
                Test = $name
                Status = $statusCode
                Expected = $expectedStatus
                Success = $success
                Response = $content
            }
        } else {
            Write-Host "[ERROR] $name - $_" -ForegroundColor Red
            return @{
                Test = $name
                Status = "ERROR"
                Expected = $expectedStatus
                Success = $false
                Response = $_.Exception.Message
            }
        }
    } catch {
        Write-Host "[ERROR] $name - $_" -ForegroundColor Red
        return @{
            Test = $name
            Status = "ERROR"
            Expected = $expectedStatus
            Success = $false
            Response = $_.Exception.Message
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   VFMS Phase 2 & 3 Test Suite" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ============================================
# PHASE 2 TESTS: User Management & Auth
# ============================================

Write-Host "`n[PHASE 2] USER MANAGEMENT & AUTHENTICATION`n" -ForegroundColor Yellow

# Test 1: Get all users with pagination
Write-Host "Test 1: Pagination - Get Users (Page 0, Size 10)" -ForegroundColor Magenta
$result = Test-Endpoint -name "GET /api/users?page=0&size=10" -method "GET" -endpoint "/api/users?page=0&size=10" -token "dummy" -expectedStatus 200
$results += $result

# Test 2: Login to get valid token
Write-Host "`nTest 2: Authentication - Login" -ForegroundColor Magenta
$loginBody = @{
    email = "admin@fleet.com"
    password = "password"
}
$loginResult = Test-Endpoint -name "POST /api/auth/login" -method "POST" -endpoint "/api/auth/login" -body $loginBody -expectedStatus 200
$results += $loginResult

# Extract token from login response
$token = $null
if ($loginResult.Success) {
    try {
        $loginData = $loginResult.Response | ConvertFrom-Json
        $token = $loginData.token
        Write-Host "Token obtained: $($token.Substring(0, 20))..." -ForegroundColor Green
    } catch {
        Write-Host "Could not extract token from login response" -ForegroundColor Yellow
    }
}

# Test 3: Get single user by ID
Write-Host "`nTest 3: Get User by ID (ID: 1)" -ForegroundColor Magenta
$result = Test-Endpoint -name "GET /api/users/1" -method "GET" -endpoint "/api/users/1" -token $token -expectedStatus 200
$results += $result

# Test 4: Update user profile
Write-Host "`nTest 4: Update User Profile (ID: 2)" -ForegroundColor Magenta
$updateBody = @{
    firstName = "John"
    lastName = "Driver"
    phoneNumber = "9876543210"
}
$result = Test-Endpoint -name "PUT /api/users/2" -method "PUT" -endpoint "/api/users/2" -body $updateBody -token $token -expectedStatus 200
$results += $result

# Test 5: Test soft delete (deactivate user)
Write-Host "`nTest 5: Soft Delete User (deactivate)" -ForegroundColor Magenta
$result = Test-Endpoint -name "DELETE /api/users/2 (soft delete)" -method "DELETE" -endpoint "/api/users/2" -token $token -expectedStatus 200
$results += $result

# Test 6: Verify user is deactivated
Write-Host "`nTest 6: Verify User is Deactivated" -ForegroundColor Magenta
$result = Test-Endpoint -name "GET /api/users/2 (should fail - deactivated)" -method "GET" -endpoint "/api/users/2" -token $token -expectedStatus 404
$results += $result

# Test 7: Change password
Write-Host "`nTest 7: Change Password" -ForegroundColor Magenta
$changePassBody = @{
    userId = 1
    newPassword = "NewPass123!@#"
}
$result = Test-Endpoint -name "PUT /api/auth/change-password" -method "PUT" -endpoint "/api/auth/change-password" -body $changePassBody -token $token -expectedStatus 200
$results += $result

# ============================================
# PHASE 3 TESTS: Code Quality Features
# ============================================

Write-Host "`n[PHASE 3] CODE QUALITY IMPROVEMENTS`n" -ForegroundColor Yellow

# Test 8: Password complexity validation - Invalid password
Write-Host "Test 8: Password Validation - Invalid Password (too short)" -ForegroundColor Magenta
$invalidPassBody = @{
    email = "admin@fleet.com"
    otp = "000000"
    newPassword = "short"
}
$result = Test-Endpoint -name "POST /api/auth/reset-password (invalid password)" -method "POST" -endpoint "/api/auth/reset-password" -body $invalidPassBody -expectedStatus 400
$results += $result

# Test 9: Exception handling - Invalid email
Write-Host "`nTest 9: Exception Handling - Invalid email format" -ForegroundColor Magenta
$invalidEmailBody = @{
    email = "invalid-email"
}
$result = Test-Endpoint -name "POST /api/auth/send-verification-code (invalid email)" -method "POST" -endpoint "/api/auth/send-verification-code" -body $invalidEmailBody -expectedStatus 400
$results += $result

# Test 10: Exception handling - User not found
Write-Host "`nTest 10: Exception Handling - User not found" -ForegroundColor Magenta
$result = Test-Endpoint -name "GET /api/users/99999 (not found)" -method "GET" -endpoint "/api/users/99999" -token $token -expectedStatus 404
$results += $result

# Test 11: File upload validation - Missing file
Write-Host "`nTest 11: File Upload - Validation (missing file)" -ForegroundColor Magenta
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/fuel/upload-receipt" `
        -Method POST `
        -Headers @{"Authorization" = "Bearer $token"}
    Write-Host "[$($response.StatusCode)] POST /api/fuel/upload-receipt (no file)" -ForegroundColor Yellow
    $results += @{
        Test = "POST /api/fuel/upload-receipt (no file)"
        Status = $response.StatusCode
        Success = $response.StatusCode -eq 400
    }
} catch [System.Net.WebException] {
    $statusCode = [int]$_.Exception.Response.StatusCode
    Write-Host "[$statusCode] POST /api/fuel/upload-receipt (no file)" -ForegroundColor Green
    $results += @{
        Test = "POST /api/fuel/upload-receipt (no file)"
        Status = $statusCode
        Success = $statusCode -eq 400
    }
} catch {
    Write-Host "[ERROR] File upload test - $_" -ForegroundColor Red
}

# Test 12: Fuel record pagination
Write-Host "`nTest 12: Fuel Records - Pagination (Page 0, Size 10)" -ForegroundColor Magenta
$result = Test-Endpoint -name "GET /api/fuel?page=0&size=10" -method "GET" -endpoint "/api/fuel?page=0&size=10" -token $token -expectedStatus 200
$results += $result

# Test 13: Fuel record by vehicle plate
Write-Host "`nTest 13: Fuel Records - Filter by Vehicle Plate" -ForegroundColor Magenta
$result = Test-Endpoint -name "GET /api/fuel/vehicle/ABC123?page=0&size=10" -method "GET" -endpoint "/api/fuel/vehicle/ABC123?page=0&size=10" -token $token -expectedStatus 200
$results += $result

# Test 14: Add new fuel record
Write-Host "`nTest 14: Add Fuel Record" -ForegroundColor Magenta
$fuelBody = @{
    vehiclePlate = "ABC123"
    driverId = 1
    quantity = 50.5
    cost = 2500.75
    pricePerLiter = 49.5
    mileage = 15000
    stationName = "Shell Fuel Station"
    date = (Get-Date).ToString("yyyy-MM-dd")
}
$result = Test-Endpoint -name "POST /api/fuel (add record)" -method "POST" -endpoint "/api/fuel" -body $fuelBody -token $token -expectedStatus 200
$results += $result

# ============================================
# SUMMARY & REPORT
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$passed = ($results | Where-Object { $_.Success -eq $true }).Count
$failed = ($results | Where-Object { $_.Success -ne $true }).Count
$total = $results.Count

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Passed: " -NoNewline
Write-Host "$passed" -ForegroundColor Green
Write-Host "Failed: " -NoNewline
if ($failed -gt 0) {
    Write-Host "$failed" -ForegroundColor Red
} else {
    Write-Host "$failed" -ForegroundColor Green
}

Write-Host "`nDetailed Results:`n"
foreach ($result in $results) {
    $status = if ($result.Success) { "PASS" } else { "FAIL" }
    $color = if ($result.Success) { "Green" } else { "Red" }
    Write-Host "[$status] $($result.Test) | Expected: $($result.Expected), Got: $($result.Status)" -ForegroundColor $color
}

Write-Host "`n========================================" -ForegroundColor Cyan
if ($failed -eq 0) {
    Write-Host "   ALL TESTS PASSED" -ForegroundColor Green
} else {
    Write-Host "   SOME TESTS FAILED - REVIEW ABOVE" -ForegroundColor Red
}
Write-Host "========================================`n" -ForegroundColor Cyan

# Save results to file
$reportPath = ".\test_results_$(Get-Date -Format 'yyyy-MM-dd_HHmmss').txt"
$results | Out-File -FilePath $reportPath
Write-Host "Test report saved to: $reportPath" -ForegroundColor Yellow
