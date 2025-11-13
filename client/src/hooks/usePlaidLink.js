import { useEffect, useState, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';

export const usePlaidLinkHandler = (linkToken, onSuccess, onExit) => {
  const config = {
    token: linkToken,
    onSuccess,
    onExit
  };

  const { open, ready } = usePlaidLink(config);

  return { open, ready };
};

export default usePlaidLinkHandler;

