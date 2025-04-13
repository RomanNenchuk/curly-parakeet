import axios from "axios";
import { VITE_API_URL } from "../constants/config";

export const fetchMyTopics = async ({ pageParam = 1, userId }) => {
  try {
    const response = await axios.get(`${VITE_API_URL}/topics/mytopics`, {
      params: { user_id: userId, page: pageParam },
    });

    const topics =
      response.data?.map(topic => ({
        ...topic,
        subscribed: "none",
      })) || [];

    return {
      topics,
      hasMore: topics.length > 0, // Позначаємо, чи є ще теми
      nextPage: topics.length > 0 ? pageParam + 1 : undefined, // Передаємо наступну сторінку, якщо є ще дані
    };
  } catch (error) {
    console.error("Error fetching user topics:", error);
    throw error;
  }
};

export const fetchMonthlyPopularTopics = async ({ pageParam = 1, userId }) => {
  try {
    const response = await axios.get(`${VITE_API_URL}/topics/popular`, {
      params: { user_id: userId, period: "month", page: pageParam },
    });

    const topics = response.data || [];

    return {
      topics,
      hasMore: topics.length > 0,
      nextPage: topics.length > 0 ? pageParam + 1 : undefined,
    };
  } catch (error) {
    console.error("Error fetching user topics:", error);
    throw error;
  }
};

export const fetchDailyPopularTopics = async ({ pageParam = 1, userId }) => {
  try {
    const response = await axios.get(`${VITE_API_URL}/topics/popular`, {
      params: { user_id: userId, period: "day", page: pageParam },
    });

    const topics = response.data || [];

    return {
      topics,
      hasMore: topics.length > 0,
      nextPage: topics.length > 0 ? pageParam + 1 : undefined,
    };
  } catch (error) {
    console.error("Error fetching user topics:", error);
    throw error;
  }
};

export const fetchSavedTopics = async ({ pageParam = 1, userId }) => {
  try {
    const response = await axios.get(`${VITE_API_URL}/topics/saved`, {
      params: { user_id: userId, page: pageParam },
    });

    const topics = response.data || [];

    return {
      topics,
      hasMore: topics.length > 0, // Позначаємо, чи є ще теми
      nextPage: topics.length > 0 ? pageParam + 1 : undefined, // Передаємо наступну сторінку, якщо є ще дані
    };
  } catch (error) {
    console.error("Error fetching saved topics:", error);
    throw error;
  }
};

export const switchSavedTopic = async ({ user_id, topic }) => {
  console.log(user_id, topic);
  const res = await axios.patch(`${VITE_API_URL}/topics/switch`, {
    user_id,
    topic_id: topic?.id,
  });
  return res.data;
};

export const fetchTopics = async ({ pageParam = 1, queryKey }) => {
  const [, queryParams, userId] = queryKey; // Дістаємо queryParams
  try {
    const response = await axios.get(`${VITE_API_URL}/topics`, {
      params: {
        page: pageParam,
        sort: queryParams?.sortOrder || "desc",
        user_id: userId || undefined,
        tags: queryParams?.tags || undefined,
        authors: queryParams?.authors || undefined,
      },
    });
    const topics = response.data || [];

    return {
      topics,
      hasMore: topics.length > 0, // Позначаємо, чи є ще теми
      nextPage: topics.length > 0 ? pageParam + 1 : undefined, // Передаємо наступну сторінку, якщо є ще дані
    };
  } catch (error) {
    console.error(error);
  }
};

export const deleteTopic = async id => {
  try {
    const res = await axios.delete(`${VITE_API_URL}/topics/${id}`);
    if (res.data.done) console.log("done");
  } catch (error) {
    console.error(error);
  } finally {
    setIsConfirmModalOpen(false);
    setTopicToDeleteId(null);
  }
};

export const createTopic = async (formData, token) => {
  const response = await axios.post(`${VITE_API_URL}/topics`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status !== 201) throw new Error("Failed to create topic");
  return response.data;
};
