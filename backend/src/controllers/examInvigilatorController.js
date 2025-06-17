// backend/src/controllers/examInvigilatorController.js
const { ExamInvigilator, ExamSchedule, Faculty } = require('../models');
const { Op } = require('sequelize');

// 1. Get all exam invigilator assignments
exports.getAllExamInvigilators = async (req, res) => {
    try {
        const invigilators = await ExamInvigilator.findAll({
            include: [
                { model: ExamSchedule, attributes: ['exam_date', 'exam_slot', 'start_time', 'end_time'] },
                { model: Faculty, attributes: ['full_name', 'faculty_code'] }
            ]
        });
        res.status(200).json(invigilators);
    } catch (error) {
        console.error('Error fetching exam invigilator assignments:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách phân công giám thị.', error: error.message });
    }
};

// 2. Get exam invigilator assignment by ID
exports.getExamInvigilatorById = async (req, res) => {
    try {
        const { id } = req.params;
        const invigilator = await ExamInvigilator.findByPk(id, {
            include: [
                { model: ExamSchedule, attributes: ['exam_date', 'exam_slot', 'start_time', 'end_time'] },
                { model: Faculty, attributes: ['full_name', 'faculty_code'] }
            ]
        });

        if (!invigilator) {
            return res.status(404).json({ message: 'Không tìm thấy phân công giám thị.' });
        }
        res.status(200).json(invigilator);
    } catch (error) {
        console.error('Error fetching exam invigilator assignment by ID:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin phân công giám thị.', error: error.message });
    }
};

// 3. Create a new exam invigilator assignment
exports.createExamInvigilator = async (req, res) => {
    try {
        const { schedule_id, faculty_id, invigilator_order } = req.body;

        if (!schedule_id || !faculty_id || !invigilator_order) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ ID lịch thi, ID cán bộ/giảng viên và thứ tự giám thị (1 hoặc 2).' });
        }
        if (![1, 2].includes(invigilator_order)) {
            return res.status(400).json({ message: 'Thứ tự giám thị phải là 1 hoặc 2.' });
        }

        // Validate if schedule and faculty exist
        const scheduleExists = await ExamSchedule.findByPk(schedule_id);
        const facultyExists = await Faculty.findByPk(faculty_id);
        if (!scheduleExists) {
            return res.status(404).json({ message: 'Không tìm thấy lịch thi.' });
        }
        if (!facultyExists) {
            return res.status(404).json({ message: 'Không tìm thấy cán bộ/giảng viên.' });
        }

        // Check if the faculty member is already assigned to this schedule
        const existingAssignment = await ExamInvigilator.findOne({
            where: { schedule_id, faculty_id }
        });
        if (existingAssignment) {
            return res.status(409).json({ message: 'Cán bộ/giảng viên này đã được phân công cho lịch thi này.' });
        }

        // Check if this invigilator_order is already taken for this schedule
        const orderTaken = await ExamInvigilator.findOne({
            where: { schedule_id, invigilator_order }
        });
        if (orderTaken) {
            return res.status(409).json({ message: `Thứ tự giám thị ${invigilator_order} đã được phân công cho lịch thi này.` });
        }
        
        // --- Critical Check: Ensure faculty member is not busy in another exam at the same time ---
        // 1. Get schedule details for the requested schedule_id
        const currentSchedule = await ExamSchedule.findByPk(schedule_id);
        if (!currentSchedule) {
            return res.status(404).json({ message: 'Lịch thi không tồn tại.' });
        }

        // 2. Find any other schedules the faculty member is assigned to within the same date and time range
        const overlappingInvigilation = await ExamInvigilator.findOne({
            where: { faculty_id: faculty_id },
            include: [{
                model: ExamSchedule,
                where: {
                    exam_date: currentSchedule.exam_date,
                    [Op.or]: [
                        { // current schedule starts during other invigilation
                            start_time: {
                                [Op.gte]: currentSchedule.start_time,
                                [Op.lt]: currentSchedule.end_time
                            }
                        },
                        { // current schedule ends during other invigilation
                            end_time: {
                                [Op.gt]: currentSchedule.start_time,
                                [Op.lte]: currentSchedule.end_time
                            }
                        },
                        { // other invigilation entirely within current schedule
                            start_time: { [Op.lte]: currentSchedule.start_time },
                            end_time: { [Op.gte]: currentSchedule.end_time }
                        }
                    ],
                    schedule_id: { [Op.ne]: schedule_id } // Exclude the current schedule being assigned
                },
                required: true // Ensures the join is performed and conditions applied
            }]
        });

        if (overlappingInvigilation) {
            return res.status(400).json({ message: 'Cán bộ/giảng viên này đã bận coi thi lịch khác trong khoảng thời gian này.' });
        }
        
        // --- End of Critical Check ---

        const newInvigilatorAssignment = await ExamInvigilator.create({
            schedule_id,
            faculty_id,
            invigilator_order
        });
        res.status(201).json({ message: 'Phân công giám thị thành công!', assignment: newInvigilatorAssignment });
    } catch (error) {
        console.error('Error creating exam invigilator assignment:', error);
        res.status(500).json({ message: 'Lỗi khi tạo phân công giám thị.', error: error.message });
    }
};

