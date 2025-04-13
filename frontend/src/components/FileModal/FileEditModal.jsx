import React, { useState, useRef } from "react";
import Modal from "../Modal.jsx";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import { useTranslation } from "react-i18next";
import styles from "./FileModal.module.css";
import { Card } from "react-bootstrap";
import deleteIcon from "../../assets/delete-button.svg";
import changeIcon from "../../assets/change-file.svg";
import fileIcon from "../../assets/file.svg";

export default function FileEditModal({
  files,
  onClose,
  setFiles,
  setFilesToDelete,
  text,
  setText,
  onEdit,
}) {
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef();
  const { t } = useTranslation();

  function handleChangeClick(index) {
    setCurrentIndex(index);
    fileInputRef.current.click();
  }

  const handleRemoveFile = index => {
    setFiles(prevFiles => {
      if (prevFiles.length === 1) onClose();
      const fileToRemove = prevFiles[index];
      if (fileToRemove.isFromDatabase) {
        setFilesToDelete(prev => [...prev, fileToRemove]);
      }
      return prevFiles.filter((_, i) => i !== index);
    });
  };

  const handleChangeFile = file => {
    if (!file || currentIndex == null) return;
    setFiles(prevFiles => {
      const fileToRemove = prevFiles[currentIndex];
      if (fileToRemove.isFromDatabase) {
        setFilesToDelete(prev => [...prev, fileToRemove]);
      }
      return prevFiles.map((prevfile, i) => {
        if (i === currentIndex) {
          return {
            data: file,
            name: file.name,
            isFromDatabase: false,
          };
        }
        return prevfile;
      });
    });
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    onEdit();
  };

  return (
    <Modal onCloseModal={onClose}>
      <Card className={styles.modalCard}>
        <ModalHeader title={t("edit")} onClose={onClose} />
        <Card.Body className={styles.cardBody}>
          <ul className={styles.fileList}>
            {files.map((file, index) => (
              <li key={index} className={styles.fileItem}>
                <div className={styles.fileHeader}>
                  <img src={fileIcon} alt="File" />
                  <span className={styles.fileName}>
                    {file.isFromDatabase
                      ? file.name.slice(file.name.indexOf("_") + 1)
                      : file.name}
                  </span>
                </div>
                <div className={styles.controlButtons}>
                  <button
                    className={styles.removeButton}
                    onClick={() => handleChangeClick(index)}
                  >
                    <img src={changeIcon} alt="Change" />
                  </button>
                  <button
                    className={styles.removeButton}
                    onClick={() => {
                      handleRemoveFile(index);
                    }}
                  >
                    <img src={deleteIcon} alt="Delete" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={e => {
              handleChangeFile(e.target.files[0]);
            }}
          />
          <div className={styles.fileModalActions}>
            <textarea
              className={`${styles.textInput} ${styles.fileModalTextarea}`}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={t("writeMessageLabel")}
              rows={2}
            />
            <div className={styles.actionButtons}>
              <button className={styles.cancelButton} onClick={onClose}>
                {t("cancel")}
              </button>
              <button
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Modal>
  );
}
