# Firebase Console Setup Required

## Error: `auth/configuration-not-found`

This means Firebase Authentication needs to be enabled in the Firebase Console.

## Steps to Enable Authentication

1. **Go to Firebase Console**
   - Open: https://console.firebase.google.com/project/spinerr-app/authentication

2. **Enable Authentication**
   - Click **"Get started"** button
   - This will enable the Authentication service

3. **Enable Sign-in Methods**
   - Click on **"Sign-in method"** tab
   - Enable **"Email/Password"**:
     - Click on "Email/Password"
     - Toggle **"Enable"** switch
     - Click **"Save"**
   - Enable **"Anonymous"**:
     - Click on "Anonymous"
     - Toggle **"Enable"** switch
     - Click **"Save"**

4. **Verify**
   - Refresh your local app (http://localhost:3000)
   - Check browser console - should see: `[Auth] Anonymous sign in successful`

## Alternative: Use Firebase Emulators

For local development without touching production:

```bash
# Terminal 1 - Start emulators
firebase emulators:start

# Terminal 2 - Start Next.js with emulators
cd web
pnpm dev:emulators
```

Emulators don't require console setup and work immediately.

## Quick Commands

```bash
# Check if auth is enabled
firebase auth:export test.json --project spinerr-app

# If successful, auth is enabled. If error, follow steps above.
```