// 4. Update exam invigilator assignment (e.g., change invigilator_order or faculty_id)
exports.updateExamInvigilator = async (req, res) => {
    try {
        const { id } = req.params;
        const { faculty_id, invigilator_order } = req.body;

        const assignment = await ExamInvigilator.findByPk(id);
        if (!assignment) {
            return res.status(404).json({ message: 'Không tìm thấy phân công giám thị để cập nhật.' });
        }

        // Check if new faculty_id exists
        if (faculty_id) {
            const facultyExists = await Faculty.findByPk(faculty_id);
            if (!facultyExists) {
                return res.status(404).json({ message: 'Không tìm thấy cán bộ/giảng viên mới.' });
            }
            // Check if new faculty_id is already assigned to this schedule
            const existingAssignmentForNewFaculty = await ExamInvigilator.findOne({
                where: { schedule_id: assignment.schedule_id, faculty_id: faculty_id }
            });
            if (existingAssignmentForNewFaculty && existingAssignmentForNewFaculty.exam_invigilator_id !== id) {
                 return res.status(409).json({ message: 'Cán bộ/giảng viên này đã được phân công cho lịch thi này.' });
            }
             // Re-check for overlapping schedules for the new faculty if faculty_id changed
             const currentSchedule = await ExamSchedule.findByPk(assignment.schedule_id);
             const overlappingInvigilation = await ExamInvigilator.findOne({
                 where: { faculty_id: faculty_id },
                 include: [{
                     model: ExamSchedule,
                     where: {
                         exam_date: currentSchedule.exam_date,
                         [Op.or]: [
                             { start_time: { [Op.gte]: currentSchedule.start_time, [Op.lt]: currentSchedule.end_time } },
                             { end_time: { [Op.gt]: currentSchedule.start_time, [Op.lte]: currentSchedule.end_time } },
                             { start_time: { [Op.lte]: currentSchedule.start_time }, end_time: { [Op.gte]: currentSchedule.end_time } }
                         ],
                         schedule_id: { [Op.ne]: assignment.schedule_id } // Exclude the current schedule being assigned
                     },
                     required: true
                 }]
             });
             if (overlappingInvigilation) {
                 return res.status(400).json({ message: 'Cán bộ/giảng viên mới đã bận coi thi lịch khác trong khoảng thời gian này.' });
             }
        }

        // Check if new invigilator_order is valid and available for this schedule
        if (invigilator_order !== undefined) {
            if (![1, 2].includes(invigilator_order)) {
                return res.status(400).json({ message: 'Thứ tự giám thị phải là 1 hoặc 2.' });
            }
            const orderTaken = await ExamInvigilator.findOne({
                where: { schedule_id: assignment.schedule_id, invigilator_order: invigilator_order }
            });
            if (orderTaken && orderTaken.exam_invigilator_id !== id) {
                return res.status(409).json({ message: `Thứ tự giám thị ${invigilator_order} đã được phân công cho lịch thi này.` });
            }
        }

        assignment.faculty_id = faculty_id || assignment.faculty_id;
        assignment.invigilator_order = invigilator_order !== undefined ? invigilator_order : assignment.invigilator_order;

        await assignment.save();
        res.status(200).json({ message: 'Phân công giám thị đã được cập nhật thành công!', assignment });
    } catch (error) {
        console.error('Error updating exam invigilator assignment:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật phân công giám thị.', error: error.message });
    }
};

// 5. Delete an exam invigilator assignment
exports.deleteExamInvigilator = async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await ExamInvigilator.findByPk(id);

        if (!assignment) {
            return res.status(404).json({ message: 'Không tìm thấy phân công giám thị để xóa.' });
        }

        await assignment.destroy();
        res.status(200).json({ message: 'Phân công giám thị đã được xóa thành công!' });
    } catch (error) {
        console.error('Error deleting exam invigilator assignment:', error);
        res.status(500).json({ message: 'Lỗi khi xóa phân công giám thị.', error: error.message });
    }
};