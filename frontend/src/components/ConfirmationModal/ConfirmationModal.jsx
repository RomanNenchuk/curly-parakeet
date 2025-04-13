import React from "react";
import Modal from "../Modal.jsx";
import { useTranslation } from "react-i18next";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import styles from "../FileModal/FileModal.module.css";
import { Card } from "react-bootstrap";

export default function ConfirmationModal({ onClose, onConfirm, message }) {
  const { t } = useTranslation();
  return (
    <Modal onCloseModal={onClose}>
      <Card className={styles.modalCard}>
        <ModalHeader title={message} onClose={onClose} />
        <Card.Body className={styles.cardBody}>
          <div
            className={`${styles.actionButtons} ${styles.confirmationButtons}`}
          >
            <button className={styles.cancelButton} onClick={onClose}>
              {t("cancel")}
            </button>
            <button className={styles.submitButton} onClick={onConfirm}>
              {t("confirm")}
            </button>
          </div>
        </Card.Body>
      </Card>
    </Modal>
  );
}
