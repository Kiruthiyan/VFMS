# Quick Start Guide - VFMS

## ✅ All Pages Fixed and Ready to Run

### Fixed Issues:
1. ✅ Added Suspense boundaries for `useSearchParams` in verify-email and reset-password pages
2. ✅ Fixed user ID type conversion (Long to String) in auth store
3. ✅ Fixed useEffect dependency warnings
4. ✅ Updated home page to redirect properly
5. ✅ Improved API error handling
6. ✅ Created environment file template
7. ✅ Updated metadata for VFMS

### Running the Application

#### 1. Start Frontend (Already Running)
```bash
cd frontend
npm run dev
```
Frontend will be available at: **http://localhost:3000**

#### 2. Start Backend
```bash
cd backend
mvn spring-boot:run
```
Backend will be available at: **http://localhost:8080**

### Available Pages

#### Authentication Pages (No Auth Required)
- **Login**: http://localhost:3000/auth/login
- **Signup**: http://localhost:3000/auth/signup
- **Email Verification**: http://localhost:3000/auth/verify-email?token={token}
- **Forgot Password**: http://localhost:3000/auth/forgot-password
- **Reset Password**: http://localhost:3000/auth/reset-password?token={token}

#### Dashboard Pages (Auth Required)
- **Admin Dashboard**: http://localhost:3000/dashboard/admin
- **Approver Dashboard**: http://localhost:3000/dashboard/approver
- **Staff Dashboard**: http://localhost:3000/dashboard/staff
- **Driver Dashboard**: http://localhost:3000/dashboard/driver

#### Fuel Management Pages (Auth Required)
- **Fuel Entry**: http://localhost:3000/fuel/add
- **Fuel History**: http://localhost:3000/fuel/history
- **Fuel Analytics**: http://localhost:3000/fuel/analytics

#### Other Pages
- **Unauthorized**: http://localhost:3000/unauthorized
- **Home (Redirects)**: http://localhost:3000/

### Environment Setup

1. **Frontend**: `.env.local` file created with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

2. **Backend**: Update `application.properties`:
   - Database credentials
   - Email configuration (for email verification)
   - JWT secret (change in production)

### Testing Flow

1. **Sign Up**: Go to `/auth/signup` and create an account
2. **Verify Email**: Check email or verify manually in database
3. **Login**: Go to `/auth/login` with your credentials
4. **Access Fuel Management**: Navigate to `/fuel/add` or `/fuel/history`

### Notes

- All pages are now error-free and ready to run
- Frontend development server is running in the background
- Backend needs to be started separately
- Database must be configured and running (PostgreSQL)
- Email service needs configuration for verification emails to work

### Troubleshooting

If you see errors:
1. **CORS Errors**: Make sure backend is running and CORS is configured
2. **API Errors**: Check backend is running on port 8080
3. **Database Errors**: Ensure PostgreSQL is running and database exists
4. **Build Errors**: Run `npm install` in frontend directory

All pages should now run without errors! 🎉

