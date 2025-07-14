import React, { useEffect, useState } from 'react';
import '../styles/form.css'; // Assuming you have a CSS file for styling the modal

function Modal({ message, onClose, isSuccess }) {
    const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 10); // slight delay for animation
    return () => clearTimeout(timeout);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300); // match transition duration
  };

  return (
    <div className={`modal-overlay ${visible ? "fade-in" : "fade-out"}`}>
      <div className={`modal-box ${isSuccess ? "modal-success" : "modal-error"} ${visible ? "slide-in" : "slide-out"}`}>
        <p>{message}</p>
        <button onClick={handleClose}>OK</button>
      </div>
    </div>
  );
}
export default Modal;