// backend/src/controllers/courseController.js
const { Course } = require('../models'); // Import Course model

// 1. Lấy danh sách tất cả các môn học
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.findAll();
        res.status(200).json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách môn học.', error: error.message });
    }
};

// 2. Lấy thông tin chi tiết một môn học bằng ID
exports.getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findByPk(id); // Tìm theo Primary Key (course_id)

        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy môn học.' });
        }
        res.status(200).json(course);
    } catch (error) {
        console.error('Error fetching course by ID:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin môn học.', error: error.message });
    }
};

// 3. Tạo môn học mới
exports.createCourse = async (req, res) => {
    try {
        const { course_code, course_name, credits, exam_duration_minutes, exam_format } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!course_code || !course_name || !credits || !exam_duration_minutes || !exam_format) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin môn học.' });
        }

        const newCourse = await Course.create({
            course_code,
            course_name,
            credits,
            exam_duration_minutes,
            exam_format
        });
        res.status(201).json({ message: 'Môn học đã được tạo thành công!', course: newCourse });
    } catch (error) {
        console.error('Error creating course:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Mã môn học đã tồn tại.' });
        }
        res.status(500).json({ message: 'Lỗi khi tạo môn học mới.', error: error.message });
    }
};

// 4. Cập nhật thông tin môn học
exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { course_code, course_name, credits, exam_duration_minutes, exam_format, total_students_registered } = req.body;

        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy môn học để cập nhật.' });
        }

        // Cập nhật các trường
        course.course_code = course_code || course.course_code;
        course.course_name = course_name || course.course_name;
        course.credits = credits || course.credits;
        course.exam_duration_minutes = exam_duration_minutes || course.exam_duration_minutes;
        course.exam_format = exam_format || course.exam_format;
        course.total_students_registered = total_students_registered !== undefined ? total_students_registered : course.total_students_registered;


        await course.save(); // Lưu thay đổi vào DB

        res.status(200).json({ message: 'Môn học đã được cập nhật thành công!', course });
    } catch (error) {
        console.error('Error updating course:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Mã môn học đã tồn tại.' });
        }
        res.status(500).json({ message: 'Lỗi khi cập nhật môn học.', error: error.message });
    }
};

// 5. Xóa một môn học
exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findByPk(id);

        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy môn học để xóa.' });
        }

        await course.destroy(); // Xóa môn học khỏi DB

        res.status(200).json({ message: 'Môn học đã được xóa thành công!' });
    } catch (error) {
        console.error('Error deleting course:', error);
        // Kiểm tra nếu có ràng buộc khóa ngoại (foreign key constraint)
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ message: 'Không thể xóa môn học này vì có dữ liệu liên quan (ví dụ: sinh viên đã đăng ký môn này hoặc môn này đã có trong lịch thi).', error: error.message });
        }
        res.status(500).json({ message: 'Lỗi khi xóa môn học.', error: error.message });
    }
};