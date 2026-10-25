# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EON Topení is a React-based heating schedule monitoring application with Ionic/Capacitor for mobile deployment. The app fetches heating schedules from a NAS server (via nginx) and displays a visual timeline of when heating is active/inactive. It features automatic update detection, offline caching via localStorage, and supports both web and native Android deployment.

**Key Features:**
- Dynamic configuration loading from remote JSON endpoint
- Automatic version checking and update notifications (every 5 minutes)
- Offline mode with localStorage caching
- Weather widget (6-hour forecast from open-meteo.com)
- Responsive glassmorphism UI design
- Multi-platform: Web (Create React App) + Native Android (Capacitor)

## Common Commands

### Development
```bash
# Install dependencies
npm install

# Start development server (opens http://localhost:3000)
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Android Build
```bash
# Build React app and sync to Android
npm run build && npx cap sync android

# Open Android Studio for APK generation
npx cap open android

# Live reload on device (development)
npx cap run android -l --external

# Clean Android build
cd android && .\gradlew clean && cd ..
```

### Configuration Testing
```bash
# Test with local JSON server on port 3001
npx serve -l 3001 public

# Generate new config with current timestamp
node generate-config.js
```

## Architecture

### Core Data Flow

```
ConfigService.getConfig()
  ↓
  1. Try: Fetch from remote server (with 5s timeout)
  2. Fallback: Use localStorage cache
  3. Fallback: Use hardcoded default data (data.jsx / dataWeekend.jsx)
  ↓
App.js receives config → Displays heating schedule
```

**Update Detection Flow:**
- On mount: Load config immediately
- Every 30 seconds: Check if update available (compares version strings)
- If new version detected: Show UpdateNotification modal
- User clicks "Update": Reload page with new config

### Key Components

**`src/services/ConfigService.js`** (Critical Service)
- Centralized configuration management
- Methods:
  - `getConfig()` - Main method with triple fallback strategy
  - `checkForUpdate()` - Compares local vs server version
  - `setServerUrl(url)` - Stores URL in localStorage
  - `clearLocal()` - Clears cached config
- Validates config structure (18 items for weekday/weekend arrays)
- Handles mixed content warnings (HTTP from HTTPS context)

**`src/App.js`** (Main Logic)
- Manages all heating schedule display logic
- Calculates progress bar position (minutes since 6:00 AM)
- Determines "Topí" (heating ON) vs "Netopí" (heating OFF)
- Computes time remaining/until next heating period
- Auto-refresh every second via setInterval
- Separate schedules for weekday (Mon-Fri) vs weekend (Sat-Sun)

**`src/components/Settings.jsx`**
- User-facing config panel (gear icon)
- Server URL input/storage
- Manual update check button
- Clear cache functionality
- Displays config source badge: Server (green), Local (yellow), Default (white)

**`src/components/UpdateNotification.jsx`**
- Modal dialog for update prompts
- Shows version comparison (current → new)
- Actions: "Update Now" (reloads page) or "Later" (dismiss)

### Configuration Format

JSON endpoint must return:
```json
{
  "version": "2024-11-06T18:00:00Z",  // ISO timestamp for version comparison
  "lastUpdated": "...",
  "description": "...",
  "validFrom": "2024-02-01",
  "validTo": "2024-04-01",
  "weekday": [
    { "id": 6, "value": "ano" },  // 6:00 AM - heating ON
    { "id": 7, "value": "ne" },   // 7:00 AM - heating OFF
    // ... 18 items total (6:00-23:00)
  ],
  "weekend": [/* same structure */]
}
```

**Critical:**
- `weekday` and `weekend` arrays must have exactly 18 items each (hours 6-23)
- `value` field: "ano" = heating ON, "ne" = heating OFF
- Change `version` timestamp whenever updating config to trigger update notifications

### Deployment Architecture

**Web (Development/Netlify):**
- React SPA served over HTTPS
- Subject to browser mixed content restrictions
- Cannot load HTTP resources from HTTPS page

**Native Android (Production):**
- Built with Capacitor → APK
- Bypasses mixed content restrictions
- `android-network-security-config.xml` allows self-signed certificates
- `capacitor.config.ts` sets allowNavigation domains
- Icon/splash screens in `android/app/src/main/res/`

**NAS Server (Docker + nginx):**
- `docker-compose.yml` - nginx:alpine container
- `nginx-default.conf` - CORS headers, no caching, security headers
- Serves `eon-config.json` from mounted volume
- Health check endpoint at `/health`

## Project Structure

```
eon/
├── src/
│   ├── App.js                    # Main app logic, schedule calculations
│   ├── App.css                   # Glassmorphism styles, CSS variables
│   ├── Weather.jsx               # 6-hour weather widget
│   ├── data.jsx                  # Fallback weekday schedule
│   ├── dataWeekend.jsx           # Fallback weekend schedule
│   ├── services/
│   │   └── ConfigService.js      # Configuration loading/caching service
│   └── components/
│       ├── UpdateNotification.jsx # Update prompt modal
│       └── Settings.jsx           # Settings panel with URL config
├── public/
│   └── eon-config.json           # Example/test configuration
├── android/                      # Capacitor Android project (generated)
├── capacitor.config.ts           # Capacitor configuration
├── docker-compose.yml            # NAS server deployment (Portainer stack)
├── nginx-default.conf            # nginx configuration with CORS
├── generate-config.js            # Helper script to generate JSON config
└── setup-android-security.sh    # Sets up network security for self-signed certs
```

## Important Implementation Details

### Time Calculations
- Progress bar represents 6:00 AM (360 min) to midnight (1440 min)
- Current position: `(hours * 60 + minutes) - 360`
- Schedule arrays map to hours 6-23 (indices 0-17)

### Offline Behavior
- localStorage keys: `eon_config`, `eon_config_version`, `eon_config_timestamp`
- Config persists across sessions
- App functional completely offline if config previously cached

### Mixed Content Handling
- Android APK solves this via network security config
- Web requires same protocol (HTTPS ↔ HTTPS or HTTP ↔ HTTP)
- ConfigService checks and warns about protocol mismatches

### Android-Specific
- Network security config allows IP `10.0.1.51` with self-signed cert
- Must update this IP in `android-network-security-config.xml` for different NAS addresses
- Build process: `npm run build` → `npx cap sync android` → Build in Android Studio

### Styling Approach
- Uses CSS custom properties in `App.css` for theming
- Main colors: `--green` (heating ON), `--red` (heating OFF), `--accent`
- Glassmorphism: `backdrop-filter: blur()` with semi-transparent backgrounds
- Fully responsive with mobile-first breakpoints

## Testing

**Unit Tests:**
- Basic tests in `src/App.test.js`
- Run with `npm test`

**Manual Testing Workflow:**
1. Start local JSON server: `npx serve -l 3001 public`
2. In Settings, set URL to `http://localhost:3001/eon-config.json`
3. Click "Check for Update"
4. Verify badge shows "Server" (green)
5. Edit `public/eon-config.json`, change `version` field
6. Wait 30s or click "Check for Update"
7. Verify update notification appears

