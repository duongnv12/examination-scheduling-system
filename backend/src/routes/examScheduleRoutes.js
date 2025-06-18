// backend/src/routes/examScheduleRoutes.js
const express = require("express");
const router = express.Router();
const examScheduleController = require("../controllers/examScheduleController");

// Routes để lấy thông tin lịch thi (có bao gồm chi tiết Course, Room, Invigilators)
router.route("/").get(examScheduleController.getAllExamSchedules); // GET /api/exam-schedules

router
  .route("/:id")
  .get(examScheduleController.getExamScheduleById) // GET /api/exam-schedules/:id
  .delete(examScheduleController.deleteExamSchedule); // DELETE /api/exam-schedules/:id

// Route để kích hoạt quá trình tạo lịch thi tự động
router.post("/generate", examScheduleController.generateSchedule); // POST /api/exam-schedules/generate

// Routes để tạo và cập nhật lịch thi thủ công (chỉ dành cho Admin)
router.post("/manual", examScheduleController.manualCreateExamSchedule); // POST /api/exam-schedules/manual
router.put("/manual/:id", examScheduleController.manualUpdateExamSchedule); // PUT /api/exam-schedules/manual/:id

module.exports = router;
