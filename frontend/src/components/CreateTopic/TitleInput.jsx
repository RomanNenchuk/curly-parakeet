import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Form } from "react-bootstrap";
import "./CreateTopic.css";


const TitleInput = ({ title, setTitle, limit, value, showCounter }) => {
  const { t } = useTranslation();

  const countRef = useRef();
  const titleRef = useRef(null);
  const [counter, setCounter] = useState(0);

  function handleChange(e) {
    setTitle(e.target.value);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }

  useEffect(() => {
    title ? setCounter(title.length) : setCounter(0);
  }, [title]);

  return (
    <Form.Group id="title" className="mb-3">
      <input
        className="title-input"
        type="text"
        maxLength={limit}
        ref={titleRef}
        defaultValue={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={t("createTopic.titleInputPlaceholder")}
        required
      />
      {showCounter ? <span ref={countRef} className="right-counter">
        {counter}/{limit} 
      </span> : ''}
    </Form.Group>
  );
};

export default TitleInput;
