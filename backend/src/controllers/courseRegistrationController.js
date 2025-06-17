// backend/src/controllers/courseRegistrationController.js
const { CourseRegistration, Student, Course } = require('../models');

// 1. Get all course registrations (with associated student and course info)
exports.getAllCourseRegistrations = async (req, res) => {
    try {
        const registrations = await CourseRegistration.findAll({
            include: [
                { model: Student, attributes: ['student_code', 'full_name'] },
                { model: Course, attributes: ['course_code', 'course_name'] }
            ]
        });
        res.status(200).json(registrations);
    } catch (error) {
        console.error('Error fetching course registrations:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đăng ký môn học.', error: error.message });
    }
};

// 2. Get course registration by ID
exports.getCourseRegistrationById = async (req, res) => {
    try {
        const { id } = req.params;
        const registration = await CourseRegistration.findByPk(id, {
            include: [
                { model: Student, attributes: ['student_code', 'full_name'] },
                { model: Course, attributes: ['course_code', 'course_name'] }
            ]
        });

        if (!registration) {
            return res.status(404).json({ message: 'Không tìm thấy đăng ký môn học.' });
        }
        res.status(200).json(registration);
    } catch (error) {
        console.error('Error fetching course registration by ID:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin đăng ký môn học.', error: error.message });
    }
};

// 3. Create a new course registration
exports.createCourseRegistration = async (req, res) => {
    try {
        const { student_id, course_id, semester } = req.body;

        if (!student_id || !course_id || !semester) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ ID sinh viên, ID môn học và học kỳ.' });
        }

        // Optional: Verify if student_id and course_id exist
        const studentExists = await Student.findByPk(student_id);
        const courseExists = await Course.findByPk(course_id);
        if (!studentExists) {
            return res.status(404).json({ message: `Không tìm thấy sinh viên với ID: ${student_id}.` });
        }
        if (!courseExists) {
            return res.status(404).json({ message: `Không tìm thấy môn học với ID: ${course_id}.` });
        }

        const newRegistration = await CourseRegistration.create({
            student_id,
            course_id,
            semester
        });

        // Tăng tổng số sinh viên đăng ký của môn học
        await Course.increment('total_students_registered', { by: 1, where: { course_id: course_id } });


        res.status(201).json({ message: 'Đăng ký môn học đã được tạo thành công!', registration: newRegistration });
    } catch (error) {
        console.error('Error creating course registration:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Sinh viên đã đăng ký môn học này trong học kỳ này.' });
        }
        res.status(500).json({ message: 'Lỗi khi tạo đăng ký môn học mới.', error: error.message });
    }
};

// 4. Update course registration (limited fields usually)
exports.updateCourseRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const { semester } = req.body; // Typically, student_id and course_id are not changed

        const registration = await CourseRegistration.findByPk(id);
        if (!registration) {
            return res.status(404).json({ message: 'Không tìm thấy đăng ký môn học để cập nhật.' });
        }

        if (semester) {
            registration.semester = semester;
            await registration.save();
            res.status(200).json({ message: 'Đăng ký môn học đã được cập nhật thành công!', registration });
        } else {
            return res.status(400).json({ message: 'Không có thông tin để cập nhật.' });
        }
    } catch (error) {
        console.error('Error updating course registration:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Thông tin đăng ký mới trùng lặp với một đăng ký khác.' });
        }
        res.status(500).json({ message: 'Lỗi khi cập nhật đăng ký môn học.', error: error.message });
    }
};

// 5. Delete a course registration
exports.deleteCourseRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const registration = await CourseRegistration.findByPk(id);

        if (!registration) {
            return res.status(404).json({ message: 'Không tìm thấy đăng ký môn học để xóa.' });
        }

        const courseId = registration.course_id; // Get course ID before deleting

        await registration.destroy();

        // Giảm tổng số sinh viên đăng ký của môn học
        await Course.decrement('total_students_registered', { by: 1, where: { course_id: courseId } });

        res.status(200).json({ message: 'Đăng ký môn học đã được xóa thành công!' });
    } catch (error) {
        console.error('Error deleting course registration:', error);
        res.status(500).json({ message: 'Lỗi khi xóa đăng ký môn học.', error: error.message });
    }
};