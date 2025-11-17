# CORS Configuration Setup

## Overview
CORS (Cross-Origin Resource Sharing) has been configured to allow the frontend running on ports **3003** and **3009** to communicate with the backend running on port **3006**.

## Backend Changes (`server/index.js`)

Added CORS middleware with the following allowed origins:
- `http://localhost:3003` - Primary frontend port
- `http://localhost:3009` - Secondary frontend port
- `http://localhost:5173` - Vite dev server default port (for testing)
- `http://localhost:3001` - Local backend testing

### What was added:
1. Imported `cors` package (already in dependencies)
2. Configured CORS options with:
   - Allowed origins (see above)
   - Credentials support
   - Methods: GET, POST, PUT, DELETE, OPTIONS
   - Allowed headers: Content-Type, Authorization

## Frontend Configuration

### Vite Config (`vite.config.js`)
- Frontend now runs on **port 3003** by default
- Proxy rule still in place for `/api` requests during dev

### Environment Files
- `.env.development`: `VITE_API_URL=http://localhost:3006`
- `.env.production`: `VITE_API_URL=http://localhost:3006`

## How to Run

### Development Setup
```bash
# Terminal 1: Start backend on port 3006
cd server
PORT=3006 npm start

# Terminal 2: Start frontend on port 3003
cd frontend
npm run dev
# Vite will automatically open http://localhost:3003
```

### Running on Different Ports
Frontend can now run on **3003** or **3009** (or any port, but update CORS if needed):

```bash
# Terminal 2: Start on port 3009
cd frontend
npm run dev -- --port 3009
```

The CORS policy will allow both ports to communicate with the backend on 3006.

## Adding More Frontend Ports
To allow additional frontend ports, update the `corsOptions.origin` array in `server/index.js`:
```javascript
const allowedOrigins = [
  'http://localhost:3003',
  'http://localhost:3009',
  'http://localhost:3010',  // Add new port here
  'http://localhost:5173',
  'http://localhost:3001',
];
```

## Testing CORS
To verify CORS is working, make a request from the browser console:
```javascript
fetch('http://localhost:3006/api/hall-of-fame?limit=5')
  .then(r => r.json())
  .then(console.log)
```

If CORS is properly configured, you'll see the data. If there's a CORS error, check:
1. Frontend origin matches one in the allowed list
2. Backend is running on port 3006
3. No typos in the URL
