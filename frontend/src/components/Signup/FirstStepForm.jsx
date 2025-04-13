import React from "react";
import { Form, Card, Alert } from "react-bootstrap";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FormInput from "../FormInput.jsx";
import Divider from "../Divider.jsx";
import GoogleAuthButton from "../GoogleAuthButton.jsx";
import NavLink from "../NavLink.jsx";
import ActionButton from "../ActionButton/ActionButton.jsx";
import {
  usernameOrEmailTaken,
  setInputInvalid,
  checkPasswordsValidity,
  setAllInputsValid,
} from "../../utils/checkValidity.jsx";

export default function FirstStepForm({
  error,
  backgroundPath,
  redirectPath,
  handleSignUpWithGoogle,
  setNextForm,
  onClose,
  setError,
  loading,
  emailRef,
  passwordRef,
  usernameRef,
  style,
}) {
  const { t } = useTranslation();
  const location = useLocation();
  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    setError("");
    setAllInputsValid(emailRef, usernameRef, passwordRef);

    // якщо всі поля форми заповнені та користувачів з такими email і username нема, то показую наступну форму
    if (
      form.checkValidity() &&
      checkPasswordsValidity(setError, passwordRef, t)
    ) {
      const { emailExists, usernameExists } = await usernameOrEmailTaken(
        emailRef.current.value,
        usernameRef.current.value
      );
      if (emailExists)
        return setInputInvalid(emailRef, setError, t("auth.emailTaken"));

      if (usernameExists)
        return setInputInvalid(usernameRef, setError, t("auth.usernameTaken"));
      setNextForm(true);
    } else {
      form.reportValidity();
    }
  }

  return (
    <div style={style}>
      <ModalHeader title={t("auth.signUp")} onClose={onClose} />
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <GoogleAuthButton onClick={handleSignUpWithGoogle} className="my-3" />
        <Divider text={t("auth.or")} />
        <Form onSubmit={handleSubmit}>
          <FormInput
            id="email"
            type="email"
            placeholder={t("auth.email")}
            ref={emailRef}
            required
          />
          <FormInput
            id="username"
            type="text"
            placeholder={t("auth.username")}
            ref={usernameRef}
            required
          />
          <FormInput
            id="password"
            type="password"
            placeholder={t("auth.password")}
            ref={passwordRef}
            required
          />
          <NavLink
            label={t("auth.haveAccount")}
            linkText={t("auth.logIn")}
            linkTo={`/login${location.search}`}
            backgroundPath={backgroundPath}
            redirectPath={redirectPath}
            className="mt-4"
          />
          <ActionButton
            label={t("continue")}
            loading={loading}
            className="my-5"
          />
        </Form>
      </Card.Body>
    </div>
  );
}
