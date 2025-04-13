import React, { useContext, useState, useEffect, createContext } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";
import { VITE_API_URL } from "../constants/config";

const TopicSearchContext = createContext();

export function useTopicSearch() {
  return useContext(TopicSearchContext);
}

export function TopicSearchProvider({ children, backgroundLocation }) {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    urlSearchParams.get("tags") || ""
  );
  const [popularTagList, setPopularTagList] = useState([]);
  const [queryParams, setQueryParams] = useState({
    page: 1,
    sortOrder: urlSearchParams.get("sort") || "desc",
    tags: urlSearchParams.get("tags") || "",
    authors: urlSearchParams.get("authors") || "",
  });
  const location = useLocation();

  useEffect(() => {
    if (backgroundLocation?.state?.reloadBackground === false) return;

    let searchInputTags = urlSearchParams.get("tags");
    if (searchInputTags)
      searchInputTags =
        "# " + urlSearchParams.get("tags").split(",").join(", # ");

    let searchInputAuthors = urlSearchParams.get("authors");
    if (searchInputAuthors)
      searchInputAuthors = "@ " + searchInputAuthors.split(",").join(", @ ");

    if (searchInputTags || searchInputAuthors)
      setSearchInput(
        (searchInputAuthors || "") +
          (searchInputAuthors && searchInputTags ? ", " : "") +
          (searchInputTags || "")
      );
    setQueryParams({
      page: 1,
      sortOrder: urlSearchParams.get("sort") || "desc",
      tags: urlSearchParams.get("tags") || "",
      authors: urlSearchParams.get("authors") || "",
    });
  }, [urlSearchParams]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axios.get(`${VITE_API_URL}/tags?page=1&limit=15`);
        setPopularTagList(res.data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    fetchTags();
  }, []);

  function getSearchInputData() {
    let searchData = searchInput
      ?.split(/[,;|]/)
      ?.map(piece => piece.trim())
      ?.filter(piece => piece);
    if (!searchData || searchData?.length === 0) return;
    let tagList = [];
    let authorList = [];
    searchData.forEach(piece => {
      if (piece[0] === "@") authorList.push(piece.slice(1).trim());
      else if (piece[0] === "#") tagList.push(piece.slice(1).trim());
      else tagList.push(piece);
    });

    const result = {
      tagList,
      authorList,
    };

    if (tagList?.length)
      result.tagList = tagList && tagList.length > 0 ? tagList.join(",") : "";
    if (authorList?.length)
      result.authorList =
        authorList && authorList.length > 0 ? authorList.join(",") : "";

    return result;
  }

  const value = {
    searchInput,
    setSearchInput,
    queryParams,
    setQueryParams,
    urlSearchParams,
    setUrlSearchParams,
    popularTagList,
    setPopularTagList,
    getSearchInputData,
  };

  return (
    <TopicSearchContext.Provider value={value}>
      {children}
    </TopicSearchContext.Provider>
  );
}
