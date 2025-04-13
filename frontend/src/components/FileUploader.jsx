import React, { useRef } from "react";
import addFileIcon from "../assets/add-file.svg";

export default function FileUploader({ setFiles, setIsSendModalOpen, style }) {
  const fileInputRef = useRef();

  function handleImageClick() {
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  }

  return (
    <div>
      <img
        src={addFileIcon}
        style={{ cursor: "pointer" , ...style}}
        alt="Add file"
        onClick={handleImageClick}
      />

      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={e => {
          setFiles(
            Array.from(e.target.files).map(file => ({
              data: file,
              name: file.name,
              isFromDatabase: false,
            }))
          );
          setIsSendModalOpen(true);
        }}
        multiple
      />
    </div>
  );
}
