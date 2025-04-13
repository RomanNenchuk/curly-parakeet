import React, { useRef, useState } from "react";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import FormInput from "../FormInput.jsx";
import { useTranslation } from "react-i18next";
import ActionButton from "../ActionButton/ActionButton.jsx";
import NavLink from "../NavLink.jsx";
import { useLocation } from "react-router-dom";
import { Form, Card, Alert } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function ForgotPassword({ onClose }) {
  const { t } = useTranslation();
  const emailRef = useRef();
  const { resetPassword } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const backgroundPath = location.state?.backgroundLocation || "/";
  const redirectPath = location.state?.redirectPath || "/";

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setMessage("");
      setError("");
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage(t("auth.checkEmailForInstructions"));
    } catch (error) {
      setError(t("auth.resetError"));
    }
    setLoading(false);
  }

  return (
    <>
      <Card>
        <ModalHeader title={t("auth.resetPassword")} onClose={onClose} />
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Form onSubmit={handleSubmit}>
            <FormInput
              id={"email"}
              type={"email"}
              placeholder={t("auth.email")}
              ref={emailRef}
              required
            />

            <NavLink
              label={t("auth.haveAnAccount")}
              linkText={t("auth.logIn")}
              linkTo={`/login${location.search}`}
              backgroundPath={backgroundPath}
              redirectPath={redirectPath}
              className="mt-5"
            />

            <NavLink
              label={t("auth.newToUforum")}
              linkText={t("auth.signUp")}
              backgroundPath={backgroundPath}
              redirectPath={redirectPath}
              linkTo={`/signup${location.search}`}
            />

            <ActionButton
              label={t("auth.reset")}
              loading={loading}
              className="my-5"
            />
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}
