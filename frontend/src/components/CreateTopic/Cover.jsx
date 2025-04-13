import React from "react";
import DefaultFileUploadCover from "../DefaultFileUploadCover";
import { FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import playIcon from "../../assets/play-button.svg";

const Cover = ({
  coverPreview,
  size = `150px`,
  handleImageClick,
  handleRemove,
  className = "",
  style = {},
}) => {
  const baseStyle = {
    objectFit: "cover",
    width: "auto",
    height: size,
    borderRadius: "15px",
    aspectRatio: "3 / 2",
    overflow: "hidden",
    backgroundPosition: "center",
    cursor: "pointer",
    color: "#000",
    position: "relative",
    ...style,
  };

  const crossStyle = {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    cursor: "pointer",
    zIndex: 10,
    border: "2px solid #000",
    padding: "2px",
  };
  const { t } = useTranslation();
  return (
    <div>
      {coverPreview ? (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={coverPreview.url}
            style={baseStyle}
            alt="Cover"
            className={`${className}`}
            onClick={handleImageClick}
          />
          {coverPreview.type === "video/mp4" ? (
            <img src={playIcon} alt="play" className="play-button" />
          ) : null}

          {coverPreview && (
            <FaTimes style={crossStyle} onClick={handleRemove} />
          )}
        </div>
      ) : (
        <DefaultFileUploadCover
          title={t("upload.addCover")}
          style={{
            border: "1px solid #bdbdbd",
            padding: "15px",
            borderRadius: "10px",
            backgroundColor:  " #d9d9d9",
          }}
          handleImageClick={handleImageClick}
        />
      )}
    </div>
  );
};

export default Cover;
