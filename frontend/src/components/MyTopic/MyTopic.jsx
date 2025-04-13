import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useInfiniteQuery } from "@tanstack/react-query";
import AltSpinner from "../AltSpinner/AltSpinner";
import TopicList from "../TopicList/TopicList.jsx";
import TopicListHeader from "./TopicListHeader.jsx";
import { fetchMyTopics, fetchSavedTopics } from "../../api/topics.js";
import "./MyTopic.css";
import { useWidth } from "../../contexts/ScreenWidthContext.jsx";

export default function MyTopic() {
  const { currentUser } = useAuth();
  const { width } = useWidth();
  const { t } = useTranslation();
  const observerRef = useRef(null);
  const [showMyTopics, setShowMyTopics] = useState(
    sessionStorage.getItem("isMyTopics") === "true"
  );

  const {
    data: myTopicsData,
    fetchNextPage: fetchNextMyTopics,
    hasNextPage: hasMoreMyTopics,
    isFetching: isFetchingMyTopics,
    isFetchingNextPage: isFetchingNextMyTopics,
  } = useInfiniteQuery({
    queryKey: ["myTopics", currentUser?.uid],
    queryFn: ({ pageParam = 1 }) =>
      fetchMyTopics({ pageParam, userId: currentUser?.uid }),
    getNextPageParam: lastPage => lastPage.nextPage,
    enabled: !!currentUser,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  });

  const {
    data: savedTopicsData,
    fetchNextPage: fetchNextSavedTopics,
    hasNextPage: hasMoreSavedTopics,
    isFetching: isFetchingSavedTopics,
    isFetchingNextPage: isFetchingNextSavedTopics,
  } = useInfiniteQuery({
    queryKey: ["savedTopics", currentUser?.uid],
    queryFn: ({ pageParam = 1 }) =>
      fetchSavedTopics({ pageParam, userId: currentUser?.uid }),
    getNextPageParam: lastPage => lastPage.nextPage,
    enabled: !!currentUser,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (!observerRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          if (showMyTopics && hasMoreMyTopics && !isFetchingNextMyTopics) {
            fetchNextMyTopics();
          } else if (
            !showMyTopics &&
            hasMoreSavedTopics &&
            !isFetchingNextSavedTopics
          ) {
            fetchNextSavedTopics();
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [
    hasMoreMyTopics,
    isFetchingNextMyTopics,
    hasMoreSavedTopics,
    isFetchingNextSavedTopics,
  ]);

  useEffect(() => {
    const savedPosition = sessionStorage.getItem("myTopicsScrollPosition");
    if (savedPosition) {
      window.scrollTo({
        top: parseInt(savedPosition, 10),
        left: 0,
        behavior: "instant",
      });
      sessionStorage.removeItem("myTopicsScrollPosition");
    }
  }, []);

  const chooseMyTopics = choice => {
    sessionStorage.setItem("isMyTopics", choice);
    setShowMyTopics(choice);
  };

  // для збереження позиції скролу
  const handleTopicClick = () => {
    sessionStorage.setItem("myTopicsScrollPosition", window.scrollY.toString());
  };

  const topicInfoList = showMyTopics
    ? myTopicsData?.pages.flatMap(page => page.topics) || []
    : savedTopicsData?.pages.flatMap(page => page.topics) || [];

  return (
    <div className="topics-container">
      <div className="topics-content">
        <TopicListHeader
          choseFirstTab={chooseMyTopics}
          showFirstTab={showMyTopics}
          showCreateButton={true}
          firstTabCaption={t("topic.myTopicsCaption")}
          secondTabCaption={t("topic.savedTopicsCaption")}
        />
        <div className="topics-container">
          {(showMyTopics ? isFetchingMyTopics : isFetchingSavedTopics) &&
          !isFetchingNextMyTopics &&
          !isFetchingNextSavedTopics &&
          topicInfoList?.length === 0 ? (
            <AltSpinner />
          ) : topicInfoList.length === 0 ? (
            <div className="topics-not-found">{t("topic.topicsNotFound")}</div>
          ) : (
            <>
              <TopicList
                topicInfoList={topicInfoList}
                onTopicClick={handleTopicClick}
                className={width > 768 ? "topics-grid" : "topic-mobile"}
              />
              {(isFetchingNextMyTopics || isFetchingNextSavedTopics) && (
                <AltSpinner />
              )}
            </>
          )}
          <div ref={observerRef} className="observer-element" />
        </div>
      </div>
    </div>
  );
}
