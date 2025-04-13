import React, { useState, useEffect, useRef } from "react";
import TopicArea from "./TopicArea.jsx";
import { useTranslation } from "react-i18next";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useTopicSearch } from "../../contexts/TopicSearchContext.jsx";
import { useLocation } from "react-router-dom";
import TopicActionMenu from "./TopicActionMenu.jsx";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import "./TopicList.css";
import axios from "axios";
import { VITE_API_URL } from "../../constants/config.js";

export default function TopicList({
  topicInfoList,
  className = "",
  scrollContainerRef,
  onTopicClick,
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const { queryParams } = useTopicSearch();
  const queryClient = useQueryClient();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [topicToDeleteId, setTopicToDeleteId] = useState(null);
  const [actionMenu, setActionMenu] = useState({
    selectedTopic: -1,
    selectedTopicItem: null,
    position: {
      x: 0,
      y: 0,
    },
    toggled: false,
  });
  const [isTopicSaved, setIsTopicSaved] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const actionMenuRef = useRef(null);

  function handleOnActionMenu(e, topic) {
    e.preventDefault();
    checkIfTopicIsSaved(currentUser?.uid, topic.id);
    const actionMenuAttr = actionMenuRef.current.getBoundingClientRect();
    const isRight = e.clientX > window?.innerWidth / 2;
    const isBottom = e.clientY > window?.innerHeight / 2;

    let x = e.clientX;
    let y = e.clientY;

    if (isRight) x -= actionMenuAttr.width;
    if (isBottom) y -= 57;

    setActionMenu({
      selectedTopic: topic.id,
      selectedTopicItem: topic,
      position: {
        x,
        y,
      },
      toggled: true,
    });
  }

  useEffect(() => {
    function handler(e) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        resetActionMenu();
      }
    }

    const scrollElement = scrollContainerRef?.current || document;

    document.addEventListener("mousedown", handler);
    scrollElement.addEventListener("scroll", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
      scrollElement.removeEventListener("scroll", handler);
    };
  }, []);

  function resetActionMenu() {
    setActionMenu({
      selectedTopic: -1,
      selectedTopicItem: null,
      position: {
        x: 0,
        y: 0,
      },
      toggled: false,
    });
  }

  const deleteTopic = async id => {
    try {
      const res = await axios.delete(`${VITE_API_URL}/topics/${id}`);
      return res.data; // Повертаємо результат, щоб його можна було використати в onSuccess
    } catch (error) {
      console.error(error);
      throw error; // Прокидуємо помилку для обробки у useMutation
    }
  };

  const confirmDeleteMutation = useMutation({
    mutationFn: deleteTopic,
    onSuccess: (data, variables) => {
      if (data.done) {
        const updateSubscriptionStatus = oldData => {
          if (!oldData || !oldData.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              topics: page.topics.filter(el => el.id !== variables),
            })),
          };
        };

        queryClient.setQueryData(
          ["topics", queryParams, currentUser?.uid],
          updateSubscriptionStatus
        );
        queryClient.setQueryData(
          ["myTopics", currentUser?.uid],
          updateSubscriptionStatus
        );
        queryClient.setQueryData(["popularTopics"], updateSubscriptionStatus);

        queryClient.invalidateQueries([
          "topics",
          queryParams,
          currentUser?.uid,
        ]);
        queryClient.invalidateQueries(["myTopics", currentUser?.uid]);
        queryClient.invalidateQueries(["popularTopics"]);
      }
    },
  });

  const handleDeleteClick = id => {
    setTopicToDeleteId(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (topicToDeleteId) {
      confirmDeleteMutation.mutate(topicToDeleteId, {
        onSuccess: () => {
          if (location.pathname.startsWith("/topics/")) navigate(-1);
        },
      });
      setIsConfirmModalOpen(false);
      setTopicToDeleteId(null);
    }
  };

  async function checkIfTopicIsSaved(user_id, topic_id) {
    try {
      const res = await axios.get(
        `${VITE_API_URL}/topics/save?user_id=${user_id}&topic_id=${topic_id}`
      );
      setIsTopicSaved(res.data.saved);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <ul className={`topic-list ${className}`}>
      {topicInfoList.length === 0 ? (
        <div className="topics-not-found">{t("topic.topicNotFound")}</div>
      ) : (
        topicInfoList.map((topic, index) => (
          <TopicArea
            key={index}
            topicItem={topic}
            initialReactions={topic?.reactions}
            userReaction={topic?.user_reaction?.name}
            handleOnActionMenu={handleOnActionMenu}
            onTopicClick={onTopicClick}
          />
        ))
      )}
      <TopicActionMenu
        positionX={actionMenu.position.x}
        positionY={actionMenu.position.y}
        isToggled={actionMenu.toggled}
        actionMenuRef={actionMenuRef}
        resetActionMenu={resetActionMenu}
        actionMenu={actionMenu}
        onDeleteClick={handleDeleteClick}
        isTopicSaved={isTopicSaved}
      />
      {isConfirmModalOpen ? (
        <ConfirmationModal
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmDelete}
          message={t("topic.deleteTopicQuery")}
        />
      ) : null}
    </ul>
  );
}
