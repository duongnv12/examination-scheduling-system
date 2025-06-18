// backend/src/scripts/testSchedule.js
const generateExamSchedule = require("../services/scheduleGenerator");

async function runTest() {
  try {
    const startDate = "2025-07-01"; // Thay đổi ngày bắt đầu phù hợp
    const endDate = "2025-07-15"; // Thay đổi ngày kết thúc phù hợp
    const examSlots = 6; // Sử dụng 6 để bao gồm cả ca 180 phút
    const examType = "Final";
    const semester = "2025-2026/1";

    console.log("--- Bắt đầu chạy test generateExamSchedule ---");
    const results = await generateExamSchedule(
      startDate,
      endDate,
      examSlots,
      examType,
      semester
    );
    console.log("\n--- Kết quả tạo lịch ---");
    console.log("Số môn cần xếp:", results.total_courses_to_schedule);
    console.log(
      "Số lịch thi được xếp thành công:",
      results.scheduled_courses_count
    );
    console.log(
      "Số môn không xếp được lịch:",
      results.unscheduled_courses_count
    );
    if (results.unscheduled_courses_count > 0) {
      console.log("Môn không xếp được lịch:", results.unscheduled_courses);
      console.log("Lỗi không xếp được lịch:");
      results.errors.forEach((err) => console.error(err));
    }
    console.log("\nCác lịch thi đã xếp (ví dụ 5 lịch đầu):");
    results.scheduled_exams.slice(0, 5).forEach((exam) => console.log(exam));
    console.log("...");
  } catch (error) {
    console.error("Lỗi trong quá trình chạy test:", error);
  } finally {
    // Đảm bảo đóng kết nối cơ sở dữ liệu nếu cần
    // Lưu ý: Nếu `sequelize` được quản lý ở `app.js`, bạn không cần đóng ở đây
    // const sequelize = require('../config/database');
    // if (sequelize) {
    //     await sequelize.close();
    //     console.log('Đóng kết nối database sau test.');
    // }
  }
}

runTest();
