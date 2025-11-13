import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi } from 'plaid-fetch';

const configuration = new Configuration({
  basePath: `https://${process.env.PLAID_ENV || 'sandbox'}.plaid.com`,
  headers: {
    'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
    'PLAID-SECRET': process.env.PLAID_SECRET!,
  },
});

const plaid = new PlaidApi(configuration);

export async function POST(request: NextRequest) {
  try {
    const response = await plaid.linkTokenCreate({
      user: {
        client_user_id: 'flash_user_id01'
      },
      client_name: 'Plaid Flash',
      products: ['auth'],
      country_codes: ['US'],
      language: 'en',
      required_if_supported_products: ['identity']
    });

    // Note: plaid-fetch returns data directly (no .data property)
    return NextResponse.json({ link_token: response.link_token });
  } catch (error: any) {
    console.error('Error creating link token:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create link token' },
      { status: 500 }
    );
  }
}

