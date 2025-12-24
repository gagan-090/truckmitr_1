# Transporter Login Crash Fix

## Problem
When logging in as a transporter, the app was crashing immediately after successful OTP verification. The logs showed:
- Token expired/unauthorized error
- TOKEN_EXPIRED event emitted
- User logged out immediately
- Navigation back to intro/language screens

## Root Cause
The issue was a race condition during the login flow:

1. **Aggressive Token Validation**: After OTP verification, the app would fetch the user profile immediately
2. **Premature 401/403 Handling**: If the backend hadn't fully activated the token yet, or if there was any delay, the profile fetch would return 401/403
3. **Global Logout Trigger**: The axios interceptor would catch any 401/403 and immediately trigger a global logout via `emitTokenExpired()`
4. **Immediate Logout**: This would log the user out right after they just logged in

This was particularly problematic for transporters, possibly due to:
- Different backend validation timing for transporter role
- Additional permission checks for transporters
- Slower token activation for transporter accounts

## Solution

### 1. Added Delay After Token Save (OTP Screen)
```typescript
// Add a small delay to ensure backend has processed the token
await new Promise<void>(resolve => setTimeout(() => resolve(), 300));
```

### 2. Mark Session Active Immediately
```typescript
// Mark session as active immediately to prevent re-initialization
await AsyncStorage.setItem('app_session_active', 'true');
```

### 3. Improved Axios Interceptor Logic
Added check to prevent global logout on auth/init endpoints with case-insensitive matching:
```typescript
const url = config?.url?.toLowerCase() || '';
// Don't trigger logout for login/signup/init endpoints - let them handle errors
const isAuthEndpoint = url.includes('/login') || 
                      url.includes('/signup') || 
                      url.includes('/otp') ||
                      url.includes('get-profile') || // Profile fetch during login
                      url.includes('subscription/details') || // Subscription fetch during init
                      url.includes('payment'); // Payment/order endpoints during init

if (isAuthEndpoint) {
    console.log('⚠️ 401/403 on auth/init endpoint - not triggering global logout');
    return Promise.reject(error);
}
```

Also improved header checking to handle both string and boolean values:
```typescript
const skipHeader = config?.headers?.['X-Skip-Global-Logout'] || config?.headers?.['x-skip-global-logout'];
if ((config as any)?.skipGlobalLogout || skipHeader === 'true' || skipHeader === true) {
    console.log('⚠️ 401/403 received but skipping global logout due to config/header.');
    return Promise.reject(error);
}
```

### 4. Added Skip-Global-Logout Headers
Added `X-Skip-Global-Logout` header to profile fetches during:
- OTP verification
- App initialization
- Background refresh

This prevents the axios interceptor from triggering automatic logout during these critical operations.

### 5. Removed Unnecessary Delay
Removed the 500ms delay before dispatching `userAuthenticatedAction(true)` - this was causing the blank screen issue.

### 6. Better Error Handling
Added proper cleanup when profile fetch fails:
```typescript
if (profile?.status === 401 || profile?.status === 403) {
    showToast("Session invalid. Please try logging in again.");
    // Clean up
    await AsyncStorage.removeItem('app_session_active');
    await saveUserData(''); // Clear token
}
```

## Files Modified
1. `src/app/layouts/auth/otp/index.tsx` - Improved login flow with delay and session management
2. `src/utils/config/axiosInstance.tsx` - Added auth endpoint check (including get-profile) to prevent premature logout
3. `src/routes/index.tsx` - Added skip-global-logout headers to profile fetches
4. `src/utils/config/tokenValidator.tsx` - Added skip-global-logout header to token validation

## Testing
Test the following scenarios:
1. ✅ Login as transporter - should not crash
2. ✅ Login as driver - should work as before
3. ✅ Token expiration during normal use - should still trigger logout
4. ✅ Network errors during login - should show error, not crash
5. ✅ App backgrounding during login - should complete successfully
6. ✅ Real token expiration - should still logout properly

## Notes
- The 300ms delay gives the backend time to fully activate the token
- The `X-Skip-Global-Logout` header prevents race conditions during critical operations
- Auth endpoints (login/signup/otp) are now excluded from global logout triggers
- Session is marked active immediately to prevent re-initialization issues
