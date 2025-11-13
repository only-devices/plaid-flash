# Plaid Flash

A lightweight web application for connecting bank accounts using Plaid Link in sandbox mode. Built with Vite + React frontend and Express.js backend.

## Features

- 🚀 Quick Plaid Link integration with sandbox mode
- 🎨 Smooth modal animations and modern UI
- 📊 Pretty-printed JSON display of account data
- ⚡ Fast development setup with Vite
- 🔒 Secure token exchange flow

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Plaid account with API credentials ([Get started here](https://dashboard.plaid.com/signup))

## Setup

### 1. Get Plaid Credentials

1. Sign up for a free Plaid account at https://dashboard.plaid.com/signup
2. Get your `client_id` and `secret` (sandbox) from the dashboard

### 2. Configure Environment Variables

Create a `.env` file in the root directory (`/Users/etuovila/Documents/plaid-flash/.env`):

```env
PLAID_CLIENT_ID=your_client_id_here
PLAID_SECRET=your_sandbox_secret_here
PLAID_ENV=sandbox
PORT=3001
```

**Important:** Replace `your_client_id_here` and `your_sandbox_secret_here` with your actual Plaid credentials.

### 3. Install Dependencies

From the root directory:

```bash
# Option 1: Install all dependencies at once
npm run install:all

# Option 2: Install separately
cd server && npm install
cd ../client && npm install
```

### 4. Run the Application

You'll need two terminal windows:

**Terminal 1 - Start the backend server:**
```bash
cd server
npm run dev
```
The server will run on `http://localhost:3001`

**Terminal 2 - Start the frontend client:**
```bash
cd client
npm run dev
```
The client will run on `http://localhost:5173`

### 5. Use the Application

1. Open your browser to `http://localhost:5173`
2. Click the "Let's Go" button
3. Use Plaid's sandbox credentials to test:
   - Username: `user_good`
   - Password: `pass_good`
4. Select any bank and complete the flow
5. View the account data in the modal
6. Click "Start Over" to reset

## Project Structure

```
plaid-flash/
├── .env                    # Environment variables (create this)
├── .env.example            # Example env file
├── package.json            # Root package with convenience scripts
├── README.md               # This file
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx         # Main application component
│   │   ├── App.css         # Styles and animations
│   │   ├── main.jsx        # React entry point
│   │   ├── components/
│   │   │   ├── LinkButton.jsx  # Pill-shaped launch button
│   │   │   └── Modal.jsx       # Animated modal component
│   │   └── hooks/
│   │       └── usePlaidLink.js # Plaid Link hook
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── server/                 # Express backend
    ├── index.js            # Server with Plaid API endpoints
    └── package.json
```

## API Endpoints

The Express server provides three endpoints:

- `POST /api/create_link_token` - Creates a Plaid Link token
- `POST /api/exchange_public_token` - Exchanges public token for access token
- `POST /api/auth/get` - Retrieves account authentication data

## Flow

1. Frontend fetches a `link_token` from the backend
2. User clicks "Let's Go" button → Plaid Link modal opens
3. User authenticates with a bank (using sandbox credentials)
4. On success, `public_token` is sent to backend
5. Backend exchanges `public_token` for `access_token`
6. Backend calls `/auth/get` with `access_token`
7. Account data is displayed in an animated modal
8. User can click "Start Over" to reset the flow

## Technologies Used

### Frontend
- **Vite** - Fast build tool and dev server
- **React** - UI library
- **react-plaid-link** - Official Plaid Link React hook
- **CSS3** - Animations and styling

### Backend
- **Express.js** - Web server framework
- **Plaid Node SDK** - Official Plaid API client
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing

## Troubleshooting

### "Failed to initialize" error
- Make sure your `.env` file exists in the root directory
- Verify your Plaid credentials are correct
- Ensure the server is running on port 3001

### CORS errors
- Check that the server is running
- Verify the proxy configuration in `client/vite.config.js`

### Link modal doesn't open
- Clear your browser cache
- Check the browser console for errors
- Ensure you're using the correct Plaid environment (sandbox)

## Development Notes

- The app uses Plaid's **sandbox environment** for testing
- No database is required - tokens are handled in-memory
- The `access_token` is not persisted (intentional for demo purposes)
- For production use, implement proper token storage and security measures

## License

MIT

