import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useUserInfo } from "../../contexts/UserInfoContext";
import { useWidth } from "../../contexts/ScreenWidthContext.jsx";
import handleUpload from "../../utils/uploadFiles.jsx";
import LoadingSpinner from "../Spinner";
import TopicList from "../TopicList/TopicList";
import TopicInput from "./TopicInput";
import AttachedFiles from "../AttachedFiles/AttachedFiles.jsx";
import TopicComments from "./TopicComments";
import FileSendModal from "../FileModal/FileSendModal.jsx";
import FileEditModal from "../FileModal/FileEditModal.jsx";
import { useScrollLock } from "../../hooks/useScrollLock.jsx";
import { useTranslation } from "react-i18next";
import TopicContextMenu from "./TopicContextMenu";
import arrowBackIcon from "../../assets/arrow-back.svg";
import axios from "axios";
import "./Topic.css";
import { VITE_API_URL } from "../../constants/config.js";

export const commentsOnOnePageCount = 10;

export default function Topic() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [topic, setTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { width } = useWidth();
  const [extendInfo, setExtendInfo] = useState();
  const [text, setText] = useState("");
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]); // Список файлів на видалення
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [editId, setEditId] = useState(-1);
  const [reply, setReply] = useState({
    id: -1,
    author: null,
    text: "",
    attachment: "",
    timestamp: null,
  });
  const [contextMenu, setContextMenu] = useState({
    selectedComment: -1,
    selectedCommentItem: null,
    position: {
      x: 0,
      y: 0,
    },
    toggled: false,
  });

  const contextMenuRef = useRef(null);
  const topicCommentsRef = useRef(null);
  const extendedInformationRef = useRef(null);
  const { currentUser } = useAuth();
  const { user } = useUserInfo();

  useScrollLock(isContextMenuOpen, topicCommentsRef);

  // вантажу інформацію з БД при монтуванні компонента
  useEffect(() => {
    setLoading(true);
    setCommentLoading(true);
    fetchTopic();
    fetchTopicComments();
  }, [id, currentUser]);
  // обробник кліку на сторінці
  useEffect(() => {
    function handler(e) {
      if (contextMenuRef.current) {
        if (!contextMenuRef.current.contains(e.target)) {
          resetContextMenu();
        }
      }
    }
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  async function fetchTopic() {
    try {
      const result = await axios.get(
        `${VITE_API_URL}/topics/${id}${
          currentUser ? "?user_id=" + currentUser.uid : ""
        }`
      );
      let buf = result.data;
      buf.author_avatar = buf.avatar;
      buf.author_full_name = buf.authorfullname;
      delete buf.avatar;
      delete buf.authorfullname;
      setTopic(buf);
      setExtendInfo(
        !buf?.description || buf?.description?.length < 150 ? 2 : 0
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTopicComments() {
    try {
      const response = await axios.get(
        `${VITE_API_URL}/topics/${id}/comments${
          currentUser ? "?user_id=" + currentUser.uid : ""
        }`
      );
      setComments(response.data);
    } catch (error) {
      console.error("fetchTopicComments error:", error);
    } finally {
      setCommentLoading(false);
    }
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setIsSendModalOpen(false);
    setEditId(-1);
    setText("");
  };

  function resetReply() {
    setReply({
      id: -1,
      author: null,
      text: "",
      attachment: "",
      timestamp: null,
    });
  }

  async function sendComment() {
    if (files.length === 0 && text.trim() !== "") {
      const comm = {
        id: -1,
        text: text.trim(),
        timestamp: new Date().toISOString(),
        author_id: currentUser.uid,
        topic_id: id,
        attachments: [],
        reply: reply?.id || -1,
        author_fullname: user.fullName,
        avatar: user.avatar,
        reply_text: null,
        reply_timestamp: reply?.timestamp || null,
      };
      const result = await axios.post(`${VITE_API_URL}/topics/comments`, comm);
      comm.id = result.data.id;
      comm.reply_text = result.data.reply_text;

      setComments(prev => [...prev, comm]);
    } else {
      // якщо користувач обере більше 10 файлів, то розбиваємо їх на частини по 10
      const CHUNK_SIZE = 10;
      const fileChunks = [];
      for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        fileChunks.push(files.slice(i, i + CHUNK_SIZE));
      }

      for (let i = 0; i < fileChunks.length; i++) {
        const chunk = fileChunks[i];
        const attachments = await handleUpload(chunk);

        const comm = {
          id: -1,
          text: text.trim(),
          timestamp: new Date().toISOString(),
          author_id: currentUser.uid,
          topic_id: id,
          attachments,
          reply: reply?.id || -1,
          author_fullname: user.fullName,
          avatar: user.avatar,
          reply_text: null,
          reply_timestamp: reply?.timestamp || null,
        };
        const result = await axios.post(
          `${VITE_API_URL}/topics/comments`,
          comm
        );
        comm.id = result.data.id;
        comm.reply_text = result.data.reply_text;

        setComments(prev => [...prev, comm]);
      }
    }
    setText("");
    setFiles([]);
    setIsSendModalOpen(false);
    resetReply();
  }

  async function editComment() {
    try {
      const newAttachments = files.filter(file => !file.isFromDatabase);
      let newAttachmentsUrls = null;

      // Завантаження нових файлів
      if (newAttachments.length) {
        newAttachmentsUrls = await handleUpload(
          newAttachments,
          currentUser.uid
        );
      }

      let newComm;
      let newComments = comments.map(comm => {
        if (comm.id === editId) {
          let cleanedAttachments = [];
          if (comm.attachments) {
            const updatedAttachments = comm.attachments.map(attachment => {
              // Перевірка, чи потрібно замінити це вкладення
              const replacementIndex = filesToDelete.findIndex(
                file => file.url === attachment
              );
              if (replacementIndex !== -1) {
                // Якщо є заміна, беремо перший новий файл
                return newAttachmentsUrls?.shift() || null;
              }
              return attachment; // Якщо немає заміни, залишаємо оригінал
            });

            // Видаляємо всі null (вкладення, які замінилися)
            cleanedAttachments = updatedAttachments.filter(
              attachment => attachment !== null
            );

            // Якщо залишилися нові вкладення, додаємо їх у кінець
            if (newAttachmentsUrls?.length) {
              cleanedAttachments.push(...newAttachmentsUrls);
            }
          }

          newComm = {
            ...comm,
            text: comm.attachments ? text : text || comm.text,
            attachments: cleanedAttachments,
          };
          return newComm;
        }
        return comm;
      });

      setFiles([]);
      handleCloseModal();
      resetReply();
      if (newComm) {
        setComments(newComments);
        await axios.patch(`${VITE_API_URL}/topics/comments/${editId}`, newComm);
      }
    } catch (error) {
      console.error("Error with editComment: ", error);
    }
  }

  async function deleteComment(commId) {
    try {
      await axios.delete(`${VITE_API_URL}/topics/comments/${commId}`);
      for (const comm of comments) {
        if (comm.id === commId) {
          setComments(prev => prev.filter(item => item.id !== commId));
          break;
        }
      }
    } catch (error) {
      console.error("Error with deleteComment:", error);
    }
  }

  function resetContextMenu() {
    setIsContextMenuOpen(false);
    setContextMenu({
      selectedComment: -1,
      selectedCommentItem: null,
      position: {
        x: 0,
        y: 0,
      },
      toggled: false,
    });
  }

  function handleOnContextMenu(e, comm) {
    e.preventDefault();
    const contextMenuAttr = contextMenuRef.current.getBoundingClientRect();

    const isRight = e.clientX > window?.innerWidth / 2;
    const isBottom = e.clientY > window?.innerHeight / 2;

    let x = e.clientX;
    let y = e.clientY;

    if (isRight) x -= contextMenuAttr.width;
    if (isBottom) y -= contextMenuAttr.height;
    setFilesToDelete([]);
    setFiles([]);
    setIsContextMenuOpen(true);

    setContextMenu({
      selectedComment: comm.id,
      selectedCommentItem: comm,
      position: {
        x,
        y,
      },
      toggled: true,
    });
  }

  function handleArrowBackClick() {
    navigate(location.state?.returnPath || "/");
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="extention-area">
      <div className="header">
        <img
          src={arrowBackIcon}
          alt="Back"
          style={{ cursor: "pointer" }}
          onClick={handleArrowBackClick}
        />
        <span>{t("topic.discussion")}</span>
      </div>
      <div className="topic-and-comments">
        <div className="in-block-for-flex">
          <div className="block left" ref={extendedInformationRef}>
            <div className="info-list">
              <TopicList
                topicInfoList={[topic]}
                scrollContainerRef={extendedInformationRef}
              />
            </div>
            <div className="extra-info">
              <div style={{ padding: "2vh 2vw" }}>
                <span className="extra-info-header">
                  {t("topic.additionalInformation")}
                </span>
                <p className="extra-info-p">
                  {extendInfo === 2 ? (
                    topic?.description
                  ) : extendInfo === 1 ? (
                    <>
                      {topic?.description}
                      <span
                        className="extention-info"
                        onClick={() => setExtendInfo(0)}
                      >
                        {t("topic.showLess")}
                      </span>
                    </>
                  ) : (
                    <>
                      {topic?.description?.slice(0, 152)}
                      <span
                        className="extention-info"
                        onClick={() => setExtendInfo(1)}
                      >
                        {t("topic.showMore")}
                      </span>
                    </>
                  )}
                </p>
                {extendInfo && topic?.attachments?.length > 0 ? (
                  <AttachedFiles urls={topic.attachments} />
                ) : null}
              </div>
            </div>
          </div>
          <div className="palka"></div>
          <div className="block right">
            <div className="comment-list-group" ref={topicCommentsRef}>
              <div className="comment-area">{t("topic.comments")}</div>
              {commentLoading ? (
                <LoadingSpinner />
              ) : (
                <TopicComments
                  handleOnContextMenu={handleOnContextMenu}
                  topicAuthorId={topic?.uid}
                  comments={comments}
                />
              )}
            </div>
            <TopicInput
              isEditModalOpen={isEditModalOpen}
              isSendModalOpen={isSendModalOpen}
              setIsSendModalOpen={setIsSendModalOpen}
              setFiles={setFiles}
              text={text}
              setText={setText}
              sendComment={
                currentUser
                  ? sendComment
                  : () => {
                      navigate("/login");
                    }
              }
              editComment={editComment}
              editId={editId}
              onCancel={handleCloseModal}
              reply={reply}
              resetReply={resetReply}
            />
          </div>
          <TopicContextMenu
            positionX={contextMenu.position.x}
            positionY={contextMenu.position.y}
            isToggled={contextMenu.toggled}
            contextMenuRef={contextMenuRef}
            resetContextMenu={resetContextMenu}
            contextMenu={contextMenu}
            deleteComment={deleteComment}
            setEditId={setEditId}
            setText={setText}
            setReply={setReply}
            setFiles={setFiles}
            setIsEditModalOpen={setIsEditModalOpen}
          />
          {isEditModalOpen && (
            <FileEditModal
              files={files}
              setFiles={setFiles}
              onClose={handleCloseModal}
              text={text}
              setText={setText}
              setFilesToDelete={setFilesToDelete}
              editId={editId}
              onEdit={editComment}
            />
          )}
          {isSendModalOpen && (
            <FileSendModal
              files={files}
              setFiles={setFiles}
              onClose={handleCloseModal}
              text={text}
              setText={setText}
              onSubmit={sendComment}
            />
          )}
        </div>
      </div>
    </div>
  );
}
