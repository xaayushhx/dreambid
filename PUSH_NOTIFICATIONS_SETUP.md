# Push Notifications Setup Guide

This guide explains how to set up push notifications for the DreamBid Android and iOS apps.

## Overview

The notification system sends push notifications to property owners when inquiries are submitted to their properties. It uses:

- **Backend**: Firebase Cloud Messaging (FCM) via Firebase Admin SDK
- **Mobile Apps**: Capacitor's PushNotifications API
- **Database**: `notification_tokens` table to store device tokens

## Prerequisites

1. A Firebase project set up
2. Service Account credentials from Firebase
3. Google Cloud project with FCM enabled

## Backend Setup

### 1. Firebase Admin SDK Installation

The required packages have been added to `package.json`:
```bash
npm install firebase-admin @capacitor/push-notifications
```

### 2. Environment Variables

Add the following to your `.env` file:

```env
# Firebase Service Account (JSON stringified)
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

**To get the Firebase Service Account JSON:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Copy the entire JSON content and stringify it (replace newlines with `\n`)

### 3. Database Migration

Run the migration to create the `notification_tokens` table:

```sql
-- Creates table to store device tokens
CREATE TABLE notification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_token VARCHAR(255) NOT NULL UNIQUE,
  platform VARCHAR(20) CHECK (platform IN ('ios', 'android')) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_tokens_user_active 
ON notification_tokens(user_id, is_active);
```

### 4. API Endpoints

Two new endpoints have been added for token management:

#### Register Device Token
```
POST /api/notifications/register-token
Authorization: Bearer {token}
Content-Type: application/json

{
  "deviceToken": "abc123...",
  "platform": "ios" or "android"
}
```

#### Unregister Device Token
```
POST /api/notifications/unregister-token
Authorization: Bearer {token}
Content-Type: application/json

{
  "deviceToken": "abc123..."
}
```

## Mobile App Setup

### 1. Install Dependencies

```bash
npm install @capacitor/push-notifications
```

### 2. Configure Capacitor

The `capacitor.config.json` has been updated to include:

```json
{
  "plugins": {
    "PushNotifications": {
      "presentationOption": ["badge", "sound", "alert"]
    }
  }
}
```

### 3. Add NotificationProvider to App

Update `src/App.jsx` to wrap the app with the `NotificationProvider`:

```jsx
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      {/* Your app content */}
    </NotificationProvider>
  );
}
```

### 4. Android Setup

#### Add Google Play Services

Update `android/variables.gradle`:

```gradle
ext {
    // ... other variables
    firebaseMessagingVersion = '23.2.1'
}
```

#### Update build.gradle

`android/app/build.gradle` should include:

```gradle
dependencies {
    // ... existing dependencies
    implementation "com.google.firebase:firebase-messaging:${firebaseMessagingVersion}"
}
```

#### Set Up Notification Channel (Android 8+)

In Android Studio, add to `android/app/src/main/AndroidManifest.xml`:

```xml
<application>
  <!-- Existing content -->
  
  <service
      android:name="com.capacitorjs.plugins.pushnotifications.PushNotificationHandler"
      android:exported="false">
      <intent-filter>
          <action android:name="com.google.firebase.MESSAGING_EVENT" />
      </intent-filter>
  </service>
  
  <!-- Notification channel for Android 8+ -->
  <meta-data
      android:name="com.google.firebase.messaging.default_notification_channel_id"
      android:value="default" />
</application>
```

### 5. iOS Setup

#### Enable Push Capabilities

In Xcode:

1. Open `ios/App/App.xcodeproj`
2. Select the "App" target
3. Go to Signing & Capabilities
4. Click "+ Capability"
5. Add "Push Notifications"

#### Add NotificationCenter Framework

Xcode should handle this automatically when you add the capability.

## How It Works

### Enquiry Notification Flow

1. **User submits enquiry** on the web app or mobile app
2. **Backend creates enquiry** record in database
3. **Backend triggers notification** to property owner:
   - Gets all active device tokens for the property owner
   - Sends push notification via Firebase Cloud Messaging
   - Notification is displayed on user's device
4. **Mobile app receives notification**:
   - Notification displayed with title and body
   - User can tap to navigate to enquiries list

### Notification Data Structure

```javascript
{
  title: "New Enquiry Received",
  body: "John Doe has sent an enquiry for 123 Main Street",
  data: {
    type: "enquiry",
    propertyId: "456",
    enquirerName: "John Doe",
    enquirerPhone: "1234567890",
    action: "open_enquiries"
  }
}
```

## Services Overview

### NotificationService.js

Main service for handling notifications:

```javascript
// Register device token
registerDeviceToken(userId, deviceToken, platform)

// Send notification to user
sendNotificationToUser(userId, notification)

// Notify property owner of enquiry
notifyPropertyOwner(propertyId, enquiryData)

// Notify agents of requirement
notifyMatchingAgents(userId, requirementData)

// Unregister token on logout
unregisterDeviceToken(deviceToken)
```

## Testing Notifications

### Test with Firebase Console

1. Go to Firebase Console → Cloud Messaging
2. Create new campaign
3. Select "FCM registration token" as target
4. Enter a registered device token
5. Send test message

### Test with Backend

Create a test script `test-notifications.js`:

```javascript
import { NotificationService } from './services/NotificationService.js';

// Send test notification
await NotificationService.notifyPropertyOwner(1, {
  name: 'Test User',
  email: 'test@example.com',
  phone: '1234567890',
  property_title: 'Test Property',
  message: 'This is a test enquiry'
});
```

## Troubleshooting

### Notifications Not Received

1. **Check Firebase credentials**
   - Verify `FIREBASE_SERVICE_ACCOUNT_JSON` is correct
   - Ensure Firebase Admin SDK is initialized

2. **Check device tokens**
   - Query database: `SELECT * FROM notification_tokens WHERE user_id = {userId}`
   - Ensure `is_active` is `true`

3. **Check notification permissions**
   - Android: Settings → Apps → DreamBid → Permissions → Notifications
   - iOS: Settings → DreamBid → Notifications

4. **Check Firebase project**
   - Ensure FCM is enabled
   - Check that service account has correct permissions

### Common Errors

**"Invalid registration token"**
- Token has expired or been revoked
- Token will be automatically deactivated

**"Error 400: invalid_argument"**
- Check payload structure
- Ensure device token format is correct

**"Permission denied"**
- Check Firebase service account credentials
- Ensure proper IAM permissions in Google Cloud

## Production Considerations

1. **Token Management**
   - Tokens may become invalid over time
   - Invalid tokens are automatically deactivated
   - Implement token refresh strategy

2. **Rate Limiting**
   - Firebase has rate limits per device
   - Implement exponential backoff for retries

3. **Logging**
   - Monitor notification delivery failures
   - Log all notification attempts for debugging

4. **User Privacy**
   - Only store tokens for consenting users
   - Provide option to disable notifications
   - Comply with GDPR/CCPA requirements

5. **Security**
   - Keep Firebase credentials secure
   - Rotate service account keys periodically
   - Use environment variables for secrets

## Next Steps

1. Set up Firebase project and get credentials
2. Update `.env` with `FIREBASE_SERVICE_ACCOUNT_JSON`
3. Run database migration
4. Install dependencies: `npm install`
5. Rebuild mobile app: `npm run build && npx cap sync`
6. Test notifications on physical device

## Additional Resources

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Android Push Notifications](https://developer.android.com/training/notify-user)
- [iOS Push Notifications](https://developer.apple.com/documentation/usernotifications)
