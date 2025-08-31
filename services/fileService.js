import axiosClient from "./axiosBase";

// Upload a file
const uploadFile = async (fileData) => {
  const formData = new FormData();

  // Append the file
  formData.append("file", fileData.file);

  // Create query parameters for userName and teamName
  const queryParams = new URLSearchParams({
    userName: fileData.userName,
    teamName: fileData.teamName,
  });

  try {
    const response = await axiosClient.post(
      `/api/files?${queryParams}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Get files
const getFile = async (query = {}) => {
  try {
    const queryString = new URLSearchParams(query).toString();
    const url = queryString ? `/api/files?${queryString}` : "/api/files";
    const response = await axiosClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error;
  }
};

// Update file metadata
const updateFile = async (fileId, updateData) => {
  try {
    const response = await axiosClient.put(`/api/files/${fileId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating file:", error);
    throw error;
  }
};

// Delete a file
const deleteFile = async (fileId) => {
  try {
    const response = await axiosClient.delete(`/api/files/${fileId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

export { uploadFile, getFile, updateFile, deleteFile };
