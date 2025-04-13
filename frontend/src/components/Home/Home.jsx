import React, { useEffect, useState, useRef } from "react";
import { useTopicSearch } from "../../contexts/TopicSearchContext.jsx";

import { useWidth } from "../../contexts/ScreenWidthContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import TopicListSettings from "../TopicList/TopicListSettings.jsx";
import TopicList from "../TopicList/TopicList.jsx";
import TagBar from "../TagBar/TagBar.jsx";
import "./Home.css";
import AltSpinner from "../AltSpinner/AltSpinner";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchTopics } from "../../api/topics.js";

export default function Home() {
  const [tagBarLoading, setTagBarLoading] = useState(true);

  const { width } = useWidth();

  const topicListRef = useRef(null);
  const observerRef = useRef(null);
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const { queryParams, setQueryParams, urlSearchParams, setUrlSearchParams } =
    useTopicSearch();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["topics", queryParams, currentUser?.uid],
    queryFn: fetchTopics,
    getNextPageParam: lastPage => lastPage.nextPage,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (!isFetching) refetch();
  }, [queryParams, currentUser]);

  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage]);

  const handleChange = e => {
    const newSortOrder = e.target.value;
    urlSearchParams.set("sort", newSortOrder);
    setUrlSearchParams(urlSearchParams);

    setQueryParams(prev => ({
      ...prev,
      sortOrder: newSortOrder,
      page: 1,
    }));
  };

  useEffect(() => {
    const savedPosition = sessionStorage.getItem("scrollPosition");
    if (savedPosition) {
      window.scrollTo({
        top: parseInt(savedPosition, 10),
        left: 0,
        behavior: "instant",
      });
      sessionStorage.removeItem("scrollPosition");
    }
  }, []);

  // для збереження позиції скролу
  const handleTopicClick = () => {
    sessionStorage.setItem("scrollPosition", window.scrollY.toString());
  };

  const topicInfoList = data?.pages.flatMap(page => page.topics) || [];

  return (
    <>
      <ul className="submain-in" ref={topicListRef}>
        <TopicListSettings
          sortOrder={queryParams.sortOrder}
          handleChange={handleChange}
        />
        {isFetching && topicInfoList?.length === 0 ? (
          <AltSpinner />
        ) : topicInfoList.length === 0 ? (
          <div className="topics-not-found">{t("topic.topicsNotFound")}</div>
        ) : (
          <>
            <TopicList
              topicInfoList={topicInfoList}
              onTopicClick={handleTopicClick}
            />
            {isFetchingNextPage && <AltSpinner />}
          </>
        )}
        <div
          ref={observerRef}
          className="observer-element"
          style={{ minHeight: "10px" }}
        />
      </ul>
      {width > 768 ? (
        <TagBar
          tagBarLoading={tagBarLoading}
          setTagBarLoading={setTagBarLoading}
        />
      ) : (
        ""
      )}
    </>
  );
}
