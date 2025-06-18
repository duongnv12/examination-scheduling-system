// backend/src/controllers/courseRegistrationController.js
const { CourseRegistration, Student, Course } = require("../models");
const { Op } = require("sequelize");
const ExcelJS = require("exceljs");

// Helper function to update total_students_registered in Course
async function updateCourseStudentCount(courseId, transaction = null) {
  const studentCount = await CourseRegistration.count({
    where: { course_id: courseId },
    transaction: transaction,
  });
  await Course.update(
    { total_students_registered: studentCount },
    { where: { course_id: courseId }, transaction: transaction }
  );
}

// @desc    Get all course registrations
// @route   GET /api/course-registrations
// @access  Public
exports.getAllCourseRegistrations = async (req, res) => {
  try {
    const registrations = await CourseRegistration.findAll({
      include: [
        {
          model: Student,
          as: "Student",
          attributes: ["student_code", "full_name", "class_name"],
        },
        {
          model: Course,
          as: "Course",
          attributes: [
            "course_code",
            "course_name",
            "credits",
            "exam_duration_minutes",
          ],
        },
      ],
    });
    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đăng ký môn học:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách đăng ký môn học.",
      error: error.message,
    });
  }
};

// @desc    Get single course registration by ID
// @route   GET /api/course-registrations/:id
// @access  Public
exports.getCourseRegistrationById = async (req, res) => {
  try {
    const registration = await CourseRegistration.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: "Student",
          attributes: ["student_code", "full_name", "class_name"],
        },
        {
          model: Course,
          as: "Course",
          attributes: [
            "course_code",
            "course_name",
            "credits",
            "exam_duration_minutes",
          ],
        },
      ],
    });
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy đăng ký môn học với ID ${req.params.id}`,
      });
    }
    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error(
      `Lỗi khi lấy thông tin đăng ký môn học ID ${req.params.id}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin đăng ký môn học.",
      error: error.message,
    });
  }
};

// @desc    Create a new course registration
// @route   POST /api/course-registrations
// @access  Private (Admin/Student)
exports.createCourseRegistration = async (req, res) => {
  try {
    const { student_id, course_id, semester } = req.body;

    // Kiểm tra xem sinh viên và môn học có tồn tại không
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Sinh viên với ID ${student_id} không tồn tại.`,
        });
    }
    const course = await Course.findByPk(course_id);
    if (!course) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Môn học với ID ${course_id} không tồn tại.`,
        });
    }

    // Kiểm tra trùng lặp đăng ký (sinh viên không thể đăng ký cùng một môn trong cùng một học kỳ 2 lần)
    const existingRegistration = await CourseRegistration.findOne({
      where: { student_id, course_id, semester },
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: `Sinh viên '${student.full_name}' đã đăng ký môn '${course.course_name}' trong học kỳ '${semester}' rồi.`,
      });
    }

    const newRegistration = await CourseRegistration.create(req.body);

    // Cập nhật số lượng sinh viên đăng ký trong bảng Course
    await updateCourseStudentCount(course_id);

    res.status(201).json({
      success: true,
      message: "Đăng ký môn học thành công.",
      data: newRegistration,
    });
  } catch (error) {
    console.error("Lỗi khi tạo đăng ký môn học:", error);
    res.status(500).json({
      success: false,
      message: "Không thể tạo đăng ký môn học.",
      error: error.message,
    });
  }
};

