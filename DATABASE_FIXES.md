# Database Connection Fixes for Neon DB on Netlify

## Problem
Neon DB connections on Netlify serverless sometimes timeout or fail during form submissions due to:
- Cold starts (database connection pool not warm)
- Transient network errors
- Initial connection timeouts
- Idle connection closure

## Solution Implemented
Four complementary fixes without changing the database:

### 1️⃣ Retry Logic (2-3 retries)
- **File**: `utils/dbRetry.js`, `config/database.js`
- **How it works**: Automatically retries failed queries 2-3 times with exponential backoff
- **Retries on**: Connection refused, timeouts, FATAL errors
- **Delays**: 100ms → 200ms → 400ms (exponential backoff)
- **Usage**: Automatically applied to property creation and form submissions

**Example Output:**
```
⚠️  Query attempt 1/3 failed: Connection timeout
⚠️  Query attempt 2/3 failed: Connection timeout  
✅ Query succeeded on attempt 3/3
```

### 2️⃣ Keep DB Warm (ping every 30 seconds)
- **File**: `config/database.js`
- **How it works**: Pings database every 30 seconds to prevent connection pool from going idle
- **Benefit**: Eliminates "cold start" issues
- **Process**: Runs automatically in background, gracefully shuts down on process termination

```javascript
// Automatically started in config/database.js
setInterval(async () => {
  await pool.query('SELECT 1');  // Keep connection alive
}, 30000);
```

### 3️⃣ Increased Timeout (5 seconds instead of 2)
- **File**: `config/database.js`
- **Before**: `connectionTimeoutMillis: 2000`
- **After**: `connectionTimeoutMillis: 5000`
- **Benefit**: Allows more time for first connection to establish
- **Also added**: `statement_timeout: 10000` for individual query timeouts

### 4️⃣ Connection Pooling & Configuration
- **File**: `config/database.js`
- **Settings**:
  - `max: 20` - Max concurrent connections
  - `idleTimeoutMillis: 30000` - Keep idle connections for 30 seconds
  - `application_name: 'dreambid-app'` - For monitoring in Neon console
  - `ssl: { rejectUnauthorized: false }` - Required for Neon

## Implementation Details

### Database Configuration
```javascript
// config/database.js
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,                          // Connection pool size
  idleTimeoutMillis: 30000,         // Keep alive for 30s
  connectionTimeoutMillis: 5000,    // Increased from 2s
  statement_timeout: 10000,         // Per-statement timeout
  application_name: 'dreambid-app', // For monitoring
};
```

### Retry Wrapper Function
```javascript
// config/database.js - queryWithRetry()
export const queryWithRetry = async (query, params, maxRetries = 2) => {
  // Retries with exponential backoff
  // Only retries on transient errors (connection, timeout, FATAL)
}
```

### Utility Functions
```javascript
// utils/dbRetry.js
export const executeWithRetry = async (queryFn, maxRetries = 2) => {
  // Wraps any async operation with retry logic
}

export const isRetryableError = (error) => {
  // Detects transient vs permanent errors
}

export const getRetryDelay = (attempt, maxDelay = 5000) => {
  // Calculates exponential backoff with jitter
}
```

### Form Submission with Retry
```javascript
// routes/properties.js - Property creation example
router.post('/', authenticate, authorize('admin', 'staff'), [...], async (req, res) => {
  try {
    const property = await executeWithRetry(async () => {
      // Create property with queryWithRetry for each DB operation
      // All operations automatically retry on transient errors
    }, 3); // Retry up to 3 times
    
    res.status(201).json({ message: 'Property created successfully' });
  } catch (error) {
    // After all retries fail, send user-friendly error
    res.status(500).json({ 
      message: 'Failed to create property',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again'
    });
  }
});
```

## Migration Steps

### Step 1: Update Database Schema (if needed)
The new area unit columns are optional (default to 'sq ft' if not present).

Run migration to add columns:
```bash
node migrations/08_add_area_units.js
```

Or manually in Neon:
```sql
ALTER TABLE properties 
ADD COLUMN area_unit VARCHAR(50) DEFAULT 'sq ft',
ADD COLUMN built_up_area_unit VARCHAR(50) DEFAULT 'sq ft',
ADD COLUMN total_area_unit VARCHAR(50) DEFAULT 'sq ft';
```

### Step 2: Deploy Updated Code
```bash
npm run build
npx cap sync
git add -A
git commit -m "feat: add Neon DB connection fixes with retry logic and keep-alive"
git push origin main
```

### Step 3: Monitor Neon Dashboard
After deployment, check Neon console for:
- Connection activity
- Query latency
- Error patterns
- `dreambid-app` application name in connections

## Testing the Fixes

### Test 1: Create Property with Form
1. Go to Admin → Add Property
2. Fill all fields and upload images
3. Submit form
4. Check server logs for retry attempts (if any)
5. Should complete even if initial connection fails

### Test 2: Form Submission Under Load
1. Create multiple properties rapidly
2. Connection pool should maintain connections
3. Watch for "Keep-alive ping" messages in logs

### Test 3: Verify Retry Logic
You'll see logs like:
```
⚠️  Query attempt 1/3 failed: Connection timeout
⚠️  Query attempt 2/3 failed: Connection timeout
✅ Query succeeded on attempt 3/3
```

## Environment Variables

Ensure these are set in Netlify:
```
DATABASE_URL=postgresql://...@db.neon.tech/dreambid?schema=public
NODE_ENV=production
```

## Monitoring

### Check Connection Health
```sql
-- In Neon console SQL editor
SELECT * FROM pg_stat_activity;
```

### Typical Success Logs
```
✅ Database connected successfully
Keep-alive ping every 30s in background
Retry logic active for transient errors
```

## Error Handling

### Retryable Errors (will retry)
- Connection refused
- Connection timeout
- FATAL database errors
- Socket hang up
- ECONNRESET

### Non-Retryable Errors (immediate failure)
- Invalid SQL syntax
- Foreign key constraint violations
- Permission denied
- Schema not found

## Performance Impact

- **Retry logic**: +100-400ms max (only on failures)
- **Keep-alive ping**: <1ms every 30 seconds (negligible)
- **Timeout increase**: More reliable, no penalty on success
- **Overall**: Significantly improves reliability with minimal performance cost

## Rollback (if needed)

If issues occur, revert to previous timeout:
```javascript
// config/database.js
connectionTimeoutMillis: 2000, // Original value
```

## Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Node.js pg module](https://node-postgres.com)
- [PostgreSQL Connection Settings](https://www.postgresql.org/docs/current/runtime-config-client.html)
