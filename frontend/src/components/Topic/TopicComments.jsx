import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import CommentArea from "./CommentArea";
import reactionList from "../../data/reactionList";
import "./Comments.css";

export default function TopicComments({
  handleOnContextMenu,
  comments,
  topicAuthorId,
}) {
  const { t } = useTranslation();
  const sortedComments = useMemo(() => {
    const temp = [...comments].sort((a, b) => {
      let ta = a.reply === -1 ? a.timestamp : a.reply_timestamp,
        tb = b.reply === -1 ? b.timestamp : b.reply_timestamp;
      if (ta === tb) {
        return new Date(ta).getTime() - new Date(tb).getTime();
      } else {
        return new Date(tb).getTime() - new Date(ta).getTime();
      }
    });
    return temp;
  }, [comments]);

  return (
    <ul className="topic-comments">
      {sortedComments.length ? (
        sortedComments.map(comment => (
          <CommentArea
            key={comment.id}
            comment={comment}
            topicAuthorId={topicAuthorId}
            handleOnContextMenu={handleOnContextMenu}
            initialReactions={comment.reactions}
            userReaction={comment.user_reaction?.name}
            reactionList={reactionList}
          />
        ))
      ) : (
        <h3 className="default-comment-notification">
          {t("topic.firstCommentNotification")}
        </h3>
      )}
    </ul>
  );
}
