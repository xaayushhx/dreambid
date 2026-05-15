import admin from 'firebase-admin';
import pool from '../config/database.js';

/**
 * Initialize Firebase Admin SDK
 * Make sure FIREBASE_SERVICE_ACCOUNT is set in environment variables
 * It should be the path to your Firebase service account JSON file
 */
export const initializeFirebase = () => {
  if (!admin.apps.length) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }
};

/**
 * Send a push notification to a specific device token
 * @param {string} deviceToken - The FCM device token
 * @param {object} notification - Notification object { title, body, image?, data? }
 * @returns {Promise<string>} - Message ID from Firebase
 */
export const sendNotificationToDevice = async (deviceToken, notification) => {
  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        ...(notification.image && { imageUrl: notification.image }),
      },
      data: notification.data || {},
      token: deviceToken,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: notification.title,
              body: notification.body,
            },
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Send notifications to all device tokens of a user
 * @param {number} userId - The user ID
 * @param {object} notification - Notification object
 * @returns {Promise<array>} - Array of sent message results
 */
export const sendNotificationToUser = async (userId, notification) => {
  try {
    const result = await pool.query(
      'SELECT device_token FROM notification_tokens WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    if (result.rows.length === 0) {
      console.log(`No active notification tokens found for user ${userId}`);
      return [];
    }

    const promises = result.rows.map(row =>
      sendNotificationToDevice(row.device_token, notification).catch(error => {
        console.error(`Failed to send to token ${row.device_token}:`, error);
        // Deactivate invalid tokens
        if (error.code === 'messaging/invalid-registration-token' || 
            error.code === 'messaging/registration-token-not-registered') {
          deactivateToken(row.device_token);
        }
        return null;
      })
    );

    const responses = await Promise.all(promises);
    return responses.filter(r => r !== null);
  } catch (error) {
    console.error('Error sending notifications to user:', error);
    throw error;
  }
};

/**
 * Send notification to all admins/staff when enquiry is received
 * @param {number} propertyId - The property ID
 * @param {object} enquiryData - The enquiry details { name, email, phone, property_title, message }
 * @returns {Promise<array>} - Results of sent notifications
 */
export const notifyAdminsOfEnquiry = async (propertyId, enquiryData) => {
  try {
    // Get all admin and staff users with active notification tokens
    const result = await pool.query(
      `SELECT DISTINCT u.id FROM users u
       INNER JOIN notification_tokens nt ON u.id = nt.user_id
       WHERE u.role IN ('admin', 'staff') 
       AND u.is_active = true
       AND nt.is_active = true`
    );

    if (result.rows.length === 0) {
      console.log('No active admin/staff notification tokens found');
      return [];
    }

    const notification = {
      title: 'New Enquiry Received',
      body: `${enquiryData.name} inquired about ${enquiryData.property_title}`,
      image: enquiryData.propertyImage || null,
      data: {
        type: 'enquiry',
        propertyId: propertyId.toString(),
        enquirerName: enquiryData.name,
        enquirerPhone: enquiryData.phone,
        action: 'open_enquiries',
      },
    };

    const promises = result.rows.map(row =>
      sendNotificationToUser(row.id, notification).catch(error => {
        console.error(`Failed to notify admin ${row.id}:`, error);
        return null;
      })
    );

    const responses = await Promise.all(promises);
    return responses.filter(r => r !== null);
  } catch (error) {
    console.error('Error notifying admins of enquiry:', error);
    throw error;
  }
};

/**
 * Send notification to all admins/staff when new user registration occurs
 * @param {object} userData - User registration details { email, name, phone, registrationType }
 * @returns {Promise<array>} - Results of sent notifications
 */
export const notifyAdminsOfRegistration = async (userData) => {
  try {
    // Get all admin and staff users with active notification tokens
    const result = await pool.query(
      `SELECT DISTINCT u.id FROM users u
       INNER JOIN notification_tokens nt ON u.id = nt.user_id
       WHERE u.role IN ('admin', 'staff') 
       AND u.is_active = true
       AND nt.is_active = true`
    );

    if (result.rows.length === 0) {
      console.log('No active admin/staff notification tokens found');
      return [];
    }

    const notification = {
      title: 'New User Registration',
      body: `${userData.name || userData.email} has registered as ${userData.registrationType || 'user'}`,
      data: {
        type: 'registration',
        userEmail: userData.email,
        action: 'open_registrations',
      },
    };

    const promises = result.rows.map(row =>
      sendNotificationToUser(row.id, notification).catch(error => {
        console.error(`Failed to notify admin ${row.id}:`, error);
        return null;
      })
    );

    const responses = await Promise.all(promises);
    return responses.filter(r => r !== null);
  } catch (error) {
    console.error('Error notifying admins of registration:', error);
    throw error;
  }
};

