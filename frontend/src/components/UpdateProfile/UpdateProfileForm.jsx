import React from "react";
import { Form } from "react-bootstrap";
import FormInput from "../FormInput.jsx";
import ActionButton from "../ActionButton/ActionButton.jsx";
import { useTranslation } from "react-i18next";

export default function UpdateProfileForm({
  isGoogleSignIn,
  currentUser,
  fullName,
  userName,
  fullNameRef,
  userNameRef,
  emailRef,
  passwordRef,
  newPasswordRef,
  onSubmit,
  loading,
}) {
  const { t } = useTranslation();
  return (
    <Form onSubmit={onSubmit}>
      <FormInput
        id="fullName"
        type="text"
        placeholder={t("profile.fullName")}
        ref={fullNameRef}
        defaultValue={fullName}
        required
      />
      <FormInput
        id="userName"
        type="text"
        placeholder={t("profile.username")}
        ref={userNameRef}
        defaultValue={userName}
        required
      />
      {!isGoogleSignIn && (
        <>
          <FormInput
            id="email"
            type="email"
            placeholder={t("profile.email")}
            ref={emailRef}
            defaultValue={currentUser.email}
            required
          />
          <FormInput
            id="reauth-password"
            type="password"
            placeholder={t("profile.password")}
            ref={passwordRef}
            required
          />
          <FormInput
            id="password"
            type="password"
            placeholder={t("profile.newPassword")}
            ref={newPasswordRef}
          />
        </>
      )}
      <ActionButton label={t("update")} loading={loading} className="my-4" />
    </Form>
  );
}
