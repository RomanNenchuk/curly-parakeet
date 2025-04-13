import React, { useState, useRef } from "react";
import Modal from "../Modal.jsx";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import { useTranslation } from "react-i18next";
import styles from "./FileModal.module.css";
import { Card } from "react-bootstrap";
import deleteIcon from "../../assets/delete-button.svg";
import fileIcon from "../../assets/file.svg";

export default function FileSendModal({
  files,
  onClose,
  setFiles,
  text,
  setText,
  onSubmit,
}) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef();

  const handleFileChange = e => {
    const filesArray = Array.from(e.target.files);
    setFiles(prev => [
      ...prev,
      ...filesArray.map(file => ({
        data: file,
        name: file.name,
        isFromDatabase: false,
      })),
    ]);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    onSubmit();
  };

  const handleRemoveFile = index => {
    setFiles(prevFiles => {
      if (prevFiles.length === 1) onClose();
      return prevFiles.filter((_, i) => i !== index);
    });
  };

  return (
    <Modal onCloseModal={onClose}>
      <Card className={styles.modalCard}>
        <ModalHeader
          title={t("upload.selectedFilesCaption")}
          onClose={onClose}
        />
        <Card.Body className={styles.cardBody}>
          <ul className={styles.fileList}>
            {files.map((file, index) => (
              <li key={index} className={styles.fileItem}>
                <div className={styles.fileHeader}>
                  <img src={fileIcon} alt="File" />
                  <span className={styles.fileName}>{file.name}</span>
                </div>
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveFile(index)}
                >
                  <img src={deleteIcon} alt="Delete" />
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className={styles.fileInput}
              multiple
            />
            <textarea
              className={`${styles.textInput} ${styles.fileModalTextarea}`}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={t("chat.writeMessageLabel")}
              rows={2}
            />
            <div className={styles.actionButtons}>
              <button
                className={`${styles.addButton} ${styles.addButtonSend}`}
                onClick={() => fileInputRef.current.click()}
              >
                {t("add")}
              </button>
              <div className={styles.actionButtonsGroup}>
                <button
                  className={`${styles.cancelButton} ${styles.cancelButtonSend}`}
                  onClick={onClose}
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleSubmit}
                  className={`${styles.submitButton} ${styles.submitButtonSend}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("sending") : t("send")}
                </button>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Modal>
  );
}
