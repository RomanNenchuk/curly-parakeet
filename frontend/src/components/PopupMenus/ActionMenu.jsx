import React from "react";
import "./PopupMenu.css";

export default function ActionMenu({
  positionX,
  positionY,
  isToggled,
  actionMenuRef,
  resetActionMenu,
  buttons = [],
}) {
  return (
    <menu
      ref={actionMenuRef}
      style={{
        top: positionY + "px",
        left: positionX + "px",
      }}
      className={`context-menu ${isToggled && buttons?.length ? "active" : ""}`}
    >
      {buttons.map(({ text, icon, onClick }, index) => (
        <button
          key={index}
          onClick={e => {
            e.stopPropagation();
            if (onClick) {
              onClick();
              resetActionMenu();
            }
          }}
          className={`context-menu-button ${!onClick ? "disabled" : ""}`}
          disabled={!onClick}
        >
          <span>{text}</span>
          <img src={icon} width="20" height="20" alt={text} className="icon" />
        </button>
      ))}
    </menu>
  );
}
