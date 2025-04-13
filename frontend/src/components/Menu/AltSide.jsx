import React, { useState } from "react";
import Avatar from "../Avatar";
import { Link } from "react-router-dom";
import { CiLight } from "react-icons/ci";
import { TbMessageLanguage } from "react-icons/tb";
import { useLocation } from "react-router-dom";
import homeIcon from "../../assets/home.svg";
import chatsIcon from "../../assets/chats.svg";
import eventsIcon from "../../assets/events.svg";
import helpIcon from "../../assets/help.svg";
import aboutIcon from "../../assets/about.svg";
import teamIcon from "../../assets/team.svg";
import themeIcon from "../../assets/side-theme.svg";
import { useTranslation } from "react-i18next";
import ChangeLanguageModal from "./ChangeLanguageModal";
import "./AltSide.css";
import "./Menu.css";
import { useUserInfo } from "../../contexts/UserInfoContext";
import { useAuth } from "../../contexts/AuthContext";

export default function AltSide({ setExpand, display }) {
  const { user } = useUserInfo();
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const isActive = path => location.pathname.startsWith(path);
  const [isChangeLanguageModalOpen, setIsChangeLanguageModalOpen] =
    useState(false);

  function onChangeLanguageClick() {
    setIsChangeLanguageModalOpen(true);
  }

  return (
    <div
      style={{
        display: display,
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.38)",
        zIndex: 100000,
      }}
      onClick={e => {
        e.preventDefault();
        setExpand(0);
        e.stopPropagation();
      }}
    >
      <div
        style={{
          width: "max-content",
          height: "70vh",
          backgroundColor: "#fff2d3",
          border: "2px solid black",
          zIndex: 100001,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            height: "13vh",
            padding: "4%",
            backgroundColor: "#ffe6a9",
          }}
        >
          {currentUser ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                width: "50%",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              <Avatar size="5vh" avatar={user?.avatar} />
              <span>{user?.fullName}</span>
            </div>
          ) : (
            <div
              style={{ display: "flex", alignItems: "center", width: "100%" }}
            >
              <button
                style={{
                  width: "100%",
                  textAlign: "center",
                  justifyContent: "center",
                }}
                className="hd-btn"
              >
                {t("auth.logIn")}
              </button>
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              width: "50%",
              alignItems: "flex-end",
            }}
          >
            <CiLight size="4vh" />
            <TbMessageLanguage
              size="4vh"
              onClick={() => {
                onChangeLanguageClick(true);
              }}
            />
          </div>
        </div>
        <div style={{ borderTop: "2px solid black" }}>
          <div
            className={`mn-menu-elem ${
              location.pathname === "/" ? "active" : ""
            }`}
          >
            <Link to="/" id="/mn-menu-home">
              <img src={homeIcon} alt="Home" />
              <span>{t("menu.home")}</span>
            </Link>
          </div>
          <div className={`mn-menu-elem ${isActive("/chats") ? "active" : ""}`}>
            <Link
              to={currentUser ? `/chats` : "/login"}
              id="mn-menu-chats"
              state={{
                backgroundLocation: location,
                redirectPath: `/chats`,
              }}
            >
              <img src={chatsIcon} alt="Chats" />
              <span>{t("menu.chats")}</span>
            </Link>
          </div>
          <div
            className={`mn-menu-elem ${isActive("/poptopics") ? "active" : ""}`}
          >
            <Link id="mn-menu-events" to="/poptopics">
              <img src={eventsIcon} alt="Events" />
              <span>{t("menu.popular")}</span>
            </Link>
          </div>
          <div
            className={`mn-menu-elem ${isActive("/mytopics") ? "active" : ""}`}
          >
            <Link id="mn-menu-events" to={currentUser ? `/mytopics` : "/login"}>
              <img src={themeIcon} alt="Events" />
              <span>{t("menu.myTopics")}</span>
            </Link>
          </div>
          <div className={`mn-menu-elem ${isActive("/about") ? "active" : ""}`}>
            <Link id="mn-menu-about" to="/about">
              <img src={aboutIcon} alt="About" />
              <span>{t("menu.about")}</span>
            </Link>
          </div>
          <div className={`mn-menu-elem ${isActive("/team") ? "active" : ""}`}>
            <Link id="mn-menu-team" to="/team">
              <img src={teamIcon} alt="Team" />
              <span>{t("menu.team")}</span>
            </Link>
          </div>
          <div className={`mn-menu-elem ${isActive("/help") ? "active" : ""}`}>
            <Link id="mn-menu-help" to="/FaQ">
              <img src={helpIcon} alt="Help" />
              <span>{t("menu.help")}</span>
            </Link>
          </div>
        </div>
      </div>
      {isChangeLanguageModalOpen ? (
        <ChangeLanguageModal
          onClose={() => {
            setIsChangeLanguageModalOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
