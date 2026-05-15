# Firebase Setup Guide for DreamBid Push Notifications

This guide walks you through setting up Firebase Cloud Messaging for push notifications.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `DreamBid` (or your preference)
4. Choose or create a Google Cloud project
5. Enable Google Analytics (optional)
6. Click **"Create project"** and wait for setup to complete

## Step 2: Enable Firebase Cloud Messaging (FCM)

1. In Firebase Console, go to your project
2. Click **"Messaging"** in the left sidebar (under Build section)
3. You should see "Cloud Messaging" options
4. Note your **Server API Key** (you may need this for testing)

## Step 3: Create Service Account for Backend

This is what your backend needs to send notifications.

1. In Firebase Console, click the **Settings icon** (gear) → **Project settings**
2. Go to the **"Service Accounts"** tab
3. Click **"Generate New Private Key"** button
4. A JSON file will download automatically - **save this safely**

### The JSON file will look like this:
```json
{
  "type": "service_account",
  "project_id": "dreambid-xyz123",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xyz@dreambid-xyz123.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk..."
}
```

## Step 4: Add to Environment Variables

1. Open your `.env` file in the project root
2. Add this line (replace with your actual JSON):

```env
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"dreambid-xyz123","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xyz@dreambid-xyz123.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk..."}'
```

**Important:** Keep this entire JSON on ONE line in the .env file.

### Quick method to convert JSON to single line:
```bash
# On Mac/Linux:
cat service-account-key.json | tr '\n' ' ' | sed 's/  */ /g'

# Then add FIREBASE_SERVICE_ACCOUNT_JSON=' at the start and ' at the end
```

## Step 5: Setup Android

### Prerequisites:
- Android Studio
- Google Play Services enabled

### In Firebase Console:

1. Click **Settings icon** → **Project settings**
2. Click **"Your apps"** section
3. If you don't have an Android app yet, click **"Add app"** → select **Android**
4. Enter:
   - Package name: `com.dreambid.app`
   - App nickname: `DreamBid Android`
5. Download the `google-services.json` file
6. Place it in: `android/app/google-services.json`

### Update Android gradle files:

**In `android/build.gradle`:**
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

**In `android/app/build.gradle`:**
```gradle
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services'

dependencies {
    // Firebase Cloud Messaging
    implementation 'com.google.firebase:firebase-messaging:23.2.1'
}
```

### Android Manifest Setup:

In `android/app/src/main/AndroidManifest.xml`, add:

```xml
<application>
    <!-- Your existing content -->
    
    <meta-data
        android:name="com.google.firebase.messaging.default_notification_channel_id"
        android:value="default" />
    
    <service
        android:name="com.capacitorjs.plugins.pushnotifications.PushNotificationHandler"
        android:exported="false">
        <intent-filter>
            <action android:name="com.google.firebase.MESSAGING_EVENT" />
        </intent-filter>
    </service>
</application>
```

## Step 6: Setup iOS

### Prerequisites:
- Xcode 14+
- Apple Developer Account

### In Firebase Console:

1. Go to **Settings icon** → **Project settings**
2. Click **"Your apps"** section
3. Click **"Add app"** → select **iOS**
4. Enter:
   - Bundle ID: `com.dreambid.app`
   - App nickname: `DreamBid iOS`
5. Download `GoogleService-Info.plist`
6. In Xcode, add it to the project (drag & drop into App folder)

### In Xcode:

1. Open `ios/App/App.xcodeproj`
2. Select the **"App"** target
3. Go to **Signing & Capabilities**
4. Click **"+ Capability"**
5. Search for and add **"Push Notifications"**

### Enable Remote Notifications:

1. Still in Capabilities, click **"+ Capability"** again
2. Add **"Background Modes"**
3. Check **"Remote notifications"**

## Step 7: Verify Installation

### Check Backend Connection:

Run this test script to verify Firebase Admin SDK is working:

