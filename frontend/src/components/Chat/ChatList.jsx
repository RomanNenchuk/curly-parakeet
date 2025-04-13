import React, { useEffect, useState } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import Avatar from "../Avatar.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import { useChat } from "../../contexts/ChatContext";
import { useWidth } from "../../contexts/ScreenWidthContext.jsx";
import "./Chat.css";
import DefaultChatScreen from "../DefaultChatScreen.jsx";

export default function ChatList() {
  const { currentUser } = useAuth();
  const { chatList, setChatList, fetchChatList } = useChat();
  const { receiverId } = useParams();
  const { t } = useTranslation();
  const { width } = useWidth();

  const [messageOpen, setMessageOpen] = useState(false);

  const handleChatClick = index => {
    setMessageOpen(true);
    const updatedChatList = chatList.map((chat, i) => ({
      ...chat,
      active: i === index,
      unread_messages_count: i === index ? 0 : chat.unread_messages_count,
    }));

    setChatList(updatedChatList);
  };

  useEffect(() => {
    fetchChatList();
  }, []);

  return (
    <div className="chat-win-container">
      {width > 768 || !messageOpen ? (
        <div className="chat-list-ct">
          <div className="chat-hd">
            <p>{t("chat.myChatsCaption")}</p>
          </div>
          <div className="chat-list">
            {chatList &&
              chatList.map((chat, index) => (
                <div
                  key={index}
                  className={`chat-item ${
                    chat?.unread_messages_count > 0 ? "unread" : ""
                  } ${chat.other_user_id === receiverId ? "active" : ""}`}
                >
                  <Link
                    to={`/chats/${chat.other_user_id}`}
                    state={{ otherUserName: chat.other_user_name }}
                    onClick={() => handleChatClick(index)}
                  >
                    <div className="chat-header">
                      <div className="chat-name-ct">
                        <Avatar
                          size={45}
                          avThickness="2px"
                          avatar={chat.other_user_avatar}
                        />
                        <div className="chat-name-text">
                          <p className="chat-name">{chat.other_user_name}</p>
                        </div>
                      </div>
                      <div className="chat-unread-msg">
                        <p className="unread-badge">
                          {chat.unread_messages_count}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
          </div>
        </div>
      ) : (
        ""
      )}

      {width > 768 || messageOpen ? (
        <div className="chat-window">
          {receiverId !== currentUser?.uid ? (
            <Outlet context={setMessageOpen} />
          ) : (
            <DefaultChatScreen />
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
