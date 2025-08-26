import axiosClient from "./axiosBase";

export const createDiscussion = async (discussionData) => {
  try {
    const response = await axiosClient.post("/api/discussions", discussionData);
    return response.data;
  } catch (error) {
    console.error("Error creating discussion:", error);
    throw error;
  }
};

export const getDiscussions = async (query = {}) => {
  try {
    const queryString = new URLSearchParams(query).toString();
    const url = queryString
      ? `/api/discussions?${queryString}`
      : "/api/discussions";
    const response = await axiosClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching discussions:", error);
    throw error;
  }
};

export const updateDiscussion = async (query = {}, discussionData) => {
  try {
    const queryString = new URLSearchParams(query).toString();
    const url = queryString
      ? `/api/discussions?${queryString}`
      : "/api/discussions";
    const response = await axiosClient.put(url, discussionData);
    return response.data;
  } catch (error) {
    console.error("Error updating discussion:", error);
    throw error;
  }
};

export const deleteDiscussion = async (query = {}) => {
  try {
    const queryString = new URLSearchParams(query).toString();
    const url = queryString
      ? `/api/discussions?${queryString}`
      : "/api/discussions";
    const response = await axiosClient.delete(url);
    return response.data;
  } catch (error) {
    console.error("Error deleting discussion:", error);
    throw error;
  }
};
