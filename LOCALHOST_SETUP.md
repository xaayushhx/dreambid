# Local Development Setup Guide

## Prerequisites

1. **PostgreSQL** - Install PostgreSQL locally
2. **Node.js** - v16 or higher
3. **npm** - comes with Node.js

## Step-by-Step Setup

### 1. Create PostgreSQL Database

```bash
# Open PostgreSQL terminal
psql -U postgres

# Create database
CREATE DATABASE dreambid;

# Connect to the database
\c dreambid

# Create a user (optional - uses default postgres user)
CREATE USER dreambid_user WITH PASSWORD 'dreambid_password';
GRANT ALL PRIVILEGES ON DATABASE dreambid TO dreambid_user;
```

### 2. Initialize Database Schema

```bash
# From project root directory
psql -U postgres -d dreambid -f init.sql

# Or if using a different user:
psql -U dreambid_user -d dreambid -f init.sql
```

### 3. Environment Variables

The project includes `.env.local` for local development which is already configured with:
- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_NAME=dreambid`
- `DB_USER=postgres`
- `DB_PASSWORD=postgres`

**To use different credentials:**

Edit `.env.local` and update:
```
DB_USER=your_username
DB_PASSWORD=your_password
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Development Server

```bash
# Runs both frontend (Vite on :5173) and backend (Express on :3000)
npm run dev

# Or run separately:
npm run dev:server  # Backend only
npm run dev:client  # Frontend only (Vite)
```

### 6. Verify Setup

**Backend should print:**
```
✅ Database connected successfully
✅ Database tables already exist
✅ Server running on port 3000
```

**Frontend should print:**
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

## Accessing the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/api/health

## Default Admin Credentials

- **Email:** admin@dreambid.com
- **Password:** admin123

## Seeding Sample Data

```bash
npm run seed
```

This will populate the database with sample properties and test data.

## Troubleshooting

### Database Connection Failed
- Ensure PostgreSQL is running: `sudo service postgresql status`
- Verify credentials in `.env.local`
- Check port 5432 is accessible: `nc -zv localhost 5432`

### Port Already in Use
- Backend (3000): `kill $(lsof -t -i:3000)` or use `PORT=3001 npm run dev:server`
- Frontend (5173): `kill $(lsof -t -i:5173)` or Vite will auto-increment port

### Module Not Found Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `rm -rf .vite`

### CORS Issues
- Frontend URL should be `http://localhost:5173` in backend CORS config
- Already configured in `.env.local`

## Development Notes

- Backend uses Node.js with Express and PostgreSQL
- Frontend uses React with Vite and Tailwind CSS
- Both run concurrently with `npm run dev`
- Database migrations run automatically on server startup
- Hot reload enabled for both frontend and backend

