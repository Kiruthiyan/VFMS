# 🔐 Complete Auth Flow Testing Guide

**Status**: ✅ Both Servers Running
- Frontend: `http://localhost:3000` (Port 3000)
- Backend: `http://localhost:8080` (Port 8080)

---

## 📋 Auth Pages Overview

| Page | Route | Purpose | Status |
|------|-------|---------|--------|
| Login | `/auth/login` | User authentication | ✅ Ready |
| Sign Up | `/auth/signup` | New user registration | ✅ Ready |
| Forgot Password | `/auth/forgot-password` | Password recovery request | ✅ Ready |
| Verify Email | `/auth/verify-email` | Email verification | ✅ Ready |
| Verify OTP | `/auth/verify-otp` | OTP confirmation | ✅ Ready |
| Reset Password | `/auth/reset-password` | Password reset with token | ✅ Ready |

---

## 🔄 Auth Flow Test Sequence

### **Test 1: Complete Registration Flow**

#### Step 1.1: Sign Up Page
- **URL**: `http://localhost:3000/auth/signup`
- **Test Points**:
  - [ ] Form renders with smooth slide-in animation
  - [ ] Design system colors applied (navy #0B1736, gold #F4B400)
  - [ ] Multi-step form visible (Step 1 of 3)
  - [ ] Form fields present:
    - [ ] Full Name input
    - [ ] Email input
    - [ ] Password input with strength indicator
  - [ ] Password strength indicator shows:
    - [ ] Red (Weak)
    - [ ] Orange (Fair)
    - [ ] Gold (Good)
    - [ ] Green (Strong)
  - [ ] Next button is disabled until form is valid
  - [ ] "Already have an account?" link directs to login

#### Step 1.2: Complete Step 1 - Personal Info
- **Test Points**:
  - [ ] Enter full name: "Test User"
  - [ ] Enter email: "testuser@example.com"
  - [ ] Enter password: "SecurePass123!"
  - [ ] Password strength updates in real-time
  - [ ] Next button becomes enabled
  - [ ] Click Next → proceeds to Step 2

#### Step 1.3: Step 2 - Additional Info
- **Test Points**:
  - [ ] Step indicator shows Step 2 of 3
  - [ ] Previous button visible
  - [ ] New form fields visible (company, phone, etc.)
  - [ ] Fill out fields appropriately
  - [ ] Click Next → proceeds to Step 3

#### Step 1.4: Step 3 - Terms & Review
- **Test Points**:
  - [ ] Step indicator shows Step 3 of 3
  - [ ] Review summary of entered data
  - [ ] Terms & conditions checkbox visible
  - [ ] Cannot proceed without accepting terms
  - [ ] Check terms box
  - [ ] Create Account button becomes enabled
  - [ ] Click Create Account

#### Step 1.5: Account Creation Response
- **Test Points**:
  - [ ] Loading state visible
  - [ ] Success message displayed (if successful)
  - [ ] OR error message displayed (if failed)
  - [ ] Redirects to verify-email page (on success)

---

### **Test 2: Email Verification Flow**

#### Step 2.1: Verify Email Page
- **URL**: `http://localhost:3000/auth/verify-email`
- **Test Points**:
  - [ ] Page loads with smooth animations
  - [ ] Email display shows registered email
  - [ ] Verification code input visible
  - [ ] "Check your email for verification code" message shown
  - [ ] Resend code link available

#### Step 2.2: Enter Verification Code
- **Test Points**:
  - [ ] Enter verification code (check email or use mock)
  - [ ] Code is validated on backend
  - [ ] Success animation plays (bounce/scale)
  - [ ] Redirects to verify-otp page OR dashboard (if OTP not required)

---

### **Test 3: OTP Verification Flow** (if applicable)

#### Step 3.1: Verify OTP Page
- **URL**: `http://localhost:3000/auth/verify-otp`
- **Test Points**:
  - [ ] Page renders with modal-like styling
  - [ ] OTP input fields visible (usually 6 digits)
  - [ ] Auto-focus on first field
  - [ ] Tab key navigates between fields
  - [ ] Paste functionality works
  - [ ] Timer shows countdown for OTP validity

#### Step 3.2: Enter OTP Code
- **Test Points**:
  - [ ] Manually enter 6-digit code or paste it
  - [ ] Fields validate as OTP is entered
  - [ ] Auto-submit when all digits entered
  - [ ] Success feedback on backend validation
  - [ ] Redirects to login page (if fresh signup)

---

### **Test 4: Login Flow**

#### Step 4.1: Login Page
- **URL**: `http://localhost:3000/auth/login`
- **Test Points**:
  - [ ] Page renders with professional design
  - [ ] Navy (#0B1736) primary color used
  - [ ] Gold (#F4B400) accent on links
  - [ ] Form fields visible:
    - [ ] Email input
    - [ ] Password input
    - [ ] "Remember me" checkbox
  - [ ] Links visible:
    - [ ] "Forgot password?" link
    - [ ] "Don't have an account?" → signup link
  - [ ] Login button visible and styled with design system

#### Step 4.2: Enter Credentials
- **Test Points**:
  - [ ] Email: "testuser@example.com"
  - [ ] Password: "SecurePass123!"
  - [ ] Check "Remember me" checkbox
  - [ ] Click Login button

#### Step 4.3: Login Response
- **Test Points**:
  - [ ] Loading spinner displayed during request
  - [ ] Backend validates credentials
  - [ ] If valid:
    - [ ] Auth token stored in localStorage
    - [ ] Redirects to appropriate dashboard based on role:
      - [ ] Admin → `/(dashboards)/admin`
      - [ ] Driver → `/(dashboards)/driver`
      - [ ] Approver → `/(dashboards)/approver`
      - [ ] Staff → `/(dashboards)/staff`
  - [ ] If invalid:
    - [ ] Error message displayed in design system error color (#F04438)
    - [ ] "Email or password is incorrect" message shown
    - [ ] Form remains for retry

---

### **Test 5: Forgot Password Flow**

#### Step 5.1: Forgot Password Page
- **URL**: `http://localhost:3000/auth/forgot-password`
- **Test Points**:
  - [ ] Page renders with animations
  - [ ] Heading: "Forgot Your Password?"
  - [ ] Description text visible
  - [ ] Email input field present
  - [ ] Back to login link available
  - [ ] Send Reset Link button visible

#### Step 5.2: Request Password Reset
- **Test Points**:
  - [ ] Enter email: "testuser@example.com"
  - [ ] Click "Send Reset Link"
  - [ ] Loading state displayed
  - [ ] Backend sends reset email (or mock response)

#### Step 5.3: Success State
- **Test Points**:
  - [ ] Success message: "Check your email for reset link"
  - [ ] Success icon with gold/green background
  - [ ] Option to "Try another email"
  - [ ] Button to return to login
  - [ ] Email sent confirmation

---

### **Test 6: Reset Password Flow**

#### Step 6.1: Reset Password Page
- **URL**: `http://localhost:3000/auth/reset-password?token=<reset_token>`
- **Test Points**:
  - [ ] Page loads only with valid token
  - [ ] If invalid token:
    - [ ] Error message displayed (#F04438)
    - [ ] "Invalid or expired link" message shown
    - [ ] Link to request new reset
  - [ ] If valid token:
    - [ ] New password input visible
    - [ ] Confirm password input visible
    - [ ] Password strength indicator active

#### Step 6.2: Enter New Password
- **Test Points**:
  - [ ] New password: "NewSecurePass123!"
  - [ ] Confirm password: "NewSecurePass123!"
  - [ ] Password strength updates in real-time
  - [ ] Strength colors work:
    - [ ] Red (Weak)
    - [ ] Orange (Fair)
    - [ ] Gold (Good)
    - [ ] Green (Strong)
  - [ ] Passwords match validation
  - [ ] Reset Password button enabled
  - [ ] Click Reset Password

#### Step 6.3: Reset Response
- **Test Points**:
  - [ ] Loading state visible
  - [ ] Success message: "Password reset successfully"
  - [ ] Success animation plays
  - [ ] Redirects to login page
  - [ ] Can now login with new password

---

## 🎨 Design System Verification

### Color Consistency Checks
- [ ] All pages use navy primary (#0B1736) for headers/text
- [ ] All accent elements use gold (#F4B400)
- [ ] Error states use red (#F04438)
- [ ] Success states use green (#12B76A)
- [ ] Form inputs have consistent borders (#E4E7EC)
- [ ] Focus states use gold accent with ring

### Animation Checks
- [ ] All page transitions smooth (slide from right/left/bottom)
- [ ] Form inputs fade in smoothly
- [ ] Success messages bounce/scale in
- [ ] Loading spinners animate continuously
- [ ] Transitions use professional easing curves

### Typography Checks
- [ ] Headers use consistent font sizing
- [ ] Labels use consistent sizing/weight
- [ ] Button text matches design system
- [ ] Error messages display properly
- [ ] All fonts consistent across pages

### Spacing & Layout Checks
- [ ] Consistent padding around content
- [ ] Form fields properly spaced
- [ ] Buttons sized uniformly
- [ ] Responsive on mobile/tablet/desktop
- [ ] No horizontal scrolling

---

## 🔗 API Endpoint Testing

### Backend Endpoints to Test

#### Auth Endpoints
- [ ] `POST /api/auth/register` - User registration
- [ ] `POST /api/auth/login` - User login
- [ ] `POST /api/auth/refresh` - Refresh token
- [ ] `POST /api/auth/logout` - User logout
- [ ] `POST /api/auth/forgot-password` - Request password reset
- [ ] `POST /api/auth/reset-password` - Reset password
- [ ] `POST /api/auth/verify-email` - Verify email
- [ ] `POST /api/auth/verify-otp` - Verify OTP
- [ ] `POST /api/auth/resend-verification` - Resend verification code

#### Response Format
- [ ] All responses include proper HTTP status codes
- [ ] Error responses include message field
- [ ] Success responses include data field
- [ ] Auth tokens are JWT format
- [ ] CORS headers are properly set

---

## ✅ Test Checklist Summary

### Frontend Tests
- [ ] All 6 auth pages render correctly
- [ ] Design system colors applied consistently
- [ ] Animations working smoothly
- [ ] Form validation working
- [ ] Navigation between pages working
- [ ] Responsive design working

### Backend Tests
- [ ] SpringBoot server running on port 8080
- [ ] All auth endpoints responding
- [ ] Database connections working
- [ ] Validation logic working
- [ ] Error handling working
- [ ] CORS configured properly

### Integration Tests
- [ ] Frontend can connect to backend
- [ ] Auth tokens received and stored
- [ ] Redirects based on user role working
- [ ] Protected routes redirecting to login
- [ ] Remember me functionality working

---

## 🚀 Quick Test Commands

```bash
# Check frontend
curl http://localhost:3000

# Check backend
curl http://localhost:8080/api/auth/health

# Check if ports are in use
netstat -ano | findstr ":3000"
netstat -ano | findstr ":8080"
```

---

## 📝 Notes for Testing

1. **Use Test Email**: Create accounts with test email addresses
2. **Mock Emails**: Check if emails are mocked in development
3. **Reset Tokens**: Verify reset tokens have proper expiration
4. **OTP Codes**: Check how OTP codes are generated/sent
5. **Session Management**: Verify logout clears tokens properly
6. **Error Messages**: Check all error messages are using design system
7. **Loading States**: Verify loading indicators on all async operations
8. **Accessibility**: Test keyboard navigation, ARIA labels, screen readers

---

## 🐛 Common Issues to Check

- [ ] Port conflicts preventing servers from starting
- [ ] Database connection issues on backend
- [ ] Missing environment variables
- [ ] CORS errors preventing API calls
- [ ] Token expiration handling
- [ ] Form validation edge cases
- [ ] Mobile responsiveness issues
- [ ] Animation performance on slower devices

---

**Last Updated**: March 25, 2026
**Frontend Status**: ✅ Running on port 3000
**Backend Status**: ✅ Running on port 8080