**Create `test-firebase.js`:**
```javascript
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  
  console.log('✓ Firebase Admin SDK initialized successfully');
  console.log('Project ID:', admin.app().options.projectId);
} catch (error) {
  console.error('✗ Firebase initialization failed:', error.message);
  process.exit(1);
}
```

Run it:
```bash
node test-firebase.js
```

Expected output:
```
✓ Firebase Admin SDK initialized successfully
Project ID: dreambid-xyz123
```

## Step 8: Test Sending a Notification

### Create `test-notification.js`:

```javascript
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function sendTestNotification() {
  try {
    // Replace with an actual device token
    const deviceToken = 'your-device-token-here';
    
    const message = {
      notification: {
        title: 'Test Notification',
        body: 'This is a test notification from DreamBid',
      },
      data: {
        type: 'test',
      },
      token: deviceToken,
    };

    const response = await admin.messaging().send(message);
    console.log('✓ Notification sent successfully:', response);
  } catch (error) {
    console.error('✗ Failed to send notification:', error.message);
  }
}

sendTestNotification();
```

Run it:
```bash
node test-notification.js
```

## Step 9: Build and Deploy Mobile App

After Firebase is set up:

```bash
# Build the web app
npm run build

# Sync with Capacitor
npx cap sync

# For Android:
npx cap open android
# Then in Android Studio: Build → Generate Signed Bundle/APK

# For iOS:
npx cap open ios
# Then in Xcode: Product → Build → Archive
```

## Troubleshooting

### "Invalid Service Account Credentials"
- Check the JSON is properly formatted in `.env`
- Make sure it's all on ONE line
- Verify the `private_key` is complete (starts with `-----BEGIN PRIVATE KEY-----`)

### "Registration token not registered"
- Device token may have expired
- User may have uninstalled/reinstalled app
- Tokens are automatically cleaned up in the database

### Notifications not received on Android
- Check notification permissions in Settings → Apps → DreamBid → Permissions
- Ensure Firebase Cloud Messaging is enabled in Firebase Console
- Check that app has proper internet connection

### Notifications not received on iOS
- Verify Push Notifications capability is enabled in Xcode
- Check that Apple Push Certificates are configured
- Ensure the app is signed with a provisioning profile that includes Push Notifications

### "The project 'projectId' does not have a service account"
- Go back to Step 3 and generate a new private key
- Make sure you're using the correct project

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot find module 'firebase-admin'" | Run `npm install` |
| Firebase not initializing | Check `.env` FIREBASE_SERVICE_ACCOUNT_JSON format |
| Notifications not triggering | Verify admin user has active notification token in database |
| Device token not registering | Check user is authenticated and has proper network |
| Android build fails | Run `./gradlew clean` in android folder |
| iOS build fails | Clean Xcode: Cmd+Shift+K |

## Environment Variables Reference

```env
# Firebase Admin SDK Configuration
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

# Optional: Server API Key (for testing via REST API)
FIREBASE_SERVER_API_KEY='your-server-api-key'

# Database
DATABASE_URL='postgresql://user:password@localhost/dreambid'

# JWT
JWT_SECRET='your-jwt-secret'

# Other configs...
```

## Security Best Practices

1. **Never commit service account credentials to Git**
   - Add `.env` to `.gitignore`
   - Use environment variables in production

2. **Rotate keys regularly**
   - Firebase: Generate new private key every 3-6 months
   - Delete old keys from Firebase Console

3. **Restrict permissions**
   - Service account should only have Firebase Cloud Messaging permissions
   - Use IAM roles to limit access

4. **Monitor usage**
   - Check Firebase Console for notification delivery rates
   - Monitor Cloud Messaging quota

## Next Steps

1. ✅ Complete all setup steps above
2. ✅ Run the test scripts to verify
3. ✅ Build and deploy mobile app
4. ✅ Test on physical Android/iOS device
5. ✅ Submit enquiry/registration to trigger notification

## Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Google Cloud Console](https://console.cloud.google.com/)
