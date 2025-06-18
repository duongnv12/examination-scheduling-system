// backend/src/services/scheduleGenerator.js

const { Op } = require("sequelize");
const {
  Course,
  Room,
  Student,
  Lecturer,
  CourseRegistration,
  ExamSchedule,
  ExamInvigilator,
  Department,
} = require("../models");

const EXAM_SLOTS_DEFINITION = [
  { id: "1", start: "07:30", end: "09:00", duration: 90 },
  { id: "2", start: "09:30", end: "11:00", duration: 90 },
  { id: "3", start: "13:00", end: "14:30", duration: 90 },
  { id: "4", start: "15:00", end: "16:30", duration: 90 },
  { id: "5", start: "10:00", end: "12:00", duration: 120 },
  { id: "6", start: "14:00", end: "17:00", duration: 180 },
];

const INVIGILATORS_PER_ROOM = 2;

function isSlotAvailable(date, room_id, exam_slot, existingSchedules) {
  const dateStr = date.toISOString().split("T")[0];
  return !existingSchedules.some(
    (schedule) =>
      schedule.exam_date === dateStr &&
      schedule.room_id === room_id &&
      schedule.exam_slot === exam_slot
  );
}

function isLecturerAvailable(
  lecturer_id,
  date,
  exam_slot,
  assignedInvigilators
) {
  const dateStr = date.toISOString().split("T")[0];
  return !assignedInvigilators.some(
    (invigilator) =>
      invigilator.lecturer_id === lecturer_id &&
      invigilator["ExamSchedule.exam_date"] === dateStr &&
      invigilator["ExamSchedule.exam_slot"] === exam_slot
  );
}

