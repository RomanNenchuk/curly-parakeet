import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import closeIcon from "../../assets/cancel.svg";
import downloadIcon from "../../assets/download.svg";
import axios from "axios";
import "./MediaModal.css";

export default function MediaModal({ url, onClose }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleWheel = e => {
    setScale(prevScale =>
      Math.max(0.5, Math.min(3, prevScale + e.deltaY * -0.001))
    );
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(url, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: response.data.type });
      const mediaUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = mediaUrl;
      link.download = `photo_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(mediaUrl);
    } catch (error) {
      console.error("Failed to load the picture:", error);
    }
  };

  function handleClose(e) {
    e.stopPropagation();
    onClose();
  }

  return ReactDOM.createPortal(
    <div className="photo-modal-overlay" onClick={handleClose}>
      <div className="photo-modal-header">
        <button className="download-button" onClick={handleDownload}>
          <img
            src={downloadIcon}
            alt="Download"
            style={{ filter: "invert(1)" }}
          />
        </button>
        <button className="close-button" onClick={handleClose}>
          <img src={closeIcon} alt="Close" style={{ filter: "invert(1)" }} />
        </button>
      </div>
      <div className="photo-modal-content" onClick={e => e.stopPropagation()}>
        <img
          src={url}
          alt="Preview"
          className="photo-modal-image"
          style={{ transform: `scale(${scale})` }}
          onWheel={handleWheel}
        />
      </div>
    </div>,
    document.body
  );
}
