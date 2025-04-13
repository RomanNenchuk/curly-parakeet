import React, { useContext, useState, createContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketProviderContext";
import axios from "axios";
import { VITE_API_URL } from "../constants/config";

const ChatContext = createContext();

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }) {
  const [chatList, setChatList] = useState([]);
  const [messages, setMessages] = useState([]);
  const socket = useSocket();
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    socket.on("message-notification-background", (chat_id, deltaCount) => {
      setChatList(prev =>
        prev.map(chat => {
          if (chat.chat_id === chat_id) {
            const unreadMessagesCount =
              +chat.unread_messages_count + deltaCount;
            return {
              ...chat,
              unread_messages_count:
                unreadMessagesCount > 0 ? unreadMessagesCount : 0,
            };
          }
          return chat;
        })
      );
      sortChatList(chat_id);
    });
  }, [socket, currentUser]);

  async function fetchChatList() {
    try {
      const result = await axios.get(`${VITE_API_URL}/chats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setChatList(result.data);
    } catch (error) {
      console.error(error);
    }
  }

  function sortChatList(chat_id) {
    setChatList(prevChats => {
      // оновлюю інформацію чату
      const updatedChats = prevChats.map(chat =>
        chat.chat_id === chat_id
          ? {
              ...chat,
              last_message_timestamp: new Date().toISOString(),
            }
          : chat
      );
      // переміщую чат на початок списку
      const movedChat = updatedChats.find(chat => chat.chat_id === chat_id);
      return [
        movedChat,
        ...updatedChats.filter(chat => chat.chat_id !== chat_id),
      ];
    });
  }

  async function fetchOrCreateChat(receiver_id, sender_id) {
    if (!socket || receiver_id === sender_id) {
      return;
    }
    const chat_id = [receiver_id, sender_id]
      .sort((a, b) => a.localeCompare(b))
      .join("_");

    try {
      const response = await axios.put(
        `${VITE_API_URL}/chats/${chat_id}`,
        {
          receiver_id,
          sender_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      socket.emit("join-chat", { user_id: currentUser.uid, chat_id });

      setMessages(response.data.messages);
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteChat(receiver_id, sender_id) {
    const chat_id = [receiver_id, sender_id]
      .sort((a, b) => a.localeCompare(b))
      .join("_");
    try {
      const response = await axios.delete(`${VITE_API_URL}/chats/${chat_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate("/chats");
    } catch (error) {
      console.error(error);
    }
  }
  async function clearChat(receiver_id, sender_id) {
    const chat_id = [receiver_id, sender_id]
      .sort((a, b) => a.localeCompare(b))
      .join("_");
    try {
      const response = await axios.delete(
        `${VITE_API_URL}/chats/${chat_id}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchOrCreateChat(receiver_id, sender_id);
    } catch (error) {
      console.error(error);
    }
  }

  const value = {
    chatList,
    setChatList,
    messages,
    setMessages,
    fetchChatList,
    fetchOrCreateChat,
    sortChatList,
    deleteChat,
    clearChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
