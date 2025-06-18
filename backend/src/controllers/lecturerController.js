// backend/src/controllers/lecturerController.js
const { Lecturer, Department } = require("../models");
const { Op } = require("sequelize");
const ExcelJS = require("exceljs");

// @desc    Get all lecturers
// @route   GET /api/lecturers
// @access  Public
exports.getAllLecturers = async (req, res) => {
  try {
    const lecturers = await Lecturer.findAll({
      include: [
        {
          model: Department,
          as: "Department", // Sử dụng alias đã định nghĩa trong model Lecturer
          attributes: ["department_name", "department_code"],
        },
      ],
    });
    res.status(200).json({
      success: true,
      count: lecturers.length,
      data: lecturers,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách giảng viên:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách giảng viên.",
      error: error.message,
    });
  }
};

// @desc    Get single lecturer by ID
// @route   GET /api/lecturers/:id
// @access  Public
exports.getLecturerById = async (req, res) => {
  try {
    const lecturer = await Lecturer.findByPk(req.params.id, {
      include: [
        {
          model: Department,
          as: "Department",
          attributes: ["department_name", "department_code"],
        },
      ],
    });
    if (!lecturer) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy giảng viên với ID ${req.params.id}`,
      });
    }
    res.status(200).json({
      success: true,
      data: lecturer,
    });
  } catch (error) {
    console.error(
      `Lỗi khi lấy thông tin giảng viên ID ${req.params.id}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin giảng viên.",
      error: error.message,
    });
  }
};

// @desc    Create a new lecturer
// @route   POST /api/lecturers
// @access  Private (Admin)
exports.createLecturer = async (req, res) => {
  try {
    const { lecturer_code, email, department_id } = req.body;

    // Kiểm tra trùng lặp lecturer_code và email
    const existingLecturer = await Lecturer.findOne({
      where: {
        [Op.or]: [{ lecturer_code: lecturer_code }, { email: email }],
      },
    });

    if (existingLecturer) {
      let message = "";
      if (existingLecturer.lecturer_code === lecturer_code) {
        message += "Mã giảng viên đã tồn tại. ";
      }
      if (existingLecturer.email === email) {
        message += "Email đã tồn tại.";
      }
      return res.status(409).json({
        success: false,
        message: message.trim(),
      });
    }

    // Kiểm tra department_id có tồn tại không
    if (department_id) {
      const department = await Department.findByPk(department_id);
      if (!department) {
        return res.status(400).json({
          success: false,
          message: `Department ID ${department_id} không tồn tại.`,
        });
      }
    }

    const newLecturer = await Lecturer.create(req.body);
    res.status(201).json({
      success: true,
      message: "Tạo giảng viên thành công.",
      data: newLecturer,
    });
  } catch (error) {
    console.error("Lỗi khi tạo giảng viên:", error);
    res.status(500).json({
      success: false,
      message: "Không thể tạo giảng viên.",
      error: error.message,
    });
  }
};

// @desc    Update a lecturer
// @route   PUT /api/lecturers/:id
// @access  Private (Admin)
exports.updateLecturer = async (req, res) => {
  try {
    const { id } = req.params;
    const { lecturer_code, email, department_id } = req.body;

    // Kiểm tra trùng lặp lecturer_code và email nếu có thay đổi
    if (lecturer_code) {
      const existingCodeLecturer = await Lecturer.findOne({
        where: {
          lecturer_code: lecturer_code,
          lecturer_id: { [Op.ne]: id },
        },
      });
      if (existingCodeLecturer) {
        return res.status(409).json({
          success: false,
          message: "Mã giảng viên đã tồn tại cho giảng viên khác.",
        });
      }
    }
    if (email) {
      const existingEmailLecturer = await Lecturer.findOne({
        where: {
          email: email,
          lecturer_id: { [Op.ne]: id },
        },
      });
      if (existingEmailLecturer) {
        return res.status(409).json({
          success: false,
          message: "Email đã tồn tại cho giảng viên khác.",
        });
      }
    }

    // Kiểm tra department_id có tồn tại không nếu có thay đổi
    if (department_id) {
      const department = await Department.findByPk(department_id);
      if (!department) {
        return res.status(400).json({
          success: false,
          message: `Department ID ${department_id} không tồn tại.`,
        });
      }
    }

    const [updatedRowsCount, updatedLecturers] = await Lecturer.update(
      req.body,
      {
        where: { lecturer_id: id },
        returning: true,
      }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy giảng viên với ID ${id} để cập nhật.`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật giảng viên thành công.",
      data: updatedLecturers[0],
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Mã giảng viên hoặc Email đã tồn tại.",
        error: error.message,
      });
    }
    console.error(`Lỗi khi cập nhật giảng viên ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật giảng viên.",
      error: error.message,
    });
  }
};

