export interface ProductConfig {
  id: string;
  name: string;
  products: string[];
  required_if_supported: string[];
  gradient: string;
  apiEndpoint?: string;
  apiTitle?: string;
  children?: ProductConfig[];
  additionalLinkParams?: Record<string, any>;
  additionalApiParams?: Record<string, any>;
}

export const PRODUCT_CONFIGS: Record<string, ProductConfig> = {
  auth: {
    id: 'auth',
    name: 'Auth',
    products: ['auth'],
    required_if_supported: ['identity'],
    gradient: 'linear-gradient(135deg, #4a5fc1 0%, #5a3d7a 100%)',
    apiEndpoint: '/api/auth-get',
    apiTitle: '/auth/get'
  },
  identity: {
    id: 'identity',
    name: 'Identity',
    products: ['identity'],
    required_if_supported: [],
    gradient: 'linear-gradient(135deg, #3d9991 0%, #2d6b66 100%)',
    children: [
      {
        id: 'identity-get',
        name: 'Identity Get',
        products: ['identity'],
        required_if_supported: [],
        gradient: 'linear-gradient(135deg, #3d9991 0%, #2d6b66 100%)',
        apiEndpoint: '/api/identity-get',
        apiTitle: '/identity/get'
      },
      {
        id: 'identity-match',
        name: 'Identity Match',
        products: ['identity'],
        required_if_supported: [],
        gradient: 'linear-gradient(135deg, #4aaa9f 0%, #327a73 100%)',
        apiEndpoint: '/api/identity-match',
        apiTitle: '/identity/match',
        additionalApiParams: {
          user: {
            legal_name: 'Jane Doe',
            phone_number: '+1 415 555 0122',
            email_address: 'jane.doe@example.com',
            address: {
              street: '123 Main St',
              city: 'San Francisco',
              region: 'CA',
              postal_code: '94105',
              country: 'US'
            }
          }
        }
      }
    ]
  },
  transactions: {
    id: 'transactions',
    name: 'Transactions',
    products: ['transactions'],
    required_if_supported: [],
    gradient: 'linear-gradient(135deg, #3b8fd1 0%, #00b8c4 100%)',
    children: [
      {
        id: 'transactions-get',
        name: 'Transactions Get',
        products: ['transactions'],
        required_if_supported: [],
        gradient: 'linear-gradient(135deg, #3b8fd1 0%, #00b8c4 100%)',
        apiEndpoint: '/api/transactions-get',
        apiTitle: '/transactions/get'
      },
      {
        id: 'transactions-sync',
        name: 'Transactions Sync',
        products: ['transactions'],
        required_if_supported: [],
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00d4d8 100%)',
        apiEndpoint: '/api/transactions-sync',
        apiTitle: '/transactions/sync',
        additionalLinkParams: {
          days_requested: 14
        }
      }
    ]
  }
};

export const PRODUCTS_ARRAY = Object.values(PRODUCT_CONFIGS);

// Helper to get config by ID (searches both parent and children)
export const getProductConfigById = (id: string): ProductConfig | undefined => {
  for (const config of PRODUCTS_ARRAY) {
    if (config.id === id) return config;
    if (config.children) {
      const child = config.children.find(c => c.id === id);
      if (child) return child;
    }
  }
  return undefined;
};

