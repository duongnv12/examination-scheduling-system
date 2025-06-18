// backend/src/routes/departmentRoutes.js
const express = require("express");
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  importDepartments,
} = require("../controllers/departmentController");

const upload = require("../middleware/upload"); // Import middleware upload

const router = express.Router();

router.route("/").get(getDepartments).post(createDepartment);

router.post("/import", upload.single("file"), importDepartments); // Route cho import

router
  .route("/:id")
  .get(getDepartment)
  .put(updateDepartment)
  .delete(deleteDepartment);

module.exports = router;
