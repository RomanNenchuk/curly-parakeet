import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";
import { Card } from "react-bootstrap";
import debounce from "../../utils/debounce.jsx";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTopicSearch } from "../../contexts/TopicSearchContext.jsx";
import { RxCross2 } from "react-icons/rx";
import { IoCloseCircleOutline } from "react-icons/io5";
import ActionButton from "../ActionButton/ActionButton.jsx";
import searchIcon from "../../assets/search.svg";
import LoadingSpinner from "../AltSpinner/AltSpinner.jsx";
import TagList from "./TagList.jsx";
import axios from "axios";
import "../CreateTopic/CreateTopic.css";
import { VITE_API_URL } from "../../constants/config.js";

export default function ExpandedTags({ onClose }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { urlSearchParams } = useTopicSearch();
  const tagListRef = useRef(null);
  const { t } = useTranslation();
  const searchRef = useRef();
  const LIMIT = 25;
  const navigate = useNavigate();

  const fetchTags = useCallback(
    async (prompt = "", pageNum = 1) => {
      try {
        const params = prompt
          ? `?search=${prompt}&page=${pageNum}&limit=${LIMIT}`
          : `?page=${pageNum}&limit=${LIMIT}`;
        const response = await axios.get(`${VITE_API_URL}/tags` + params);

        if (pageNum === 1) {
          setTags(response.data);
        } else {
          setTags(prev => [...prev, ...response.data]);
        }

        if (response.data.length < LIMIT) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setLoading(false);
      }
    },
    [setTags, setHasMore, setLoading]
  );

  const debouncedFetchTags = useMemo(
    () => debounce(fetchTags, 500),
    [fetchTags]
  );

  useEffect(() => {
    return () => debouncedFetchTags.cancel();
  }, [debouncedFetchTags]);

  function handleChange() {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    debouncedFetchTags(searchRef.current.value, 1);
  }

  function deleteTag(deleted) {
    setSelectedTags(prev => {
      return prev.filter(tag => tag !== deleted);
    });
  }

  function handleClick() {
    const tagList = selectedTags.map(tag => tag.tag_name).join(",");
    urlSearchParams.delete("tags");
    urlSearchParams.delete("authors");
    console.log(tagList);
    if (selectedTags.length > 0) urlSearchParams.set("tags", tagList);
    navigate({
      pathname: "/",
      search: urlSearchParams.toString(),
    });
  }

  useEffect(() => {
    fetchTags("", 1);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!tagListRef.current || loading || !hasMore) {
        return;
      }

      const container = tagListRef.current;
      const { scrollTop, scrollHeight, clientHeight } = container;

      if (scrollTop + clientHeight >= scrollHeight - 25) {
        setPage(prevPage => prevPage + 1);
      }
    };

    const tagListElement = tagListRef.current;
    tagListElement?.addEventListener("scroll", handleScroll);

    return () => tagListElement?.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  useEffect(() => {
    if (page > 1) {
      fetchTags(searchRef.current?.value || "", page);
    }
  }, [page]);

  return (
    <Card>
      <div className="corner-line" style={{ top: "81%", left: "2%" }}></div>
      <div
        className="corner-line"
        style={{ top: "2%", left: "97%", transform: "rotate(180deg)" }}
      ></div>
      <div
        className="close-button-container"
        onClick={() => {
          onClose();
        }}
      >
        <IoCloseCircleOutline size={30} />
      </div>
      <div className="modal-header">{t("tag.allTags")}</div>

      <Card.Body style={{ padding: "0 50px" }}>
        <div className="seach-bar-container">
          <img
            src={searchIcon}
            style={{ height: "3.5vh", width: "auto", margin: "1vh" }}
          />
          <input
            className="for_font tag-search-input"
            type="text"
            placeholder={t("tag.searchTag")}
            ref={searchRef}
            onChange={handleChange}
          />
        </div>
        <div className="selected-tags-container">
          <div className="selected-tags-scrollable">
            {selectedTags.map((tag, index) => (
              <span
                key={index}
                className="selected-tags"
                style={{ marginTop: "0.3vh" }}
              >
                {tag.tag_name}
                <RxCross2 color="black" onClick={() => deleteTag(tag)} />
              </span>
            ))}
          </div>
          <div className="selected-tags-gradient"></div>
        </div>

        <div className="tag-list-container" ref={tagListRef}>
          <>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <TagList
                tags={tags}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
              />
            )}
          </>
        </div>
        <div style={{ margin: "20px 0 30px 0" }}>
          <ActionButton label={t("tag.searchByTags")} onClick={handleClick} />
        </div>
      </Card.Body>
    </Card>
  );
}
