// backend/src/routes/studentRoutes.js
const express = require("express");
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  importStudents,
} = require("../controllers/studentController");

const upload = require("../middleware/upload"); // Import middleware upload

const router = express.Router();

router.route("/").get(getStudents).post(createStudent);

router.post("/import", upload.single("file"), importStudents); // Sử dụng upload middleware

router.route("/:id").get(getStudent).put(updateStudent).delete(deleteStudent);

module.exports = router;
