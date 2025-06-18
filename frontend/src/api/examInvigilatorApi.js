// frontend/src/api/examInvigilatorApi.js
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/exam-invigilators";

export const getAllExamInvigilators = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching exam invigilators:", error);
    throw error;
  }
};

export const getExamInvigilatorById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exam invigilator with ID ${id}:`, error);
    throw error;
  }
};

export const createExamInvigilator = async (invigilatorData) => {
  try {
    const response = await axios.post(API_BASE_URL, invigilatorData);
    return response.data;
  } catch (error) {
    console.error("Error creating exam invigilator:", error);
    throw error;
  }
};

export const updateExamInvigilator = async (id, invigilatorData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, invigilatorData);
    return response.data;
  } catch (error) {
    console.error(`Error updating exam invigilator with ID ${id}:`, error);
    throw error;
  }
};

export const deleteExamInvigilator = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting exam invigilator with ID ${id}:`, error);
    throw error;
  }
};
