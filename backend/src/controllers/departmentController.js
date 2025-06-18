// backend/src/controllers/departmentController.js
const { Department, Student } = require("../config/database"); // Import cả Student để kiểm tra quan hệ
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const upload = require("../middleware/upload"); // Import middleware upload
const exceljs = require("exceljs");
const fs = require("fs"); // Để xóa file tạm thời

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
exports.getDepartments = asyncHandler(async (req, res, next) => {
  const departments = await Department.findAll({
    // Có thể bao gồm các sinh viên thuộc khoa nếu muốn:
    // include: [{
    //     model: Student,
    //     as: 'students', // Alias đã định nghĩa trong database.js
    //     attributes: ['student_id', 'student_code', 'full_name']
    // }]
  });
  res
    .status(200)
    .json({ success: true, count: departments.length, data: departments });
});

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Public
exports.getDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.findByPk(req.params.id, {
    // Có thể bao gồm các sinh viên thuộc khoa nếu muốn:
    // include: [{
    //     model: Student,
    //     as: 'students',
    //     attributes: ['student_id', 'student_code', 'full_name']
    // }]
  });

  if (!department) {
    return next(
      new ErrorResponse(`Không tìm thấy khoa với id là ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: department });
});

// @desc    Create new department
// @route   POST /api/departments
// @access  Private (có thể thêm xác thực)
exports.createDepartment = asyncHandler(async (req, res, next) => {
  // Kiểm tra xem department_code hoặc department_name đã tồn tại chưa
  const existingDepartment = await Department.findOne({
    where: {
      // Sử dụng OR để kiểm tra cả hai trường
      [require("sequelize").Op.or]: [
        { department_code: req.body.department_code },
        { department_name: req.body.department_name },
      ],
    },
  });

  if (existingDepartment) {
    if (existingDepartment.department_code === req.body.department_code) {
      return next(
        new ErrorResponse(
          `Mã khoa '${req.body.department_code}' đã tồn tại.`,
          400
        )
      );
    }
    if (existingDepartment.department_name === req.body.department_name) {
      return next(
        new ErrorResponse(
          `Tên khoa '${req.body.department_name}' đã tồn tại.`,
          400
        )
      );
    }
  }

  const department = await Department.create(req.body);
  res.status(201).json({ success: true, data: department });
});

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (có thể thêm xác thực)
exports.updateDepartment = asyncHandler(async (req, res, next) => {
  let department = await Department.findByPk(req.params.id);

  if (!department) {
    return next(
      new ErrorResponse(`Không tìm thấy khoa với id là ${req.params.id}`, 404)
    );
  }

  // Kiểm tra trùng lặp mã hoặc tên khoa với các khoa khác (ngoại trừ chính nó)
  const existingDepartment = await Department.findOne({
    where: {
      [require("sequelize").Op.or]: [
        { department_code: req.body.department_code },
        { department_name: req.body.department_name },
      ],
      department_id: { [require("sequelize").Op.ne]: req.params.id }, // Loại trừ chính khoa đang chỉnh sửa
    },
  });

  if (existingDepartment) {
    if (existingDepartment.department_code === req.body.department_code) {
      return next(
        new ErrorResponse(
          `Mã khoa '${req.body.department_code}' đã được sử dụng bởi khoa khác.`,
          400
        )
      );
    }
    if (existingDepartment.department_name === req.body.department_name) {
      return next(
        new ErrorResponse(
          `Tên khoa '${req.body.department_name}' đã được sử dụng bởi khoa khác.`,
          400
        )
      );
    }
  }

  await department.update(req.body);
  res.status(200).json({ success: true, data: department });
});

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (có thể thêm xác thực)
exports.deleteDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.findByPk(req.params.id);

  if (!department) {
    return next(
      new ErrorResponse(`Không tìm thấy khoa với id là ${req.params.id}`, 404)
    );
  }

  // Kiểm tra xem có sinh viên nào thuộc khoa này không
  const studentsInDepartment = await Student.count({
    where: { department_id: req.params.id },
  });
  if (studentsInDepartment > 0) {
    return next(
      new ErrorResponse(
        `Không thể xóa khoa này vì có ${studentsInDepartment} sinh viên thuộc khoa. Vui lòng chuyển hoặc xóa sinh viên trước.`,
        400
      )
    );
  }

  await department.destroy();
  res.status(200).json({ success: true, data: {} });
});

// @desc    Import departments from Excel
// @route   POST /api/departments/import
// @access  Public (hoặc Private nếu có xác thực)
exports.importDepartments = (req, res, next) => {
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
        // Đọc dữ liệu từ các cột theo thứ tự trong file mẫu: Mã khoa | Tên khoa | Mô tả
        const department_code = String(row.getCell(1).value || "").trim();
        const department_name = String(row.getCell(2).value || "").trim();
        const description = String(row.getCell(3).value || "").trim();

        // Bỏ qua hàng hoàn toàn trống
        if (!department_code && !department_name && !description) {
          continue;
        }

        // Kiểm tra dữ liệu bắt buộc
        if (!department_code || !department_name) {
          failedCount++;
          errors.push({
            row: i,
            message: "Dữ liệu thiếu (Mã khoa hoặc Tên khoa).",
            data: { department_code, department_name, description },
          });
          continue;
        }

        try {
          // Tìm hoặc tạo khoa dựa trên department_code
          const [department, created] = await Department.findOrCreate({
            where: { department_code: department_code },
            defaults: { department_name, description },
          });

          if (!created) {
            // Nếu đã tồn tại, kiểm tra xem tên khoa có khớp không
            // Nếu tên khoa khác, cập nhật
            if (
              department.department_name !== department_name ||
              department.description !== description
            ) {
              department.department_name = department_name;
              department.description = description;
              await department.save();
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
            data: { department_code, department_name, description },
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
        message: "Import khoa hoàn tất.",
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
