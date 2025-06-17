// backend/src/controllers/facultyController.js
const { Faculty, ExamInvigilator } = require('../models');

// 1. Get all faculty members
exports.getAllFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findAll();
        res.status(200).json(faculty);
    } catch (error) {
        console.error('Error fetching faculty members:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách cán bộ/giảng viên.', error: error.message });
    }
};

// 2. Get faculty member by ID
exports.getFacultyById = async (req, res) => {
    try {
        const { id } = req.params;
        const facultyMember = await Faculty.findByPk(id);

        if (!facultyMember) {
            return res.status(404).json({ message: 'Không tìm thấy cán bộ/giảng viên.' });
        }
        res.status(200).json(facultyMember);
    } catch (error) {
        console.error('Error fetching faculty member by ID:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin cán bộ/giảng viên.', error: error.message });
    }
};

// 3. Create a new faculty member
exports.createFaculty = async (req, res) => {
    try {
        const { faculty_code, full_name, department, is_available_for_invigilation } = req.body;

        if (!faculty_code || !full_name) {
            return res.status(400).json({ message: 'Vui lòng cung cấp mã và họ tên cán bộ/giảng viên.' });
        }

        const newFaculty = await Faculty.create({
            faculty_code,
            full_name,
            department,
            is_available_for_invigilation
        });
        res.status(201).json({ message: 'Cán bộ/giảng viên đã được tạo thành công!', faculty: newFaculty });
    } catch (error) {
        console.error('Error creating faculty member:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Mã cán bộ/giảng viên đã tồn tại.' });
        }
        res.status(500).json({ message: 'Lỗi khi tạo cán bộ/giảng viên mới.', error: error.message });
    }
};

// 4. Update faculty member information
exports.updateFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const { faculty_code, full_name, department, is_available_for_invigilation } = req.body;

        const facultyMember = await Faculty.findByPk(id);
        if (!facultyMember) {
            return res.status(404).json({ message: 'Không tìm thấy cán bộ/giảng viên để cập nhật.' });
        }

        facultyMember.faculty_code = faculty_code || facultyMember.faculty_code;
        facultyMember.full_name = full_name || facultyMember.full_name;
        facultyMember.department = department !== undefined ? department : facultyMember.department;
        facultyMember.is_available_for_invigilation = is_available_for_invigilation !== undefined ? is_available_for_invigilation : facultyMember.is_available_for_invigilation;

        await facultyMember.save();

        res.status(200).json({ message: 'Thông tin cán bộ/giảng viên đã được cập nhật thành công!', faculty: facultyMember });
    } catch (error) {
        console.error('Error updating faculty member:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Mã cán bộ/giảng viên đã tồn tại.' });
        }
        res.status(500).json({ message: 'Lỗi khi cập nhật thông tin cán bộ/giảng viên.', error: error.message });
    }
};

// 5. Delete a faculty member
exports.deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const facultyMember = await Faculty.findByPk(id);

        if (!facultyMember) {
            return res.status(404).json({ message: 'Không tìm thấy cán bộ/giảng viên để xóa.' });
        }

        // Check for related ExamInvigilators
        const hasInvigilatorAssignments = await ExamInvigilator.count({ where: { faculty_id: id } });
        if (hasInvigilatorAssignments > 0) {
            return res.status(400).json({ message: 'Không thể xóa cán bộ/giảng viên này vì có dữ liệu phân công coi thi liên quan.' });
        }

        await facultyMember.destroy();
        res.status(200).json({ message: 'Cán bộ/giảng viên đã được xóa thành công!' });
    } catch (error) {
        console.error('Error deleting faculty member:', error);
        res.status(500).json({ message: 'Lỗi khi xóa cán bộ/giảng viên.', error: error.message });
    }
};