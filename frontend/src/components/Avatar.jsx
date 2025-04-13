import React from "react";
import { FaUserCircle, FaTimes } from "react-icons/fa";

const Avatar = ({
  preview,
  avatar,
  size = `120px`,
  avThickness = '1px',
  handleImageClick,
  handleRemove,
  className = "",
  style = {},
}) => {
  const baseStyle = {
    objectFit: "cover",
    width: "auto",
    height: size,
    aspectRatio: "1 / 1",
    borderRadius: "50%",
    overflow: "hidden",
    backgroundPosition: "center",
    cursor: "pointer",
    color: "#000",
    position: "relative",
    border: `${avThickness} solid #659287`,
    ...style,
  };

  const crossStyle = {
    position: "absolute",
    top: "5px",
    right: "5px",
    borderRadius: "50%",
    cursor: "pointer",
    zIndex: 10,
    border: "2px solid #000",
    padding: "2px",
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {preview || avatar ? (
        <>
          <img
            src={preview || avatar}
            style={baseStyle}
            alt="Avatar"
            className={`${className}`}
            onClick={handleImageClick}
          />
          {preview && <FaTimes style={crossStyle} onClick={handleRemove} />}
        </>
      ) : (
        <FaUserCircle
          style={baseStyle}
          className={className}
          onClick={handleImageClick}
        />
      )}
    </div>
  );
};

export default Avatar;
