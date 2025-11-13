import React from 'react';

const Modal = ({ isVisible, children }) => {
  return (
    <div className={`modal ${isVisible ? 'modal-visible' : ''}`}>
      <div className="modal-content">
        {children}
      </div>
    </div>
  );
};

export default Modal;

