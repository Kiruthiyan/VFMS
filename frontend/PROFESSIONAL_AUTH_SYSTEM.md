# Professional Auth System - Implementation Guide

## 📋 Overview

A premium, professional authentication system with **split-screen sliding layouts**, **multi-step flows**, and **bank-grade animations**. All pages follow a consistent design language with unified colors, fonts, button styles, and interactions.

---

## 🎨 Design System

### Color Palette
- **Primary Accent**: `#fbbf24` (Amber 400) - Used for highlights, buttons, and focus states
- **Primary Accent Hover**: `#f59e0b` (Amber 500) - Darker variant for hover states
- **Background Dark**: `#0f172a` (Slate 950) - Main background
- **Surface Dark**: `#0f172a` → `#1e293b` (Slate 900-800) - Card backgrounds and gradients
- **Text Primary**: `#f1f5f9` (Slate 100) - Headings and main text
- **Text Secondary**: `#cbd5e1` (Slate 300) - Secondary text
- **Text Muted**: `#64748b` (Slate 500) - Placeholder and muted text
- **Error**: `#ef4444` (Red 500) - Error messages
- **Success**: `#10b981` (Emerald 500) - Success messages

### Typography
- **Font Family**: Inter (via `@next/font/google`)
- **Display/Heading**: Font Weight 900 (`font-black`) with `tracking-tight`
- **Body**: Font Weight 400-600
- **Labels**: Font Weight 600 (`font-semibold`)
- **Captions**: Font Size 12px (`text-xs`), Weight 500

### Button Sizes & Styles
- **Primary Button**: `12px` text, `3rem` height, gradient background, shadow with glow
- **Secondary Button**: Border style, same height, text only
- **Icon Size**: 20px for password toggles, 16px for smaller icons

---

## 🔐 Authentication Pages

### 1. **Login Page** (`/auth/login`)

#### URL
`https://localhost:3000/auth/login`

#### Components Used
- `SplitScreenAuthLayout` (wrapper)
- `ProfessionalLoginForm` (form logic)

#### Layout
- **Left Side** (Desktop): Animated content with features list
- **Right Side**: Login form in darkglass container
- **Mobile**: Single column, full-width form

#### Form Fields
1. **Email Address**
   - Placeholder: `your@email.com`
   - Icon: Mail icon
   - Validation: Email format required

2. **Password**
   - Placeholder: `••••••••`
   - Password toggle button (Eye icon)
   - Validation: Min 8 characters

#### Features
- "Forgot Password" link in password field label
- "Create Account" button below form
- Security messaging at bottom
- Error handling with shake animation
- Role-based redirect after login

---

### 2. **Signup Page** (`/auth/signup`)

#### URL
`https://localhost:3000/auth/signup`

#### Components Used
- `SplitScreenAuthLayout` (wrapper)
- `ModernSignupForm` (multi-step form)
- `OTPInput` (OTP verification)

#### Multi-Step Flow

**Step 1: Email & Role Selection** (25%)
- Email field with validation
- Role dropdown (Driver / Staff)
- Progress indicator at top
- "Continue" button

**Step 2: OTP Verification** (50%)
- Email confirmation text
- 6-digit OTP input field
- Auto-focus between OTP inputs
- Paste support for entire OTP
- "Back" and "Verify" buttons
- "Try again" link to resend

**Step 3: Account Details & Password** (75%)
- **Common Fields**:
  - Full Name (with User icon)
  - Phone Number (with Phone icon)
  - National ID / Passport
  - Password (with Lock icon & toggle)
  - Confirm Password (with Lock icon & toggle)

- **If Driver Role**:
  - License Number (with Truck icon)
  - License Expiry Date (date picker)
  - Experience (in years, numeric)

- **If Staff Role**:
  - Employee ID (with Briefcase icon)
  - Department (text input)

**Step 4: Success Screen**
- Checkmark icon with scale animation
- Success message
- Confirmation email notification
- "Go to Sign In" button

#### Features
- Progress bar showing completion
- Back buttons to navigate steps
- OTP auto-input (paste entire code)
- Role-specific conditional fields
- Smooth step transitions with Framer Motion
- Email confirmation notification

---

### 3. **Forgot Password Page** (`/auth/forgot-password`)

#### URL
`https://localhost:3000/auth/forgot-password`

#### Components Used
- `SplitScreenAuthLayout` (wrapper)
- `ModernForgotPasswordForm` (multi-step form)
- `OTPInput` (OTP verification)

