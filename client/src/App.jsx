import React, { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import LinkButton from './components/LinkButton';
import Modal from './components/Modal';
import './App.css';

function App() {
  const [linkToken, setLinkToken] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalState, setModalState] = useState('loading'); // 'loading', 'callback-success', 'callback-exit', 'processing', 'success', 'error'
  const [accountData, setAccountData] = useState(null);
  const [callbackData, setCallbackData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch link token on mount
  useEffect(() => {
    fetchLinkToken();
  }, []);

  // Welcome animation sequence
  useEffect(() => {
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

  const onSuccess = useCallback((public_token, metadata) => {
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
    // Show processing state
    setModalState('processing');

    try {
      const { public_token } = callbackData;

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
  };

  const onExit = useCallback((err, metadata) => {
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
    // Reset to start screen
    setShowModal(false);
    setCallbackData(null);
    setModalState('loading');
    setShowButton(true);
  };

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

  const renderModalContent = () => {
    if (modalState === 'callback-success' && callbackData) {
      return (
        <div className="modal-callback">
          <div className="callback-header">
            <div className="callback-icon success-callback">✓</div>
            <h2>onSuccess Callback Fired!</h2>
          </div>
          <p className="callback-description">
            Here's the data returned from Plaid Link:
          </p>
          <div className="account-data">
            <pre className="code-block">
              <code>{JSON.stringify(callbackData, null, 2)}</code>
            </pre>
          </div>
          <button className="copy-callback-button" onClick={handleCopyCallback}>
            Copy Callback
          </button>
          <button className="proceed-button" onClick={handleProceedWithSuccess}>
            Don't stop me now →
          </button>
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
          <button className="copy-callback-button" onClick={handleCopyCallback}>
            Copy Callback
          </button>
          <button className="retry-button" onClick={handleExitRetry}>
            Womp, womp. Try again?
          </button>
        </div>
      );
    }

    if (modalState === 'processing') {
      return (
        <div className="modal-loading">
          <div className="spinner"></div>
          <p>Exchanging token and fetching account data...</p>
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
      {showWelcome && (
        <div className="welcome-text">
          Welcome to Plaid Flash.
        </div>
      )}
      <LinkButton 
        onClick={handleButtonClick} 
        isVisible={showButton && ready && !showWelcome} 
      />
      <Modal isVisible={showModal}>
        {renderModalContent()}
      </Modal>
    </div>
  );
}

export default App;

