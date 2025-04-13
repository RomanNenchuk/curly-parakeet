import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import "./PopupMenu.css";

export default function ContextMenu({
  positionX,
  positionY,
  isToggled,
  contextMenuRef,
  buttons = [],
  resetContextMenu,
}) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <menu
      ref={contextMenuRef}
      style={{
        top: positionY + 2 + "px",
        left: positionX + 2 + "px",
      }}
      className={`context-menu ${isToggled && buttons?.length ? "active" : ""}`}
    >
      {buttons?.length === 0
        ? null
        : buttons.map(({ text, icon, onClick }, index) => (
            <button
              key={index}
              onClick={e => {
                e.stopPropagation();
                if (!currentUser) {
                  resetContextMenu();
                  setTimeout(() => {
                    navigate("/login", {
                      state: {
                        backgroundLocation: location,
                        redirectPath: location,
                      },
                    });
                  }, 0);
                  return;
                }
                if (onClick) {
                  onClick();
                  resetContextMenu();
                }
              }}
              className={`context-menu-button ${!onClick ? "disabled" : ""}`}
              disabled={!onClick}
            >
              <span>{text}</span>
              <img
                src={icon}
                width="20"
                height="20"
                alt={text}
                className="icon"
              />
            </button>
          ))}
    </menu>
  );
}