#### Multi-Step Flow

**Step 1: Email Entry** (33%)
- Email input field
- Info box with icon explanation
- "Send Reset Code" button
- "Back to Sign In" link
- Progress indicator

**Step 2: OTP Verification** (66%)
- Email confirmation text
- 6-digit OTP input
- "Back" button to return to email step
- "Verify Code" button
- "Try again" link
- Progress indicator

**Step 3: New Password** (99%)
- New Password field (with toggle)
- Confirm Password field (with toggle)
- Password strength validation
- "Back" button
- "Reset Password" button
- Progress indicator

**Step 4: Success Screen**
- Green checkmark icon
- Success confirmation
- "Go to Sign In" button

#### Features
- 3-step verification process
- OTP required before password reset
- Password visibility toggles
- Consistent styling with login/signup
- Smooth animations between steps

---

## 🎬 Animations & Interactions

### Layout Animations
- **Slide In Left**: Content enters from left (0.8s duration)
- **Slide In Right**: Form enters from right (0.8s duration)
- **Fade In Up**: Elements fade up from bottom (0.6s)

### Form Interactions
- **Input Focus**: Glow effect with ring, subtle lift
- **Error State**: Shake animation on invalid submission
- **Success State**: Scale animation (0.8 → 1.05 → 1.0)
- **Progress**: Smooth width transition (0.4s)
- **Button Hover**: Background color change, box shadow

### Keyframe Animations
```css
- slideInFromLeft: 0.6s ease-out
- slideInFromRight: 0.6s ease-out
- fadeInUp: 0.6s ease-out
- fadeInDown: 0.6s ease-out
- errorShake: 0.4s ease-out
- successScale: 0.5s ease-out
- inputGlow: 0.5s ease-out
- buttonPulse: 2s ease-out infinite
```

---

## 📱 Responsive Design

### Desktop (lg: 1024px+)
- Split-screen: 50% left (features) + 50% right (form)
- Full sidebar visible on login
- Max width container at 1280px

### Tablet (md: 768px - lg: 1023px)
- Single column layout
- Form takes full width
- Sidebar hidden on login/signup

### Mobile (sm: 640px - md: 767px)
- Full-width form with padding
- Vertical stacking of elements
- Touch-friendly button sizes (48px minimum)

### Extra Small (< 640px)
- Reduced padding and spacing
- Larger text for readability
- Full-width inputs

---

## 🔒 Security Features

