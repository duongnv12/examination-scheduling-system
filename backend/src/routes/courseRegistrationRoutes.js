// backend/src/routes/courseRegistrationRoutes.js
const express = require('express');
const router = express.Router();
const courseRegistrationController = require('../controllers/courseRegistrationController');
const upload = require('../middleware/upload'); // Import middleware upload

// Các routes CRUD cơ bản
router.route('/')
    .get(courseRegistrationController.getAllCourseRegistrations) // GET /api/course-registrations
    .post(courseRegistrationController.createCourseRegistration); // POST /api/course-registrations

// Lưu ý: Đối với CourseRegistration, chúng ta không có PUT theo ID vì đây là bảng Many-to-Many.
// Việc cập nhật thường là xóa và tạo lại hoặc không cần thiết nếu dữ liệu chỉ là liên kết.
// Ở đây, chúng ta chỉ cung cấp GET và DELETE cho từng đăng ký cụ thể.
router.route('/:id')
    .get(courseRegistrationController.getCourseRegistrationById) // GET /api/course-registrations/:id
    // DÒNG NÀY ĐÃ BỊ XÓA HOẶC COMMENT
    // .put(courseRegistrationController.updateCourseRegistration) // <--- XÓA DÒNG NÀY
    .delete(courseRegistrationController.deleteCourseRegistration); // DELETE /api/course-registrations/:id

// Route cho việc Import từ Excel
router.post('/import', upload.single('file'), courseRegistrationController.importCourseRegistrations); // POST /api/course-registrations/import

module.exports = router;