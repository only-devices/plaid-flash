import React, { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import LinkButton from './components/LinkButton';
import Modal from './components/Modal';
import './App.css';

function App() {
  const [linkToken, setLinkToken] = useState(null);
  const [showButton, setShowButton] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalState, setModalState] = useState('loading'); // 'loading', 'success', 'error'
  const [accountData, setAccountData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch link token on mount
  useEffect(() => {
    fetchLinkToken();
  }, []);

  const fetchLinkToken = async () => {
    try {
      const response = await fetch('/api/create_link_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setLinkToken(data.link_token);
    } catch (error) {
      console.error('Error fetching link token:', error);
      setErrorMessage('Failed to initialize. Please refresh the page.');
      setModalState('error');
      setShowModal(true);
    }
  };

  const onSuccess = useCallback(async (public_token, metadata) => {
    // Hide the button
    setShowButton(false);
    
    // Show loading modal
    setShowModal(true);
    setModalState('loading');

    try {
      // Exchange public token for access token
      const exchangeResponse = await fetch('/api/exchange_public_token', {
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

      // Get auth data
      const authResponse = await fetch('/api/auth/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token }),
      });

      if (!authResponse.ok) {
        throw new Error('Failed to fetch account data');
      }

      const authData = await authResponse.json();
      
      // Update state to show success
      setAccountData(authData);
      setModalState('success');
    } catch (error) {
      console.error('Error processing account:', error);
      setErrorMessage('We encountered an issue connecting your account. Please try again.');
      setModalState('error');
      
      // Clear link token and reload after a delay
      setTimeout(() => {
        setLinkToken(null);
        window.location.reload();
      }, 3000);
    }
  }, []);

  const onExit = useCallback((err, metadata) => {
    if (err != null) {
      console.error('Plaid Link error:', err);
      setErrorMessage('Something went wrong. Please try again.');
      setModalState('error');
      setShowModal(true);
      
      // Clear and reload
      setTimeout(() => {
        setLinkToken(null);
        window.location.reload();
      }, 3000);
    }
    // If user just closed the modal without error, show the button again
    setShowButton(true);
  }, []);

  const config = {
    token: linkToken,
    onSuccess,
    onExit,
  };

  const { open, ready } = usePlaidLink(config);

  const handleButtonClick = () => {
    if (ready) {
      setShowButton(false);
      open();
    }
  };

  const handleStartOver = () => {
    setShowModal(false);
    setAccountData(null);
    setModalState('loading');
    setShowButton(true);
    setLinkToken(null);
    window.location.reload();
  };

  const handleCopyResponse = async () => {
    if (accountData) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(accountData, null, 2));
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

  const renderModalContent = () => {
    if (modalState === 'loading') {
      return (
        <div className="modal-loading">
          <div className="spinner"></div>
          <p>Connecting your account...</p>
        </div>
      );
    }

    if (modalState === 'error') {
      return (
        <div className="modal-error">
          <div className="error-icon">⚠️</div>
          <p>{errorMessage}</p>
          <p className="error-subtext">Refreshing...</p>
        </div>
      );
    }

    if (modalState === 'success' && accountData) {
      return (
        <div className="modal-success">
          <div className="success-header">
            <div className="success-icon">✓</div>
            <h2>Account linked successfully</h2>
          </div>
          <div className="account-data">
            <pre className="code-block">
              <code>{JSON.stringify(accountData, null, 2)}</code>
            </pre>
          </div>
          <button className="copy-response-button" onClick={handleCopyResponse}>
            Copy Response
          </button>
          <button className="start-over-button" onClick={handleStartOver}>
            Start Over
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="app">
      <LinkButton 
        onClick={handleButtonClick} 
        isVisible={showButton && ready} 
      />
      <Modal isVisible={showModal}>
        {renderModalContent()}
      </Modal>
    </div>
  );
}

export default App;

