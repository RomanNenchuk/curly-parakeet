import React, { useState, useRef, useEffect } from "react";
import FileUploader from "../FileUploader.jsx";
import { useChat } from "../../contexts/ChatContext.jsx";
import { useTranslation } from "react-i18next";
import { useWidth } from "../../contexts/ScreenWidthContext.jsx";
import sendMessageIcon from "../../assets/send-message.svg";
import { MdEdit } from "react-icons/md";
import cancelIcon from "../../assets/cancel.svg";
import EmojiPickerButton from "../EmojiPickerButton/EmojiPickerButton.jsx";

export default function ChatInput({
  isEditModalOpen,
  isSendModalOpen,
  setIsEditModalOpen,
  setIsSendModalOpen,
  setFiles,
  text,
  setText,
  sendMessage,
  editMessage,
  editId,
  reply,
  resetReply,
  onCancel,
}) {
  const inputRef = useRef();
  const { messages } = useChat();
  const { t } = useTranslation();
  const { width } = useWidth();

  const [scaleValue, setScaleValue] = useState(window.innerHeight * 0.0015);
  const updateScaleValue = () => {
    setScaleValue(window.innerHeight * 0.0015);
  };

  useEffect(() => {
    window.addEventListener("resize", updateScaleValue);
    return () => {
      window.removeEventListener("resize", updateScaleValue);
    };
  }, []);

  useEffect(() => {
    inputRef.current.focus();
    return () => {
      setText("");
    };
  }, []);

  function hasAttachments() {
    const message = messages.find(msg => msg.id === editId);
    return message?.attachments?.length > 0 || false;
  }

  function onChange(e) {
    if (isEditModalOpen || isSendModalOpen) return;
    setText(e.target.value);
  }

  function onKeyDown(e) {
    if (
      editId === -1 &&
      e.key === "Enter" &&
      !isEditModalOpen &&
      !isSendModalOpen
    ) {
      sendMessage();
    }
  }

  const style = {
    ...{ width: "auto" },
    ...(width > 768 ? { height: "20px" } : { height: "20px" }),
  };

  return (
    <div className="chat-input">
      {reply.id !== -1 && (
        <div className="reply-label">
          <div className="reply-label-info">
            <span className="reply-label-author">
              {reply.author || t("unknown")}
            </span>
            <span>
              :{" "}
              {reply.text ||
                reply.attachment.slice(reply.attachment.indexOf("_") + 1) ||
                t("chat.deletedMessageLabel")}
            </span>
          </div>
          <img
            src={cancelIcon}
            style={style}
            alt={t("cancel")}
            onClick={resetReply}
          />
        </div>
      )}

      {editId === -1 && !hasAttachments() ? (
        <FileUploader
          setFiles={setFiles}
          editId={editId}
          setIsEditModalOpen={setIsEditModalOpen}
          setIsSendModalOpen={setIsSendModalOpen}
          text={text}
          setText={text}
          style={{ ...style, height: width > 768 ? "20px" : "20px" }}
        />
      ) : null}

      <input
        id="chat-message-input"
        type="text"
        value={isEditModalOpen || isSendModalOpen ? "" : text}
        onChange={onChange}
        onKeyDown={onKeyDown}
        autoComplete="off"
        ref={inputRef}
        placeholder={t("chat.writeMessageLabel")}
      />

      <EmojiPickerButton setText={setText} style={{ left: "-40px" }} />
      {(editId === -1 || isEditModalOpen || isSendModalOpen) && (
        <div className="send-msg-btn" onClick={sendMessage}>
          <img src={sendMessageIcon} style={style} alt={t("send")} />
        </div>
      )}
      {editId !== -1 && !isEditModalOpen && !isSendModalOpen && (
        <>
          <MdEdit
            size={width > 768 ? "20px" : "20px"}
            onClick={editMessage}
          />
          <img
            src={cancelIcon}
            style={style}
            alt={t("cancel")}
            onClick={onCancel}
          />
        </>
      )}
    </div>
  );
}
