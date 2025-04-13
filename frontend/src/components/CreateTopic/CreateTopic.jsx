import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useWidth } from "../../contexts/ScreenWidthContext.jsx";
import { Form, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createTopic } from "../../api/topics.js";
import CoverUploader from "./CoverUploader.jsx";
import TopicFileUploader from "./TopicFileUploader.jsx";
import ActionButton from "../ActionButton/ActionButton.jsx";
import TagBar from "../TagBar/TagBar.jsx";
import TitleInput from "./TitleInput.jsx";
import SearchInput from "./SearchInput.jsx";
import DescriptionInput from "./DescriptionInput.jsx";
import arrowBackIcon from "../../assets/arrow-back.svg";
import "./CreateTopic.css";

export default function CreateTopic() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { currentUser, token } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [descriptionFiles, setDescriptionFiles] = useState([]);
  const [isFirstTopicType, setIsFirstTopicType] = useState(true);
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [selectedTagList, setSelectedTagList] = useState([]);
  const [coverPreview, setCoverPreview] = useState(null);
  const [cover, setCover] = useState(null);
  const navigate = useNavigate();
  const { width } = useWidth();

  const createTopicMutation = useMutation({
    mutationFn: formData => createTopic(formData, token),
    onSuccess: () => {
      queryClient.invalidateQueries(["myTopics", currentUser?.uid]);
      queryClient.invalidateQueries(["topics"]);

      setSuccess(t("createTopic.successTopic"));
      setTimeout(() => navigate("/"), 1000);
    },
    onError: err => {
      setError(err.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", currentUser.uid);
      if (selectedTagList.length)
        formData.append("tags", JSON.stringify(selectedTagList));
      if (description) formData.append("description", description);
      if (cover) formData.append("cover", cover);
      if (descriptionFiles.length)
        descriptionFiles
          .slice(0, 10)
          .forEach(file => formData.append("attachments", file));

      createTopicMutation.mutate(formData);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }
  console.log(`${isFirstStep || width > 768} here`);
  return (
    <>
      <main className="create-topic-container">
        <div className="create-topic-inner">
          <div className="title-container">
            {!isFirstStep ? (
              <img
                src={arrowBackIcon}
                onClick={() => {
                  setIsFirstStep(true);
                }}
                className="arrow-back"
              />
            ) : (
              ""
            )}
            {width > 768 ? (
              <h3 className="title">{t("createTopic.createTopicCaption")}</h3>
            ) : (
              <div
                style={{
                  position: "fixed",
                  top: "8vh",
                  left: 0,
                  width: "100%",
                  height:"4vh",
                  backgroundColor: "#d2dbe0",
                  zIndex: 13,
                }}
              >
                <h3 className="title">{t("createTopic.createTopicCaption")}</h3>
              </div>
            )}
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          {warning && <Alert variant="warning">{warning}</Alert>}
          <Form onSubmit={handleSubmit}>
            <div style={isFirstStep ? {} : { display: "none" }}>
              <FirstStep
                title={title}
                setTitle={setTitle}
                selectedTagList={selectedTagList}
                setSelectedTagList={setSelectedTagList}
                isFirstTopicType={isFirstTopicType}
                setIsFirstTopicType={setIsFirstTopicType}
                coverPreview={coverPreview}
                setCoverPreview={setCoverPreview}
                cover={cover}
                setCover={setCover}
                setIsFirstStep={setIsFirstStep}
                setError={setError}
              />
            </div>
            <div
              style={
                !isFirstStep || width <= 768
                  ? { display: "block" }
                  : { display: "none" }
              }
            >
              <SecondStep
                descriptionFiles={descriptionFiles}
                setDescriptionFiles={setDescriptionFiles}
                description={description}
                setDescription={setDescription}
                setWarning={setWarning}
                loading={loading}
                handleSubmit={handleSubmit}
              />
            </div>
          </Form>
        </div>
      </main>
      {width > 768 ? <TagBar /> : ""}
    </>
  );
}

function FirstStep({
  title,
  setTitle,
  selectedTagList,
  setSelectedTagList,
  isFirstTopicType,
  setIsFirstTopicType,
  setCover,
  coverPreview,
  setCoverPreview,
  setIsFirstStep,
  setError,
}) {
  const { t } = useTranslation();
  function handleContinueClick(e) {
    e.preventDefault();
    setError("");
    if (title.length < 15) return setError(t("createTopic.errorTitle"));
    setIsFirstStep(false);
  }
  const { width } = useWidth();
  return (
    <>
      <div className="topic-type">
        <div
          className={` topic-type-option ${
            isFirstTopicType ? "topic-type-chosen" : ""
          }`}
          onClick={() => setIsFirstTopicType(true)}
        >
          {t("createTopic.textType")}
        </div>
        <div
          className={`topic-type-option ${
            !isFirstTopicType ? "topic-type-chosen" : ""
          }`}
          onClick={() => setIsFirstTopicType(false)}
        >
          {t("createTopic.mediaType")}
        </div>
      </div>
      <TitleInput
        title={title}
        setTitle={setTitle}
        limit={255}
        showCounter={width > 768 ? true : false}
      />
      <SearchInput
        selectedTagList={selectedTagList}
        setSelectedTagList={setSelectedTagList}
      />
      {!isFirstTopicType && (
        <>
          {width < 768 ? <p>{t("createTopic.mediaHeader")}</p> : ""}
          <CoverUploader
            coverPreview={coverPreview}
            setCoverPreview={setCoverPreview}
            setCover={setCover}
            setError={setError}
          />
        </>
      )}
      {width > 768 ? (
        <ActionButton
          className="my-4"
          onClick={handleContinueClick}
          label={t("continue")}
          type="button"
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "2px",
            backgroundColor: "gray",
            marginBottom: "2vh",
          }}
        ></div>
      )}
    </>
  );
}

function SecondStep({
  description,
  setDescription,
  descriptionFiles,
  setDescriptionFiles,
  setWarning,
  loading,
}) {
  const { t } = useTranslation();
  const { width } = useWidth();
  return (
    <>
      <DescriptionInput
        description={description}
        setDescription={setDescription}
      />
      {width < 768 ? <p>{t("createTopic.additionalMedia")}</p> : ""}
      <TopicFileUploader
        files={descriptionFiles}
        setFiles={setDescriptionFiles}
        setWarning={setWarning}
      />
      <ActionButton
        label={loading ? t("createTopic.creating") : t("createTopic.create")}
        loading={loading}
        type="submit"
      />
    </>
  );
}
