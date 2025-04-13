import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import reactionListSetter from "../../utils/reactionListSetter.jsx";
import convertLinks from "../../utils/textLinkConverter.jsx";
import AttachedFiles from "../AttachedFiles/AttachedFiles.jsx";
import { formatRelativeTime } from "../../utils/getCurrentTime.jsx";
import InteractWindow from "../TopicList/InteractWindow.jsx";
import ProfileHeader from "../ProfileHeader.jsx";
import axios from "axios";
import "./Comments.css";
import { VITE_API_URL } from "../../constants/config.js";

export default function CommentArea({
  comment,
  index,
  topicAuthorId,
  handleOnContextMenu,
  reactionList,
  initialReactions = [],
  userReaction = [],
}) {
  const { t } = useTranslation();
  const [activeReactions, setActiveReactions] = useState(
    reactionListSetter(initialReactions, userReaction)
  );
  const { currentUser, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
        `${VITE_API_URL}/comments/${comment.id}/reactions`,
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

  return (
    <div
      key={index}
      className={`comment-outer${comment.reply === -1 ? "" : "-reply"}`}
      onContextMenu={e => handleOnContextMenu(e, comment)}
    >
      <div className="header-container">
        <ProfileHeader
          id={comment.author_id}
          avatar={comment.avatar}
          profileName={
            comment.author_fullname +
            (topicAuthorId === comment.author_id
              ? ` (${t("topic.author")})`
              : "")
          }
          textStyle={{ color: "#000" }}
          sizeFont="16px"
          size="37px"
        />
        <span className="header-delimiter">•</span>
        <span className="comment-timestamp">
          {formatRelativeTime(comment.timestamp)}
        </span>
      </div>
      <AttachedFiles urls={comment?.attachments} />
      <p className="comment-text">{convertLinks(comment.text)}</p>
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
              <span>{reaction.icon}</span>{" "}
              <span className="reaction-button-count">
                {reaction.count ? reaction.count : ""}
              </span>
            </button>
          ))}
        </div>
        <div className="chat-settings">
          <div className="emo-container">
            😀
            <InteractWindow reactionList={reactionList} onClick={handleClick} />
          </div>
        </div>
      </div>
    </div>
  );
}
