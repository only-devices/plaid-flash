# Migration Guide: Vite + Express → Next.js

This document outlines the migration from v1.0 (Vite + React frontend with Express backend) to v2.0 (Next.js unified app).

## What Changed

### Architecture
- **Before**: Separate `client/` (Vite + React) and `server/` (Express) directories
- **After**: Unified Next.js app with `app/` directory (App Router)

### API Implementation
- **Before**: Express.js with `plaid` Node SDK
- **After**: Next.js API Routes with `plaid-fetch` (Edge-compatible)

### Language
- **Before**: JavaScript (.jsx, .js)
- **After**: TypeScript (.tsx, .ts)

### Deployment
- **Before**: Required separate deployments or complex setup
- **After**: Single command deployment to Vercel

## File Mapping

| Old (v1.0) | New (v2.0) |
|------------|------------|
| `client/src/App.jsx` | `app/page.tsx` |
| `client/src/App.css` | `app/globals.css` |
| `client/src/components/LinkButton.jsx` | `components/LinkButton.tsx` |
| `client/src/components/Modal.jsx` | `components/Modal.tsx` |
| `server/index.js` | `app/api/*/route.ts` (3 routes) |
| `.env` (root) | `.env.local` (root) |
| `client/package.json` + `server/package.json` | `package.json` (single) |

## API Endpoint Changes

| Old Endpoint | New Endpoint |
|--------------|--------------|
| `POST /api/create_link_token` | `POST /api/create-link-token` |
| `POST /api/exchange_public_token` | `POST /api/exchange-public-token` |
| `POST /api/auth/get` | `POST /api/auth-get` |

## Code Changes

### Plaid Client Initialization

**Before (v1.0 - Express + official SDK):**
```javascript
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// API call
const response = await plaidClient.linkTokenCreate({...});
const linkToken = response.data.link_token; // Note: .data property
```

**After (v2.0 - Next.js + plaid-fetch):**
```typescript
import { Configuration, PlaidApi } from 'plaid-fetch';

const configuration = new Configuration({
  basePath: `https://${process.env.PLAID_ENV}.plaid.com`,
  headers: {
    'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
    'PLAID-SECRET': process.env.PLAID_SECRET!,
  },
});

const plaid = new PlaidApi(configuration);

// API call
const response = await plaid.linkTokenCreate({...});
const linkToken = response.link_token; // No .data property!
```

### React Components

**Before (v1.0 - JavaScript):**
```jsx
import React from 'react';

const LinkButton = ({ onClick, isVisible }) => {
  return (
    <button 
      className={`link-button ${isVisible ? 'visible' : 'hidden'}`}
      onClick={onClick}
    >
      Let's Go
    </button>
  );
};

export default LinkButton;
```

**After (v2.0 - TypeScript):**
```tsx
import React from 'react';

interface LinkButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

const LinkButton: React.FC<LinkButtonProps> = ({ onClick, isVisible }) => {
  return (
    <button 
      className={`link-button ${isVisible ? 'visible' : 'hidden'}`}
      onClick={onClick}
    >
      Let's Go
    </button>
  );
};

export default LinkButton;
```

### Main App Component

**Before (v1.0):**
```jsx
// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // ... component code
}

export default App;
```

**After (v2.0):**
```tsx
// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  // ... component code (same logic)
}
```

Note the `'use client'` directive for client-side features like hooks and event handlers.

## Running the App

### v1.0 (Old)
```bash
# Terminal 1 - Backend
cd server
npm install
npm run dev

# Terminal 2 - Frontend
cd client
npm install
npm run dev
```

### v2.0 (New)
```bash
# Single terminal
npm install
npm run dev
```

## Environment Variables

### v1.0 (Old)
`.env` in root:
```
PLAID_CLIENT_ID=...
PLAID_SECRET=...
PLAID_ENV=sandbox
PORT=3001
```

### v2.0 (New)
`.env.local` in root:
```
PLAID_CLIENT_ID=...
PLAID_SECRET=...
PLAID_ENV=sandbox
```

No PORT needed - Next.js defaults to 3000.

## Deployment

### v1.0 (Old)
- Requires separate hosting for frontend and backend
- Need to configure CORS
- Complex proxy setup

### v2.0 (New)
```bash
# Option 1: Vercel CLI
vercel

# Option 2: GitHub + Vercel Dashboard
# Just connect repo and deploy!
```

## Benefits of Migration

1. ✅ **Unified Codebase** - Single app, single deployment
2. ✅ **Edge Runtime** - Faster API responses with plaid-fetch
3. ✅ **TypeScript** - Better type safety and autocomplete
4. ✅ **Modern Stack** - Next.js 14 with App Router
5. ✅ **Vercel-Native** - Optimized for Vercel platform
6. ✅ **Simpler Setup** - One install, one dev server

## Breaking Changes

1. API endpoint URLs changed (dashes instead of underscores/slashes)
2. Plaid response objects have no `.data` property (plaid-fetch)
3. TypeScript required for development
4. Old `client/` and `server/` directories no longer used

## Cleanup (Optional)

After confirming v2.0 works, you can remove:
```bash
rm -rf client/
rm -rf server/
```

The `.gitignore` is already configured to exclude these directories.

