import React, { useEffect } from "react";
import { useChat } from "../../contexts/ChatContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import convertLinks from "../../utils/textLinkConverter.jsx";
import scrollToBottom from "../../utils/scrollToBottom.jsx";
import AttachedFiles from "../AttachedFiles/AttachedFiles.jsx";
import MessageTriangle from "./MessageTriangle.jsx";
import { timestampToTime } from "../../utils/getCurrentTime.jsx";

export default function ChatMessages({
  handleOnContextMenu,
  userSentMessage,
  setUserSentMessage,
  chatMessagesRef,
}) {
  const { t } = useTranslation();
  const { messages } = useChat();
  const { currentUser } = useAuth();

  const isAtBottom = () => {
    if (chatMessagesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
      return scrollHeight - scrollTop - clientHeight <= 200; // додано буфер
    }
    return false;
  };

  useEffect(() => {
    const chatMessagesElement = chatMessagesRef.current;
    if (chatMessagesElement) {
      // Якщо користувач вже знаходиться внизу, автоматично скролимо вниз
      if (userSentMessage || isAtBottom()) {
        scrollToBottom(chatMessagesRef);
        setUserSentMessage(false);
      }
    }
  }, [messages]);

  useEffect(() => {
    // Скрол донизу при завантаженні сторінки
    scrollToBottom(chatMessagesRef);
  }, []);

  return (
    <ul ref={chatMessagesRef} className="chat-messages">
      {messages.map((msg, index) => {
        return (
          <li
            key={index}
            className="uTou-message"
            style={
              msg.sender_id === currentUser.uid
                ? {
                    marginLeft: "auto",
                    backgroundColor: "#a3beb7",
                  }
                : {
                    marginRight: "auto",
                    backgroundColor: "#d0d0d0",
                  }
            }
            onContextMenu={e => handleOnContextMenu(e, msg)}
          >
            {msg.reply !== -1 && (
              <div
                className="message-reply-label"
                style={{
                  backgroundColor:
                    msg.sender_id === currentUser.uid
                      ? "#ffffff66"
                      : "#0000001a",
                }}
              >
                <div className="reply-fullname">
                  {msg.reply_fullname ? msg.reply_fullname : ""}
                </div>
                <div className="reply-text">
                  {msg.reply_text ||
                    msg.reply_attachment?.slice(
                      msg.reply_attachment?.indexOf("_") + 1
                    ) ||
                    t("chat.deletedMessageLabel")}
                </div>
              </div>
            )}
            {msg?.attachments?.length ? (
              <div className="attached-files-container">
                <AttachedFiles
                  urls={msg?.attachments}
                  onImageLoad={() => scrollToBottom(chatMessagesRef)}
                />
              </div>
            ) : null}

            {msg.text !== "" ? (
              <p className="message-text">{convertLinks(msg.text)}</p>
            ) : null}
            <span
              className="message-timestamp"
              style={{
                textAlign: msg.sender_id === currentUser.uid ? "right" : "left",
              }}
            >
              {timestampToTime(msg.timestamp)}
            </span>
            <MessageTriangle isSender={msg.sender_id === currentUser.uid} />
          </li>
        );
      })}
    </ul>
  );
}
