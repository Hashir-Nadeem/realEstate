# Test User Credentials

## Hardcoded Test User for Development

**Phone Number:** +919876543210  
**Password:** test123

## How it works:

1. **Login Flow (Direct):**
   - Enter the phone number: `+919876543210`
   - Enter the password: `test123`
   - Click "Login"
   - You will be automatically logged in (no OTP verification needed)

2. **Signup Flow (With OTP):**
   - Use the same credentials during signup
   - You will be redirected to OTP verification with a 40-second timer
   - Enter any 3-digit number (e.g., 123, 456, 999)
   - The system will accept any OTP for the test user

3. **Logged-in State:**
   - Login buttons will be hidden
   - User name "Test User" will appear in the header
   - Full authentication state will be maintained in localStorage

## Technical Details:

- The test user data is hardcoded in `/lib/auth.ts`
- **Login**: Direct authentication (no OTP required)
- **Signup**: OTP verification with 40-second timer (accepts any OTP)
- User session persists across browser refreshes
- Logout functionality works normally

## Usage:
Perfect for testing both authentication flows:
- **Quick login testing** - immediate authentication
- **Signup flow testing** - full OTP verification experience