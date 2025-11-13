# Plaid Flash

A lightweight Next.js application for connecting bank accounts using Plaid Link in sandbox mode. Built with Next.js 14 App Router, TypeScript, and the edge-compatible `plaid-fetch` library.

## ✨ Features

- 🚀 Quick Plaid Link integration with sandbox mode
- 🎨 Smooth modal animations and modern UI
- 📊 Pretty-printed JSON display of account data
- ⚡ Edge Runtime compatible with Vercel
- 🔒 Secure token exchange flow
- 📱 Responsive design for mobile and desktop
- 🎓 Educational tool showing Plaid Link callbacks in real-time

## 🎬 Flow

1. Welcome animation fades in
2. "Let's Go" button appears
3. Click button → Plaid Link opens
4. **Link succeeds**: Shows `onSuccess` callback data → Click "Don't stop me now" → Exchange token → Display account data
5. **Link exits**: Shows `onExit` callback data → Click "Womp, womp. Try again?"

## 📋 Prerequisites

- Node.js 18+ or higher
- npm or pnpm
- Plaid account with API credentials ([Get started here](https://dashboard.plaid.com/signup))

## 🚀 Quick Start

### 1. Get Plaid Credentials

1. Sign up for a free Plaid account at https://dashboard.plaid.com/signup
2. Navigate to Team Settings → Keys
3. Copy your:
   - Client ID
   - Sandbox secret key

### 2. Clone and Install

```bash
cd /Users/etuovila/Documents/plaid-flash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
PLAID_CLIENT_ID=your_client_id_here
PLAID_SECRET=your_sandbox_secret_here
PLAID_ENV=sandbox
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Test It Out

1. Click "Let's Go"
2. Use Plaid's sandbox credentials:
   - **Username:** `user_good`
   - **Password:** `pass_good`
3. Select any bank (like "First Platypus Bank")
4. Complete the flow and see callback data + account data!

## 🌐 Deploy to Vercel

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `PLAID_CLIENT_ID`
   - `PLAID_SECRET`
   - `PLAID_ENV` (set to `sandbox`)
6. Click "Deploy"

Your app will be live at `https://your-project.vercel.app`

### Environment Variables in Vercel

After deployment, add these in your Vercel project settings:

1. Go to your project dashboard
2. Click "Settings" → "Environment Variables"
3. Add:
   - `PLAID_CLIENT_ID` = your Plaid client ID
   - `PLAID_SECRET` = your Plaid sandbox secret
   - `PLAID_ENV` = `sandbox`

## 📁 Project Structure

```
plaid-flash/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page (client component)
│   ├── globals.css             # Global styles
│   └── api/
│       ├── create-link-token/
│       │   └── route.ts        # POST /api/create-link-token
│       ├── exchange-public-token/
│       │   └── route.ts        # POST /api/exchange-public-token
│       └── auth-get/
│           └── route.ts        # POST /api/auth-get
├── components/
│   ├── LinkButton.tsx          # Pill-shaped launch button
│   └── Modal.tsx               # Animated modal component
├── .env.local                  # Environment variables (create this)
├── .env.local.example          # Example env file
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript configuration
└── vercel.json                 # Vercel deployment config
```

## 🔌 API Routes

The app provides three Next.js API routes:

### `POST /api/create-link-token`
Creates a Plaid Link token with predefined configuration.

### `POST /api/exchange-public-token`
Exchanges public token for access token.

**Body:** `{ "public_token": "public-sandbox-..." }`

### `POST /api/auth-get`
Retrieves account authentication data.

**Body:** `{ "access_token": "access-sandbox-..." }`

## 🛠 Technologies

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **react-plaid-link** - Official Plaid Link React hook
- **CSS3** - Animations and styling

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **plaid-fetch** - Edge-compatible Plaid API client ([heysanil/plaid-fetch](https://github.com/heysanil/plaid-fetch))

## 🎓 Educational Purpose

Plaid Flash visualizes the Plaid Link integration flow:

1. **Link Token Creation**: See how link tokens are generated server-side
2. **Plaid Link Modal**: Experience the actual Link flow
3. **Callback Inspection**: View `onSuccess` and `onExit` callback data before processing
4. **Token Exchange**: Understand the public → access token flow
5. **API Response**: Inspect the `/auth/get` response data

Perfect for learning, demoing, or debugging Plaid integrations!

## 🧪 Sandbox Test Credentials

Plaid provides various test users for different scenarios:

| Username | Password | Description |
|----------|----------|-------------|
| `user_good` | `pass_good` | Successfully link account |
| `user_custom` | `pass_good` | Require MFA |
| `user_locked` | `pass_good` | Account locked error |

For more test credentials, visit: https://plaid.com/docs/sandbox/test-credentials/

## 🔧 Development Notes

- The app uses Plaid's **sandbox environment** for testing
- No database required - tokens are handled in-memory per session
- The `access_token` is not persisted (intentional for demo purposes)
- For production use, implement proper token storage and security measures

## 🚨 Important: plaid-fetch vs Official SDK

This app uses [`plaid-fetch`](https://github.com/heysanil/plaid-fetch) instead of Plaid's official Node SDK because:

1. **Edge Runtime Compatible** - Works in Vercel Edge Functions
2. **Smaller Bundle** - Uses `fetch` instead of Axios
3. **Response Format** - Returns data directly (no `.data` property)

**Key Difference:**
```typescript
// Official SDK
const response = await plaidClient.linkTokenCreate({...});
const linkToken = response.data.link_token;

// plaid-fetch
const response = await plaid.linkTokenCreate({...});
const linkToken = response.link_token; // No .data property
```

## 📝 Migration from v1.0 (Vite + Express)

This is v2.0, migrated from separate Vite frontend and Express backend to a unified Next.js application. Benefits:

✅ Single codebase
✅ One-command deployment to Vercel
✅ TypeScript throughout
✅ Edge Runtime support
✅ Better performance

## 🐛 Troubleshooting

### "Failed to initialize" error
- Ensure `.env.local` exists in the root directory
- Verify Plaid credentials are correct
- Check that PLAID_ENV is set to 'sandbox'

### TypeScript errors
- Run `npm install` to ensure all dependencies are installed
- Delete `.next` folder and restart dev server

### Module not found errors
- Ensure you're using the correct import paths (`@/components/...`)
- Check `tsconfig.json` has the correct path mappings

## 📜 License

MIT

## 🙋 Questions?

Check out:
- [Plaid Documentation](https://plaid.com/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [plaid-fetch GitHub](https://github.com/heysanil/plaid-fetch)
