// backend/src/controllers/examScheduleController.js
const { ExamSchedule, Course, Room, ExamInvigilator, Faculty } = require('../models');
const { Op } = require('sequelize'); // For advanced queries like date ranges

// 1. Get all exam schedules (with associated course and room info)
exports.getAllExamSchedules = async (req, res) => {
    try {
        const schedules = await ExamSchedule.findAll({
            include: [
                { model: Course, attributes: ['course_code', 'course_name', 'exam_format'] },
                { model: Room, attributes: ['room_name', 'capacity', 'room_type'] },
                { model: ExamInvigilator, include: [{ model: Faculty, attributes: ['full_name', 'faculty_code'] }] }
            ]
        });
        res.status(200).json(schedules);
    } catch (error) {
        console.error('Error fetching exam schedules:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách lịch thi.', error: error.message });
    }
};

// 2. Get exam schedule by ID
exports.getExamScheduleById = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await ExamSchedule.findByPk(id, {
            include: [
                { model: Course, attributes: ['course_code', 'course_name', 'exam_format'] },
                { model: Room, attributes: ['room_name', 'capacity', 'room_type'] },
                { model: ExamInvigilator, include: [{ model: Faculty, attributes: ['full_name', 'faculty_code'] }] }
            ]
        });

        if (!schedule) {
            return res.status(404).json({ message: 'Không tìm thấy lịch thi.' });
        }
        res.status(200).json(schedule);
    } catch (error) {
        console.error('Error fetching exam schedule by ID:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin lịch thi.', error: error.message });
    }
};

// 3. Create a new exam schedule (manual creation, not automated scheduling)
exports.createExamSchedule = async (req, res) => {
    try {
        const { course_id, room_id, exam_date, exam_slot, start_time, end_time, scheduled_students_count } = req.body;

        if (!course_id || !room_id || !exam_date || !exam_slot || !start_time || !end_time || !scheduled_students_count) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin lịch thi.' });
        }
        if (scheduled_students_count <= 0) {
            return res.status(400).json({ message: 'Số lượng sinh viên phải lớn hơn 0.' });
        }

        // Basic validation: Check if room capacity is sufficient
        const room = await Room.findByPk(room_id);
        if (!room) {
            return res.status(404).json({ message: 'Không tìm thấy phòng thi.' });
        }
        if (scheduled_students_count > room.capacity) {
            return res.status(400).json({ message: `Số lượng sinh viên (${scheduled_students_count}) vượt quá sức chứa của phòng (${room.capacity}).` });
        }

        // Basic validation: Check if exam format matches room type
        const course = await Course.findByPk(course_id);
        if (!course) {
            return res.status(404).json({ message: 'Không tìm thấy môn học.' });
        }
        // Example logic: if course needs 'Trắc nghiệm', room must be 'Phòng máy tính'
        if (course.exam_format === 'Trắc nghiệm' && room.room_type !== 'Phòng máy tính') {
             return res.status(400).json({ message: 'Môn thi trắc nghiệm phải được xếp vào phòng máy tính.' });
        }


        const newSchedule = await ExamSchedule.create({
            course_id,
            room_id,
            exam_date,
            exam_slot,
            start_time,
            end_time,
            scheduled_students_count
        });
        res.status(201).json({ message: 'Lịch thi đã được tạo thành công!', schedule: newSchedule });
    } catch (error) {
        console.error('Error creating exam schedule:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Lịch thi đã bị trùng lặp (Phòng/Môn học đã được sử dụng trong ca này).' });
        }
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: error.message, error: error.errors });
        }
        res.status(500).json({ message: 'Lỗi khi tạo lịch thi mới.', error: error.message });
    }
};

// 4. Update exam schedule information
exports.updateExamSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { course_id, room_id, exam_date, exam_slot, start_time, end_time, scheduled_students_count } = req.body;

        const schedule = await ExamSchedule.findByPk(id);
        if (!schedule) {
            return res.status(404).json({ message: 'Không tìm thấy lịch thi để cập nhật.' });
        }

        // Update fields
        schedule.course_id = course_id || schedule.course_id;
        schedule.room_id = room_id || schedule.room_id;
        schedule.exam_date = exam_date || schedule.exam_date;
        schedule.exam_slot = exam_slot || schedule.exam_slot;
        schedule.start_time = start_time || schedule.start_time;
        schedule.end_time = end_time || schedule.end_time;
        schedule.scheduled_students_count = scheduled_students_count || schedule.scheduled_students_count;

        // Re-validate against room capacity and type if room_id or scheduled_students_count changed
        if (room_id || scheduled_students_count) {
            const room = await Room.findByPk(schedule.room_id); // Use updated room_id
            if (!room) return res.status(404).json({ message: 'Phòng thi không tồn tại.' });
            if (schedule.scheduled_students_count > room.capacity) {
                return res.status(400).json({ message: `Số lượng sinh viên (${schedule.scheduled_students_count}) vượt quá sức chứa của phòng (${room.capacity}).` });
            }

            const course = await Course.findByPk(schedule.course_id); // Use updated course_id
            if (!course) return res.status(404).json({ message: 'Môn học không tồn tại.' });
            if (course.exam_format === 'Trắc nghiệm' && room.room_type !== 'Phòng máy tính') {
                return res.status(400).json({ message: 'Môn thi trắc nghiệm phải được xếp vào phòng máy tính.' });
            }
        }


        await schedule.save();

        res.status(200).json({ message: 'Lịch thi đã được cập nhật thành công!', schedule });
    } catch (error) {
        console.error('Error updating exam schedule:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Lịch thi đã bị trùng lặp (Phòng/Môn học đã được sử dụng trong ca này).' });
        }
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: error.message, error: error.errors });
        }
        res.status(500).json({ message: 'Lỗi khi cập nhật lịch thi.', error: error.message });
    }
};

// 5. Delete an exam schedule
exports.deleteExamSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await ExamSchedule.findByPk(id);

        if (!schedule) {
            return res.status(404).json({ message: 'Không tìm thấy lịch thi để xóa.' });
        }

        // Before deleting, check if there are associated invigilators
        const hasInvigilators = await ExamInvigilator.count({ where: { schedule_id: id } });
        if (hasInvigilators > 0) {
            return res.status(400).json({ message: 'Không thể xóa lịch thi này vì có giám thị được phân công. Vui lòng xóa phân công giám thị trước.' });
        }

        await schedule.destroy();
        res.status(200).json({ message: 'Lịch thi đã được xóa thành công!' });
    } catch (error) {
        console.error('Error deleting exam schedule:', error);
        res.status(500).json({ message: 'Lỗi khi xóa lịch thi.', error: error.message });
    }
};