// frontend/src/api/courseRegistrationApi.js
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/course-registrations"; // Chú ý: URL

export const getAllCourseRegistrations = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching course registrations:", error);
    throw error;
  }
};

export const getCourseRegistrationById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching course registration with ID ${id}:`, error);
    throw error;
  }
};

export const createCourseRegistration = async (registrationData) => {
  try {
    const response = await axios.post(API_BASE_URL, registrationData);
    return response.data;
  } catch (error) {
    console.error("Error creating course registration:", error);
    throw error;
  }
};

export const updateCourseRegistration = async (id, registrationData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, registrationData);
    return response.data;
  } catch (error) {
    console.error(`Error updating course registration with ID ${id}:`, error);
    throw error;
  }
};

export const deleteCourseRegistration = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting course registration with ID ${id}:`, error);
    throw error;
  }
};
