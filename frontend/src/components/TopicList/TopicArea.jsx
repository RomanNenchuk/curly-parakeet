import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useTopicSearch } from "../../contexts/TopicSearchContext.jsx";
import AttachedFiles from "../AttachedFiles/AttachedFiles.jsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWidth } from "../../contexts/ScreenWidthContext.jsx";
import reactionListSetter from "../../utils/reactionListSetter.jsx";
import InteractWindow from "./InteractWindow.jsx";
import { VscSettings } from "react-icons/vsc";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import ProfileHeader from "../ProfileHeader.jsx";
import reactionList from "../../data/reactionList.js";
import "./TopicList.css";
import axios from "axios";
import { VITE_API_URL } from "../../constants/config.js";

export default function TopicArea({
  topicItem,
  initialReactions,
  userReaction,
  handleOnActionMenu,
  onTopicClick,
}) {
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState(topicItem);
  const { width } = useWidth();
  const { t } = useTranslation();
  const [activeReactions, setActiveReactions] = useState(
    reactionListSetter(initialReactions, userReaction)
  );
  const { queryParams } = useTopicSearch();

  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, token } = useAuth();

  useEffect(() => {
    setTopic(topicItem);
  }, [topicItem]);

  useEffect(() => {
    setActiveReactions(reactionListSetter(initialReactions, userReaction));
  }, [initialReactions, userReaction]);

  const addSubscribeMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`${VITE_API_URL}/subscriptions`, {
        user1_id: currentUser.uid,
        user2_id: topic.author,
      });
      return res.data;
    },
    onSuccess: data => {
      if (data.done) {
        setTopic(prev => ({ ...prev, subscribed: true }));

        const updateSubscriptionStatus = oldData => {
          if (!oldData || !oldData.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              topics: page.topics.map(el =>
                el.author === topic.author ? { ...el, subscribed: true } : el
              ),
            })),
          };
        };

        queryClient.setQueryData(
          ["topics", queryParams, currentUser?.uid],
          updateSubscriptionStatus
        );
        queryClient.setQueryData(
          ["savedTopics", currentUser?.uid],
          updateSubscriptionStatus
        );
        queryClient.setQueryData(
          ["monthlyPopularTopics"],
          updateSubscriptionStatus
        );
        queryClient.setQueryData(
          ["dailyPopularTopics"],
          updateSubscriptionStatus
        );

        queryClient.invalidateQueries([
          "topics",
          queryParams,
          currentUser?.uid,
        ]);
        queryClient.invalidateQueries(["savedTopics", currentUser?.uid]);
        queryClient.invalidateQueries(["monthlyPopularTopics"]);
        queryClient.invalidateQueries(["dailyPopularTopics"]);
      }
    },
  });

  const deleteSubscribeMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.delete(`${VITE_API_URL}/subscriptions`, {
        data: { user1_id: currentUser.uid, user2_id: topic.author },
      });
      return res.data;
    },
    onSuccess: data => {
      if (data.done) {
        setTopic(prev => ({ ...prev, subscribed: false }));

        const updateSubscriptionStatus = oldData => {
          if (!oldData || !oldData.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              topics: page.topics.map(el =>
                el.author === topic.author ? { ...el, subscribed: false } : el
              ),
            })),
          };
        };

        queryClient.setQueryData(
          ["topics", queryParams, currentUser?.uid],
          updateSubscriptionStatus
        );
        queryClient.setQueryData(
          ["savedTopics", currentUser?.uid],
          updateSubscriptionStatus
        );
        queryClient.setQueryData(
          ["monthlyPopularTopics"],
          updateSubscriptionStatus
        );
        queryClient.setQueryData(
          ["dailyPopularTopics"],
          updateSubscriptionStatus
        );

        queryClient.invalidateQueries([
          "topics",
          queryParams,
          currentUser?.uid,
        ]);
        queryClient.invalidateQueries(["savedTopics", currentUser?.uid]);
        queryClient.invalidateQueries(["monthlyPopularTopics"]);
        queryClient.invalidateQueries(["dailyPopularTopics"]);
      }
    },
  });

  async function handleClick(emoji) {
    if (!currentUser)
      return navigate("/login", {
        state: {
          backgroundLocation: location,
          redirectPath: location,
        },
      });
    try {
      const response = await axios.put(
        `${VITE_API_URL}/topics/${topic.id}/reactions`,
        {
          reaction: emoji.name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      setActiveReactions(() =>
        reactionListSetter(response.data.reactions, response.data.active)
      );
    } catch (error) {
      console.error(error);
    }
  }

  const handleTopicClick = topicId => {
    if (onTopicClick) {
      onTopicClick();
      navigate(`/topics/${topicId}${location.search}`, {
        state: { returnPath: location },
      });
    }
  };

  const handleSubscribeClick = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      return navigate(`/login${location.search}`, {
        state: {
          backgroundLocation: location,
          redirectPath: location,
        },
      });
    } else
      setTimeout(() => {
        topic.subscribed
          ? deleteSubscribeMutation.mutate()
          : addSubscribeMutation.mutate();
      }, 200);
  };

  return (
    <li className="topic-card">
      <div>
        <div
          className="topic-content"
          onClick={() => handleTopicClick(topic.id)}
        >
          <div
            style={
              width > 768
                ? {
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }
                : {
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }
            }
          >
            <ProfileHeader
              id={topic.author}
              avatar={topic.author_avatar}
              size={width > 768 ? "2.5rem" : "4vh"}
              sizeFont={width > 768 ? "1rem" : "1.1rem"}
              avThickness="0.4vmin"
              style={{ gap: "10px" }}
              profileName={topic.author_full_name}
            />
            {topic.subscribed !== "none" && (
              <button
                className={`subs ${
                  topic.subscribed ? "subscribed" : "subscribe"
                }`}
                onClick={handleSubscribeClick}
              >
                {topic.subscribed
                  ? t("topic.subscribed")
                  : t("topic.subscribe")}
              </button>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <span
              className="topic-title"
              style={{
                marginBottom: "1vh",
                overflowWrap: "break-word",
                width: width <= 768 && topic.cover ? "70%" : "100%",
              }}
            >
              {topic.title}
            </span>
            {width <= 768 && topic.cover && (
              <AttachedFiles
                urls={[topic.cover]}
                imgstyle={"alt-media-image"}
                videoStyle={"alt-media-video"}
              />
            )}
          </div>
          <div
            style={{
              textAlign: "right",
              fontSize: width > 768 ? "0.8rem" : "0.8rem",
              color: "gray",
            }}
          >
            {topic.tag_list.length > 0 && "#" + topic.tag_list.join(" #")}
          </div>

          {width > 768 && topic.cover && <AttachedFiles urls={[topic.cover]} />}
        </div>

        <div className="icons-menu">
          <div className="active-reactions">
            {activeReactions.map((reaction, index) => (
              <button
                key={index}
                className={`reaction-button ${
                  reaction.active ? "my-reaction" : ""
                }`}
                onClick={() => handleClick(reaction)}
              >
                <span>{reaction.icon}</span>
                <span className="reaction-button-count">
                  {reaction.count ? reaction.count : ""}
                </span>
              </button>
            ))}
          </div>

          <div className="chat-settings">
            <Link to={`/topics/${topic.id}`}>
              <IoChatboxEllipsesOutline
                size={width > 768 ? "3.5vh" : "1.2rem"}
              />
            </Link>
            <div className="emo-container">
              😀
              <InteractWindow
                reactionList={reactionList}
                onClick={handleClick}
              />
            </div>
            <VscSettings
              size={width > 768 ? "3.5vh" : "1.2rem"}
              onClick={e => handleOnActionMenu(e, topic)}
            />
          </div>
        </div>
      </div>
    </li>
  );
}