// @desc    Delete a lecturer
// @route   DELETE /api/lecturers/:id
// @access  Private (Admin)
exports.deleteLecturer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await Lecturer.destroy({
      where: { lecturer_id: id },
    });

    if (deletedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy giảng viên với ID ${id} để xóa.`,
      });
    }
    res.status(200).json({
      success: true,
      message: "Xóa giảng viên thành công.",
    });
  } catch (error) {
    // Kiểm tra lỗi khi giảng viên đang được tham chiếu bởi ExamInvigilators
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Không thể xóa giảng viên này vì đã được phân công coi thi.",
        error: error.message,
      });
    }
    console.error(`Lỗi khi xóa giảng viên ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Không thể xóa giảng viên.",
      error: error.message,
    });
  }
};

// @desc    Import lecturers from Excel file
// @route   POST /api/lecturers/import
// @access  Private (Admin) - cần middleware 'multer'
exports.importLecturers = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng tải lên một file Excel." });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return res
        .status(400)
        .json({
          success: false,
          message: "File Excel không có worksheet nào.",
        });
    }

    const lecturersToProcess = [];
    const errors = [];
    let createdCount = 0;
    let updatedCount = 0;

    // Tải tất cả departments để tra cứu
    const departments = await Department.findAll({
      attributes: ["department_id", "department_code", "department_name"],
    });
    const departmentMapByCode = new Map(
      departments.map((d) => [d.department_code.toLowerCase(), d.department_id])
    );
    const departmentMapByName = new Map(
      departments.map((d) => [d.department_name.toLowerCase(), d.department_id])
    );

    // Giả định hàng đầu tiên là tiêu đề (Lecturer Code, Full Name, Email, Phone Number, Department Code/Name, Is Available For Invigilation)
    const headerRow = worksheet.getRow(1).values;
    const codeCol =
      headerRow.findIndex(
        (h) =>
          typeof h === "string" && h.trim().toLowerCase() === "lecturer code"
      ) + 1;
    const nameCol =
      headerRow.findIndex(
        (h) => typeof h === "string" && h.trim().toLowerCase() === "full name"
      ) + 1;
    const emailCol =
      headerRow.findIndex(
        (h) => typeof h === "string" && h.trim().toLowerCase() === "email"
      ) + 1;
    const phoneCol =
      headerRow.findIndex(
        (h) =>
          typeof h === "string" && h.trim().toLowerCase() === "phone number"
      ) + 1;
    const deptCol =
      headerRow.findIndex(
        (h) =>
          typeof h === "string" &&
          (h.trim().toLowerCase() === "department code" ||
            h.trim().toLowerCase() === "department name")
      ) + 1;
    const invigilateCol =
      headerRow.findIndex(
        (h) =>
          typeof h === "string" &&
          h.trim().toLowerCase() === "is available for invigilation"
      ) + 1;

    if (codeCol === 0 || nameCol === 0 || deptCol === 0) {
      return res.status(400).json({
        success: false,
        message:
          'File Excel thiếu các cột bắt buộc: "Lecturer Code", "Full Name", "Department Code/Name".',
      });
    }

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const lecturer_code = row.getCell(codeCol).text
        ? row.getCell(codeCol).text.trim()
        : null;
      const full_name = row.getCell(nameCol).text
        ? row.getCell(nameCol).text.trim()
        : null;
      const email = emailCol > 0 ? row.getCell(emailCol).text.trim() : null;
      const phone_number =
        phoneCol > 0 ? row.getCell(phoneCol).text.trim() : null;
      const departmentIdentifier =
        deptCol > 0 ? row.getCell(deptCol).text.trim() : null;
      const isAvailableText =
        invigilateCol > 0
          ? row.getCell(invigilateCol).text.trim().toLowerCase()
          : "true"; // Mặc định là true

      let department_id = null;
      let currentErrors = [];

      if (!lecturer_code || !full_name || !departmentIdentifier) {
        errors.push(
          `Hàng ${i}: Dữ liệu thiếu (Mã giảng viên, Họ và tên, hoặc Khoa).`
        );
        continue;
      }

      // Tìm department_id từ departmentIdentifier (ưu tiên code, sau đó name)
      if (departmentIdentifier) {
        department_id = departmentMapByCode.get(
          departmentIdentifier.toLowerCase()
        );
        if (!department_id) {
          department_id = departmentMapByName.get(
            departmentIdentifier.toLowerCase()
          );
        }
        if (!department_id) {
          currentErrors.push(
            `Không tìm thấy Khoa với mã/tên "${departmentIdentifier}".`
          );
        }
      }

      // Validate email format if provided
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        currentErrors.push(`Email "${email}" không đúng định dạng.`);
      }

      if (currentErrors.length > 0) {
        errors.push(
          `Hàng ${i} (${lecturer_code} - ${full_name}): ${currentErrors.join(
            "; "
          )}`
        );
        continue;
      }

      const is_available_for_invigilation = ["true", "1", "yes"].includes(
        isAvailableText
      );

      lecturersToProcess.push({
        lecturer_code,
        full_name,
        email,
        phone_number,
        department_id,
        is_available_for_invigilation,
      });
    }

    await Lecturer.sequelize.transaction(async (t) => {
      for (const lecturerData of lecturersToProcess) {
        try {
          const existingLecturer = await Lecturer.findOne({
            where: { lecturer_code: lecturerData.lecturer_code },
            transaction: t,
          });

          if (existingLecturer) {
            // Kiểm tra trùng email nếu cập nhật
            if (
              lecturerData.email &&
              lecturerData.email !== existingLecturer.email
            ) {
              const emailConflict = await Lecturer.findOne({
                where: {
                  email: lecturerData.email,
                  lecturer_id: { [Op.ne]: existingLecturer.lecturer_id },
                },
                transaction: t,
              });
              if (emailConflict) {
                errors.push(
                  `Lỗi hàng "${lecturerData.full_name}" (${lecturerData.lecturer_code}): Email "${lecturerData.email}" đã tồn tại cho giảng viên khác.`
                );
                continue;
              }
            }
            await existingLecturer.update(lecturerData, { transaction: t });
            updatedCount++;
          } else {
            // Kiểm tra trùng email nếu tạo mới
            if (lecturerData.email) {
              const emailConflict = await Lecturer.findOne({
                where: { email: lecturerData.email },
                transaction: t,
              });
              if (emailConflict) {
                errors.push(
                  `Lỗi hàng "${lecturerData.full_name}" (${lecturerData.lecturer_code}): Email "${lecturerData.email}" đã tồn tại cho giảng viên khác.`
                );
                continue;
              }
            }
            await Lecturer.create(lecturerData, { transaction: t });
            createdCount++;
          }
        } catch (rowError) {
          errors.push(
            `Lỗi hàng "${lecturerData.full_name}" (${lecturerData.lecturer_code}): ${rowError.message}`
          );
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Import giảng viên hoàn tất.",
      created: createdCount,
      updated: updatedCount,
      failed: errors.length,
      errors: errors,
    });
  } catch (error) {
    console.error("Lỗi khi import file Excel:", error);
    res.status(500).json({
      success: false,
      message:
        "Không thể import file Excel. Đảm bảo file đúng định dạng và có dữ liệu hợp lệ.",
      error: error.message,
    });
  }
};
