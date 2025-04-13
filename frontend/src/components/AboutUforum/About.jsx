import React from "react";
import { useTranslation } from "react-i18next";
import "../MyTopic/MyTopic.css";
import "./About.css";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="topics-container">
      <div className="topics-content content-center">
        <div className="text-content">
          <p>
            <span className="uf">
              <span className="u">U</span>FORUM
            </span>{" "}
            {t("about.description")}
          </p>
          <p>{t("about.mission")}</p>
          <p>{t("about.how_it_works")}</p>
          <ul>
            <li>{t("about.features.create_topic")}</li>
            <li>{t("about.features.commenting")}</li>
            <li>{t("about.features.reactions")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
