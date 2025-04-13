import React, { useState, useEffect } from "react";
import LoadingSpinner from "./Spinner.jsx";
import { useTranslation } from "react-i18next";
import { useChat } from "../contexts/ChatContext";

export default function DefaultChatScreen() {
  const { t } = useTranslation();

  return (
    <div className="h-100 d-flex justify-content-center align-items-center">
      <h3>{t("chat.defaultChatScreenMessage")}</h3>
    </div>
  );
}
