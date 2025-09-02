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
const deleteFile = async (query = {}) => {
  try {
    const queryString = new URLSearchParams(query).toString();
    const response = await axiosClient.delete(`/api/files?${queryString}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

// Download a file
const downloadFile = async (query = {}) => {
  try {
    const queryString = new URLSearchParams(query).toString();
    const url = queryString
      ? `/api/files/download?${queryString}`
      : "/api/files/download";

    const response = await axiosClient.get(url, {
      responseType: "blob", // Important for file downloads
    });

    // Get filename from Content-Disposition header or use a default
    const contentDisposition = response.headers["content-disposition"];
    let filename = "download";

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Create blob URL and trigger download
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return { success: true, filename };
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};

export { uploadFile, getFile, updateFile, deleteFile, downloadFile };
