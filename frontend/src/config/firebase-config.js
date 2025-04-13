// Імпортуємо необхідні функції з Firebase SDK
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";

// Конфігурація Firebase, що містить ваші ключі та параметри
const app = initializeApp({
  apiKey: import.meta.env.VITE_API_KEY, // ключ API
  authDomain: import.meta.env.VITE_AUTH_DOMAIN, // домен аутентифікації
  projectId: import.meta.env.VITE_PROJECT_ID, // ID проекту
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET, // контейнер для зберігання
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID, // ID відправника повідомлень
  appId: import.meta.env.VITE_APP_ID, // ID додатку
});

// Ініціалізація Firebase Auth
export const auth = getAuth(app); // отримуємо екземпляр аутентифікації для поточного додатку

// Встановлюємо sessionStorage як тип зберігання стану
setPersistence(auth, browserSessionPersistence).catch(error => {
  console.error("Error setting persistence:", error);
});

// Експортуємо ініціалізовану функцію для аутентифікації та GoogleAuthProvider
export default app;
export const googleAuthProvider = new GoogleAuthProvider();
