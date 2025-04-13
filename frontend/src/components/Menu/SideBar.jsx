import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import ChangeLanguageModal from "./ChangeLanguageModal";
import homeIcon from "../../assets/home.svg";
import chatsIcon from "../../assets/chats.svg";
import eventsIcon from "../../assets/events.svg";
import helpIcon from "../../assets/help.svg";
import languageIcon from "../../assets/language.svg";
import modIcon from "../../assets/theme.svg";
import aboutIcon from "../../assets/about.svg";
import teamIcon from "../../assets/team.svg";
import themeIcon from "../../assets/side-theme.svg";
import "./Menu.css";

export default function SideBar() {
  const { t } = useTranslation();
  const [isExpanded, setExpand] = useState(true);
  const [isChangeLanguageModalOpen, setIsChangeLanguageModalOpen] =
    useState(false);

  const SQUEEZE_SIDE_BAR_PATHS = ["/chats", "/topics"];
  const location = useLocation();
  const { currentUser } = useAuth();

  useEffect(() => {
    const isSqueezeSideBarRoute = SQUEEZE_SIDE_BAR_PATHS.some(path => {
      return location.pathname.startsWith(path);
    });
    if (isSqueezeSideBarRoute) setExpand(false);
    else setExpand(true);
  }, [location]);

  const isActive = path => location.pathname.startsWith(path);

  function onChangeLanguageClick() {
    setIsChangeLanguageModalOpen(true);
  }

  return (
    <div
      className="main-page-menu"
      style={{ width: isExpanded ? "45vh" : "10vh" }}
    >
      <div className="mn-menu-row mn-menu-row1">
        <div
          className={`mn-menu-el ${location.pathname === "/" ? "active" : ""}`}
        >
          <Link to="/" id="/mn-menu-home">
            <img src={homeIcon} alt="Home" />
            {isExpanded && <span>{t("menu.home")}</span>}
          </Link>
        </div>
        <div className={`mn-menu-el ${isActive("/chats") ? "active" : ""}`}>
          <Link
            to={currentUser ? `/chats` : `/login${location.search}`}
            id="mn-menu-chats"
            state={{
              backgroundLocation: location,
              redirectPath: `/chats`,
            }}
          >
            <img src={chatsIcon} alt="Chats" />
            {isExpanded && <span>{t("menu.chats")}</span>}
          </Link>
        </div>
        <div className={`mn-menu-el ${isActive("/poptopics") ? "active" : ""}`}>

          <Link id="mn-menu-popular" to="/poptopics">
            <img src={eventsIcon} alt="Popular" />
            {isExpanded && <span>{t("menu.popular")}</span>}
          </Link>
        </div>
        <div className={`mn-menu-el ${isActive("/mytopics") ? "active" : ""}`}>
          <Link
            id="mn-menu-my-topics"
            to={currentUser ? `/mytopics` : `/login${location.search}`}
            state={{
              backgroundLocation: location,
              redirectPath: `/mytopics`,
            }}
          >
            <img src={themeIcon} alt="My topics" />
            {isExpanded && <span>{t("menu.myTopics")}</span>}
          </Link>
        </div>
      </div>
      <div className="mn-menu-row mn-menu-row2">
        <div
          className="mn-menu-el change-language"
          onClick={onChangeLanguageClick}
        >
          <img src={languageIcon} alt="Language" />
          {isExpanded && <span>{t("menu.changeLanguage")}</span>}
        </div>
        <div className="mn-menu-el">
          <Link id="mn-menu-theme">
            <img src={modIcon} alt="Theme" />
            {isExpanded && <span>{t("menu.theme")}</span>}
          </Link>
        </div>
      </div>
      <div className="mn-menu-row mn-menu-row3">
        <div className={`mn-menu-el ${isActive("/about") ? "active" : ""}`}>
          <Link id="mn-menu-about" to="/about">
            <img src={aboutIcon} alt="About" />
            {isExpanded && <span>{t("menu.about")}</span>}
          </Link>
        </div>
        <div className={`mn-menu-el ${isActive("/team") ? "active" : ""}`}>
          <Link id="mn-menu-team" to="/team">
            <img src={teamIcon} alt="Team" />
            {isExpanded && <span>{t("menu.team")}</span>}
          </Link>
        </div>
        <div className={`mn-menu-el ${isActive("/help") ? "active" : ""}`}>
          <Link id="mn-menu-help" to="/FaQ">
            <img src={helpIcon} alt="Help" />
            {isExpanded && <span>{t("menu.help")}</span>}
          </Link>
        </div>
      </div>

      {isChangeLanguageModalOpen ? (
        <ChangeLanguageModal
          onClose={() => setIsChangeLanguageModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
