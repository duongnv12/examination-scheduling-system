// backend/src/routes/courseRoutes.js
const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const upload = require("../middleware/upload"); // Import middleware upload

// Các routes CRUD cơ bản
router
  .route("/")
  .get(courseController.getAllCourses) // GET /api/courses
  .post(courseController.createCourse); // POST /api/courses

router
  .route("/:id")
  .get(courseController.getCourseById) // GET /api/courses/:id
  .put(courseController.updateCourse) // PUT /api/courses/:id
  .delete(courseController.deleteCourse); // DELETE /api/courses/:id

// Route cho việc Import từ Excel
router.post("/import", upload.single("file"), courseController.importCourses); // POST /api/courses/import

module.exports = router;
