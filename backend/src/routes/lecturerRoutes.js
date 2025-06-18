// backend/src/routes/lecturerRoutes.js
const express = require("express");
const router = express.Router();
const lecturerController = require("../controllers/lecturerController");
const upload = require("../middleware/upload"); // Import middleware upload

// Các routes CRUD cơ bản
router
  .route("/")
  .get(lecturerController.getAllLecturers) // GET /api/lecturers
  .post(lecturerController.createLecturer); // POST /api/lecturers

router
  .route("/:id")
  .get(lecturerController.getLecturerById) // GET /api/lecturers/:id
  .put(lecturerController.updateLecturer) // PUT /api/lecturers/:id
  .delete(lecturerController.deleteLecturer); // DELETE /api/lecturers/:id

// Route cho việc Import từ Excel
router.post(
  "/import",
  upload.single("file"),
  lecturerController.importLecturers
); // POST /api/lecturers/import

module.exports = router;
