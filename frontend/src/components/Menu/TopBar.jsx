import React, { useEffect, useState } from "react";
import { useUserInfo } from "../../contexts/UserInfoContext";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTopicSearch } from "../../contexts/TopicSearchContext.jsx";
import { useWidth } from "../../contexts/ScreenWidthContext.jsx";
import { MdMenu } from "react-icons/md";
import { IoIosSearch } from "react-icons/io";

import ProfileHeader from "../ProfileHeader";
import logo from "../../assets/logo.svg";
import seachIcon from "../../assets/search.svg";
import "./Menu.css";
import Avatar from "../Avatar.jsx";

export default function TopBar({ setExpand }) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [appendSearch, setAppendSearch] = useState(false);

  const location = useLocation();
  const {
    searchInput,
    setSearchInput,
    urlSearchParams,
    setUrlSearchParams,
    getSearchInputData,
  } = useTopicSearch();
  const navigate = useNavigate();
  const { user } = useUserInfo();

  function handleSearch(e) {
    e.preventDefault();
    const result = getSearchInputData();
    urlSearchParams.delete("tags");
    urlSearchParams.delete("authors");

    if (result?.tagList?.length > 0)
      urlSearchParams.set("tags", result.tagList);
    if (result?.authorList?.length > 0)
      urlSearchParams.set("authors", result.authorList);

    navigate({
      pathname: "/",
      search: urlSearchParams.toString(),
    });
  }

  function handlerClick(e) {
    e.preventDefault();
    e.stopPropagation();
    navigate(`profiles/${currentUser.uid}`, {
      state: { backgroundLocation: location },
    });
  }
  const { width } = useWidth();

  useEffect(() => {
    if (width >= 768) setAppendSearch(false);
  }, [width]);

  return (
    <header>
      <div className="header-inr">
        <Link
          to="/"
          className="hd-col home-link"
          onClick={() => {
            setUrlSearchParams({});
            setSearchInput("");
          }}
        >
          {width < 768 ? (
            <MdMenu
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                setExpand(1);
              }}
              size="5vh"
            />
          ) : (
            ""
          )}
          <div className="hd-logo">
            {width > 768 ? <img src={logo} alt="UFORUM" /> : ""}
            {!appendSearch ? (
              <span>
                <span>U</span>FORUM
              </span>
            ) : (
              ""
            )}
          </div>
        </Link>
        {width > 768 ? (
          <>
            <div className="hd-col">
              <form className="hd-search" onSubmit={handleSearch}>
                <img src={seachIcon} alt="Search" />
                <input
                  className="hd-search-input"
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder={t("menu.searchPlaceholder")}
                />
                <button className="hd-search-btn" type="submit">
                  <span>{t("menu.searchButton")}</span>
                </button>
              </form>
            </div>
            <div className="hd-col">
              {currentUser && user ? (
                <ProfileHeader
                  id={currentUser.uid}
                  avatar={user?.avatar}
                  profileName={`${t("menu.welcomeMessage")} ${
                    user?.fullName || "user"
                  }!`}
                  size="9vh"
                  sizeFont="3vh"
                  avThickness="0.4vh"
                  gap="1.5vh"
                  order="text-first"
                  style={{ textAlign: "right", marginRight: "10px" }}
                  textStyle={{ color: "#000" }}
                />
              ) : (
                <Link
                  to={`/login${location.search}`}
                  state={{
                    backgroundLocation: {
                      pathname: location.pathname,
                      search: location.search,
                    },
                    redirectPath: location,
                  }}
                >
                  <button className="hd-btn">
                    {t("menu.logIn")}
                    <div className="hd-btn-sep">
                      <span> | </span>
                    </div>
                    {t("menu.signUp")}
                  </button>
                </Link>
              )}
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {!appendSearch ? (
                !currentUser ? (
                  <Link
                    to="/login"
                    state={{
                      backgroundLocation: {
                        pathname: location.pathname,
                        search: location.search,
                      },
                      redirectPath: location,
                    }}
                  >
                    <button className="hd-btn">{t("auth.logIn")}</button>
                  </Link>
                ) : (
                  <div style={{ marginRight: "2vh" }}>
                    <Avatar
                      avatar={user?.avatar}
                      handleImageClick={handlerClick}
                      size="5vh"
                    />
                  </div>
                )
              ) : (
                <form className="hd-search" onSubmit={handleSearch}>
                  <input
                    className="hd-search-input"
                    type="text"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder={t("menu.searchPlaceholder")}
                  />
                  <button className="hd-search-btn" type="submit">
                    <span>{t("menu.searchButton")}</span>
                  </button>
                </form>
              )}
              <IoIosSearch
                size="5vh"
                onClick={() => {
                  setAppendSearch(prev => !prev);
                }}
              />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
