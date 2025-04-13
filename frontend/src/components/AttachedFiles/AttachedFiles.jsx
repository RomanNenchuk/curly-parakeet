import React, { useState } from "react";
import LazyVideo from "./LazyVideo.jsx";
import MediaModal from "../MediaModal/MediaModal.jsx";
import fileIcon from "../../assets/file.svg";
import "./AttachedFiles.css";

export default function AttachedFiles({ urls, onImageLoad, imgstyle, videoStyle = "media-video" }) {
  const [mediaModalInfo, setMediaModalInfo] = useState({
    isOpen: false,
    url: null,
  });

  return (
    <>
      {urls?.length > 0 ? (
        <div className="media-grid">
          {urls?.map((url, index) => {
            const isImage = url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);
            const isVideo = url.match(/\.(mp4|webm|ogg)$/i);

            return isImage ? (
              <img
                key={index}
                src={url}
                alt={`media-${index}`}
                onLoad={onImageLoad}
                className={imgstyle ? imgstyle:"media-image"}
                onClick={e => {
                  e.stopPropagation();
                  setMediaModalInfo({
                    isOpen: true,
                    url,
                  });
                }}
              />
            ) : isVideo ? (
              <LazyVideo key={index} videoId={index} src={url} className={videoStyle} />
            ) : (
              <a
                key={index}
                href={url}
                target="blank"
                style={{ width: "100%" }}
              >
                <div className="file-item">
                  <div className="file-header">
                    <img
                      src={fileIcon}
                      alt="File"
                      height={30}
                      onLoad={onImageLoad}
                    />
                    <span className="file-name">
                      {url.slice(url.indexOf("_") + 1)}
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
          {mediaModalInfo.isOpen && (
            <MediaModal
              url={mediaModalInfo.url}
              onClose={() =>
                setMediaModalInfo({
                  isOpen: false,
                  url: null,
                })
              }
            />
          )}
        </div>
      ) : null}
    </>
  );
}
