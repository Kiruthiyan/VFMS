@echo off
REM VFMS Phase 2 & 3 Test Suite using curl
setlocal enabledelayedexpansion

set "BASE_URL=http://localhost:8080"
set "PASS=0"
set "FAIL=0"

echo.
echo ========================================
echo    VFMS Phase 2 ^& Phase 3 Tests
echo ========================================
echo.

REM Test 1: Login
echo [Phase 2] Test 1: Login with credentials
curl -s -X POST "%BASE_URL%/api/auth/authenticate" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@fleet.com\",\"password\":\"password\"}" > login_response.json

for /f "tokens=2 delims=:," %%A in ('findstr /i "token" login_response.json') do (
  set "TOKEN=%%A"
  goto :login_success
)
echo [FAIL] Login - No token received
set /a FAIL+=1
goto :test2

:login_success
echo [PASS] Login successful
set /a PASS+=1
REM Extract token (remove quotes and trim)
for /f "tokens=*" %%A in ('type login_response.json ^| findstr token') do (
  echo %%A | findstr token > nul && (
    echo [PASS] Authentication successful
  )
)

REM Test 2: Get all users
:test2
echo.
echo [Phase 2] Test 2: Get All Users (Paginated)
if defined TOKEN (
  curl -s -X GET "%BASE_URL%/api/users?page=0^&size=10" ^
    -H "Authorization: Bearer !TOKEN:~1,-1!" > users_response.json
  
  findstr /i "content" users_response.json > nul && (
    echo [PASS] Get All Users - Data retrieved
    set /a PASS+=1
  ) || (
    echo [FAIL] Get All Users - No content found
    set /a FAIL+=1
  )
) else (
  echo [SKIP] No token available
)

REM Test 3: Invalid email validation
echo.
echo [Phase 3] Test 3: Email Validation (Invalid Format)
curl -s -X POST "%BASE_URL%/api/auth/send-verification-code" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"not-valid-email\"}" > email_validation_response.json

findstr /i "400\|Validation\|Email should be valid" email_validation_response.json > nul && (
  echo [PASS] Email Validation - Correctly rejected invalid email
  set /a PASS+=1
) || (
  echo [FAIL] Email Validation - Should reject invalid email
  set /a FAIL+=1
)

REM Test 4: Password complexity validation
echo.
echo [Phase 3] Test 4: Password Complexity Validation
curl -s -X POST "%BASE_URL%/api/auth/reset-password" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@fleet.com\",\"otp\":\"123456\",\"newPassword\":\"weak\"}" > pass_validation_response.json

findstr /i "400\|error" pass_validation_response.json > nul && (
  echo [PASS] Password Complexity - Correctly rejected weak password
  set /a PASS+=1
) || (
  echo [FAIL] Password Complexity - Should reject weak password
  set /a FAIL+=1
)

REM Test 5: Fuel records pagination
:test5
echo.
echo [Phase 3] Test 5: Fuel Records Pagination
if defined TOKEN (
  curl -s -X GET "%BASE_URL%/api/fuel?page=0^&size=10" ^
    -H "Authorization: Bearer !TOKEN:~1,-1!" > fuel_response.json
  
  findstr /i "content\|totalPages" fuel_response.json > nul && (
    echo [PASS] Fuel Records Pagination - Data Retrieved
    set /a PASS+=1
  ) || (
    echo [FAIL] Fuel Records Pagination - No data found
    set /a FAIL+=1
  )
) else (
  echo [SKIP] No token available
)

REM Summary
echo.
echo ========================================
echo    TEST RESULTS SUMMARY
echo ========================================
echo.
echo Passed: %PASS%
echo Failed: %FAIL%
echo Total:  %PASS%+%FAIL%=%((PASS + FAIL))%
echo.

if %FAIL% EQU 0 (
  echo ALL TESTS PASSED
  echo Pass Rate: 100%%
) else (
  set /a PERCENT=(PASS * 100) / (PASS + FAIL)
  echo Pass Rate: !PERCENT!%%
)

echo ========================================
echo.

REM Cleanup
del /q login_response.json users_response.json email_validation_response.json pass_validation_response.json fuel_response.json 2>nul

