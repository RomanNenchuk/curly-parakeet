import React from "react";
import ContextMenu from "../PopupMenus/ContextMenu";
import { useTranslation } from "react-i18next";
import deleteIcon from "../../assets/delete-context-menu.svg";
import editIcon from "../../assets/edit-file.svg";
import replyIcon from "../../assets/reply-context-menu.svg";

export default function ChatContextMenu(props) {
  const {
    positionX,
    positionY,
    isToggled,
    contextMenuRef,
    resetContextMenu,
    deleteMessage,
    resetEdit,
    setIsEditModalOpen,
    setText,
    setEditId,
    setFiles,
    currentUser,
    setReply,
    contextMenu,
  } = props;
  const { t } = useTranslation();

  const buttons = [
    {
      text: t("delete"),
      icon: deleteIcon,
      onClick: deleteMessage
        ? () => {
            deleteMessage(contextMenu.selectedMessage);
            resetEdit();
          }
        : null,
    },
    {
      text: t("edit"),
      icon: editIcon,
      onClick:
        contextMenu.selectedMessageItem?.sender_id === currentUser.uid
          ? () => {
              const dbFiles = contextMenu.selectedMessageItem?.attachments?.map(
                url => ({
                  name: url.split("/").pop(),
                  url,
                  isFromDatabase: true,
                })
              );

              if (dbFiles) setFiles(prevFiles => [...dbFiles, ...prevFiles]);

              setText(contextMenu.selectedMessageItem?.text || "");
              setEditId(contextMenu.selectedMessage);

              if (contextMenu.selectedMessageItem?.attachments?.length) {
                setIsEditModalOpen(true);
              }
            }
          : null,
    },
    {
      text: t("reply"),
      icon: replyIcon,
      onClick: setReply
        ? () => {
            setReply({
              id: contextMenu.selectedMessageItem.id,
              author: contextMenu.selectedMessageItem.fullname,
              text: contextMenu.selectedMessageItem.text,
              attachment: contextMenu.selectedMessageItem.attachments[0],
            });
          }
        : null,
    },
  ].filter(button => button.onClick);

  return (
    <ContextMenu
      positionX={positionX}
      positionY={positionY}
      isToggled={isToggled}
      contextMenuRef={contextMenuRef}
      buttons={buttons}
      resetContextMenu={resetContextMenu}
    />
  );
}
