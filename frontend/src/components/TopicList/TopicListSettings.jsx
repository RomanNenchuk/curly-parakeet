import React from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useWidth } from "../../contexts/ScreenWidthContext";
import { Link, useLocation } from "react-router-dom";

import CreateTopicButton from "./CreateTopicButton";
import "./TopicList.css";

export default function TopicListSettings({ sortOrder, handleChange }) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { width } = useWidth();
  const location = useLocation();

  return width > 768 ? (
    <div className="top-button">
      <CreateTopicButton />
      <select
        className="dropdown-button"
        value={sortOrder}
        onChange={handleChange}
      >
        <option key="desc" value="desc">{t("topic.newest")}</option>
        <option key="asc" value="asc">{t("topic.oldest")}</option>
        <option key="rating" value="rating">{t("topic.topRated")}</option>
        {currentUser && (
          <option key="subs" value="subs">{t("topic.subs")}</option>
        )}
      </select>
    </div>
  ) : (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          width: "100%",
          borderBottom: "1px solid black",
          paddingBottom: "0.8%",
          marginBottom: "2vh",
        }}
      >
        <select
          className="custom-select"
          value={sortOrder}
          onChange={handleChange}
        >
          <option key="desc" value="desc">{t("topic.newest")}</option>
          <option key="asc" value="asc">{t("topic.oldest")}</option>
          <option key="rating" value="rating">{t("topic.topRated")}</option>
        </select>
      </div>
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Link
          style={{ width: "90%" }}
          to={currentUser ? "/create-topic" : "/login"}
          state={{
            backgroundLocation: location,
            redirectPath: "/create-topic",
          }}
        >
          <button
            className="add-topic-button"
            style={{ width: "100%", marginBottom: "2vh" }}
          >
            {t("topic.addTopicButton")}
          </button>
        </Link>
      </div>
    </div>
  );
}
