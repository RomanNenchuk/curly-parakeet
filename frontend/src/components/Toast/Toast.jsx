import React from "react";
import ReactDOM from "react-dom";
import styles from "./Toast.module.css";

export const Toast = ({ message, type, item, onClose }) => {
  return (
    <div className={styles.toast} onAnimationEnd={onClose}>
      <span className={styles.itemName}>{item}</span> {message}
    </div>
  );
};

const ToastPortal = ({ message, type, item, onClose }) => {
  return ReactDOM.createPortal(
    <Toast message={message} item={item} type={type} onClose={onClose} />,
    document.getElementById("modal-root")
  );
};

export default ToastPortal;
