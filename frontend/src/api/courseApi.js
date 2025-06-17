// frontend/src/api/courseApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/courses'; // Địa chỉ API Courses của backend

// Lấy tất cả môn học
export const getAllCourses = async () => {
    try {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
    }
};

// Lấy chi tiết môn học theo ID
export const getCourseById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching course with ID ${id}:`, error);
        throw error;
    }
};

// Tạo môn học mới
export const createCourse = async (courseData) => {
    try {
        const response = await axios.post(API_BASE_URL, courseData);
        return response.data;
    } catch (error) {
        console.error('Error creating course:', error);
        throw error;
    }
};

// Cập nhật môn học
export const updateCourse = async (id, courseData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/${id}`, courseData);
        return response.data;
    } catch (error) {
        console.error(`Error updating course with ID ${id}:`, error);
        throw error;
    }
};

// Xóa môn học
export const deleteCourse = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting course with ID ${id}:`, error);
        throw error;
    }
};