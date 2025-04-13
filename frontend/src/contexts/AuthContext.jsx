import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth"; // Імпортуємо необхідні функції
import { auth, googleAuthProvider } from "../config/firebase-config.js"; // Імпортуємо вже ініціалізований екземпляр auth
import { useTranslation } from "react-i18next";
import axios from "axios";
import { VITE_API_URL } from "../constants/config.js";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const { t } = useTranslation();

  // Оновлений метод signup, використовуємо createUserWithEmailAndPassword
  async function signup(email, password) {
    return await createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return auth.signOut();
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function reauthenticate(email, password) {
    const credential = EmailAuthProvider.credential(email, password);
    return reauthenticateWithCredential(auth.currentUser, credential);
  }

  async function updateUserEmail(newEmail, password) {
    try {
      if (auth.currentUser == null) return;

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        password
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      return updateEmail(currentUser, newEmail);
    } catch (error) {
      console.error(error);
      throw Error(t("auth.updateEmailFailed"));
    }
  }

  async function updateUserPassword(password, newPassword) {
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      password
    );
    await reauthenticateWithCredential(currentUser, credential);
    return updatePassword(currentUser, newPassword);
  }

  async function loginWithGoogle() {
    return signInWithPopup(auth, googleAuthProvider);
  }

  async function verifyPassword(currentPassword) {
    if (!currentUser) {
      throw new Error("No user is logged in.");
    }

    try {
      // Створюємо облікові дані
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );

      // Реавтентифікуємо користувача
      await reauthenticateWithCredential(currentUser, credential);
      return true; // Пароль правильний
    } catch (error) {
      console.error("Error reauthenticating user:", error);
      if (error.code === "auth/wrong-password") {
        console.error("Incorrect password.");
      }
      return false; // Пароль неправильний
    }
  }

  async function checkUsername(username) {
    try {
      const response = await axios.get(
        `${VITE_API_URL}/auth/check-username/${username}`
      );
      return response.data.email;
    } catch (error) {
      console.error(error);
    }
  }

  async function checkUserRegistration(id) {
    try {
      const response = await axios.get(
        `${VITE_API_URL}/auth/check-registration/${id}`
      );
      return true;
    } catch (error) {
      if (error.response.status === 404)
        console.error("User is not registered", error);
      else console.error(error);

      return false;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      setLoading(true);

      if (user) {
        try {
          const newToken = await user.getIdToken();
          // console.log(newToken);
          setToken(newToken); // Збереження токена
          setCurrentUser(user); // Оновлення поточного користувача
        } catch (error) {
          console.error("Error fetching token:", error);
        }
      } else {
        setCurrentUser(null);
        setToken(""); // Очищення токена, якщо користувача немає
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const value = {
    currentUser,
    token,
    login,
    signup,
    logout,
    resetPassword,
    updateUserEmail,
    updateUserPassword,
    reauthenticate,
    loginWithGoogle,
    verifyPassword,
    checkUserRegistration,
    checkUsername,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
