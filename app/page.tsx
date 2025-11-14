'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import LinkButton from '@/components/LinkButton';
import Modal from '@/components/Modal';
import ProductSelector from '@/components/ProductSelector';
import { PRODUCTS_ARRAY, PRODUCT_CONFIGS, getProductConfigById } from '@/lib/productConfig';

export default function Home() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showChildModal, setShowChildModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedChildProduct, setSelectedChildProduct] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [modalState, setModalState] = useState<'loading' | 'callback-success' | 'callback-exit' | 'accounts-data' | 'processing-accounts' | 'processing-product' | 'success' | 'error'>('loading');
  const [accountsData, setAccountsData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [callbackData, setCallbackData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [apiStatusCode, setApiStatusCode] = useState<number>(200);

  // Don't fetch link token on mount - wait for product selection
  // useEffect removed - link token fetched after product selection

  // Welcome animation sequence
  useEffect(() => {
    // Only run if showWelcome is true (on natural page load)
    if (!showWelcome) {
      // If welcome is already false, show button immediately
      setShowButton(true);
      return;
    }

    // Remove welcome text after animation completes (5 seconds)
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);

    // Show button after welcome fades out (5 seconds total)
    const buttonTimer = setTimeout(() => {
      setShowButton(true);
    }, 5000);

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(buttonTimer);
    };
  }, [showWelcome]);

  const fetchLinkToken = async (productId: string) => {
    try {
      const productConfig = getProductConfigById(productId);
      if (!productConfig) {
        throw new Error('Product configuration not found');
      }
      
      const requestBody: any = {
        products: productConfig.products,
        required_if_supported_products: productConfig.required_if_supported
      };

      // Add additional link params if they exist (e.g., days_requested for transactions sync)
      if (productConfig.additionalLinkParams) {
        Object.assign(requestBody, productConfig.additionalLinkParams);
      }

      const response = await fetch('/api/create-link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      setLinkToken(data.link_token);
    } catch (error) {
      console.error('Error fetching link token:', error);
      setErrorMessage('Failed to initialize. Please try again.');
      setModalState('error');
      setShowModal(true);
      setShowWelcome(false);
      
      // Reset after a delay
      setTimeout(() => {
        setShowModal(false);
        setModalState('loading');
        setShowProductModal(true);
      }, 3000);
    }
  };

  const handleProductSelect = (productId: string) => {
    const productConfig = PRODUCT_CONFIGS[productId];
    
    // If product has children, show child selection modal
    if (productConfig?.children && productConfig.children.length > 0) {
      setSelectedProduct(productId);
      setShowProductModal(false);
      setShowChildModal(true);
    } else {
      // Direct product, proceed to Link
      setSelectedProduct(productId);
      setSelectedChildProduct(null);
      setShowProductModal(false);
      fetchLinkToken(productId);
    }
  };

  const handleChildProductSelect = (childId: string) => {
    setSelectedChildProduct(childId);
    setShowChildModal(false);
    fetchLinkToken(childId);
  };

  const onSuccess = useCallback((public_token: string, metadata: any) => {
    // Hide the button
    setShowButton(false);
    
    // Show callback data modal
    setShowModal(true);
    setModalState('callback-success');
    setCallbackData({
      public_token,
      metadata
    });
  }, []);

  const handleProceedWithSuccess = async () => {
    // Show processing state for accounts
    setModalState('processing-accounts');

    try {
      const { public_token } = callbackData;

      // Exchange public token for access token
      const exchangeResponse = await fetch('/api/exchange-public-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_token }),
      });
      
      if (!exchangeResponse.ok) {
        throw new Error('Failed to exchange token');
      }

      const { access_token } = await exchangeResponse.json();

      // Store access token for cleanup
      setAccessToken(access_token);

      // Get accounts data
      const accountsResponse = await fetch('/api/accounts-get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token }),
      });

      if (!accountsResponse.ok) {
        throw new Error('Failed to fetch accounts data');
      }

      const accountsData = await accountsResponse.json();
      
      // Update state to show accounts data
      setAccountsData(accountsData);
      setApiStatusCode(accountsResponse.status);
      setModalState('accounts-data');
    } catch (error) {
      console.error('Error processing account:', error);
      setErrorMessage('We encountered an issue connecting your account. Please try again.');
      setModalState('error');
      
      // Reset after a delay
      setTimeout(() => {
        setShowModal(false);
        setCallbackData(null);
        setAccountsData(null);
        setProductData(null);
        setModalState('loading');
        setShowButton(true);
        setShowWelcome(false);
        setShowProductModal(true);
      }, 3000);
    }
  };

  const handleCallProduct = async () => {
    // Show processing state for product
    setModalState('processing-product');

    try {
      // Get the effective product ID (child if selected, otherwise parent)
      const effectiveProductId = selectedChildProduct || selectedProduct;
      const productConfig = getProductConfigById(effectiveProductId!);
      
      if (!productConfig || !productConfig.apiEndpoint) {
        throw new Error('Product API endpoint not configured');
      }

      // Build request body with access token and any additional params
      const requestBody: any = { access_token: accessToken };
      if (productConfig.additionalApiParams) {
        Object.assign(requestBody, productConfig.additionalApiParams);
      }
      
      const productResponse = await fetch(productConfig.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!productResponse.ok) {
        throw new Error('Failed to fetch product data');
      }

      const productData = await productResponse.json();
      
      // Update state to show product data
      setProductData(productData);
      setApiStatusCode(productResponse.status);
      setModalState('success');
    } catch (error) {
      console.error('Error fetching product data:', error);
      setErrorMessage('We encountered an issue fetching product data. Please try again.');
      setModalState('error');
      
      // Reset after a delay
      setTimeout(() => {
        setShowModal(false);
        setCallbackData(null);
        setAccountsData(null);
        setProductData(null);
        setModalState('loading');
        setShowButton(true);
        setShowWelcome(false);
        setShowProductModal(true);
      }, 3000);
    }
  };

  const onExit = useCallback((err: any, metadata: any) => {
    // Show callback data modal for exit
    setShowButton(false);
    setShowModal(true);
    setModalState('callback-exit');
    setCallbackData({
      err: err || null,
      metadata
    });
  }, []);

  const handleExitRetry = () => {
    // Reset to start screen without reloading
    setShowModal(false);
    setCallbackData(null);
    setModalState('loading');
    setShowButton(true);
    setShowWelcome(false);
    // Clear link token and selected products to prevent auto-opening
    setLinkToken(null);
    setSelectedProduct(null);
    setSelectedChildProduct(null);
    setShowProductModal(true);
  };

  const config = {
    token: linkToken,
    onSuccess,
    onExit,
  };

  const { open, ready } = usePlaidLink(config);

  // Auto-open Link when ready after product selection
  useEffect(() => {
    if (ready && linkToken && (selectedProduct || selectedChildProduct) && !showModal && !showChildModal) {
      open();
    }
  }, [ready, linkToken, selectedProduct, selectedChildProduct, showModal, showChildModal, open]);

  const handleButtonClick = () => {
    // Show product selection modal instead of opening Link directly
    setShowButton(false);
    setShowProductModal(true);
  };

  const handleStartOver = async () => {
    // Clean up Plaid item if access token exists
    if (accessToken) {
      try {
        await fetch('/api/item-remove', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ access_token: accessToken }),
        });
      } catch (error) {
        console.error('Error removing item:', error);
        // Continue with reset even if cleanup fails
      }
    }

    // Reset to start screen without reloading
    setShowModal(false);
    setAccountsData(null);
    setProductData(null);
    setCallbackData(null);
    setAccessToken(null);
    setSelectedProduct(null);
    setSelectedChildProduct(null);
    setLinkToken(null);
    setModalState('loading');
    setShowButton(true);
    setShowWelcome(false);
  };

  const handleCopyResponse = async () => {
    if (productData) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(productData, null, 2));
        // Optional: Add visual feedback
        const button = document.querySelector('.copy-response-button');
        if (button) {
          const originalText = button.textContent;
          button.textContent = 'Copied!';
          button.classList.add('copied');
          setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
          }, 2000);
        }
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleCopyAccounts = async () => {
    if (accountsData) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(accountsData, null, 2));
        // Add visual feedback
        const button = document.querySelector('.copy-accounts-button');
        if (button) {
          const originalText = button.textContent;
          button.textContent = 'Copied!';
          button.classList.add('copied');
          setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
          }, 2000);
        }
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleCopyCallback = async () => {
    if (callbackData) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(callbackData, null, 2));
        // Add visual feedback
        const button = document.querySelector('.copy-callback-button');
        if (button) {
          const originalText = button.textContent;
          button.textContent = 'Copied!';
          button.classList.add('copied');
          setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
          }, 2000);
        }
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleCopyAccessToken = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (accessToken) {
      try {
        await navigator.clipboard.writeText(accessToken);
        // Add visual feedback
        const button = event.currentTarget;
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('copied');
        }, 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const renderModalContent = () => {
    if (modalState === 'callback-success' && callbackData) {
      return (
        <div className="modal-callback">
          <div className="callback-header">
            <div className="callback-icon success-callback">✓</div>
            <h2>onSuccess Callback Fired!</h2>
          </div>
          <p className="callback-description">
            Here&apos;s the data returned from Plaid Link:
          </p>
          <div className="account-data">
            <pre className="code-block">
              <code>{JSON.stringify(callbackData, null, 2)}</code>
            </pre>
          </div>
          <div className="button-row">
            <button className="action-button button-purple" onClick={handleCopyCallback}>
              Copy Callback
            </button>
            <button className="action-button button-blue" onClick={handleProceedWithSuccess}>
              Don't stop me now →
            </button>
          </div>
        </div>
      );
    }

    if (modalState === 'callback-exit' && callbackData) {
      return (
        <div className="modal-callback">
          <div className="callback-header">
            <div className="callback-icon exit-callback">✕</div>
            <h2>onExit Callback Fired</h2>
          </div>
          <p className="callback-description">
            {callbackData.err ? 'An error occurred:' : 'User exited the flow:'}
          </p>
          <div className="account-data">
            <pre className="code-block">
              <code>{JSON.stringify(callbackData, null, 2)}</code>
            </pre>
          </div>
          <div className="button-row">
            <button className="action-button button-purple" onClick={handleCopyCallback}>
              Copy Callback
            </button>
            <button className="action-button button-pink" onClick={handleExitRetry}>
              Womp, womp. Try again?
            </button>
          </div>
        </div>
      );
    }

    if (modalState === 'accounts-data' && accountsData) {
      const effectiveProductId = selectedChildProduct || selectedProduct;
      const productConfig = getProductConfigById(effectiveProductId!);
      const productName = productConfig?.name || 'Product';
      
      return (
        <div className="modal-success">
          <div className="success-header">
            <div className="success-icon">✓</div>
            <h2>/accounts/get Response</h2>
            <span className={`status-badge ${apiStatusCode < 400 ? 'status-success' : 'status-error'}`}>
              {apiStatusCode}
            </span>
          </div>
          <div className="account-data">
            <pre className="code-block">
              <code>{JSON.stringify(accountsData, null, 2)}</code>
            </pre>
          </div>
          <div className="button-row">
            <button className="action-button button-purple" onClick={handleCopyAccounts}>
              Copy Response
            </button>
            <button className="action-button button-pink" onClick={handleCopyAccessToken}>
              Copy Access Token
            </button>
            <button className="action-button button-blue" onClick={handleCallProduct}>
              Call {productName} →
            </button>
          </div>
        </div>
      );
    }

    if (modalState === 'processing-accounts') {
      return (
        <div className="modal-loading">
          <div className="spinner"></div>
          <p>Exchanging token and fetching account data...</p>
        </div>
      );
    }

    if (modalState === 'processing-product') {
      const effectiveProductId = selectedChildProduct || selectedProduct;
      const productConfig = getProductConfigById(effectiveProductId!);
      const productName = productConfig?.name || 'Product';
      
      return (
        <div className="modal-loading">
          <div className="spinner"></div>
          <p>Fetching {productName} data...</p>
        </div>
      );
    }

    if (modalState === 'error') {
      return (
        <div className="modal-error">
          <div className="error-icon">⚠️</div>
          <p>{errorMessage}</p>
          <p className="error-subtext">Restarting...</p>
        </div>
      );
    }

    if (modalState === 'success' && productData) {
      const effectiveProductId = selectedChildProduct || selectedProduct;
      const productConfig = getProductConfigById(effectiveProductId!);
      const apiTitle = productConfig?.apiTitle || 'API Response';
      
      return (
        <div className="modal-success">
          <div className="success-header">
            <div className="success-icon">✓</div>
            <h2>{apiTitle} Response</h2>
            <span className={`status-badge ${apiStatusCode < 400 ? 'status-success' : 'status-error'}`}>
              {apiStatusCode}
            </span>
          </div>
          <div className="account-data">
            <pre className="code-block">
              <code>{JSON.stringify(productData, null, 2)}</code>
            </pre>
          </div>
          <div className="button-row">
            <button className="action-button button-purple" onClick={handleCopyResponse}>
              Copy Response
            </button>
            <button className="action-button button-pink" onClick={handleCopyAccessToken}>
              Copy Access Token
            </button>
            <button className="action-button button-blue" onClick={handleStartOver}>
              Start Over
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="app">
      {showWelcome && (
        <div className="welcome-text">
          Welcome to Plaid Flash.
        </div>
      )}
      <LinkButton 
        onClick={handleButtonClick} 
        isVisible={showButton && !showWelcome} 
      />
      <Modal isVisible={showProductModal}>
        <ProductSelector 
          products={PRODUCTS_ARRAY} 
          onSelect={handleProductSelect} 
        />
      </Modal>
      <Modal isVisible={showChildModal}>
        {selectedProduct && PRODUCT_CONFIGS[selectedProduct]?.children && (
          <ProductSelector 
            products={PRODUCT_CONFIGS[selectedProduct].children!} 
            onSelect={handleChildProductSelect}
            onBack={() => {
              setShowChildModal(false);
              setShowProductModal(true);
            }}
            showBackButton={true}
          />
        )}
      </Modal>
      <Modal isVisible={showModal}>
        {renderModalContent()}
      </Modal>
    </div>
  );
}