// @desc    Delete a course registration
// @route   DELETE /api/course-registrations/:id
// @access  Private (Admin/Student)
exports.deleteCourseRegistration = async (req, res) => {
  const transaction = await CourseRegistration.sequelize.transaction();
  try {
    const { id } = req.params;
    const registration = await CourseRegistration.findByPk(id, { transaction });

    if (!registration) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy đăng ký môn học với ID ${id} để xóa.`,
      });
    }

    const courseId = registration.course_id;

    const deletedRows = await registration.destroy({ transaction });

    if (deletedRows === 0) {
      // Should not happen if registration was found
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy đăng ký môn học với ID ${id} để xóa.`,
      });
    }

    // Cập nhật số lượng sinh viên đăng ký trong bảng Course
    await updateCourseStudentCount(courseId, transaction);

    await transaction.commit();
    res.status(200).json({
      success: true,
      message: "Xóa đăng ký môn học thành công.",
    });
  } catch (error) {
    await transaction.rollback();
    console.error(`Lỗi khi xóa đăng ký môn học ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Không thể xóa đăng ký môn học.",
      error: error.message,
    });
  }
};

// @desc    Import course registrations from Excel file
// @route   POST /api/course-registrations/import
// @access  Private (Admin) - cần middleware 'multer'
exports.importCourseRegistrations = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng tải lên một file Excel." });
  }

  const transaction = await CourseRegistration.sequelize.transaction();
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      await transaction.rollback();
      return res
        .status(400)
        .json({
          success: false,
          message: "File Excel không có worksheet nào.",
        });
    }

    const registrationsToProcess = [];
    const errors = [];
    let createdCount = 0;
    let skippedCount = 0; // Số lượng bản ghi bị bỏ qua do trùng lặp hoặc lỗi dữ liệu

    // Tải tất cả sinh viên và môn học để tra cứu
    const students = await Student.findAll({
      attributes: ["student_id", "student_code"],
      transaction,
    });
    const studentMapByCode = new Map(
      students.map((s) => [s.student_code.toLowerCase(), s.student_id])
    );

    const courses = await Course.findAll({
      attributes: ["course_id", "course_code"],
      transaction,
    });
    const courseMapByCode = new Map(
      courses.map((c) => [c.course_code.toLowerCase(), c.course_id])
    );

    // Lấy tất cả đăng ký hiện có để kiểm tra trùng lặp
    const existingRegistrations = await CourseRegistration.findAll({
      attributes: ["student_id", "course_id", "semester"],
      raw: true, // Lấy dữ liệu thô để dễ dàng so sánh
      transaction,
    });
    const existingRegistrationSet = new Set(
      existingRegistrations.map(
        (reg) => `${reg.student_id}-${reg.course_id}-${reg.semester}`
      )
    );

    // Giả định hàng đầu tiên là tiêu đề (Student Code, Course Code, Semester)
    const headerRow = worksheet.getRow(1).values;
    const studentCodeCol =
      headerRow.findIndex(
        (h) =>
          typeof h === "string" && h.trim().toLowerCase() === "student code"
      ) + 1;
    const courseCodeCol =
      headerRow.findIndex(
        (h) => typeof h === "string" && h.trim().toLowerCase() === "course code"
      ) + 1;
    const semesterCol =
      headerRow.findIndex(
        (h) => typeof h === "string" && h.trim().toLowerCase() === "semester"
      ) + 1;

    if (studentCodeCol === 0 || courseCodeCol === 0 || semesterCol === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message:
          'File Excel thiếu các cột bắt buộc: "Student Code", "Course Code", "Semester".',
      });
    }

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const student_code_excel = row.getCell(studentCodeCol).text
        ? row.getCell(studentCodeCol).text.trim()
        : null;
      const course_code_excel = row.getCell(courseCodeCol).text
        ? row.getCell(courseCodeCol).text.trim()
        : null;
      const semester = row.getCell(semesterCol).text
        ? row.getCell(semesterCol).text.trim()
        : null;

      let student_id = null;
      let course_id = null;
      let currentErrors = [];

      if (!student_code_excel || !course_code_excel || !semester) {
        errors.push(
          `Hàng ${i}: Dữ liệu thiếu (Mã sinh viên, Mã môn học hoặc Học kỳ).`
        );
        skippedCount++;
        continue;
      }

      // Tra cứu student_id
      student_id = studentMapByCode.get(student_code_excel.toLowerCase());
      if (!student_id) {
        currentErrors.push(
          `Mã sinh viên "${student_code_excel}" không tồn tại.`
        );
      }

      // Tra cứu course_id
      course_id = courseMapByCode.get(course_code_excel.toLowerCase());
      if (!course_id) {
        currentErrors.push(`Mã môn học "${course_code_excel}" không tồn tại.`);
      }

      if (currentErrors.length > 0) {
        errors.push(
          `Hàng ${i} (${student_code_excel} - ${course_code_excel}): ${currentErrors.join(
            "; "
          )}`
        );
        skippedCount++;
        continue;
      }

      // Kiểm tra trùng lặp với dữ liệu đã có trong DB
      if (
        existingRegistrationSet.has(`${student_id}-${course_id}-${semester}`)
      ) {
        errors.push(
          `Hàng ${i} (${student_code_excel} - ${course_code_excel}): Đăng ký này đã tồn tại.`
        );
        skippedCount++;
        continue;
      }

      registrationsToProcess.push({ student_id, course_id, semester });
      existingRegistrationSet.add(`${student_id}-${course_id}-${semester}`); // Thêm vào set để kiểm tra trùng lặp trong file
    }

    const coursesToUpdateCount = new Set();

    for (const registrationData of registrationsToProcess) {
      try {
        await CourseRegistration.create(registrationData, { transaction });
        createdCount++;
        coursesToUpdateCount.add(registrationData.course_id); // Đánh dấu môn học cần cập nhật số lượng SV
      } catch (rowError) {
        // Lỗi có thể xảy ra nếu có ràng buộc duy nhất khác bị vi phạm trong quá trình tạo
        errors.push(
          `Lỗi khi tạo đăng ký cho sinh viên ${registrationData.student_id} - môn ${registrationData.course_id} - học kỳ ${registrationData.semester}: ${rowError.message}`
        );
        skippedCount++;
      }
    }

    // Cập nhật total_students_registered cho tất cả các môn học bị ảnh hưởng
    for (const courseId of coursesToUpdateCount) {
      await updateCourseStudentCount(courseId, transaction);
    }

    await transaction.commit();
    res.status(200).json({
      success: true,
      message: "Import đăng ký môn học hoàn tất.",
      created: createdCount,
      skipped: skippedCount,
      failed: errors.length,
      errors: errors,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Lỗi khi import file Excel:", error);
    res.status(500).json({
      success: false,
      message:
        "Không thể import file Excel. Đảm bảo file đúng định dạng và có dữ liệu hợp lệ.",
      error: error.message,
    });
  }
};
