// frontend/src/api/facultyApi.js
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/faculty"; // Chú ý: URL là /api/faculty

export const getAllFaculty = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching faculty members:", error);
    throw error;
  }
};

export const getFacultyById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching faculty member with ID ${id}:`, error);
    throw error;
  }
};

export const createFaculty = async (facultyData) => {
  try {
    const response = await axios.post(API_BASE_URL, facultyData);
    return response.data;
  } catch (error) {
    console.error("Error creating faculty member:", error);
    throw error;
  }
};

export const updateFaculty = async (id, facultyData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, facultyData);
    return response.data;
  } catch (error) {
    console.error(`Error updating faculty member with ID ${id}:`, error);
    throw error;
  }
};

export const deleteFaculty = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting faculty member with ID ${id}:`, error);
    throw error;
  }
};
