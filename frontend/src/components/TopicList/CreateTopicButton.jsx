import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";

export default function CreateTopicButton({ style }) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  function handleCreateTopicClick() {
    navigate(currentUser ? "/create-topic" : "/login", {
      state: {
        redirectPath: "/create-topic",
      },
    });
  }
  return (
    <button
      className="add-topic-button"
      style={style}
      onClick={handleCreateTopicClick}
    >
      {t("topic.addTopicButton")}
    </button>
  );
}
