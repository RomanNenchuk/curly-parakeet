import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useChat } from "../../contexts/ChatContext.jsx";
import { useTranslation } from "react-i18next";
import ActionMenu from "../PopupMenus/ActionMenu.jsx";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal.jsx";
import deleteIcon from "../../assets/delete-context-menu.svg";
import cleanIcon from "../../assets/clean.svg";

export default function TopicActionMenu({
  positionX,
  positionY,
  isToggled,
  actionMenuRef,
  resetActionMenu,
}) {
  const { t } = useTranslation();
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    onConfirm: () => {},
  });
  const { deleteChat, clearChat } = useChat();
  const { currentUser } = useAuth();
  const { receiverId } = useParams();

  const buttons = [
    {
      text: t("delete"),
      icon: deleteIcon,
      onClick: () => {
        setConfirmModal({
          isOpen: true,
          message: t("chat.deleteChatQuery"),
          onConfirm: () => {
            deleteChat(receiverId, currentUser.uid);
            resetConfirmModal();
          },
        });
      },
    },
    {
      text: t("clear"),
      icon: cleanIcon,
      onClick: () => {
        setConfirmModal({
          isOpen: true,
          message: t("chat.clearChatQuery"),
          onConfirm: () => {
            clearChat(receiverId, currentUser.uid);
            resetConfirmModal();
          },
        });
      },
    },
  ];

  const resetConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      message: "",
      onConfirm: () => {},
    });
  };

  return (
    <>
      {confirmModal.isOpen ? (
        <ConfirmationModal
          onClose={resetConfirmModal}
          onConfirm={confirmModal.onConfirm}
          message={confirmModal.message}
        />
      ) : null}
      <ActionMenu
        positionX={positionX}
        positionY={positionY}
        isToggled={isToggled}
        actionMenuRef={actionMenuRef}
        buttons={buttons}
        resetActionMenu={resetActionMenu}
      />
    </>
  );
}
