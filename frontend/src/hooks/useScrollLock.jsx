import { useEffect } from "react";

export function useScrollLock(isLocked, ref) {
  useEffect(() => {
    let element = ref?.current;
    if (!element) {
      element = document.querySelector("html");
      return;
    }

    if (isLocked) {
      const fullWidth = element.offsetWidth;
      const contentWidth = element.clientWidth;
      const scrollBarWidth = fullWidth - contentWidth;

      element.style.overflow = "hidden";
      element.style.paddingRight = `${scrollBarWidth}px`; // Компенсація
    } else {
      element.style.overflow = "";
      element.style.paddingRight = ""; // Скидаємо відступ
    }

    return () => {
      element.style.overflow = "";
      element.style.paddingRight = ""; // Скидаємо відступ при демонтованому компоненті
    };
  }, [isLocked, ref]);
}
