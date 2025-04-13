import React, { useEffect, useRef, useState } from "react";
import { Card, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useUserInfo } from "../../contexts/UserInfoContext.jsx";
import {
  setInputInvalid,
  setAllInputsValid,
  usernameOrEmailTaken,
  checkPasswordsValidity,
} from "../../utils/checkValidity.jsx";
import AvatarUploader from "../AvatarUploader.jsx";
import UpdateProfileForm from "./UpdateProfileForm.jsx";
import ModalHeader from "../ModalHeader/ModalHeader.jsx";
import axios from "axios";
import { VITE_API_URL } from "../../constants/config.js";

export default function UpdateProfile({ onClose }) {
  const { t } = useTranslation();
  const {
    currentUser,
    token,
    updateUserPassword,
    updateUserEmail,
    verifyPassword,
  } = useAuth();
  const { user, setUser, saveAvatar, deleteAvatar } = useUserInfo();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
  const fullNameRef = useRef();
  const userNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const newPasswordRef = useRef();
  const imageInputRef = useRef();

  const navigate = useNavigate();
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation || "/";

  useEffect(() => {
    setPreview(user.avatar);
  }, [user.avatar]);

  const isGoogleSignIn = currentUser.providerData.some(
    provider => provider.providerId === "google.com"
  );

  async function updateUserOnServer(token, userId, userData) {
    try {
      const response = await axios.put(
        `${VITE_API_URL}/users/${userId}`,
        userData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response.data);
      const { fullname, username, avatar, email } = response.data.user;
      return {
        fullName: fullname,
        userName: username,
        avatar,
        email,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    let newToken = token;
    const userData = {};

    try {
      setError("");
      setAllInputsValid(emailRef, userNameRef, fullNameRef);

      // перевіряємо пароль користувача, якщо він реєструвався як email + password
      if (!isGoogleSignIn) {
        if (!checkPasswordsValidity(setError, passwordRef, newPasswordRef, t))
          return;
        const verified = await verifyPassword(passwordRef.current.value);
        if (!verified) throw new Error(t("profile.incorrectPassword"));
      }

      // emailChanged буде false, якщо користувач входив за google
      const emailChanged =
        !isGoogleSignIn && emailRef?.current?.value !== currentUser.email;
      const userNameChanged = userNameRef.current.value !== user.userName;
      const fullNameChanged = fullNameRef.current.value !== user.fullName;

      if (emailChanged || userNameChanged) {
        const { emailExists, usernameExists } = await usernameOrEmailTaken(
          emailRef?.current?.value || currentUser.email,
          userNameRef.current.value
        );

        if (emailChanged && emailExists)
          return setInputInvalid(emailRef, setError, t("profile.emailInUse"));

        if (userNameChanged && usernameExists)
          return setInputInvalid(
            userNameRef,
            setError,
            t("profile.usernameInUse")
          );

        if (emailChanged) {
          await updateUserEmail(
            emailRef.current.value,
            passwordRef.current.value
          );
          newToken = await currentUser.getIdToken(true);
          userData.email = emailRef.current.value;
        }
        if (userNameChanged) userData.userName = userNameRef.current.value;
      }
      if (fullNameChanged) userData.fullName = fullNameRef.current.value;

      if (newPasswordRef?.current?.value) {
        await updateUserPassword(
          passwordRef.current.value,
          newPasswordRef.current.value
        );
        newToken = await currentUser.getIdToken(true);
      }

      if (preview && image) await saveAvatar(image, currentUser.uid, newToken);
      if (!preview && user.avatar)
        await deleteAvatar(currentUser.uid, newToken);

      if (Object.keys(userData).length > 0) {
        const updatedUserInfo = await updateUserOnServer(
          newToken,
          currentUser.uid,
          userData
        );
        setUser(prev => ({
          ...prev,
          ...updatedUserInfo,
        }));
      }

      navigateToProfile();
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function navigateToProfile() {
    navigate(`/profiles/${currentUser.uid}`, {
      state: { backgroundLocation },
      replace: true,
    });
  }

  return (
    <Card>
      <ModalHeader
        title={t("profile.updateProfile")}
        onClose={onClose}
        onBack={navigateToProfile}
      />
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <AvatarUploader
          preview={preview}
          setPreview={setPreview}
          setImage={setImage}
          imageInputRef={imageInputRef}
          deleteAvatar={deleteAvatar}
          setError={setError}
        />
        <UpdateProfileForm
          isGoogleSignIn={isGoogleSignIn}
          currentUser={currentUser}
          fullName={user.fullName}
          userName={user.userName}
          fullNameRef={fullNameRef}
          userNameRef={userNameRef}
          emailRef={emailRef}
          passwordRef={passwordRef}
          newPasswordRef={newPasswordRef}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </Card.Body>
    </Card>
  );
}
