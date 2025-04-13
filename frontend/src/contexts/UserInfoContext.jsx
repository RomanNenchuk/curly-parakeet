import React, { useContext, useState, createContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";
import { VITE_API_URL } from "../constants/config";

const UserInfoContext = createContext();

export function useUserInfo() {
  return useContext(UserInfoContext);
}

export function UserInfoProvider({ children }) {
  const [user, setUser] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    (async () => {
      try {
        const { fullName, userName, avatar, createdAt, email } =
          await getUserInfo(currentUser.uid);

        setUser({
          fullName,
          userName,
          avatar,
          createdAt,
          email,
        });
      } catch (error) {
        console.error(error);
      }
    })();
  }, [currentUser]);

  async function getUserInfo(id) {
    try {
      const response = await axios.get(`${VITE_API_URL}/users/${id}`, {
        params:
          currentUser && currentUser.uid !== id
            ? { currentUserId: currentUser.uid }
            : {},
      });

      const { fullname, username, avatar, formatted_date, email } =
        response.data.userInfo;

      const result = {
        userName: username,
        fullName: fullname,
        avatar,
        createdAt: formatted_date,
        email,
      };
      if (currentUser?.uid !== id)
        result.isSubscribedTo = response.data.isSubscribedTo;

      return result;
    } catch (error) {
      console.error("No user data found", error);
    }
  }

  async function saveUserInDB(token, userData) {
    try {
      const response = await axios.post(`${VITE_API_URL}/users`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser({
        fullName: userData.fullName,
        userName: userData.userName,
        createdAt: userData.createdAt,
        email: userData.email,
      });

      return response.data; // Повертаємо відповідь, якщо потрібна
    } catch (error) {
      console.error("Error registering user on server:", error);
      throw error; // Кидаємо помилку далі для обробки
    }
  }

  async function saveAvatar(image, uid, token) {
    const formData = new FormData();
    formData.append("profileImage", image);
    try {
      const response = await axios.post(
        `${VITE_API_URL}/attachments/${uid}/profile-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(prev => ({
        ...prev,
        avatar: response.data.fileUrl,
      }));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async function deleteAvatar(uid, token) {
    try {
      const response = await axios.delete(
        `${VITE_API_URL}/attachments/${uid}/profile-image`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  const value = {
    user,
    setUser,
    getUserInfo,
    saveUserInDB,
    saveAvatar,
    deleteAvatar,
  };

  return (
    <UserInfoContext.Provider value={value}>
      {children}
    </UserInfoContext.Provider>
  );
}
