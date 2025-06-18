// backend/src/controllers/studentController.js
const { Student, Department } = require("../config/database"); // Import cả Student và Department từ database config
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const upload = require("../middleware/upload"); // Import middleware upload đã cấu hình
const exceljs = require("exceljs");
const fs = require("fs"); // Để xóa file tạm thời

// @desc    Get all students
// @route   GET /api/students
// @access  Public
exports.getStudents = asyncHandler(async (req, res, next) => {
  const students = await Student.findAll({
    include: [
      {
        model: Department,
        as: "Department", // Sử dụng alias đã định nghĩa trong config/database.js
        attributes: ["department_id", "department_code", "department_name"],
      },
    ],
  });
  res
    .status(200)
    .json({ success: true, count: students.length, data: students });
});

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Public
exports.getStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findByPk(req.params.id, {
    include: [
      {
        model: Department,
        as: "Department",
        attributes: ["department_id", "department_code", "department_name"],
      },
    ],
  });

  if (!student) {
    return next(
      new ErrorResponse(
        `Không tìm thấy sinh viên với id là ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({ success: true, data: student });
});

// @desc    Create new student
// @route   POST /api/students
// @access  Private (có thể thêm xác thực)
exports.createStudent = asyncHandler(async (req, res, next) => {
  // Kiểm tra department_id có tồn tại không
  const department = await Department.findByPk(req.body.department_id);
  if (!department) {
    return next(new ErrorResponse("ID khoa không tồn tại.", 400));
  }

  // Kiểm tra email và mã sinh viên đã tồn tại chưa
  const existingStudentByCode = await Student.findOne({
    where: { student_code: req.body.student_code },
  });
  if (existingStudentByCode) {
    return next(
      new ErrorResponse(
        `Mã sinh viên '${req.body.student_code}' đã tồn tại.`,
        400
      )
    );
  }
  const existingStudentByEmail = await Student.findOne({
    where: { email: req.body.email },
  });
  if (existingStudentByEmail) {
    return next(
      new ErrorResponse(`Email '${req.body.email}' đã được sử dụng.`, 400)
    );
  }

  const student = await Student.create(req.body);
  // Sau khi tạo, lấy lại thông tin đầy đủ bao gồm Department để trả về cho frontend
  const newStudentWithDept = await Student.findByPk(student.student_id, {
    include: [
      {
        model: Department,
        as: "Department",
        attributes: ["department_id", "department_code", "department_name"],
      },
    ],
  });

  res.status(201).json({ success: true, data: newStudentWithDept });
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (có thể thêm xác thực)
exports.updateStudent = asyncHandler(async (req, res, next) => {
  let student = await Student.findByPk(req.params.id);

  if (!student) {
    return next(
      new ErrorResponse(
        `Không tìm thấy sinh viên với id là ${req.params.id}`,
        404
      )
    );
  }

  // Nếu có department_id trong request body, kiểm tra tính hợp lệ
  if (
    req.body.department_id &&
    req.body.department_id !== student.department_id
  ) {
    const department = await Department.findByPk(req.body.department_id);
    if (!department) {
      return next(new ErrorResponse("ID khoa không tồn tại.", 400));
    }
  }

  // Kiểm tra email và mã sinh viên (trừ chính sinh viên đang cập nhật)
  if (req.body.email && req.body.email !== student.email) {
    const existingStudentByEmail = await Student.findOne({
      where: { email: req.body.email },
    });
    if (existingStudentByEmail) {
      return next(
        new ErrorResponse(
          `Email '${req.body.email}' đã được sử dụng bởi sinh viên khác.`,
          400
        )
      );
    }
  }

  // Không cho phép cập nhật student_code sau khi tạo
  if (req.body.student_code && req.body.student_code !== student.student_code) {
    return next(new ErrorResponse("Không thể thay đổi mã sinh viên.", 400));
  }

  await student.update(req.body);

  // Sau khi cập nhật, lấy lại thông tin đầy đủ bao gồm Department để trả về cho frontend
  const updatedStudentWithDept = await Student.findByPk(student.student_id, {
    include: [
      {
        model: Department,
        as: "Department",
        attributes: ["department_id", "department_code", "department_name"],
      },
    ],
  });

  res.status(200).json({ success: true, data: updatedStudentWithDept });
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (có thể thêm xác thực)
exports.deleteStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findByPk(req.params.id);

  if (!student) {
    return next(
      new ErrorResponse(
        `Không tìm thấy sinh viên với id là ${req.params.id}`,
        404
      )
    );
  }

  await student.destroy();
  res.status(200).json({ success: true, data: {} });
});

// @desc    Import students from Excel
// @route   POST /api/students/import
// @access  Public (hoặc Private nếu có xác thực)
exports.importStudents = (req, res, next) => {
  // Sử dụng middleware upload.single('file') đã cấu hình
  upload.single("file")(req, res, async (err) => {
    if (err) {
      // Lỗi từ Multer hoặc từ fileFilter
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

      const departmentMap = {}; // Cache để lưu department_id từ department_code
      const departments = await Department.findAll({
        attributes: ["department_id", "department_code"],
      });
      departments.forEach((dept) => {
        departmentMap[dept.department_code] = dept.department_id;
      });

      // Duyệt qua từng hàng, bỏ qua hàng tiêu đề đầu tiên (bắt đầu từ hàng 2)
      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        // Đọc dữ liệu từ các cột theo thứ tự trong file mẫu
        // Mã sinh viên | Tên sinh viên | Giới tính | Ngày sinh | Email | Số điện thoại | Địa chỉ | Mã khoa
        const student_code = String(row.getCell(1).value || "").trim();
        const full_name = String(row.getCell(2).value || "").trim(); // Đã đổi
        const gender = String(row.getCell(3).value || "").trim();
        const date_of_birth_excel = row.getCell(4).value;
        const email = String(row.getCell(5).value || "").trim();
        const phone_number = String(row.getCell(6).value || "").trim();
        const address = String(row.getCell(7).value || "").trim();
        const department_code = String(row.getCell(8).value || "").trim();

        // Bỏ qua hàng hoàn toàn trống
        if (
          !student_code &&
          !full_name &&
          !gender &&
          !date_of_birth_excel &&
          !email &&
          !department_code
        ) {
          continue;
        }

        // Chuyển đổi ngày sinh từ định dạng số Excel sang Date
        let date_of_birth = null;
        if (typeof date_of_birth_excel === "number") {
          date_of_birth = new Date(
            Math.round((date_of_birth_excel - 25569) * 86400 * 1000)
          );
        } else if (date_of_birth_excel instanceof Date) {
          date_of_birth = date_of_birth_excel;
        } else if (
          typeof date_of_birth_excel === "string" &&
          date_of_birth_excel !== ""
        ) {
          date_of_birth = new Date(date_of_birth_excel);
        }

        const department_id = departmentMap[department_code];

        // Kiểm tra dữ liệu bắt buộc và hợp lệ
        if (
          !student_code ||
          !full_name ||
          !gender ||
          !date_of_birth ||
          isNaN(date_of_birth.getTime()) ||
          !email ||
          !department_id
        ) {
          failedCount++;
          errors.push({
            row: i,
            message:
              "Dữ liệu thiếu hoặc không hợp lệ (Mã SV, Tên SV, Giới tính, Ngày sinh, Email, Mã khoa).",
            data: {
              student_code,
              full_name,
              gender,
              date_of_birth_excel,
              email,
              phone_number,
              address,
              department_code,
            },
          });
          continue;
        }
        if (!["Nam", "Nữ", "Khác"].includes(gender)) {
          failedCount++;
          errors.push({
            row: i,
            message: `Giới tính '${gender}' không hợp lệ. Chỉ chấp nhận 'Nam', 'Nữ', 'Khác'.`,
            data: {
              student_code,
              full_name,
              gender,
              date_of_birth_excel,
              email,
              phone_number,
              address,
              department_code,
            },
          });
          continue;
        }

        try {
          const [student, created] = await Student.findOrCreate({
            where: { student_code: student_code }, // Tìm theo student_code để kiểm tra đã tồn tại hay chưa
            defaults: {
              student_code,
              full_name, // Đã đổi
              gender,
              date_of_birth,
              email,
              phone_number: phone_number || null,
              address: address || null,
              department_id,
            },
          });

          if (!created) {
            // Nếu đã tồn tại, cập nhật các trường
            student.full_name = full_name; // Đã đổi
            student.gender = gender;
            student.date_of_birth = date_of_birth;
            student.email = email;
            student.phone_number = phone_number || null;
            student.address = address || null;
            student.department_id = department_id;
            await student.save();
            updatedCount++;
          } else {
            createdCount++;
          }
        } catch (dbError) {
          failedCount++;
          errors.push({
            row: i,
            message: `Lỗi DB: ${dbError.message}`,
            data: {
              student_code,
              full_name,
              gender,
              date_of_birth_excel,
              email,
              phone_number,
              address,
              department_code,
            },
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
        message: "Import sinh viên hoàn tất.",
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
