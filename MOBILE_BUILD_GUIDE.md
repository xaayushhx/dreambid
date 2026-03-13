# DreamBid Mobile Build Guide - iOS & Android

This guide covers building your DreamBid application as native iOS and Android apps using Capacitor.

## What You've Set Up ✅

- ✅ Capacitor installed
- ✅ Android platform initialized
- ✅ iOS platform initialized
- ✅ Production bundle built
- ✅ Web assets synced to both platforms

## Prerequisites

### For Android APK Build
- **Android Studio** - Download from [developer.android.com](https://developer.android.com/studio)
- **JDK 11+** - Verify with: `java -version`
- **Android SDK** - Installed via Android Studio

### For iOS Build
- **macOS** - iOS development requires a Mac
- **Xcode** - Install from App Store or [Apple Developer](https://developer.apple.com)
- **CocoaPods** - Installed via Xcode

---

## Android APK Build

### Step 1: Setup Android Environment

```bash
# Check Java installation
java -version

# List Android SDK versions
android list sdk

# Or check via Android Studio settings
# Android Studio → Settings → Appearance & Behavior → System Settings → Android SDK
```

### Step 2: Open Android Project in Android Studio

```bash
npx cap open android
```

This opens the Android project in Android Studio. Android Studio will:
- Download required Gradle dependencies
- Configure build tools
- Index the project (wait for completion)

### Step 3: Create Release Keystore (First Time Only)

A keystore is required to sign your APK for release on Google Play.

```bash
# Generate secure keystore
cd /home/kazuha/work/dreambid/unified-dreambid

keytool -genkey -v -keystore dreambid-release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias dreambid-key -storepass dreambid123 -keypass dreambid123 \
  -dname "CN=DreamBid,O=DreamBid,C=US"
```

**Important Security Notes:**
- Store `dreambid-release.keystore` in a SECURE location
- NEVER commit to git (already in .gitignore)
- Backup this file - losing it means you can't update your app
- Use a STRONG password, not "dreambid123"
- This keystore is valid for 10,000 days (~27 years)

### Step 4: Configure Signing in Android Studio

1. **File** → **Project Structure** → **Modules** → **app**
2. Click **Signing** tab
3. Click **+** to add new signing configuration:
   - **Name:** `release`
   - **Keystore path:** Browse to `dreambid-release.keystore`
   - **Keystore password:** Your keystore password
   - **Key alias:** `dreambid-key`
   - **Key password:** Your key password
4. Click **OK**

### Step 5: Configure Build Types

1. In Project Structure, click **Build Types** tab
2. Select **release**
3. Under "Signing Config", choose the `release` config you just created
4. Click **OK** and **Finish**

### Step 6: Build the APK

1. In Android Studio: **Build** → **Build Bundle(s)/APK(s)** → **Build APK(s)**
2. Wait for build to complete (5-10 minutes)
3. You'll see a notification: "Build successful" with a link to the APK location

### Step 7: Locate Your APK

```bash
# APK location
ls -lah android/app/release/app-release.apk

# File size should be 15-30 MB
```

### Step 8: Test on Device or Emulator

#### Option A: Connected Physical Device

```bash
# Make sure device is connected and USB debugging is enabled
adb devices

# Install APK
adb install -r android/app/release/app-release.apk

# View logs
adb logcat | grep -i dreambid
```

#### Option B: Android Emulator

1. Open Android Studio
2. **Tools** → **Virtual Device Manager**
3. Create or select an emulator
4. Click **Play** to start it
5. Run: `adb install -r android/app/release/app-release.apk`

### Step 9: Test Checklist

Before uploading to Google Play, verify:

- [ ] App launches without crashes
- [ ] Login/logout works correctly
- [ ] Property browsing and search work
- [ ] Images load properly
- [ ] Maps and location features work
- [ ] WhatsApp sharing works
- [ ] Network requests use HTTPS
- [ ] Push notifications (if enabled) work
- [ ] Logout clears sensitive data
- [ ] Permission prompts appear correctly
- [ ] No console errors (check with: `adb logcat`)

---

## Verify APK Security

```bash
# Check APK doesn't contain sensitive files
unzip -l android/app/release/app-release.apk | grep -i "keystore\|secret"
# Should return nothing

# Verify APK is properly signed
jarsigner -verify -verbose -certs android/app/release/app-release.apk
# Should show: "verified OK"

# Check for hardcoded secrets
unzip -p android/app/release/app-release.apk | strings | grep -i "password\|secret\|api.*key"
# Should return nothing
```

---

## iOS Build

### Prerequisites
- **macOS** computer
- **Xcode** (from App Store)
- **Apple Developer Account** ($99/year for App Store distribution)
- **iOS SDK** 13.0 or later

### Step 1: Open iOS Project in Xcode

```bash
npx cap open ios
```

This opens the iOS project in Xcode. Xcode will:
- Download dependencies
- Configure build settings
- Index the project

### Step 2: Configure App Signing

1. In Xcode: **Signing & Capabilities** tab
2. Select team (or create one with Apple ID)
3. Set Bundle ID to `com.dreambid.app`
4. Xcode will automatically manage signing certificates

### Step 3: Build for Testing

```bash
# Build for simulator testing
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Debug \
  -sdk iphonesimulator \
  -derivedDataPath ios/build

# Or use Xcode UI: Product → Build
```

### Step 4: Run on Simulator

1. **Xcode** → **Product** → **Scheme** → Select simulator device
2. **Product** → **Run** (⌘R)
3. App will build and launch in simulator

### Step 5: Build for Release (App Store)

1. **Product** → **Scheme** → Edit Scheme
2. Set Configuration to **Release**
3. **Product** → **Build** (⌘B)
4. **Product** → **Archive** (⇧⌘A)

### Step 6: Submit to App Store

1. Window → Organizer
2. Select your archive
3. Click **Validate App**
4. Click **Distribute App**
5. Choose **App Store Connect**
6. Follow the upload wizard

---

## Publishing to App Stores

### Google Play Store

1. **Create Google Play Developer Account** (one-time $25 fee)
2. **Create app listing:**
   - App name: DreamBid
   - App category: Real Estate
   - Content rating questionnaire
3. **Upload APK:**
   - Navigate to **Release** → **Production**
   - Upload `app-release.apk`
4. **Add store details:**
   - Screenshots (minimum 2, up to 8 per device type)
   - App description
   - Short description
   - Category: Real Estate
5. **Set up pricing** (free or paid)
6. **Submit for review** (24-72 hours typically)

### Apple App Store

1. **Create Apple Developer Account** ($99/year)
2. **Create app in App Store Connect:**
   - [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
3. **Upload via Xcode or Transporter**
4. **Add app information:**
   - Screenshots for all device sizes
   - App description
   - Keywords
   - Privacy policy URL
   - Support URL
5. **Set pricing** (free or paid)
6. **Submit for review** (24-48 hours typically)

---

## Version Updates

For each new version:

### Step 1: Update Version Numbers

```bash
# Edit capacitor.config.json
{
  "appId": "com.dreambid.app",
  "appName": "DreamBid",
  "webDir": "dist",
  "version": "1.1.0"
}
```

### Step 2: Update native version codes

**Android (android/app/build.gradle):**
```gradle
android {
    defaultConfig {
        versionCode 2
        versionName "1.1.0"
    }
}
```

**iOS (ios/App/Podfile):**
Edit version in Xcode's General tab

### Step 3: Rebuild

```bash
npm run build
npx cap sync
```

### Step 4: Build Android APK

```bash
# In Android Studio: Build → Build APK(s)
# Select Release configuration
```

### Step 5: Build iOS Archive

```bash
# In Xcode: Product → Archive
```

### Step 6: Upload to stores

---

## Troubleshooting

### Android Issues

**APK won't install:**
```bash
# Uninstall previous version
adb uninstall com.dreambid.app

# Clear app data
adb shell pm clear com.dreambid.app

# Reinstall
adb install -r android/app/release/app-release.apk
```

**Build fails:**
```bash
# Clean build
npx cap sync --clear
./gradlew clean

# In Android Studio:
# File → Invalidate Caches → Invalidate and Restart
```

**API requests fail:**
- Verify API domain in `capacitor.config.json`
- Check HTTPS is configured (no cleartext)
- Verify Android network security config

**Blank screen:**
- Check console: `adb logcat | grep -i "error\|dreambid"`
- Verify dist folder has all assets
- Rebuild with: `npm run build && npx cap sync android`

### iOS Issues

**Signing errors:**
- Verify Apple ID is added to Xcode
- Check Bundle ID matches developer account
- Update signing: **Xcode** → **Preferences** → **Accounts**

**Build failures:**
- Clean: **Product** → **Clean Build Folder** (⇧⌘K)
- Update pods: `cd ios/App && pod update`
- Restart Xcode

**App crashes on launch:**
- Check console output in Xcode
- Verify Info.plist has required permissions
- Check network security settings

---

## Environment Variables

Update your API URL in `capacitor.config.json`:

```json
{
  "server": {
    "cleartext": false,
    "url": "https://your-dreambid-api.com"
  }
}
```

For development, use a local server:
```json
{
  "server": {
    "cleartext": true,
    "url": "http://192.168.1.100:5000"
  }
}
```

---

## Security Checklist

Before uploading to app stores:

- [ ] APK/IPA is properly signed with release keystore
- [ ] No API keys or secrets hardcoded in app
- [ ] All network requests use HTTPS
- [ ] Sensitive data (tokens) stored securely (Preferences plugin)
- [ ] Logout clears all user data
- [ ] Permissions are minimally requested
- [ ] Privacy policy is linked in stores
- [ ] GDPR compliance verified
- [ ] Payment processing is PCI-DSS compliant (if applicable)

---

## Monitoring After Launch

1. **Google Play Console:**
   - Monitor crashes in **Android Vitals**
   - Check user reviews for issues
   - Track downloads and ratings

2. **Xcode:**
   - Monitor crashes via **App Analytics** in App Store Connect

3. **Setup Analytics:**
   ```bash
   npm install firebase react-native-firebase
   # Configure Firebase analytics
   ```

4. **Error Tracking:**
   - Use Sentry or similar for crash reporting
   - Monitor API errors

---

## Next Steps

1. ✅ Install Android Studio and Xcode
2. ✅ Generate production keystores
3. ✅ Build and test APK on device
4. ✅ Build and test iOS on simulator
5. ✅ Create app store listings
6. ✅ Upload to Google Play & App Store
7. ✅ Monitor performance and reviews

---

## Useful Resources

- [Capacitor Documentation](https://capacitorjs.com)
- [Android Developers Guide](https://developer.android.com)
- [Xcode Documentation](https://developer.apple.com/xcode)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)
