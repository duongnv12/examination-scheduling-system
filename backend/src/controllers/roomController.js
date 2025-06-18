// backend/src/controllers/roomController.js
const { Room } = require("../config/database");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const upload = require("../middleware/upload"); // Import middleware upload
const exceljs = require("exceljs");
const fs = require("fs"); // Để xóa file tạm thời

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
exports.getRooms = asyncHandler(async (req, res, next) => {
  const rooms = await Room.findAll();
  res.status(200).json({ success: true, count: rooms.length, data: rooms });
});

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findByPk(req.params.id);

  if (!room) {
    return next(
      new ErrorResponse(
        `Không tìm thấy phòng học với id là ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({ success: true, data: room });
});

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (có thể thêm xác thực)
exports.createRoom = asyncHandler(async (req, res, next) => {
  // Kiểm tra xem room_name đã tồn tại chưa
  const existingRoom = await Room.findOne({
    where: { room_name: req.body.room_name },
  });
  if (existingRoom) {
    return next(
      new ErrorResponse(`Tên phòng '${req.body.room_name}' đã tồn tại.`, 400)
    );
  }

  const room = await Room.create(req.body);
  res.status(201).json({ success: true, data: room });
});

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (có thể thêm xác thực)
exports.updateRoom = asyncHandler(async (req, res, next) => {
  let room = await Room.findByPk(req.params.id);

  if (!room) {
    return next(
      new ErrorResponse(
        `Không tìm thấy phòng học với id là ${req.params.id}`,
        404
      )
    );
  }

  // Kiểm tra trùng lặp tên phòng với các phòng khác (ngoại trừ chính nó)
  if (req.body.room_name && req.body.room_name !== room.room_name) {
    const existingRoom = await Room.findOne({
      where: {
        room_name: req.body.room_name,
        room_id: { [require("sequelize").Op.ne]: req.params.id },
      },
    });
    if (existingRoom) {
      return next(
        new ErrorResponse(
          `Tên phòng '${req.body.room_name}' đã được sử dụng bởi phòng khác.`,
          400
        )
      );
    }
  }

  await room.update(req.body);
  res.status(200).json({ success: true, data: room });
});

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (có thể thêm xác thực)
exports.deleteRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findByPk(req.params.id);

  if (!room) {
    return next(
      new ErrorResponse(
        `Không tìm thấy phòng học với id là ${req.params.id}`,
        404
      )
    );
  }

  // TODO: Kiểm tra xem có bất kỳ ExamSlot, Schedule hay sự kiện nào đang sử dụng phòng này không
  // Ví dụ: const existingBookings = await ExamSlot.count({ where: { room_id: req.params.id } });
  // if (existingBookings > 0) {
  //     return next(new ErrorResponse(`Không thể xóa phòng này vì có ${existingBookings} lịch học/thi đang sử dụng.`, 400));
  // }

  await room.destroy();
  res.status(200).json({ success: true, data: {} });
});

// @desc    Import rooms from Excel
// @route   POST /api/rooms/import
// @access  Public (hoặc Private nếu có xác thực)
exports.importRooms = (req, res, next) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      if (err.message === "INVALID_FILE_TYPE") {
        return next(
          new ErrorResponse(
            "Loại file không hợp lệ. Chỉ chấp nhận file Excel (.xlsx, .xls).",
            400
          )
        );
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          new ErrorResponse("Kích thước file quá lớn. Tối đa 5MB.", 413)
        );
      }
      return next(new ErrorResponse(`Lỗi tải lên file: ${err.message}`, 400));
    }

    if (!req.file) {
      return next(new ErrorResponse("Vui lòng tải lên một file Excel.", 400));
    }

    const filePath = req.file.path;
    let workbook;

    try {
      workbook = new exceljs.Workbook();
      await workbook.xlsx.readFile(filePath);

      const worksheet = workbook.getWorksheet(1);
      let createdCount = 0;
      let updatedCount = 0;
      let failedCount = 0;
      const errors = [];

      // Duyệt qua từng hàng, bỏ qua hàng tiêu đề đầu tiên (bắt đầu từ hàng 2)
      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        // Đọc dữ liệu từ các cột theo thứ tự trong file mẫu: Tên phòng | Sức chứa | Loại phòng
        const room_name = String(row.getCell(1).value || "").trim();
        const capacity_excel = row.getCell(2).value;
        const room_type = String(row.getCell(3).value || "").trim();

        // Bỏ qua hàng hoàn toàn trống
        if (!room_name && !capacity_excel && !room_type) {
          continue;
        }

        const capacity = parseInt(capacity_excel);

        // Kiểm tra dữ liệu bắt buộc và hợp lệ
        if (!room_name || isNaN(capacity) || capacity <= 0 || !room_type) {
          failedCount++;
          errors.push({
            row: i,
            message:
              "Dữ liệu thiếu hoặc không hợp lệ (Tên phòng, Sức chứa, Loại phòng).",
            data: { room_name, capacity_excel, room_type },
          });
          continue;
        }

        try {
          // Tìm hoặc tạo phòng học dựa trên room_name
          const [room, created] = await Room.findOrCreate({
            where: { room_name: room_name },
            defaults: { room_name, capacity, room_type },
          });

          if (!created) {
            // Nếu đã tồn tại, cập nhật các trường
            if (room.capacity !== capacity || room.room_type !== room_type) {
              room.capacity = capacity;
              room.room_type = room_type;
              await room.save();
              updatedCount++;
            }
          } else {
            createdCount++;
          }
        } catch (dbError) {
          failedCount++;
          errors.push({
            row: i,
            message: `Lỗi DB: ${dbError.message}`,
            data: { room_name, capacity, room_type },
          });
          console.error(`Lỗi xử lý hàng ${i}: ${dbError.message}`);
        }
      }

      // Xóa file tạm thời sau khi xử lý
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Lỗi khi xóa file tạm thời: ${filePath}`, err);
      });

      res.status(200).json({
        success: true,
        message: "Import phòng học hoàn tất.",
        created: createdCount,
        updated: updatedCount,
        failed: failedCount,
        errors: errors,
      });
    } catch (excelError) {
      // Xóa file tạm thời ngay cả khi có lỗi đọc Excel
      fs.unlink(filePath, (err) => {
        if (err)
          console.error(
            `Lỗi khi xóa file tạm thời sau lỗi Excel: ${filePath}`,
            err
          );
      });
      return next(
        new ErrorResponse(`Lỗi khi đọc file Excel: ${excelError.message}`, 400)
      );
    }
  });
};
