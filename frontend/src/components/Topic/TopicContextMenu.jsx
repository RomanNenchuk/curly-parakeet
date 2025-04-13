import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ContextMenu from "../PopupMenus/ContextMenu.jsx";
import deleteIcon from "../../assets/delete-context-menu.svg";
import editIcon from "../../assets/edit-file.svg";
import replyIcon from "../../assets/reply-context-menu.svg";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function TopicContextMenu({
  positionX,
  positionY,
  isToggled,
  contextMenuRef,
  resetContextMenu,
  contextMenu,
  deleteComment,
  setEditId,
  setText,
  setReply,
  setFiles,
  setIsEditModalOpen,
}) {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const buttons = [
    {
      text: t("delete"),
      icon: deleteIcon,
      onClick:
        contextMenu.selectedCommentItem?.author_id === currentUser?.uid
          ? () => {
              deleteComment(contextMenu.selectedComment);
            }
          : null,
    },
    {
      text: t("edit"),
      icon: editIcon,
      onClick:
        contextMenu.selectedCommentItem?.author_id == currentUser?.uid
          ? () => {
              const dbFiles = contextMenu.selectedCommentItem?.attachments?.map(
                url => ({
                  name: url.split("/").pop(),
                  url,
                  isFromDatabase: true,
                })
              );

              if (dbFiles) setFiles(prevFiles => [...dbFiles, ...prevFiles]);

              console.log(contextMenu.selectedComment);
              setEditId(contextMenu.selectedComment);
              setText(contextMenu.selectedCommentItem.text);

              if (contextMenu.selectedCommentItem?.attachments?.length) {
                setIsEditModalOpen(true);
              }
            }
          : null,
    },
    {
      text: t("reply"),
      icon: replyIcon,
      onClick:
        contextMenu.selectedCommentItem?.reply === -1
          ? () => {
              setReply({
                id: contextMenu.selectedCommentItem.id,
                author: contextMenu.selectedCommentItem.author_fullname,
                text: contextMenu.selectedCommentItem.text,
                attachment: contextMenu.selectedCommentItem.attachments[0],
                timestamp: contextMenu.selectedCommentItem.timestamp,
              });
            }
          : null,
    },
  ].filter(button => button.onClick);

  useEffect(() => {
    if (!isToggled || buttons.length === 0) {
      resetContextMenu();
    }
  }, [contextMenu.selectedCommentItem]);
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
