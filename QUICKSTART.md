# Quick Start Guide - Plaid Flash

Get up and running in 5 minutes!

## Step 1: Get Plaid Credentials (2 min)

1. Go to https://dashboard.plaid.com/signup
2. Create a free account
3. Navigate to Team Settings → Keys
4. Copy your:
   - Client ID
   - Sandbox secret key

## Step 2: Create .env File (1 min)

In `/Users/etuovila/Documents/plaid-flash/`, create a file named `.env`:

```env
PLAID_CLIENT_ID=paste_your_client_id_here
PLAID_SECRET=paste_your_sandbox_secret_here
PLAID_ENV=sandbox
PORT=3001
```

## Step 3: Install Dependencies (1 min)

```bash
cd /Users/etuovila/Documents/plaid-flash
npm run install:all
```

Or install manually:
```bash
cd server && npm install
cd ../client && npm install
```

## Step 4: Start the App (1 min)

Open two terminal windows:

**Terminal 1:**
```bash
cd /Users/etuovila/Documents/plaid-flash/server
npm run dev
```

**Terminal 2:**
```bash
cd /Users/etuovila/Documents/plaid-flash/client
npm run dev
```

## Step 5: Test It Out!

1. Open http://localhost:5173 in your browser
2. Click "Let's Go"
3. When Plaid Link opens, use these test credentials:
   - **Username:** `user_good`
   - **Password:** `pass_good`
4. Select any bank (like "First Platypus Bank")
5. Complete the flow and see your account data!

## Sandbox Test Credentials

Plaid provides various test users for different scenarios:

| Username | Password | Description |
|----------|----------|-------------|
| `user_good` | `pass_good` | Successfully link account |
| `user_custom` | `pass_good` | Require MFA |
| `user_locked` | `pass_good` | Account locked error |

For more test credentials, visit: https://plaid.com/docs/sandbox/test-credentials/

## Need Help?

Check out the main [README.md](./README.md) for detailed documentation and troubleshooting.

