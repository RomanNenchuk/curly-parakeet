import React, { useState, useRef } from "react";
import { useTopicSearch } from "../../contexts/TopicSearchContext.jsx";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ToastPortal from "../Toast/Toast.jsx";
import "./TagBar.css";

export default function TagBar() {
  const [toast, setToast] = useState(null);
  const toastTimeout = useRef(null);
  const { popularTagList } = useTopicSearch();
  const { t } = useTranslation();
  const location = useLocation();

  const showToast = (message, type, item = "") => {
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }

    setToast({ message, type, item });

    toastTimeout.current = setTimeout(() => {
      setToast(null);
      toastTimeout.current = null;
    }, 3000);
  };

  const handleTagClick = tagName => {
    navigator.clipboard.writeText(`# ${tagName}`);
    showToast(t("tag.copied"), "success", `# ${tagName}`);
  };

  return (
    <>
      <div className="tag-list">
        <h5 className="tag-list-title">{t("tag.popularTags")}</h5>
        {
          <>
            {popularTagList.map((tag, index) => (
              <h5
                className="tag"
                key={index}
                onClick={() => handleTagClick(tag.tag_name)}
              >
                # {tag.tag_name}
              </h5>
            ))}
            <Link
              to={`/tags${location.search}`}
              state={{
                backgroundLocation: location,
              }}
              id = "show-more"
            >
              {t("tag.showMore")}
            </Link>
          </>
        }
      </div>
      {toast && (
        <ToastPortal
          message={toast.message}
          type={toast.type}
          item={toast.item}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
