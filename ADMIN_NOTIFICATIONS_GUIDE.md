# Admin Push Notifications Implementation Summary

## Overview
Push notifications for new inquiries and user registrations have been implemented to notify **admin and staff users only** through their mobile devices.

## What Was Implemented

### 1. Backend Changes

#### NotificationService.js
- **`notifyAdminsOfEnquiry(propertyId, enquiryData)`**: Sends notification to all active admin/staff users when a new enquiry is submitted
- **`notifyAdminsOfRegistration(userData)`**: Sends notification to all active admin/staff users when a new user registration is received
- Automatically filters by user role (`admin`, `staff`) and active notification tokens

#### Database
- **`notification_tokens` table**: Stores device tokens for each admin/staff user
  - Tracks user ID, device token, platform (iOS/Android), and activation status
  - Automatically indexes for fast queries

#### API Endpoints
- `POST /api/notifications/register-token`: Admins register their device for notifications
- `POST /api/notifications/unregister-token`: Admins unregister device (on logout)

#### Routes Modified
- **`routes/enquiries.js`**: Triggers admin notification when new enquiry is created
- **`routes/user-registrations.js`**: Triggers admin notification when new registration is submitted

### 2. Mobile App Changes

#### NotificationProvider (NotificationContext.jsx)
- Initializes Firebase Cloud Messaging on app startup
- Listens for incoming push notifications
- Routes notifications to appropriate admin pages:
  - **Enquiry notifications** → `/admin/enquiries`
  - **Registration notifications** → `/admin/registrations`
- Automatically unregisters device token on logout

#### capacitor.config.json
- Added `PushNotifications` plugin configuration
- Enables badges, sound, and alert for notifications

#### App.jsx
- Wrapped app with `NotificationProvider` to enable notifications globally

### 3. Authentication Context
- Updated logout flow to unregister device token from backend

## Notification Flow

### For New Enquiries
```
User submits enquiry
    ↓
Backend creates enquiry record
    ↓
Backend triggers notifyAdminsOfEnquiry()
    ↓
Query: Get all active admin/staff users with tokens
    ↓
Send FCM notification to each admin device
    ↓
Admin receives notification on phone
    ↓
Admin can tap to view enquiries list
```

### For New Registrations
```
User submits registration
    ↓
Backend creates registration record
    ↓
Backend triggers notifyAdminsOfRegistration()
    ↓
Query: Get all active admin/staff users with tokens
    ↓
Send FCM notification to each admin device
    ↓
Admin receives notification on phone
    ↓
Admin can tap to view registrations list
```

## Notification Payload Examples

### Enquiry Notification
```json
{
  "title": "New Enquiry Received",
  "body": "John Doe inquired about 123 Main Street",
  "data": {
    "type": "enquiry",
    "propertyId": "456",
    "enquirerName": "John Doe",
    "enquirerPhone": "1234567890",
    "action": "open_enquiries"
  }
}
```

### Registration Notification
```json
{
  "title": "New User Registration",
  "body": "jane@example.com has registered as property requirement",
  "data": {
    "type": "registration",
    "userEmail": "jane@example.com",
    "action": "open_registrations"
  }
}
```

## Setup Checklist

- [ ] Install dependencies: `npm install`
- [ ] Set Firebase credentials in `.env`:
  ```
  FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
  ```
- [ ] Run database migration to create `notification_tokens` table
- [ ] Rebuild mobile app: `npm run build && npx cap sync`
- [ ] Test on physical Android/iOS device
- [ ] Admin users register their device tokens
- [ ] Test inquiry notification
- [ ] Test registration notification

## Key Features

✅ **Admin-only notifications**: Only users with `admin` or `staff` role receive notifications
✅ **Multi-device support**: Each admin can register multiple devices
✅ **Automatic token cleanup**: Invalid/revoked tokens are automatically deactivated
✅ **Deep linking**: Tapping notification opens relevant admin page
✅ **Graceful degradation**: Notification failures don't affect main request
✅ **Logout safety**: Device tokens are unregistered on logout

## Testing

### Test Enquiry Notification
1. Log in as admin on mobile app
2. Register device for notifications
3. Submit enquiry from web app for any property
4. Admin should receive notification within seconds
5. Tap notification → should open enquiries page

### Test Registration Notification
1. Log in as admin on mobile app
2. Register device for notifications
3. Submit registration from web app
4. Admin should receive notification within seconds
5. Tap notification → should open registrations page

## Troubleshooting

**Notifications not received?**
- Check Firebase credentials in `.env`
- Verify admin user has active notification token in database
- Check notification permissions on mobile device
- Check Firebase Cloud Messaging is enabled in Firebase console

**Device token not registering?**
- Ensure user is logged in as admin/staff
- Check network connectivity
- Check mobile device has proper notification permissions
- Check logs for registration errors

## Security Notes

- Only authenticated users can register device tokens
- Only `admin` and `staff` role users receive notifications
- Device tokens are unique per device
- Invalid tokens are automatically deactivated
- Tokens are deleted on logout
- Firebase credentials should be stored securely in environment variables
