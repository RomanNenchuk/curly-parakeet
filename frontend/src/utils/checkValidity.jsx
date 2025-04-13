import axios from "axios";
import { VITE_API_URL } from "../constants/config";

// функція для перевірки, чи користувач з таким ім'ям та імейлом вже існує
export async function usernameOrEmailTaken(email, username) {
  try {
    const response = await axios.get(
      `${VITE_API_URL}/auth/verify-username-email?email=${email}&username=${username}`
    );
    const { emailExists, usernameExists } = response.data;
    return { emailExists, usernameExists };
  } catch (error) {
    console.error(error);
    return { emailExists: true, usernameExists: true };
  }
}

export function checkPasswordsValidity(
  setError,
  passwordRef,
  newPasswordRef,
  t
) {
  const password = passwordRef.current.value.trim();
  const newPassword = newPasswordRef?.current?.value?.trim();

  if (password.length <= 5) {
    passwordRef.current.classList.add("border", "border-danger");
    setError(t("auth.passwordMinLength"));
    return false;
  }
  if (newPassword?.length && newPassword?.length <= 5) {
    newPasswordRef.current.classList.add("border", "border-danger");
    setError(t("auth.passwordMinLength"));
    return false;
  }
  return true;
}

export function setInputInvalid(inputRef, setError, message) {
  inputRef?.current?.classList.add("border", "border-danger");
  setError(message);
}

export function setAllInputsValid(...inputRefs) {
  inputRefs.forEach(inputRef => {
    inputRef?.current?.classList?.remove("border", "border-danger");
  });
}

export function checkPasswordInput(passwordRef) {
  const { t } = useTranslation();
  if (passwordRef.current.value.length <= 5) {
    passwordRef.current.classList.add("border", "border-danger");
    setError(t("auth.passwordMinLength"));
    return false;
  }
  return true;
}