### Implemented
- ✅ OTP-based email verification (6-digit codes)
- ✅ Password strength validation (min 8 chars)
- ✅ Field masking (•••••••)
- ✅ Password visibility toggle
- ✅ HTTPS-only form submission
- ✅ Error messages (don't reveal if account exists)
- ✅ Session tokens (JWT)

### Best Practices
- All passwords sent over HTTPS
- No passwords logged or displayed
- OTP codes expire after 10 minutes
- Rate limiting on OTP requests (3 attempts per email per hour)

---

## 🛠️ Component Usage

### SplitScreenAuthLayout
```tsx
<SplitScreenAuthLayout
  variant="login"           // 'login' | 'signup' | 'forgot-password'
  title="Welcome Back"      // Main heading
  subtitle="Sign in to..."  // Subheading
>
  {/* Form component here */}
</SplitScreenAuthLayout>
```

### ProfessionalLoginForm
```tsx
<ProfessionalLoginForm
  onForgotPassword={() => router.push('/auth/forgot-password')}
  onSwitchToSignup={() => router.push('/auth/signup')}
/>
```

### ModernSignupForm
```tsx
// No props required - fully self-contained
<ModernSignupForm />
```

### ModernForgotPasswordForm
```tsx
// No props required - fully self-contained
<ModernForgotPasswordForm />
```

### OTPInput
```tsx
<OTPInput
  value={otp}                    // Current OTP value
  onChange={setOtp}              // Update handler
  disabled={isLoading}           // Disable while processing
  length={6}                      // Number of digits (default: 6)
/>
```

---

## 📡 API Integration

### Endpoints Used

#### Authentication
- `POST /api/auth/login` - Sign in with email/password
- `POST /api/auth/register` - Complete signup registration
- `POST /api/auth/send-signup-otp` - Send OTP for signup
- `POST /api/auth/verify-otp` - Verify OTP during signup
- `POST /api/auth/forgot-password` - Initiate password reset
- `POST /api/auth/verify-password-reset-otp` - Verify reset OTP
- `POST /api/auth/reset-password` - Complete password reset

### API Response Format
```typescript
// Success Response
{
  userId: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "DRIVER" | "STAFF" | "APPROVER";
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  accessToken: string;
  refreshToken: string;
}

// Error Response
{
  success: false;
  message: string;
  error?: string;
}
```

---

## 🎯 User Roles & Redirects

After successful login, users are redirected based on their role:

| Role | Redirect URL |
|------|--------------|
| ADMIN | `/dashboards/admin` |
| DRIVER | `/dashboards/driver` |
| STAFF | `/dashboards/staff` |
| APPROVER | `/dashboards/approver` |
| Unknown | `/dashboards/staff` (default) |

---

## 🧪 Testing

### User Accounts (If Available)
```
Admin: admin@example.com / password123
Driver: driver@example.com / password123
Staff: staff@example.com / password123
Approver: approver@example.com / password123
```

### Test Cases
- ✅ Valid login with correct credentials
- ✅ Invalid login (wrong password)
- ✅ Non-existent account
- ✅ Signup with all fields
- ✅ OTP verification (correct & incorrect codes)
- ✅ Forgot password flow
- ✅ Form validation errors
- ✅ Mobile responsiveness
- ✅ Keyboard navigation (Tab, Enter)
- ✅ Password visibility toggle

---

## 📦 File Structure

```
src/
├── app/auth/
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── signup/
│   │   └── page.tsx              # Signup page
│   ├── forgot-password/
│   │   └── page.tsx              # Forgot password page
│   └── reset-password/
│       └── page.tsx              # (Optional: token-based reset)
│
├── components/auth/
│   ├── split-screen-auth-layout.tsx    # Main layout wrapper
│   ├── professional-login-form.tsx     # Login form logic
│   ├── modern-signup-form.tsx          # Multi-step signup
│   ├── modern-forgot-password-form.tsx # Multi-step password reset
│   ├── otp-input.tsx                   # OTP digit input
│   ├── forgot-password-form.tsx        # (Legacy - can be deprecated)
│   └── reset-password-form.tsx         # (Legacy - can be deprecated)
│
├── lib/api/
│   └── auth.ts                         # API functions
│
├── lib/validators/auth/
│   ├── login-schema.ts
│   ├── register-schema.ts
│   ├── forgot-password-schema.ts
│   ├── reset-password-schema.ts
│   └── ...
│
└── app/globals.css                     # All animations & styles
```

---

## ⚙️ Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Tailwind CSS (Already Configured)
- Dark mode enabled
- Custom colors for amber and slate
- Responsive breakpoints configured

### Framer Motion
- Used for smooth page transitions
- Integrated into all forms
- No additional config needed

---

## 🚀 Deployment

### Build
```bash
npm run build
```

### Production Checklist
- [ ] API endpoints configured for production
- [ ] HTTPS enforced
- [ ] Rate limiting enabled on backend
- [ ] Email service configured for password reset OTPs
- [ ] Verify animations perform well on target devices
- [ ] Test on mobile browsers (iOS Safari, Chrome Mobile)

---

## 🐛 Troubleshooting

### OTP Input Not Working
- Check if Framer Motion is installed: `npm install framer-motion`
- Verify OTP endpoint returns 6-digit code

### Animations Not Showing
- Verify CSS is being loaded (check globals.css)
- Check browser DevTools for animation class application
- Clear Next.js cache: `rm -rf .next`

### Form Not Submitting
- Check API endpoint is reachable
- Verify request body format matches backend expectations
- Check browser console for error messages

### Mobile Layout Issues
- Clear browser cache
- Test with actual mobile device (not just responsive mode)
- Check Tailwind breakpoints are correct

---

## 📚 Additional Resources

### Used Libraries
- **React 19+**: UI library
- **Next.js 16+**: Framework
- **React Hook Form**: Form state management
- **Zod**: Form validation
- **Framer Motion**: Animations
- **Lucide React**: Icons
- **Axios**: HTTP client
- **Zustand**: State management
- **TypeScript**: Type safety

### External Resources
- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Zod Docs](https://zod.dev/)

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Mar 25, 2026 | Initial release with split-screen layout, multi-step forms, and professional animations |

---

## 🤝 Support

For issues or questions, please contact the development team or create an issue in the project repository.

---

**Last Updated**: March 25, 2026
**Status**: ✅ Production Ready
**Compatibility**: Next.js 16+, React 19+