## Common Development Tasks

**Modify heating schedule:**
1. Edit `public/eon-config.json` or use `node generate-config.js`
2. Change "ano"/"ne" values in weekday/weekend arrays
3. Update `version` field to new ISO timestamp
4. Copy to NAS server or test locally

**Change server URL default:**
- Edit `src/services/ConfigService.js` line 24
- Or set in app Settings UI (persists in localStorage)

**Customize UI colors:**
- Edit CSS variables in `src/App.css` (`.App` selector)
- `--green`, `--red`, `--accent`, `--bg-primary`, etc.

**Add new time slot:**
- Currently hardcoded for 6:00-23:00 (18 hours)
- To extend: modify validation in `ConfigService.validateConfig()`
- Update UI rendering logic in `App.js` (progress calculation)

**Build Android APK:**
1. Follow `ANDROID_BUILD_GUIDE.md` for first-time setup
2. For updates: `npm run build && npx cap sync android`
3. In Android Studio: Build → Build APK(s)
4. Find APK in `android/app/build/outputs/apk/`

## Documentation Reference

- **QUICKSTART.md** - 5-minute setup guide
- **README.md** - Main overview and features
- **FILES_OVERVIEW.md** - Complete file listing and purposes
- **ANDROID_BUILD_GUIDE.md** - Complete Android APK build instructions
- **PORTAINER_QUICKSTART.md** - Quick NAS/Docker setup (5 minutes)
- **PORTAINER_NGINX_SETUP.md** - Detailed Portainer/nginx configuration
- **NAS_SETUP.md** - Alternative setup without Docker

## Troubleshooting

**"Failed to fetch" errors:**
- Check URL in Settings is correct and accessible
- Verify NAS server/nginx container is running
- Check browser console (F12) for CORS or mixed content errors
- Test URL directly in browser - should return valid JSON

**Update notifications not appearing:**
- Verify `version` field was actually changed in JSON
- Check ConfigService is being called (console logs)
- Wait 30 seconds for automatic check, or use manual "Check for Update"
- Clear browser cache if needed

**"Mixed Content" warning:**
- Cannot load HTTP from HTTPS page in browser
- Solutions: Use HTTPS server, run app on HTTP (localhost), or use Android APK
- See `HTTPS_SETUP.md` for generating self-signed certificates

**Android build fails:**
- Ensure Android Studio and SDK 34 installed
- Run `cd android && .\gradlew clean && cd ..`
- Check `capacitor.config.ts` has correct `webDir: 'build'`
- Verify `npm run build` completed successfully

**Badge shows "Default" instead of "Server":**
- Config validation failed - check JSON structure
- Network request failed - check URL accessibility
- View browser console for specific error messages

## Security Considerations

- Server URL stored in localStorage (client-side)
- No authentication on JSON endpoint (relies on network security)
- NAS typically behind firewall, local network only
- HTTPS with self-signed cert supported on Android
- nginx config includes basic security headers
