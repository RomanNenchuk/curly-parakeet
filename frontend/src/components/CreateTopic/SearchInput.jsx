import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import debounce from "../../utils/debounce.jsx";
import { RxCross2 } from "react-icons/rx";
import "./CreateTopic.css";
import axios from "axios";
import { VITE_API_URL } from "../../constants/config.js";

const SearchInput = ({ selectedTagList, setSelectedTagList }) => {
  const { t } = useTranslation();
  const tagsRef = useRef();
  const [isDropdownListOpen, setIsDropdownListOpen] = useState(false);
  const [tagList, setTagList] = useState([]);

  const handleSearch = useCallback(
    async prompt => {
      try {
        const res = await axios.get(
          `${VITE_API_URL}/tags?page=1&limit=12${
            prompt ? "&search=" + prompt : ""
          }`
        );
        setTagList(res.data);
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    },
    [setTagList]
  );

  const debouncedHandleSearch = useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch]
  );

  useEffect(() => {
    debouncedHandleSearch();
  }, []);

  useEffect(() => {
    return () => {
      debouncedHandleSearch.cancel();
    };
  }, [debouncedHandleSearch]);

  const handleInputChange = e => {
    debouncedHandleSearch(e.target.value);
  };

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      selectTag(tagsRef.current.value);
      tagsRef.current.value = "";
      debouncedHandleSearch();
    }
  };

  function selectTag(selected) {
    if (selected && selectedTagList.length < 5)
      setSelectedTagList(prevData => [...new Set(prevData).add(selected)]);
  }

  function deleteTag(deleted) {
    const buf = new Set(selectedTagList);
    buf.delete(deleted);
    setSelectedTagList([...buf]);
  }

  function handleTagClick(e, tag) {
    e.preventDefault();
    e.stopPropagation();
    selectTag(tag.tag_name);
    tagsRef.current.value = "";
  }

  return (
    <Form.Group id="tags" className="mb-3">
      <div className="selected-tags-container">
        {selectedTagList.map((tag, index) => (
          <span key={index} className="selected-tags">
            {tag}
            <RxCross2 color="black" onClick={() => deleteTag(tag)} />
          </span>
        ))}
      </div>
      <div>
        <div className="tag-search-container">
          <input
            type="text"
            ref={tagsRef}
            onFocus={() => {
              if (selectedTagList.length < 5) setIsDropdownListOpen(true);
            }}
            placeholder={
              selectedTagList.length < 5
                ? t("createTopic.selectTagsPlaceholder")
                : t("createTopic.tagsLimitReached")
            }
            className="tag-input"
            readOnly={selectedTagList.length > 4}
            onChange={handleInputChange}
            onBlur={() => setIsDropdownListOpen(false)}
            onKeyDown={handleKeyDown}
            maxLength={100}
            style={{ position: "relative", zIndex: 12 }}
          />
          <div
            className="tag-select-button"
            onClick={() => {
              selectTag(tagsRef.current.value);
            }}
          >
            {t("add")}
          </div>
        </div>
        <div style={{ position: "relative", width: "100%" }}>
          <div
            style={{
              position: "absolute",
              width: "100%",
              ...(tagList.length === 0 && { display: "none" }),
            }}
          >
            {isDropdownListOpen && (
              <ul className="find-list">
                {tagList
                  .filter(
                    tag =>
                      !selectedTagList.some(
                        selectedTag => selectedTag === tag.tag_name
                      )
                  )
                  .slice(0, 7)
                  .map(tag => (
                    <li
                      key={tag.id || tag.tag_name}
                      className="find-list-item"
                      onMouseDown={e => handleTagClick(e, tag)}
                    >
                      {tag.tag_name}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Form.Group>
  );
};

export default SearchInput;
