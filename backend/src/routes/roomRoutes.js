// backend/src/routes/roomRoutes.js
const express = require("express");
const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  importRooms,
} = require("../controllers/roomController");

const upload = require("../middleware/upload"); // Import middleware upload

const router = express.Router();

router.route("/").get(getRooms).post(createRoom);

router.post("/import", upload.single("file"), importRooms); // Route cho import

router.route("/:id").get(getRoom).put(updateRoom).delete(deleteRoom);

module.exports = router;
