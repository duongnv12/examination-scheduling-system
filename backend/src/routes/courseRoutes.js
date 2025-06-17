// backend/src/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Route để lấy tất cả các môn học
router.get('/', courseController.getAllCourses);

// Route để lấy thông tin chi tiết một môn học bằng ID
router.get('/:id', courseController.getCourseById);

// Route để tạo môn học mới
router.post('/', courseController.createCourse);

// Route để cập nhật thông tin môn học
router.put('/:id', courseController.updateCourse);

// Route để xóa một môn học
router.delete('/:id', courseController.deleteCourse);

module.exports = router;