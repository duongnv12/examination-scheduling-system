// backend/src/controllers/examScheduleController.js
const {
  ExamSchedule,
  ExamInvigilator,
  Course,
  Room,
  Lecturer,
} = require("../models");
const generateExamSchedule = require("../services/scheduleGenerator"); // Import service đã tạo
const { Op } = require("sequelize");

// @desc    Get all exam schedules (with details)
// @route   GET /api/exam-schedules
// @access  Public
exports.getAllExamSchedules = async (req, res) => {
  try {
    const schedules = await ExamSchedule.findAll({
      include: [
        {
          model: Course,
          as: "Course",
          attributes: [
            "course_code",
            "course_name",
            "credits",
            "exam_duration_minutes",
          ],
        },
        {
          model: Room,
          as: "Room",
          attributes: ["room_name", "capacity", "room_type"],
        },
        {
          model: ExamInvigilator,
          as: "ExamInvigilators",
          include: {
            model: Lecturer,
            as: "Lecturer",
            attributes: ["full_name", "lecturer_code"],
          },
          attributes: ["invigilator_order", "role"],
        },
      ],
      order: [
        ["exam_date", "ASC"],
        ["start_time", "ASC"],
      ],
    });
    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách lịch thi:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách lịch thi.",
      error: error.message,
    });
  }
};

// @desc    Get single exam schedule by ID
// @route   GET /api/exam-schedules/:id
// @access  Public
exports.getExamScheduleById = async (req, res) => {
  try {
    const schedule = await ExamSchedule.findByPk(req.params.id, {
      include: [
        {
          model: Course,
          as: "Course",
          attributes: [
            "course_code",
            "course_name",
            "credits",
            "exam_duration_minutes",
          ],
        },
        {
          model: Room,
          as: "Room",
          attributes: ["room_name", "capacity", "room_type"],
        },
        {
          model: ExamInvigilator,
          as: "ExamInvigilators",
          include: {
            model: Lecturer,
            as: "Lecturer",
            attributes: ["full_name", "lecturer_code"],
          },
          attributes: ["invigilator_order", "role"],
        },
      ],
    });
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy lịch thi với ID ${req.params.id}`,
      });
    }
    res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin lịch thi ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin lịch thi.",
      error: error.message,
    });
  }
};

// @desc    Delete an exam schedule
// @route   DELETE /api/exam-schedules/:id
// @access  Private (Admin)
exports.deleteExamSchedule = async (req, res) => {
  const transaction = await ExamSchedule.sequelize.transaction();
  try {
    const { id } = req.params;

    const schedule = await ExamSchedule.findByPk(id, { transaction });
    if (!schedule) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy lịch thi với ID ${id} để xóa.`,
      });
    }

    // Xóa các phân công giám thị liên quan trước
    await ExamInvigilator.destroy({
      where: { schedule_id: id },
      transaction,
    });
    console.log(`Đã xóa phân công giám thị cho lịch thi ID: ${id}`);

    // Sau đó xóa lịch thi
    const deletedRows = await schedule.destroy({ transaction });

    if (deletedRows === 0) {
      // Should not happen if schedule was found
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy lịch thi với ID ${id} để xóa.`,
      });
    }

    await transaction.commit();
    res.status(200).json({
      success: true,
      message: "Xóa lịch thi và phân công giám thị liên quan thành công.",
    });
  } catch (error) {
    await transaction.rollback();
    console.error(`Lỗi khi xóa lịch thi ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Không thể xóa lịch thi.",
      error: error.message,
    });
  }
};

