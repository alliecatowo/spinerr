# Spinerr Development Guide

## Local Development Setup

### Prerequisites
- **Node.js** 20+ (managed via mise)
- **pnpm** 10+ (managed via mise)
- **Firebase CLI** (installed globally)

### Initial Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/alliecatowo/spinerr.git
   cd spinerr
   mise install  # Installs Node.js, pnpm
   cd web
   pnpm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your Firebase credentials from:
   https://console.firebase.google.com/project/spinerr-app/settings/general

3. **Run with Production Firebase (default)**
   ```bash
   pnpm dev
   ```
   Open http://localhost:3000

### Local Testing with Firebase Emulators

For safe local development without touching production data:

1. **Start Firebase Emulators** (in one terminal):
   ```bash
   firebase emulators:start
   ```

   Emulator UI: http://localhost:4000
   - Auth Emulator: http://localhost:9099
   - Firestore Emulator: http://localhost:8080

2. **Start Next.js with Emulators** (in another terminal):
   ```bash
   cd web
   pnpm dev:emulators
   ```

   Or use the combined command:
   ```bash
   pnpm test:local
   ```

3. **Verify Emulator Connection**
   Check browser console for:
   ```
   [Firebase] Connecting to emulators...
   [Firebase] Connected to emulators
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | ✅ |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ✅ |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | ✅ |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | ✅ |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | ✅ |
| `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` | Use emulators (true/false) | ❌ (defaults to false) |
| `YOUTUBE_API_KEY` | YouTube Data API key | ❌ (optional) |

**IMPORTANT:** Never commit `.env.local` - it's already in `.gitignore`

## Build and Deploy

### Local Build
```bash
cd web
pnpm build
pnpm start  # Test production build locally
```

### Deploy to Firebase
```bash
# From project root
firebase deploy --only hosting
```

### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

## CI/CD Pipeline

### GitHub Actions Workflow

`.github/workflows/ci.yml` runs on every push:

1. **Lint & Build** - Runs on all branches
   - Lints code with ESLint
   - Builds Next.js app
   - Uploads build artifacts

2. **Deploy** - Runs only on `main` branch
   - Builds with production Firebase config
   - Deploys to Firebase Hosting
   - Auto-deploys on merge to main

### Required GitHub Secrets

Add these in **Settings → Secrets and variables → Actions**:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_SERVICE_ACCOUNT  # JSON service account key
```

#### Generate Firebase Service Account:
1. Go to [Firebase Console](https://console.firebase.google.com/project/spinerr-app/settings/serviceaccounts/adminsdk)
2. Click **Generate new private key**
3. Save JSON file
4. Copy entire JSON content to `FIREBASE_SERVICE_ACCOUNT` secret

## Testing

### Test Authentication Flows

1. **Anonymous User Flow**
   - Open app → auto signs in anonymously
   - Add albums to library → stored in localStorage
   - Check: Library persists on page refresh

2. **Account Creation Flow**
   - Click "Create Account" (when UI is built)
   - Enter email/password
   - Check: Anonymous library auto-migrates to Firestore
   - Check console: `[LibrarySync] Migrated X albums to Firestore`

3. **Sign In on Different Device**
   - Sign in with same email/password
   - Check: Library syncs from Firestore

4. **Sign Out Flow**
   - Sign out → auto converts to anonymous
   - Check: Can still use app with localStorage

### Debug Tips

**Enable Firebase Debug Logging:**
```typescript
// In firebase.ts
import { setLogLevel } from 'firebase/app';
setLogLevel('debug');
```

**Check Auth State:**
```javascript
// In browser console
firebase.auth().currentUser
```

**View Emulator Data:**
- Auth: http://localhost:4000/auth
- Firestore: http://localhost:4000/firestore

## Project Structure

```
spinerr/
├── .github/workflows/     # CI/CD workflows
├── web/                   # Next.js application
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts (AuthContext)
│   │   ├── lib/          # Core libraries
│   │   │   ├── firebase.ts         # Firebase init
│   │   │   ├── auth.ts             # Auth methods
│   │   │   ├── library-sync.ts     # Hybrid storage
│   │   │   └── store.ts            # Zustand stores
│   │   └── hooks/        # Custom React hooks
│   ├── public/           # Static assets
│   └── .env.local        # Local environment (DO NOT COMMIT)
├── firebase.json          # Firebase config
├── firestore.rules        # Firestore security rules
└── firestore.indexes.json # Firestore indexes
```

## Common Issues

### Error: `auth/configuration-not-found`
- **Cause:** Missing or invalid `.env.local` file
- **Fix:** Copy `.env.example` to `.env.local` and add real Firebase credentials

### Error: `auth/invalid-api-key`
- **Cause:** Incorrect `NEXT_PUBLIC_FIREBASE_API_KEY`
- **Fix:** Get correct API key from Firebase console

### Build fails with TypeScript errors
- **Cause:** Type mismatches or missing types
- **Fix:** Run `pnpm lint` to see detailed errors

### Emulators won't start
- **Cause:** Ports 4000, 8080, 9099 already in use
- **Fix:**
  ```bash
  lsof -ti:4000,8080,9099 | xargs kill -9  # Kill processes on those ports
  ```

### Changes not reflecting
- **Cause:** Next.js cache
- **Fix:**
  ```bash
  rm -rf .next
  pnpm dev
  ```

## Useful Commands

```bash
# Development
pnpm dev                  # Start dev server (production Firebase)
pnpm dev:emulators        # Start with emulators
pnpm test:local           # Start emulators + dev server

# Build
pnpm build                # Production build
pnpm start                # Run production build

# Emulators
firebase emulators:start  # Start all emulators
firebase emulators:exec   # Run tests with emulators

# Deployment
firebase deploy           # Deploy everything
firebase deploy --only hosting          # Deploy hosting only
firebase deploy --only firestore:rules  # Deploy Firestore rules only

# Firebase CLI
firebase login                          # Login to Firebase
firebase projects:list                  # List projects
firebase use spinerr-app                # Switch to project
```

## Resources

- [Firebase Docs](https://firebase.google.com/docs)
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Firebase Emulators](https://firebase.google.com/docs/emulator-suite)
- [GitHub Actions](https://docs.github.com/en/actions)
