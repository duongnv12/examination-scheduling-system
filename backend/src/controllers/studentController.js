// backend/src/controllers/studentController.js
const { Student, CourseRegistration, ExamSchedule } = require('../models'); // Import Student, and others for foreign key checks

// 1. Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.findAll();
        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sinh viên.', error: error.message });
    }
};

// 2. Get student by ID
exports.getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findByPk(id);

        if (!student) {
            return res.status(404).json({ message: 'Không tìm thấy sinh viên.' });
        }
        res.status(200).json(student);
    } catch (error) {
        console.error('Error fetching student by ID:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin sinh viên.', error: error.message });
    }
};

// 3. Create a new student
exports.createStudent = async (req, res) => {
    try {
        const { student_code, full_name, date_of_birth, class_name } = req.body;

        if (!student_code || !full_name) {
            return res.status(400).json({ message: 'Vui lòng cung cấp mã sinh viên và họ tên.' });
        }

        const newStudent = await Student.create({
            student_code,
            full_name,
            date_of_birth,
            class_name
        });
        res.status(201).json({ message: 'Sinh viên đã được tạo thành công!', student: newStudent });
    } catch (error) {
        console.error('Error creating student:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Mã sinh viên đã tồn tại.' });
        }
        res.status(500).json({ message: 'Lỗi khi tạo sinh viên mới.', error: error.message });
    }
};

// 4. Update student information
exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { student_code, full_name, date_of_birth, class_name } = req.body;

        const student = await Student.findByPk(id);
        if (!student) {
            return res.status(404).json({ message: 'Không tìm thấy sinh viên để cập nhật.' });
        }

        student.student_code = student_code || student.student_code;
        student.full_name = full_name || student.full_name;
        student.date_of_birth = date_of_birth !== undefined ? date_of_birth : student.date_of_birth;
        student.class_name = class_name !== undefined ? class_name : student.class_name;

        await student.save();

        res.status(200).json({ message: 'Thông tin sinh viên đã được cập nhật thành công!', student });
    } catch (error) {
        console.error('Error updating student:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Mã sinh viên đã tồn tại.' });
        }
        res.status(500).json({ message: 'Lỗi khi cập nhật thông tin sinh viên.', error: error.message });
    }
};

// 5. Delete a student
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findByPk(id);

        if (!student) {
            return res.status(404).json({ message: 'Không tìm thấy sinh viên để xóa.' });
        }

        // Check for related CourseRegistrations
        const hasRegistrations = await CourseRegistration.count({ where: { student_id: id } });
        if (hasRegistrations > 0) {
            return res.status(400).json({ message: 'Không thể xóa sinh viên này vì có dữ liệu đăng ký môn học liên quan.' });
        }

        await student.destroy();
        res.status(200).json({ message: 'Sinh viên đã được xóa thành công!' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Lỗi khi xóa sinh viên.', error: error.message });
    }
};