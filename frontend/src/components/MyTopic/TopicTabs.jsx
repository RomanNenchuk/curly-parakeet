import React from "react";

export default function TopicTabs({
  showFirstTab,
  choseFirstTab,
  firstTabCaption,
  secondTabCaption,
}) {
  return (
    <div className="topic-tabs">
      <div
        className={`tab ${showFirstTab ? "active-tab" : ""}`}
        onClick={() => choseFirstTab(true)}
      >
        {firstTabCaption}
      </div>
      <div
        className={`tab ${!showFirstTab ? "active-tab" : ""}`}
        onClick={() => {
          choseFirstTab(false);
        }}
      >
        {secondTabCaption}
      </div>
    </div>
  );
}
