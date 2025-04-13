import React from "react";
import { useTranslation } from "react-i18next";
import "../CreateTopic/CreateTopic.css";

export default function TagList({ tags, selectedTags, setSelectedTags }) {
  const { t } = useTranslation();
  function selectTag(selected) {
    if (selectedTags.length >= 5) return;
    setSelectedTags(prevData => [...new Set(prevData).add(selected)]);
  }
  return (
    <>
      {tags.length === 0 ? (
        <div className="tags-not-found">{t("tag.tagsNotFound")}</div>
      ) : (
        tags.map((tag, index) => (
          <h5
            className="tag"
            key={index}
            onClick={() => {
              selectTag(tag);
            }}
          >
            # {tag.tag_name}
          </h5>
        ))
      )}
    </>
  );
}
