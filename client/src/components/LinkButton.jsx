import React from 'react';

const LinkButton = ({ onClick, isVisible }) => {
  return (
    <button 
      className={`link-button ${isVisible ? 'visible' : 'hidden'}`}
      onClick={onClick}
    >
      Let's Go
    </button>
  );
};

export default LinkButton;

