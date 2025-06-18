// backend/src/controllers/scheduleGenerationController.js
const { generateExamSchedule } = require("../services/scheduleGenerator"); // Đường dẫn đã được điều chỉnh

exports.generateSchedule = async (req, res) => {
  try {
    const { startDate, endDate, examSlotsPerDay, examType, semester } =
      req.body;

    if (!startDate || !endDate || !examSlotsPerDay || !examType || !semester) {
      return res
        .status(400)
        .json({
          message:
            "Vui lòng cung cấp đầy đủ Ngày bắt đầu, Ngày kết thúc, Số ca thi mỗi ngày, Loại hình thi và Học kỳ.",
        });
    }

    const results = await generateExamSchedule(
      startDate,
      endDate,
      examSlotsPerDay,
      examType,
      semester
    );

    if (results.error_count > 0 && results.scheduled_count === 0) {
      return res.status(500).json(results);
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Error in schedule generation controller:", error);
    res
      .status(500)
      .json({
        message: "Lỗi server không xác định khi tạo lịch thi tự động.",
        error: error.message,
      });
  }
};
