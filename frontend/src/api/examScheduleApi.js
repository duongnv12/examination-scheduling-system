// frontend/src/api/examScheduleApi.js
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/exam-schedules";

export const getAllExamSchedules = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching exam schedules:", error);
    throw error;
  }
};

export const getExamScheduleById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exam schedule with ID ${id}:`, error);
    throw error;
  }
};

export const createExamSchedule = async (scheduleData) => {
  try {
    const response = await axios.post(API_BASE_URL, scheduleData);
    return response.data;
  } catch (error) {
    console.error("Error creating exam schedule:", error);
    throw error;
  }
};

export const updateExamSchedule = async (id, scheduleData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, scheduleData);
    return response.data;
  } catch (error) {
    console.error(`Error updating exam schedule with ID ${id}:`, error);
    throw error;
  }
};

export const deleteExamSchedule = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting exam schedule with ID ${id}:`, error);
    throw error;
  }
};