// @desc    Generate exam schedule
// @route   POST /api/exam-schedules/generate
// @access  Private (Admin)
exports.generateSchedule = async (req, res) => {
  const { startDate, endDate, examSlotsPerDay, examType, semester } = req.body;

  if (!startDate || !endDate || !examSlotsPerDay || !examType || !semester) {
    return res.status(400).json({
      success: false,
      message:
        "Vui lòng cung cấp đầy đủ startDate, endDate, examSlotsPerDay, examType và semester.",
    });
  }

  // Kiểm tra định dạng ngày
  if (isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
    return res
      .status(400)
      .json({ success: false, message: "Định dạng ngày không hợp lệ." });
  }

  if (new Date(startDate) > new Date(endDate)) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Ngày bắt đầu không thể lớn hơn ngày kết thúc.",
      });
  }

  if (![1, 2, 3, 4, 5, 6].includes(examSlotsPerDay)) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Số ca thi mỗi ngày không hợp lệ. Vui lòng chọn 1-6.",
      });
  }

  try {
    console.log(
      `API gọi tạo lịch thi cho học kỳ ${semester}, loại ${examType} từ ${startDate} đến ${endDate}`
    );
    const result = await generateExamSchedule(
      startDate,
      endDate,
      examSlotsPerDay,
      examType,
      semester
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: `Tạo lịch thi thành công. ${result.scheduled_courses_count} / ${result.total_courses_to_schedule} môn đã được xếp lịch.`,
        data: {
          scheduled_courses_count: result.scheduled_courses_count,
          total_courses_to_schedule: result.total_courses_to_schedule,
          unscheduled_courses_count: result.unscheduled_courses_count,
          unscheduled_courses: result.unscheduled_courses,
          errors: result.errors,
          scheduled_exams: result.scheduled_exams,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Tạo lịch thi hoàn tất nhưng có lỗi. ${result.unscheduled_courses_count} môn không xếp được lịch.`,
        data: {
          scheduled_courses_count: result.scheduled_courses_count,
          total_courses_to_schedule: result.total_courses_to_schedule,
          unscheduled_courses_count: result.unscheduled_courses_count,
          unscheduled_courses: result.unscheduled_courses,
          errors: result.errors,
          scheduled_exams: result.scheduled_exams, // Vẫn trả về các lịch đã xếp nếu có
        },
      });
    }
  } catch (error) {
    console.error("Lỗi khi gọi tạo lịch thi:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi trong quá trình tạo lịch thi.",
      error: error.message,
    });
  }
};

// @desc    Manually create an exam schedule entry (Admin only, use with caution)
// @route   POST /api/exam-schedules/manual
// @access  Private (Admin)
exports.manualCreateExamSchedule = async (req, res) => {
  try {
    const {
      course_id,
      room_id,
      exam_date,
      start_time,
      end_time,
      exam_slot,
      scheduled_students_count,
      semester,
      exam_type,
      invigilator_ids,
    } = req.body;

    // Basic validation for required fields
    if (
      !course_id ||
      !room_id ||
      !exam_date ||
      !start_time ||
      !end_time ||
      !exam_slot ||
      !semester ||
      !exam_type ||
      !scheduled_students_count
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Missing required fields for manual schedule creation.",
        });
    }

    // Validate existence of foreign keys
    const course = await Course.findByPk(course_id);
    const room = await Room.findByPk(room_id);
    if (!course)
      return res
        .status(400)
        .json({
          success: false,
          message: `Course with ID ${course_id} not found.`,
        });
    if (!room)
      return res
        .status(400)
        .json({
          success: false,
          message: `Room with ID ${room_id} not found.`,
        });

    // Check for slot availability manually (optional but recommended)
    const existingSchedule = await ExamSchedule.findOne({
      where: {
        exam_date: exam_date,
        room_id: room_id,
        exam_slot: exam_slot,
      },
    });
    if (existingSchedule) {
      return res
        .status(409)
        .json({
          success: false,
          message:
            "This room is already scheduled for another exam at this date and slot.",
        });
    }

    const newSchedule = await ExamSchedule.create({
      course_id,
      room_id,
      exam_date,
      start_time,
      end_time,
      exam_slot,
      scheduled_students_count,
      semester,
      exam_type,
    });

    // Handle invigilators if provided
    if (
      invigilator_ids &&
      Array.isArray(invigilator_ids) &&
      invigilator_ids.length > 0
    ) {
      const invigilatorAssignments = [];
      for (let i = 0; i < invigilator_ids.length; i++) {
        const lecturer_id = invigilator_ids[i];
        const lecturer = await Lecturer.findByPk(lecturer_id);
        if (!lecturer) {
          console.warn(
            `Lecturer ID ${lecturer_id} not found for manual assignment to schedule ${newSchedule.schedule_id}. Skipping.`
          );
          // Optionally, you might want to return an error or still create the schedule without this invigilator.
          // For now, we'll just warn and skip this specific invigilator.
          continue;
        }
        invigilatorAssignments.push({
          schedule_id: newSchedule.schedule_id,
          lecturer_id: lecturer_id,
          invigilator_order: i + 1,
          role: `Giám thị ${i + 1}`,
        });
      }
      if (invigilatorAssignments.length > 0) {
        await ExamInvigilator.bulkCreate(invigilatorAssignments);
      }
    }

    res.status(201).json({
      success: true,
      message: "Tạo lịch thi thủ công thành công.",
      data: newSchedule,
    });
  } catch (error) {
    console.error("Lỗi khi tạo lịch thi thủ công:", error);
    res.status(500).json({
      success: false,
      message: "Không thể tạo lịch thi thủ công.",
      error: error.message,
    });
  }
};

// @desc    Manually update an exam schedule entry (Admin only, use with caution)
// @route   PUT /api/exam-schedules/manual/:id
// @access  Private (Admin)
exports.manualUpdateExamSchedule = async (req, res) => {
  const transaction = await ExamSchedule.sequelize.transaction();
  try {
    const { id } = req.params;
    const { invigilator_ids, ...updateData } = req.body; // Tách invigilator_ids ra khỏi updateData

    const existingSchedule = await ExamSchedule.findByPk(id, { transaction });
    if (!existingSchedule) {
      await transaction.rollback();
      return res
        .status(404)
        .json({
          success: false,
          message: `Không tìm thấy lịch thi với ID ${id}.`,
        });
    }

    // Validate existence of foreign keys if they are being updated
    if (updateData.course_id) {
      const course = await Course.findByPk(updateData.course_id, {
        transaction,
      });
      if (!course) {
        await transaction.rollback();
        return res
          .status(400)
          .json({
            success: false,
            message: `Course with ID ${updateData.course_id} not found.`,
          });
      }
    }
    if (updateData.room_id) {
      const room = await Room.findByPk(updateData.room_id, { transaction });
      if (!room) {
        await transaction.rollback();
        return res
          .status(400)
          .json({
            success: false,
            message: `Room with ID ${updateData.room_id} not found.`,
          });
      }
    }

    // Check for slot availability for update (if date, room, or slot changed)
    if (updateData.exam_date || updateData.room_id || updateData.exam_slot) {
      const newExamDate = updateData.exam_date || existingSchedule.exam_date;
      const newRoomId = updateData.room_id || existingSchedule.room_id;
      const newExamSlot = updateData.exam_slot || existingSchedule.exam_slot;

      const conflictSchedule = await ExamSchedule.findOne({
        where: {
          exam_date: newExamDate,
          room_id: newRoomId,
          exam_slot: newExamSlot,
          schedule_id: { [Op.ne]: id }, // Exclude current schedule
        },
        transaction,
      });
      if (conflictSchedule) {
        await transaction.rollback();
        return res
          .status(409)
          .json({
            success: false,
            message:
              "This room is already scheduled for another exam at the new date and slot.",
          });
      }
    }

    // Update ExamSchedule
    const [updatedRowsCount, updatedSchedules] = await ExamSchedule.update(
      updateData,
      {
        where: { schedule_id: id },
        returning: true,
        transaction,
      }
    );

    if (updatedRowsCount === 0) {
      await transaction.rollback();
      return res
        .status(404)
        .json({
          success: false,
          message: `Không tìm thấy lịch thi với ID ${id} để cập nhật.`,
        });
    }

    // Handle invigilators update: clear existing and re-create if new IDs are provided
    if (invigilator_ids !== undefined) {
      // Check if invigilator_ids was even sent in the request body
      await ExamInvigilator.destroy({
        where: { schedule_id: id },
        transaction,
      });

      if (Array.isArray(invigilator_ids) && invigilator_ids.length > 0) {
        const invigilatorAssignments = [];
        for (let i = 0; i < invigilator_ids.length; i++) {
          const lecturer_id = invigilator_ids[i];
          const lecturer = await Lecturer.findByPk(lecturer_id, {
            transaction,
          });
          if (!lecturer) {
            console.warn(
              `Lecturer ID ${lecturer_id} not found for manual assignment to schedule ${id}. Skipping.`
            );
            continue;
          }
          invigilatorAssignments.push({
            schedule_id: id,
            lecturer_id: lecturer_id,
            invigilator_order: i + 1,
            role: `Giám thị ${i + 1}`,
          });
        }
        if (invigilatorAssignments.length > 0) {
          await ExamInvigilator.bulkCreate(invigilatorAssignments, {
            transaction,
          });
        }
      }
    }

    await transaction.commit();
    res.status(200).json({
      success: true,
      message: "Cập nhật lịch thi thủ công thành công.",
      data: updatedSchedules[0],
    });
  } catch (error) {
    await transaction.rollback();
    console.error(
      `Lỗi khi cập nhật lịch thi thủ công ID ${req.params.id}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật lịch thi thủ công.",
      error: error.message,
    });
  }
};
