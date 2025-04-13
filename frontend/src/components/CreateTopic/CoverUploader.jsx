import React, { useRef } from "react";
import Cover from "./Cover.jsx";
import { generateVideoThumbnail } from "../../utils/videoThumbnail.jsx";

export default function CoverUploader({
  coverPreview,
  setCoverPreview,
  setCover,
  setError,
}) {
  const coverInputRef = useRef(null);

  async function handleImageChange(e) {
    setError("");
    const selectedFile = e.target.files[0];
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "video/mp4",
    ];

    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      // звільняю пам'ять від попереднього URL
      if (coverPreview?.url) URL.revokeObjectURL(coverPreview.url);

      let url;
      try {
        if (selectedFile.type === "video/mp4") {
          url = await generateVideoThumbnail(selectedFile);
        } else {
          url = URL.createObjectURL(selectedFile);
        }

        setCover(selectedFile);
        setCoverPreview({
          type: selectedFile.type,
          url,
        });

        e.target.value = "";
      } catch (error) {
        setError(t("upload.errorPreview"));
        console.error(error);
      }
    } else {
      setError(t("upload.errorFormat"));
      e.target.value = "";
    }
  }

  const handleImageClick = () => coverInputRef.current.click();

  const handleRemove = () => {
    if (coverPreview?.url) URL.revokeObjectURL(coverPreview.url);
    setCoverPreview("");
    setCover("");
  };

  return (
    <div className="text-center my-4">
      <Cover
        coverPreview={coverPreview}
        handleImageClick={handleImageClick}
        handleRemove={handleRemove}
      />
      <input
        type="file"
        onChange={handleImageChange}
        ref={coverInputRef}
        style={{ display: "none" }}
        accept=".jpg, .jpeg, .png, .gif, .mp4"
      />
    </div>
  );
}
