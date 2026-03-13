# Entity/Admin Login Credentials

## Current Setup: Phone-Based Authentication

Since we've changed the login system from email to phone number, here are the Entity (Admin) login credentials:

### Admin Account Credentials:

**Phone Number:** `9876543210`  
**Password:** `admin123`

**Role:** admin

---

## How to Setup (if not already in database):

If the admin user is not yet in the database, run one of these scripts:

### Option 1: Via SQL (One-time setup)
```sql
-- Generate password hash first using generate-hash.js
-- Then insert the user:
INSERT INTO users (email, password_hash, full_name, phone, role, is_active)
VALUES ('admin@dreambid.com', '[hash_from_generate-hash.js]', 'Admin', '9876543210', 'admin', true);
```

### Option 2: Via Node Script
```bash
node scripts/reset-admin-password.js
```

Then manually set the phone number:
```sql
UPDATE users SET phone = '9876543210' WHERE email = 'admin@dreambid.com';
```

---

## Login Steps in App:

1. Go to **Sign In** page
2. Enter **Phone:** `9876543210`
3. Enter **Password:** `admin123`
4. Click **Sign In**
5. You'll be redirected to the **Admin Dashboard** where you can:
   - Manage Properties
   - View Enquiries
   - Manage Users
   - **Manage Blogs** (newly added!)

---

## Alternative Admin Accounts (create as needed):

**For Entity Representative:**
- **Phone:** `9876543211`
- **Password:** `entity123`
- **Role:** staff (or admin)

---

## Notes:

- The login system now accepts **phone numbers only** (10 digits)
- If you need to reset admin password, run: `node scripts/reset-admin-password.js`
- To create new admin accounts, either:
  - Register through the app and manually update the role to 'admin' in the database
  - Insert directly into the database with hashed password

---

**Last Updated:** March 7, 2026
