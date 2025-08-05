import axiosClient from "./axiosBase";

export const createTeam = async (teamData) => {
  try {
    const response = await axiosClient.post("/api/teams", teamData);
    return response.data;
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
};

export const getTeam = async (query = {}) => {
  try {
    const queryString = new URLSearchParams(query).toString();
    const url = queryString ? `/api/teams?${queryString}` : "/api/teams";
    const response = await axiosClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw error;
  }
};

export const updateTeam = async (query = {}, teamData) => {
  try {
    if (Object.keys(query).length === 0) {
      throw new Error("Query parameters are required to update team");
    }
    const queryString = new URLSearchParams(query).toString();
    const url = queryString ? `/api/teams?${queryString}` : "/api/teams";
    const response = await axiosClient.put(url, teamData);
    return response.data;
  } catch (error) {
    console.error("Error updating team:", error);
    throw error;
  }
};

export const deleteTeam = async (query = {}) => {
  try {
    if (Object.keys(query).length === 0) {
      throw new Error("Query parameters are required to delete team");
    }
    const queryString = new URLSearchParams(query).toString();
    const url = queryString ? `/api/teams?${queryString}` : "/api/teams";
    const response = await axiosClient.delete(url);
    return response.data;
  } catch (error) {
    console.error("Error deleting team:", error);
    throw error;
  }
};
