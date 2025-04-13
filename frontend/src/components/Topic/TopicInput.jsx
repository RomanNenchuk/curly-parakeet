import React from "react";
import { useTranslation } from "react-i18next";
import FileUploader from "../FileUploader.jsx";
import sendMessageIcon from "../../assets/send-message.svg";
import EmojiPickerButton from "../EmojiPickerButton/EmojiPickerButton.jsx";
import { useWidth } from "../../contexts/ScreenWidthContext.jsx";
import { MdEdit } from "react-icons/md";
import cancelIcon from "../../assets/cancel.svg";

export default function TopicInput({
  isEditModalOpen,
  isSendModalOpen,
  setIsSendModalOpen,
  setFiles,
  text,
  setText,
  sendComment,
  editComment,
  editId,
  onCancel,
  reply,
  resetReply,
}) {
  const { width } = useWidth();

  const { t } = useTranslation();

  function onChange(e) {
    if (isEditModalOpen || isSendModalOpen) return;
    setText(e.target.value);
  }
  const style = {
    ...{ width: "auto" },
    ...(width > 768 ? { height: "20px" } : { height: "1.2rem" }),
  };
  return (
    <div className="comment-input-container">
      {reply.id !== -1 && (
        <div className="reply-label">
          <div className="reply-label-info">
            <span className="reply-label-author">
              {reply.author || "Unknown author"}
            </span>
            <span>
              :{" "}
              {reply.text ||
                reply.attachment?.slice(reply.attachment.indexOf("_") + 1) ||
                t("topic.deletedCommentLabel")}
            </span>
          </div>
          <img src={cancelIcon}  style = {style} alt="Cancel" onClick={resetReply} />
        </div>
      )}

      <FileUploader
        setFiles={setFiles}
        setIsSendModalOpen={setIsSendModalOpen}
        style={{ ...style, height: width > 768 ? "20px" : "1.2rem" }}
      />
      <input
        id="comment-input"
        type="text"
        value={isEditModalOpen || isSendModalOpen ? "" : text}
        onChange={onChange}
        placeholder={t("topic.writeCommentLabel")}
        autoComplete="off"
      />
      <EmojiPickerButton setText={setText} style={{ left: "-40px" }} />
      {(editId === -1 || isEditModalOpen || isSendModalOpen) && (
        <div onClick={sendComment}>
          <img src={sendMessageIcon} style={style} alt="Send" />
        </div>
      )}
      {editId !== -1 && !isEditModalOpen && !isSendModalOpen && (
        <>
          <MdEdit
            size={width > 768 ? "20px" : "1.2rem"}
            onClick={editComment}
          />
          <img src={cancelIcon} style={style} alt="Cancel" onClick={onCancel} />
        </>
      )}
    </div>
  );
}
