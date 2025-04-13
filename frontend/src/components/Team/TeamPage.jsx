import React from "react";
import { useWidth } from "../../contexts/ScreenWidthContext";
import "../MyTopic/MyTopic.css";
import "../AboutUforum/About.css";
import "./TeamPage.css";
import { useTranslation } from "react-i18next";
import roman from "../../assets/authors/roman.png";
import bagdan from "../../assets/authors/bagdan.png";
import matviy from "../../assets/authors/matveysus.jpg";
import vitaliy from "../../assets/authors/vitalia.jpg";
import dimoon from "../../assets/authors/dimooon.jpg";
import naz from "../../assets/authors/naz.jpg";

export default function TeamPage() {
  const { width } = useWidth();
  const { t } = useTranslation();

  function getColumn(index) {
    if (width > 768) return (index % 3) + 1;
    else return (index % 2) + 1;
  }
  function getRow(index) {
    if (width > 768) return index / 3 + 1;
    else return index / 2 + 1;
  }
  return (
    <div className="topics-container">
      <div
        className="topics-content"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <div className="content">
          <div
            className="person-card"
            style={{ gridColumn: getColumn(0), gridRow: getRow(0) }}
          >
            <div className="avtr">
              <p className="vert-text">{t("team.members.0.name")}</p>
              <img src={roman} />
            </div>
            <p className="p-c-info">{t("team.members.0.role")}</p>
          </div>
          <div
            className="person-card"
            style={{ gridColumn: getColumn(1), gridRow: getRow(1) }}
          >
            <div className="avtr">
              <p className="vert-text">{t("team.members.1.name")}</p>
              <img src={bagdan} />
            </div>
            <p className="p-c-info">{t("team.members.1.role")}</p>
          </div>
          <div
            className="person-card"
            style={{ gridColumn: getColumn(2), gridRow: getRow(2) }}
          >
            <div className="avtr">
              <p className="vert-text">{t("team.members.2.name")}</p>
              <img src={matviy} />
            </div>
            <p className="p-c-info">{t("team.members.2.role")}</p>
          </div>
          <div
            className="person-card"
            style={{ gridColumn: getColumn(3), gridRow: getRow(3) }}
          >
            <div className="avtr">
              <p className="vert-text">{t("team.members.3.name")}</p>
              <img src={vitaliy} />
            </div>
            <p className="p-c-info">{t("team.members.3.role")}</p>
          </div>
          <div
            className="person-card"
            style={{ gridColumn: getColumn(4), gridRow: getRow(4) }}
          >
            <div className="avtr">
              <p className="vert-text">{t("team.members.4.name")}</p>
              <img src={dimoon} />
            </div>
            <p className="p-c-info">{t("team.members.4.role")}</p>
          </div>
          <div
            className="person-card"
            style={{ gridColumn: getColumn(5), gridRow: getRow(5) }}
          >
            <div className="avtr">
              <p className="vert-text">{t("team.members.5.name")}</p>
              <img src={naz} />
            </div>
            <p className="p-c-info">{t("team.members.5.role")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
