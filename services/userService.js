import axiosClient from "./axiosBase";

export const createUser = async (userData) => {
  try {
    const response = await axiosClient.post("/api/users", userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const getUser = async (query = {}) => {
  try {
    const queryString = new URLSearchParams(query).toString();
    const url = queryString ? `/api/users?${queryString}` : "/api/users";
    console.log(url);
    const response = await axiosClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const updateUser = async (query = {}, userData) => {
  try {
    if (Object.keys(query).length === 0) {
      throw new Error("Query parameters are required to update user");
    }
    const queryString = new URLSearchParams(query).toString();
    const url = queryString ? `/api/users?${queryString}` : "/api/users";
    const response = await axiosClient.put(url, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUser = async (query = {}) => {
  try {
    if (Object.keys(query).length === 0) {
      throw new Error("Query parameters are required to delete user");
    }
    const queryString = new URLSearchParams(query).toString();
    const url = queryString ? `/api/users?${queryString}` : "/api/users";
    const response = await axiosClient.delete(url);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
