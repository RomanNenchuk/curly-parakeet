import React from "react";
import Modal from "../Modal.jsx";
import { useTranslation } from "react-i18next";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import { Card } from "react-bootstrap";
import styles from "../FileModal/FileModal.module.css";

export default function ChangeLanguageModal({ onClose }) {
  const { t, i18n } = useTranslation();
  const changeLanguage = lng => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
    onClose();
  };

  return (
    <Modal onCloseModal={onClose}>
      <Card className={styles.modalCard}>
        <ModalHeader title={t("selectLanguage")} onClose={onClose} />
        <Card.Body className={styles.cardBody}>
          <div
            className={`${styles.actionButtons} ${styles.confirmationButtons}`}
          >
            <button
              className={styles.cancelButton}
              style={{ width: "45%" }}
              onClick={() => changeLanguage("en")}
            >
              English
            </button>
            <button
              className={styles.submitButton}
              style={{ width: "45%" }}
              onClick={() => changeLanguage("ua")}
            >
              Українська
            </button>
          </div>
        </Card.Body>
      </Card>
    </Modal>
  );
}
