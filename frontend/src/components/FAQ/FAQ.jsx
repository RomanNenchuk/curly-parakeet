import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { IoIosArrowDown } from "react-icons/io";
import "../MyTopic/MyTopic.css";
import "../AboutUforum/About.css";
import "./FAQ.css";

export default function FAQ() {
  const [uniqueExtension, setExtension] = useState();
  const { t } = useTranslation();

  function setExt(index) {
    if (uniqueExtension === 0 || uniqueExtension != index) setExtension(index);
    else setExtension(0);
  }
  return (
    <div className="topics-container">
      <div className="topics-content content-center">
        <div className="content-cards">
          <h5>{t("faq")}</h5>
          <div className=" card card-add" onClick={() => setExt(1)}>
            <div className="card-head">
              <h6>{t("questions.username_change.title")}</h6>
              <IoIosArrowDown
                size={25}
                style={
                  uniqueExtension === 1
                    ? { transform: "rotate(180deg)" }
                    : { transform: "rotate(0deg)" }
                }
              />
            </div>
            {uniqueExtension === 1 ? (
              <p>{t("questions.username_change.answer")}</p>
            ) : (
              ""
            )}
          </div>
          <div className="card card-add" onClick={() => setExt(2)}>
            <div className="card-head">
              <h6>{t("questions.forgot_password.title")}</h6>
              <IoIosArrowDown
                size={25}
                style={
                  uniqueExtension === 2
                    ? { transform: "rotate(180deg)" }
                    : { transform: "rotate(0deg)" }
                }
              />
            </div>
            {uniqueExtension === 2 ? (
              <p>{t("questions.forgot_password.answer")}</p>
            ) : (
              ""
            )}
          </div>
          <div className="card card-add" onClick={() => setExt(3)}>
            <div className="card-head">
              <h6>{t("questions.search_system.title")}</h6>
              <IoIosArrowDown
                size={25}
                style={
                  uniqueExtension === 3
                    ? { transform: "rotate(180deg)" }
                    : { transform: "rotate(0deg)" }
                }
              />
            </div>
            {uniqueExtension === 3 ? (
              <p>
                {t("questions.search_system.answer.general")}
                <br />
                {t("questions.search_system.answer.first")}
                <br />
                {t("questions.search_system.answer.second")}
                <br />
                {t("questions.search_system.answer.third")}
              </p>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
