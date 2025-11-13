import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Endpoint to create link token
app.post('/api/create_link_token', async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: 'flash_user_id01'
      },
      client_name: 'Plaid Flash',
      products: ['auth'],
      country_codes: ['US'],
      language: 'en',
      required_if_supported_products: ['identity']
    });

    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to exchange public token for access token
app.post('/api/exchange_public_token', async (req, res) => {
  try {
    const { public_token } = req.body;
    
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    });

    const accessToken = response.data.access_token;
    
    res.json({ access_token: accessToken });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to get auth data
app.post('/api/auth/get', async (req, res) => {
  try {
    const { access_token } = req.body;
    
    const response = await plaidClient.authGet({
      access_token: access_token,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error getting auth data:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

