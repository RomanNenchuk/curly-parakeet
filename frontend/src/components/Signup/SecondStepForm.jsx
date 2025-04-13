import React from "react";
import { Form, Card, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import FormInput from "../FormInput.jsx";
import AvatarUploader from "../AvatarUploader.jsx";
import ActionButton from "../ActionButton/ActionButton.jsx";

export default function SecondStepForm({
  error,
  preview,
  setPreview,
  fullNameRef,
  majorRef,
  imageInputRef,
  handleSubmit,
  onClose,
  setNextForm,
  setImage,
  setError,
  loading,
  style,
}) {
  const { t } = useTranslation();
  return (
    <div style={style}>
      <ModalHeader
        title={t("auth.signUp")}
        renderArrowBack={true}
        onBack={() => setNextForm(false)}
        onClose={onClose}
      />
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group id="avatar">
            <AvatarUploader
              preview={preview}
              setPreview={setPreview}
              imageInputRef={imageInputRef}
              setImage={setImage}
              setError={setError}
            />
          </Form.Group>

          <FormInput
            id={"fullName"}
            type={"text"}
            placeholder={t("auth.fullName")}
            ref={fullNameRef}
            required
          />

          <ActionButton
            label={t("auth.register")}
            loading={loading}
            className="my-5"
          />
        </Form>
      </Card.Body>
    </div>
  );
}
