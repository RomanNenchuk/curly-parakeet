import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "@tanstack/react-query";
import AltSpinner from "../AltSpinner/AltSpinner";
import { useAuth } from "../../contexts/AuthContext.jsx";
import TopicList from "../TopicList/TopicList.jsx";
import "../MyTopic/MyTopic.css";
import {
  fetchDailyPopularTopics,
  fetchMonthlyPopularTopics,
} from "../../api/topics.js";
import TopicListHeader from "../MyTopic/TopicListHeader.jsx";
import { useWidth } from "../../contexts/ScreenWidthContext.jsx";

export default function PopulTopic() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { width } = useWidth();
  const observerRef = useRef(null);
  const [showDayPeriod, setShowDayPeriod] = useState(
    sessionStorage.getItem("isDayPeriod") === "true"
  );

  const {
    data: monthPeriodData,
    fetchNextPage: fetchNextMonthPeriod,
    hasNextPage: hasMoreMonthPeriod,
    isFetching: isFetchingMonthPeriod,
    isFetchingNextPage: isFetchingNextMonthPeriod,
  } = useInfiniteQuery({
    queryKey: ["monthlyPopularTopics", currentUser?.uid],
    queryFn: ({ pageParam = 1 }) =>
      fetchMonthlyPopularTopics({ pageParam, userId: currentUser?.uid }),
    getNextPageParam: lastPage => lastPage.nextPage,
    staleTime: 1000 * 60 * 5, // зберігати кеш 5 хвилин
    cacheTime: 1000 * 60 * 10, // не видаляти кеш 10 хвилин
  });

  const {
    data: dayPeriodData,
    fetchNextPage: fetchNextDayPeriod,
    hasNextPage: hasMoreMyTopics,
    isFetching: isFetchingDayPeriod,
    isFetchingNextPage: isFetchingNextDayPeriod,
  } = useInfiniteQuery({
    queryKey: ["dailyPopularTopics", currentUser?.uid],
    queryFn: ({ pageParam = 1 }) =>
      fetchDailyPopularTopics({ pageParam, userId: currentUser?.uid }),
    getNextPageParam: lastPage => lastPage.nextPage,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (!observerRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          if (showDayPeriod && hasMoreMyTopics && !isFetchingNextMonthPeriod) {
            fetchNextDayPeriod();
          } else if (
            !showDayPeriod &&
            hasMoreMonthPeriod &&
            !isFetchingNextMonthPeriod
          ) {
            fetchNextMonthPeriod();
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [
    hasMoreMyTopics,
    isFetchingDayPeriod,
    hasMoreMonthPeriod,
    isFetchingNextMonthPeriod,
  ]);

  // відновлення прокрутки
  useEffect(() => {
    const savedPosition = sessionStorage.getItem("popularTopicsScrollPosition");
    if (savedPosition) {
      window.scrollTo({
        top: parseInt(savedPosition, 10),
        left: 0,
        behavior: "instant",
      });
      sessionStorage.removeItem("popularTopicsScrollPosition");
    }
  }, []);

  // для збереження позиції скролу
  const handleTopicClick = () => {
    sessionStorage.setItem(
      "popularTopicsScrollPosition",
      window.scrollY.toString()
    );
  };

  const choseDayPeriod = choice => {
    sessionStorage.setItem("isDayPeriod", choice);
    setShowDayPeriod(choice);
  };

  // const topics = data?.pages.flatMap(page => page.topics) || [];
  const topicInfoList = showDayPeriod
    ? dayPeriodData?.pages.flatMap(page => page.topics) || []
    : monthPeriodData?.pages.flatMap(page => page.topics) || [];

  return (
    <div className="topics-container">
      <div className="topics-content">
        <TopicListHeader
          choseFirstTab={choseDayPeriod}
          showFirstTab={showDayPeriod}
          firstTabCaption={t("time.for_today")}
          secondTabCaption={t("time.for_this_month")}
        />
        <div className="topics-container">
          {(showDayPeriod ? isFetchingDayPeriod : isFetchingMonthPeriod) &&
          !isFetchingNextDayPeriod &&
          !isFetchingNextMonthPeriod &&
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
              {(isFetchingNextDayPeriod || isFetchingNextMonthPeriod) && (
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