async function generateExamSchedule(
  startDateString,
  endDateString,
  examSlotsPerDay,
  examType,
  semester
) {
  console.log(
    `Bắt đầu tạo lịch thi cho học kỳ ${semester}, loại ${examType} từ ${startDateString} đến ${endDateString}`
  );

  // --- 1. Xóa lịch thi và phân công giám thị cũ ---
  console.log(
    `🔄 Xóa lịch thi và phân công giám thị cũ cho ${semester} - ${examType}...`
  );

  const schedulesToDelete = await ExamSchedule.findAll({
    where: { semester, exam_type: examType },
    attributes: ["schedule_id"],
    raw: true,
  });
  const scheduleIdsToDelete = schedulesToDelete.map((s) => s.schedule_id);

  if (scheduleIdsToDelete.length > 0) {
    await ExamInvigilator.destroy({
      where: {
        schedule_id: {
          [Op.in]: scheduleIdsToDelete,
        },
      },
    });
    console.log(
      `✅ Đã xóa ${scheduleIdsToDelete.length} bản ghi phân công giám thị liên quan.`
    );
  }

  await ExamSchedule.destroy({ where: { semester, exam_type: examType } });
  console.log(
    `✅ Đã xóa lịch thi và phân công giám thị cũ cho ${semester} - ${examType}.`
  );

  // --- 2. Lấy tất cả dữ liệu cần thiết một lần ---
  // Đảm bảo các biến này được khai báo ở đây, không nằm trong khối lồng ghép nào khác.
  console.log("Đang tải dữ liệu từ cơ sở dữ liệu...");
  const allCourses = await Course.findAll({
    include: [
      {
        model: CourseRegistration,
        as: "CourseRegistrations",
        where: { semester },
        attributes: ["student_id"],
      },
    ],
    order: [["total_students_registered", "DESC"]],
  });

  const coursesToSchedule = allCourses.filter(
    (c) => c.CourseRegistrations.length > 0
  );
  for (const course of coursesToSchedule) {
    if (
      course.total_students_registered !== course.CourseRegistrations.length
    ) {
      await course.update({
        total_students_registered: course.CourseRegistrations.length,
      });
    }
  }
  coursesToSchedule.sort(
    (a, b) => b.total_students_registered - a.total_students_registered
  );

  const rooms = await Room.findAll({ where: { is_active: true } });
  const availableLecturers = await Lecturer.findAll({
    where: { is_available_for_invigilation: true },
  });

  const existingSchedules = await ExamSchedule.findAll({
    where: {
      exam_date: {
        [Op.between]: [startDateString, endDateString],
      },
    },
    raw: true,
  });

  const assignedInvigilators = await ExamInvigilator.findAll({
    include: [
      {
        model: ExamSchedule,
        as: "ExamSchedule",
        where: {
          exam_date: {
            [Op.between]: [startDateString, endDateString],
          },
        },
        attributes: ["exam_date", "exam_slot"],
      },
    ],
    raw: true,
  });
  console.log("✅ Đã tải dữ liệu.");

  // --- 3. Chuẩn bị dữ liệu và biến trạng thái ---
  const scheduledExams = [];
  const unscheduledCourses = [];
  const errors = [];

  const roomMap = new Map(rooms.map((room) => [room.room_id, room]));
  const lecturerMap = new Map(
    availableLecturers.map((lecturer) => [lecturer.lecturer_id, lecturer])
  );

  const definedExamSlots = EXAM_SLOTS_DEFINITION.slice(0, examSlotsPerDay);

  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);

  // --- 4. Thuật toán xếp lịch (Greedy Approach) ---
  console.log("Bắt đầu xếp lịch...");
  for (const course of coursesToSchedule) {
    let isCourseScheduled = false;
    const requiredDuration = course.exam_duration_minutes;
    const numStudents = course.total_students_registered;

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const currentDate = new Date(d);
      const currentDateStr = currentDate.toISOString().split("T")[0];

      const suitableSlots = definedExamSlots.filter(
        (slot) => slot.duration >= requiredDuration
      );
      if (suitableSlots.length === 0) {
        errors.push(
          `Môn ${course.course_code} (${
            course.course_name
          }) có thời lượng ${requiredDuration} phút, không thể xếp vào bất kỳ ca thi nào trong các ca được chọn (max ${Math.max(
            ...definedExamSlots.map((s) => s.duration)
          )} phút).`
        );
        unscheduledCourses.push(course.course_code);
        isCourseScheduled = true;
        break;
      }

      suitableSlots.sort((a, b) => a.duration - b.duration);

      for (const slot of suitableSlots) {
        for (const room of rooms) {
          // Lỗi ReferenceError: rooms is not defined xảy ra ở đây
          if (room.capacity < numStudents) {
            continue;
          }

          if (
            isSlotAvailable(
              currentDate,
              room.room_id,
              slot.id,
              existingSchedules
            )
          ) {
            const availableInvigilators = availableLecturers.filter(
              (lecturer) =>
                isLecturerAvailable(
                  lecturer.lecturer_id,
                  currentDate,
                  slot.id,
                  assignedInvigilators
                )
            );

            if (availableInvigilators.length >= INVIGILATORS_PER_ROOM) {
              const newSchedule = {
                course_id: course.course_id,
                room_id: room.room_id,
                exam_date: currentDateStr,
                start_time: slot.start,
                end_time: slot.end,
                exam_slot: slot.id,
                scheduled_students_count: numStudents,
                semester: semester,
                exam_type: examType,
              };

              scheduledExams.push(newSchedule);

              existingSchedules.push({
                exam_date: currentDateStr,
                room_id: room.room_id,
                exam_slot: slot.id,
              });

              const assignedToThisSchedule = [];
              for (let i = 0; i < INVIGILATORS_PER_ROOM; i++) {
                const lecturer = availableInvigilators[i];
                assignedToThisSchedule.push({
                  lecturer_id: lecturer.lecturer_id,
                  ExamSchedule: {
                    exam_date: currentDateStr,
                    exam_slot: slot.id,
                  },
                });
              }
              assignedInvigilators.push(...assignedToThisSchedule);

              isCourseScheduled = true;
              console.log(
                `✅ Xếp thành công môn ${course.course_code} vào ${currentDateStr}, Ca ${slot.id}, Phòng ${room.room_name}`
              );
              break;
            }
          }
        }
        if (isCourseScheduled) break;
      }
      if (isCourseScheduled) break;
    }

    if (!isCourseScheduled) {
      unscheduledCourses.push(course.course_code);
      errors.push(
        `Môn ${course.course_code} (${course.course_name}) không thể xếp lịch do không tìm được phòng, ca thi hoặc giám thị phù hợp trong khoảng thời gian đã chọn.`
      );
    }
  }

  // --- 5. Lưu lịch thi và phân công giám thị vào cơ sở dữ liệu ---
  console.log("Đang lưu lịch thi vào cơ sở dữ liệu...");
  let createdSchedules = [];
  let createdInvigilators = [];

  if (scheduledExams.length > 0) {
    createdSchedules = await ExamSchedule.bulkCreate(scheduledExams, {
      returning: true,
    });
    console.log(`✅ Đã lưu ${createdSchedules.length} lịch thi thành công.`);

    const invigilatorAssignments = [];
    for (const schedule of createdSchedules) {
      // Logic tìm giám thị cho mỗi lịch trình đã tạo
      // Vấn đề: `availableInvigilators` và `assignedInvigilators` đã bị thay đổi trong quá trình xếp lịch
      // Để đảm bảo tính chính xác, chúng ta cần tái tính toán hoặc lưu trữ tốt hơn.
      // Để đơn giản hóa, ta sẽ tạm thời lấy ngẫu nhiên 2 giám thị sẵn có tại thời điểm này
      // Trong thực tế, bạn sẽ cần một cách tinh vi hơn để theo dõi ai đã được gán cho ca nào.

      // Tái lọc giám thị khả dụng cho ca cụ thể này.
      // Điều này cần được cải thiện nếu logic phân bổ giám thị phức tạp hơn.
      const potentiallyAvailableLecturers = availableLecturers.filter(
        (l) =>
          !assignedInvigilators.some(
            (ai) =>
              ai.lecturer_id === l.lecturer_id &&
              ai["ExamSchedule.exam_date"] === schedule.exam_date &&
              ai["ExamSchedule.exam_slot"] === schedule.exam_slot
          )
      );

      if (potentiallyAvailableLecturers.length >= INVIGILATORS_PER_ROOM) {
        const selectedLecturers = potentiallyAvailableLecturers.slice(
          0,
          INVIGILATORS_PER_ROOM
        ); // Lấy 2 giám thị đầu tiên

        for (let i = 0; i < INVIGILATORS_PER_ROOM; i++) {
          invigilatorAssignments.push({
            schedule_id: schedule.schedule_id,
            lecturer_id: selectedLecturers[i].lecturer_id,
            invigilator_order: i + 1,
            role: `Giám thị ${i + 1}`,
          });
        }
      } else {
        console.warn(
          `⚠️ Không đủ giám thị để phân công cho lịch thi của môn ${schedule.course_id} vào ${schedule.exam_date} Ca ${schedule.exam_slot}. Lịch này có thể cần phân công thủ công.`
        );
        // Bạn có thể chọn rollback lịch này hoặc ghi log và xử lý thủ công
      }
    }

    if (invigilatorAssignments.length > 0) {
      createdInvigilators = await ExamInvigilator.bulkCreate(
        invigilatorAssignments
      );
      console.log(
        `✅ Đã lưu ${createdInvigilators.length} phân công giám thị.`
      );
    }
  } else {
    console.log("Không có lịch thi nào được tạo.");
  }

  console.log("--- Hoàn tất xếp lịch ---");

  return {
    success: unscheduledCourses.length === 0,
    total_courses_to_schedule: coursesToSchedule.length,
    scheduled_courses_count: scheduledExams.length,
    unscheduled_courses_count: unscheduledCourses.length,
    errors: errors,
    unscheduled_courses: unscheduledCourses,
    scheduled_exams: createdSchedules.map((s) => ({
      schedule_id: s.schedule_id,
      course_code: allCourses.find((c) => c.course_id === s.course_id)
        ?.course_code,
      room_name: roomMap.get(s.room_id)?.room_name,
      exam_date: s.exam_date,
      start_time: s.start_time,
      end_time: s.end_time,
      exam_slot: s.exam_slot,
    })),
  };
}

module.exports = generateExamSchedule;
