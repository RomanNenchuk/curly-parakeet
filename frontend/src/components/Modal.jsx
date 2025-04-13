import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";

export default function Modal({ onCloseModal, children }) {
  const navigate = useNavigate();

  const defaultCloseModal = () => {
    navigate(-1);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return ReactDOM.createPortal(
    <div className="glob" onClick={onCloseModal || defaultCloseModal}>
      <div className="glob-reg" onClick={e => e.stopPropagation()}>
        {React.cloneElement(children, {
          onClose: onCloseModal || defaultCloseModal,
        })}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}
