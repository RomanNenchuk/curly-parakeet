import { useLocation } from "react-router-dom";
import { useRef } from "react";

const MODAL_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/profile",
  "/update-profile",
  "/tags",
];

export function useBackgroundLocation() {
  const location = useLocation();
  const originalBackground = useRef(null);
  const state = location.state || {};

  let backgroundLocation = location;
  let showBackground = false;

  const isModalPath = MODAL_PATHS.some(path => {
    if (path === "/profile") {
      return location.pathname.startsWith(path);
    }
    return location.pathname === path;
  });

  // якщо шлях є модальним, зберігаю початковий фон
  if (isModalPath) {
    if (!originalBackground.current && state.backgroundLocation) {
      originalBackground.current = state.backgroundLocation;
    }
    backgroundLocation = {
      ...(originalBackground.current || { pathname: "/" }),
      state: {
        ...(originalBackground.current?.state || {}),
        reloadBackground: false, // прапорець, щоб не перевантажувалася сторінка на задньому фоні, якщо це модальний маршрут
      },
    };
    showBackground = true;
  } else {
    // якщо шлях не модальний, очищую збережений фон
    originalBackground.current = null;
  }

  return { backgroundLocation, showBackground };
}
