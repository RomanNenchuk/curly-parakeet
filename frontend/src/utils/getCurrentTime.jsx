import { useTranslation } from "react-i18next";
export function getFormattedTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function timestampToTime(timestamp) {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid timestamp format");
    }
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting timestamp:", error.message);
    return null;
  }
}

export function formatRelativeTime(pgTimestamp) {
  const { t } = useTranslation();
  const date = new Date(pgTimestamp); // час, взятий з коментаря
  const now = new Date(); // час зараз

  const diffInMs = now - date;
  const diffInSec = Math.floor(diffInMs / 1000);
  const diffInMin = Math.floor(diffInSec / 60);
  const diffInHours = Math.floor(diffInMin / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365.25);

  if (diffInDays === 0) {
    return t("time.today");
  } else if (diffInDays === 1) {
    return t("time.yesterday");
  } else if (diffInDays < 5) {
    return t("time.days_ago_few", { count: diffInDays });
  } else if (diffInDays < 7) {
    return t("time.days_ago_many", { count: diffInDays });
  } else if (diffInDays < 30) {
    return t(diffInWeeks === 1 ? "time.weeks_ago" : "time.weeks_ago_plural", {
      count: diffInWeeks,
    });
  } else if (diffInMonths < 5) {
    return t("time.months_ago", { count: diffInMonths });
  } else if (diffInMonths < 12) {
    return t("time.months_ago_plural", { count: diffInMonths });
  } else {
    return t(diffInYears === 1 ? "time.years_ago" : "time.years_ago_plural", {
      count: diffInYears,
    });
  }
}
