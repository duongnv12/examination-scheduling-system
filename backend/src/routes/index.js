// backend/src/routes/index.js
const express = require("express");
const router = express.Router();

const departmentRoutes = require("./departmentRoutes");
const roomRoutes = require("./roomRoutes");
const studentRoutes = require("./studentRoutes");
const lecturerRoutes = require("./lecturerRoutes");
const courseRoutes = require("./courseRoutes");
const courseRegistrationRoutes = require("./courseRegistrationRoutes");
const examScheduleRoutes = require("./examScheduleRoutes");

// Định nghĩa các đường dẫn cơ sở cho từng nhóm routes
router.use("/departments", departmentRoutes);
router.use("/rooms", roomRoutes);
router.use("/students", studentRoutes);
router.use("/lecturers", lecturerRoutes);
router.use("/courses", courseRoutes);
router.use("/course-registrations", courseRegistrationRoutes);
router.use("/exam-schedules", examScheduleRoutes);

module.exports = router;
