// backend/src/controllers/courseController.js
const { Course, Department } = require("../models");
const { Op } = require("sequelize");
const ExcelJS = require("exceljs");

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        {
          model: Department,
          as: "Department", // Sử dụng alias đã định nghĩa trong model Course
          attributes: ["department_name", "department_code"],
        },
      ],
    });
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách môn học:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách môn học.",
      error: error.message,
    });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: Department,
          as: "Department",
          attributes: ["department_name", "department_code"],
        },
      ],
    });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy môn học với ID ${req.params.id}`,
      });
    }
    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin môn học ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin môn học.",
      error: error.message,
    });
  }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Admin)
exports.createCourse = async (req, res) => {
  try {
    const { course_code, course_name, department_id, exam_duration_minutes } =
      req.body;

    // Kiểm tra trùng lặp course_code hoặc course_name
    const existingCourse = await Course.findOne({
      where: {
        [Op.or]: [{ course_code: course_code }, { course_name: course_name }],
      },
    });

    if (existingCourse) {
      let message = "";
      if (existingCourse.course_code === course_code) {
        message += "Mã môn học đã tồn tại. ";
      }
      if (existingCourse.course_name === course_name) {
        message += "Tên môn học đã tồn tại.";
      }
      return res.status(409).json({
        success: false,
        message: message.trim(),
      });
    }

    // Kiểm tra department_id có tồn tại không
    const department = await Department.findByPk(department_id);
    if (!department) {
      return res.status(400).json({
        success: false,
        message: `Department ID ${department_id} không tồn tại.`,
      });
    }

    // Kiểm tra exam_duration_minutes
    if (
      typeof exam_duration_minutes !== "number" ||
      exam_duration_minutes <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Thời lượng thi phải là số nguyên dương.",
      });
    }

    const newCourse = await Course.create(req.body);
    res.status(201).json({
      success: true,
      message: "Tạo môn học thành công.",
      data: newCourse,
    });
  } catch (error) {
    console.error("Lỗi khi tạo môn học:", error);
    res.status(500).json({
      success: false,
      message: "Không thể tạo môn học.",
      error: error.message,
    });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Admin)
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { course_code, course_name, department_id, exam_duration_minutes } =
      req.body;

    // Kiểm tra trùng lặp course_code và course_name nếu có thay đổi
    if (course_code) {
      const existingCodeCourse = await Course.findOne({
        where: {
          course_code: course_code,
          course_id: { [Op.ne]: id },
        },
      });
      if (existingCodeCourse) {
        return res.status(409).json({
          success: false,
          message: "Mã môn học đã tồn tại cho môn học khác.",
        });
      }
    }
    if (course_name) {
      const existingNameCourse = await Course.findOne({
        where: {
          course_name: course_name,
          course_id: { [Op.ne]: id },
        },
      });
      if (existingNameCourse) {
        return res.status(409).json({
          success: false,
          message: "Tên môn học đã tồn tại cho môn học khác.",
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

    // Kiểm tra exam_duration_minutes nếu có thay đổi
    if (exam_duration_minutes !== undefined) {
      if (
        typeof exam_duration_minutes !== "number" ||
        exam_duration_minutes <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Thời lượng thi phải là số nguyên dương.",
        });
      }
    }

    const [updatedRowsCount, updatedCourses] = await Course.update(req.body, {
      where: { course_id: id },
      returning: true,
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy môn học với ID ${id} để cập nhật.`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật môn học thành công.",
      data: updatedCourses[0],
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Mã môn học hoặc Tên môn học đã tồn tại.",
        error: error.message,
      });
    }
    console.error(`Lỗi khi cập nhật môn học ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật môn học.",
      error: error.message,
    });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await Course.destroy({
      where: { course_id: id },
    });

    if (deletedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy môn học với ID ${id} để xóa.`,
      });
    }
    res.status(200).json({
      success: true,
      message: "Xóa môn học thành công.",
    });
  } catch (error) {
    // Kiểm tra lỗi khi môn học đang được tham chiếu bởi CourseRegistrations hoặc ExamSchedules
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(409).json({
        success: false,
        message:
          "Không thể xóa môn học này vì nó đang được sinh viên đăng ký hoặc có lịch thi.",
        error: error.message,
      });
    }
    console.error(`Lỗi khi xóa môn học ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Không thể xóa môn học.",
      error: error.message,
    });
  }
};

// @desc    Import courses from Excel file
// @route   POST /api/courses/import
// @access  Private (Admin) - cần middleware 'multer'
exports.importCourses = async (req, res) => {
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

    const coursesToProcess = [];
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

    // Giả định hàng đầu tiên là tiêu đề (Course Code, Course Name, Credits, Exam Duration Minutes, Description, Department Code/Name)
    const headerRow = worksheet.getRow(1).values;
    const codeCol =
      headerRow.findIndex(
        (h) => typeof h === "string" && h.trim().toLowerCase() === "course code"
      ) + 1;
    const nameCol =
      headerRow.findIndex(
        (h) => typeof h === "string" && h.trim().toLowerCase() === "course name"
      ) + 1;
    const creditsCol =
      headerRow.findIndex(
        (h) => typeof h === "string" && h.trim().toLowerCase() === "credits"
      ) + 1;
    const durationCol =
      headerRow.findIndex(
        (h) =>
          typeof h === "string" &&
          h.trim().toLowerCase() === "exam duration minutes"
      ) + 1;
    const descCol =
      headerRow.findIndex(
        (h) => typeof h === "string" && h.trim().toLowerCase() === "description"
      ) + 1;
    const deptCol =
      headerRow.findIndex(
        (h) =>
          typeof h === "string" &&
          (h.trim().toLowerCase() === "department code" ||
            h.trim().toLowerCase() === "department name")
      ) + 1;

    if (
      codeCol === 0 ||
      nameCol === 0 ||
      creditsCol === 0 ||
      durationCol === 0 ||
      deptCol === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'File Excel thiếu các cột bắt buộc: "Course Code", "Course Name", "Credits", "Exam Duration Minutes", "Department Code/Name".',
      });
    }

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const course_code = row.getCell(codeCol).text
        ? row.getCell(codeCol).text.trim()
        : null;
      const course_name = row.getCell(nameCol).text
        ? row.getCell(nameCol).text.trim()
        : null;
      const creditsText = row.getCell(creditsCol).text
        ? row.getCell(creditsCol).text.trim()
        : null;
      const exam_duration_minutes_text = row.getCell(durationCol).text
        ? row.getCell(durationCol).text.trim()
        : null;
      const description = descCol > 0 ? row.getCell(descCol).text.trim() : null;
      const departmentIdentifier =
        deptCol > 0 ? row.getCell(deptCol).text.trim() : null;

      let department_id = null;
      let currentErrors = [];

      if (
        !course_code ||
        !course_name ||
        !creditsText ||
        !exam_duration_minutes_text ||
        !departmentIdentifier
      ) {
        errors.push(
          `Hàng ${i}: Dữ liệu thiếu (Mã môn, Tên môn, Số tín chỉ, Thời lượng thi, hoặc Khoa).`
        );
        continue;
      }

      const credits = parseInt(creditsText, 10);
      const exam_duration_minutes = parseInt(exam_duration_minutes_text, 10);

      if (isNaN(credits) || credits <= 0) {
        currentErrors.push(
          `Số tín chỉ "${creditsText}" không hợp lệ (phải là số nguyên dương).`
        );
      }
      if (isNaN(exam_duration_minutes) || exam_duration_minutes <= 0) {
        currentErrors.push(
          `Thời lượng thi "${exam_duration_minutes_text}" không hợp lệ (phải là số nguyên dương).`
        );
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

      if (currentErrors.length > 0) {
        errors.push(
          `Hàng ${i} (${course_code} - ${course_name}): ${currentErrors.join(
            "; "
          )}`
        );
        continue;
      }

      coursesToProcess.push({
        course_code,
        course_name,
        credits,
        exam_duration_minutes,
        description,
        department_id,
        total_students_registered: 0, // Mặc định là 0, sẽ được cập nhật khi đăng ký
      });
    }

    await Course.sequelize.transaction(async (t) => {
      for (const courseData of coursesToProcess) {
        try {
          const existingCourse = await Course.findOne({
            where: { course_code: courseData.course_code },
            transaction: t,
          });

          if (existingCourse) {
            // Kiểm tra trùng tên môn nếu cập nhật
            if (
              courseData.course_name &&
              courseData.course_name !== existingCourse.course_name
            ) {
              const nameConflict = await Course.findOne({
                where: {
                  course_name: courseData.course_name,
                  course_id: { [Op.ne]: existingCourse.course_id },
                },
                transaction: t,
              });
              if (nameConflict) {
                errors.push(
                  `Lỗi hàng "${courseData.course_name}" (${courseData.course_code}): Tên môn học "${courseData.course_name}" đã tồn tại cho môn học khác.`
                );
                continue;
              }
            }
            await existingCourse.update(courseData, { transaction: t });
            updatedCount++;
          } else {
            // Kiểm tra trùng tên môn nếu tạo mới
            if (courseData.course_name) {
              const nameConflict = await Course.findOne({
                where: { course_name: courseData.course_name },
                transaction: t,
              });
              if (nameConflict) {
                errors.push(
                  `Lỗi hàng "${courseData.course_name}" (${courseData.course_code}): Tên môn học "${courseData.course_name}" đã tồn tại cho môn học khác.`
                );
                continue;
              }
            }
            await Course.create(courseData, { transaction: t });
            createdCount++;
          }
        } catch (rowError) {
          errors.push(
            `Lỗi hàng "${courseData.course_name}" (${courseData.course_code}): ${rowError.message}`
          );
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Import môn học hoàn tất.",
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