/**
 * Send notification when requirement/need is submitted
 * @param {number} userId - The user ID (requirement creator)
 * @param {object} requirementData - Requirement details
 * @returns {Promise<array>} - Results of sent notifications
 */
export const notifyMatchingAgents = async (userId, requirementData) => {
  try {
    // Get agents/admins who should be notified
    const result = await pool.query(
      `SELECT DISTINCT u.id FROM users u 
       WHERE u.role IN ('admin', 'agent') 
       AND u.is_active = true
       LIMIT 10`
    );

    if (result.rows.length === 0) {
      console.log('No agents/admins found to notify');
      return [];
    }

    const notification = {
      title: 'New Requirement Posted',
      body: `A new requirement has been submitted: ${requirementData.title || 'View details'}`,
      data: {
        type: 'requirement',
        userId: userId.toString(),
        action: 'open_requirements',
      },
    };

    const promises = result.rows.map(row =>
      sendNotificationToUser(row.id, notification).catch(error => {
        console.error(`Failed to notify agent ${row.id}:`, error);
        return null;
      })
    );

    const responses = await Promise.all(promises);
    return responses.filter(r => r !== null);
  } catch (error) {
    console.error('Error notifying agents about requirement:', error);
    throw error;
  }
};

/**
 * Register a device token for push notifications
 * @param {number} userId - The user ID
 * @param {string} deviceToken - The FCM device token
 * @param {string} platform - Platform type: 'ios' or 'android'
 * @returns {Promise<object>} - Inserted token record
 */
export const registerDeviceToken = async (userId, deviceToken, platform) => {
  try {
    // Check if token already exists
    const existing = await pool.query(
      'SELECT id FROM notification_tokens WHERE device_token = $1',
      [deviceToken]
    );

    if (existing.rows.length > 0) {
      // Update existing token
      const result = await pool.query(
        `UPDATE notification_tokens 
         SET user_id = $1, platform = $2, is_active = true, updated_at = NOW() 
         WHERE device_token = $3 
         RETURNING *`,
        [userId, platform, deviceToken]
      );
      console.log('Device token updated:', deviceToken);
      return result.rows[0];
    } else {
      // Insert new token
      const result = await pool.query(
        `INSERT INTO notification_tokens (user_id, device_token, platform, is_active) 
         VALUES ($1, $2, $3, true) 
         RETURNING *`,
        [userId, deviceToken, platform]
      );
      console.log('Device token registered:', deviceToken);
      return result.rows[0];
    }
  } catch (error) {
    console.error('Error registering device token:', error);
    throw error;
  }
};

/**
 * Deactivate a device token (for invalid/revoked tokens)
 * @param {string} deviceToken - The FCM device token
 * @returns {Promise<object>} - Updated token record
 */
export const deactivateToken = async (deviceToken) => {
  try {
    const result = await pool.query(
      `UPDATE notification_tokens 
       SET is_active = false, updated_at = NOW() 
       WHERE device_token = $1 
       RETURNING *`,
      [deviceToken]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error deactivating token:', error);
    throw error;
  }
};

/**
 * Unregister a device token (remove on logout)
 * @param {string} deviceToken - The FCM device token
 * @returns {Promise<void>}
 */
export const unregisterDeviceToken = async (deviceToken) => {
  try {
    await pool.query(
      'DELETE FROM notification_tokens WHERE device_token = $1',
      [deviceToken]
    );
    console.log('Device token unregistered:', deviceToken);
  } catch (error) {
    console.error('Error unregistering device token:', error);
    throw error;
  }
};

export default {
  initializeFirebase,
  sendNotificationToDevice,
  sendNotificationToUser,
  notifyAdminsOfEnquiry,
  notifyAdminsOfRegistration,
  notifyMatchingAgents,
  registerDeviceToken,
  deactivateToken,
  unregisterDeviceToken,
};
