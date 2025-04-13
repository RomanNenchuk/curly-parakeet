import React from "react";
import CreateTopicButton from "../TopicList/CreateTopicButton.jsx";
import { useTranslation } from "react-i18next";
import TopicTabs from "./TopicTabs.jsx";
import "./MyTopic.css";

export default function TopicListHeader({
  choseFirstTab,
  showFirstTab,
  firstTabCaption,
  secondTabCaption,
  showCreateButton = false,
}) {
  const { t } = useTranslation();
  return (
    <div className="topics-header">
      <div className="topics-navigation-container">
        <TopicTabs
          showFirstTab={showFirstTab}
          choseFirstTab={choseFirstTab}
          firstTabCaption={firstTabCaption}
          secondTabCaption={secondTabCaption}
        />
        {showCreateButton && showFirstTab ? (
          <div className="add-topic-container">
            <CreateTopicButton style={{ width: "100%" }} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
