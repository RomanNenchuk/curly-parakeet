import React from "react";
import addCoverIcon from "../assets/add-cover.svg";

let baseStyle = {
  uploadFilesCover: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    cursor: "pointer",
    width: "100%",
    alignItems: "center",
    margin: "auto 0",
  },
  title: {
    fontFamily: "Inter",
    fontSize: "1rem",
    fontWeight: "500",
    lineHeight: "22.99px",
    textAlign: "left",
  },
};

export default function DefaultFileUploadCover({
  title,
  handleImageClick,
  style,
}) {
  baseStyle.uploadFilesCover = { ...baseStyle.uploadFilesCover, ...style };
  return (
    <div style={baseStyle.uploadFilesCover} onClick={handleImageClick}>
      <span style={baseStyle.title}>{title}</span>
      <img src={addCoverIcon} style={{ height: "27px" }} />
    </div>
  );
}
