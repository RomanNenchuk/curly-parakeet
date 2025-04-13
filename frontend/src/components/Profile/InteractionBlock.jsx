import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import "./Profile.css";
import { VITE_API_URL } from "../../constants/config";

export default function InteractionBlock({ userProfile, setUserProfile }) {
  const { t } = useTranslation();
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation || "/";

  async function onSubscribe() {
    if (!currentUser) {
      navigate(`/login${location.search}`, {
        state: {
          backgroundLocation,
          redirectPath: `/profiles/${id}`,
        },
      });
    }
    try {
      const result = await axios.post(`${VITE_API_URL}/subscriptions`, {
        user1_id: currentUser.uid,
        user2_id: id,
      });
      if (result.data.done) {
        setUserProfile(prev => ({
          ...prev,
          isSubscribedTo: true,
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }
  async function onUnsubscribe() {
    try {
      const result = await axios.delete(`${VITE_API_URL}/subscriptions`, {
        data: {
          user1_id: currentUser.uid,
          user2_id: id,
        },
      });
      if (result.data.done) {
        setUserProfile(prev => ({
          ...prev,
          isSubscribedTo: false,
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleChatClick() {
    navigate(currentUser ? `/chats/${id}` : `/login${location.search}`, {
      state: {
        otherUserName: userProfile.fullName,
        backgroundLocation,
        redirectPath: `/chats/${id}`,
      },
    });
  }
  return (
    <div className="interaction-container">
      <h3 className="interaction-button" onClick={handleChatClick}>
        {t("profile.message")}
      </h3>
      {userProfile.isSubscribedTo ? (
        <h3 className="interaction-button" onClick={onUnsubscribe}>
          {t("profile.unfollow")}
        </h3>
      ) : (
        <h3 className="interaction-button" onClick={onSubscribe}>
          {t("profile.follow")}
        </h3>
      )}
    </div>
  );
}
