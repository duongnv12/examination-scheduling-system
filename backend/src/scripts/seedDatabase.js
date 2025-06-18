// backend/src/scripts/seedDatabase.js
const { Op } = require('sequelize');
const dotenv = require('dotenv'); // Import dotenv
dotenv.config({ path: __dirname + "/../../.env" });

const {
  sequelize,
  Course,
  Room,
  Student,
  Lecturer, 
  Department,
  CourseRegistration,
  ExamSchedule,
  ExamInvigilator,
} = require("../config/database"); // Import từ config/database để có tất cả models đã associate
const { v4: uuidv4 } = require("uuid"); // Để tạo UUID cho các ID (không còn cần thiết nếu dùng DEFAULT gen_random_uuid())

async function seedDatabase() {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối cơ sở dữ liệu thành công.");

    // Đồng bộ hóa các model.
    // Cẩn thận: { force: true } sẽ XÓA TẤT CẢ DỮ LIỆU HIỆN CÓ trong các bảng này.
    // Chỉ dùng trong môi trường phát triển!
    console.log("🔄 Đồng bộ hóa các model (Xóa dữ liệu cũ và tạo lại bảng)...");
    // Đảm bảo rằng force: true được sử dụng một cách có ý thức
    await sequelize.sync({ force: true });
    console.log("✅ Đồng bộ hóa model hoàn tất.");

    console.log("--- Bắt đầu thêm dữ liệu mẫu ---");

    // --- 1. Thêm dữ liệu Khoa/Phòng ban (Departments) ---
    console.log("Adding Departments...");
    const departmentsData = [
      {
        department_code: "CNTT",
        department_name: "Khoa Công nghệ thông tin",
        description: "Chuyên ngành IT, PM, KHMT",
      },
      {
        department_code: "DT",
        department_name: "Khoa Điện tử",
        description: "Chuyên ngành Điện tử, Viễn thông",
      },
      {
        department_code: "KT",
        department_name: "Khoa Kinh tế",
        description: "Chuyên ngành Kinh tế, Quản trị kinh doanh",
      },
      {
        department_code: "TA",
        department_name: "Khoa Tiếng Anh",
        description: "Đào tạo ngôn ngữ Anh",
      },
    ];
    const createdDepartments = await Department.bulkCreate(departmentsData);
    console.log(`✅ Đã thêm ${createdDepartments.length} khoa/phòng ban.`);

    // Lấy ID của các khoa đã tạo để gán cho giảng viên và môn học
    const deptIT = createdDepartments.find((d) => d.department_code === "CNTT");
    const deptElec = createdDepartments.find((d) => d.department_code === "DT");
    const deptEco = createdDepartments.find((d) => d.department_code === "KT");
    const deptEng = createdDepartments.find((d) => d.department_code === "TA");

    // --- 2. Thêm dữ liệu Giảng viên (Lecturers) ---
    console.log("Adding Lecturers...");
    const lecturersData = [];
    for (let i = 1; i <= 15; i++) {
      // 15 giảng viên có sẵn để coi thi
      const lecturerCode = `GV${String(i).padStart(3, "0")}`;
      let departmentId;
      if (i <= 7) departmentId = deptIT.department_id; // Giảng viên CNTT
      else if (i <= 12)
        departmentId = deptElec.department_id; // Giảng viên Điện tử
      else departmentId = deptEco.department_id; // Giảng viên Kinh tế

      lecturersData.push({
        lecturer_code: lecturerCode,
        full_name: `Giảng Viên ${i}`,
        email: `${lecturerCode.toLowerCase()}@example.com`,
        phone_number: `09${Math.floor(Math.random() * 100000000)
          .toString()
          .padStart(8, "0")}`,
        department_id: departmentId, // Gán khoa
        is_available_for_invigilation: true,
      });
    }
    // Thêm 2 giảng viên không sẵn sàng coi thi
    lecturersData.push({
      lecturer_code: "GV016",
      full_name: "Giảng Viên K không sẵn",
      email: "gv016@example.com",
      phone_number: "0912345678",
      department_id: deptIT.department_id,
      is_available_for_invigilation: false,
    });
    lecturersData.push({
      lecturer_code: "GV017",
      full_name: "Giảng Viên L bận",
      email: "gv017@example.com",
      phone_number: "0987654321",
      department_id: deptElec.department_id,
      is_available_for_invigilation: false,
    });

    const createdLecturers = await Lecturer.bulkCreate(lecturersData);
    console.log(`✅ Đã thêm ${createdLecturers.length} giảng viên.`);

    // --- 3. Thêm dữ liệu Môn học (Courses) ---
    console.log("Adding Courses...");
    const coursesData = [
      // Gán môn học vào khoa tương ứng
      {
        course_code: "CS101",
        course_name: "Lập trình C",
        credit_hours: 3,
        exam_duration_minutes: 90,
        exam_format: "Tự luận",
        department_id: deptIT.department_id,
      },
      {
        course_code: "MA202",
        course_name: "Đại số tuyến tính",
        credit_hours: 4,
        exam_duration_minutes: 120,
        exam_format: "Tự luận",
        department_id: deptIT.department_id,
      },
      {
        course_code: "PH303",
        course_name: "Vật lý đại cương",
        credit_hours: 3,
        exam_duration_minutes: 90,
        exam_format: "Trắc nghiệm",
        department_id: deptElec.department_id,
      },
      {
        course_code: "NE404",
        course_name: "Mạng máy tính",
        credit_hours: 3,
        exam_duration_minutes: 60,
        exam_format: "Trắc nghiệm",
        department_id: deptIT.department_id,
      },
      {
        course_code: "UX505",
        course_name: "Thiết kế giao diện",
        credit_hours: 3,
        exam_duration_minutes: 120,
        exam_format: "Thực hành",
        department_id: deptIT.department_id,
      },
      {
        course_code: "IT606",
        course_name: "Cấu trúc dữ liệu",
        credit_hours: 4,
        exam_duration_minutes: 90,
        exam_format: "Tự luận",
        department_id: deptIT.department_id,
      },
      {
        course_code: "SE707",
        course_name: "Kỹ thuật phần mềm",
        credit_hours: 3,
        exam_duration_minutes: 90,
        exam_format: "Tự luận",
        department_id: deptIT.department_id,
      },
      {
        course_code: "AI808",
        course_name: "Trí tuệ nhân tạo",
        credit_hours: 4,
        exam_duration_minutes: 180,
        exam_format: "Đồ án",
        department_id: deptIT.department_id,
      },
      {
        course_code: "DS909",
        course_name: "Khoa học dữ liệu",
        credit_hours: 3,
        exam_duration_minutes: 120,
        exam_format: "Trắc nghiệm",
        department_id: deptIT.department_id,
      },
      {
        course_code: "CY110",
        course_name: "An toàn thông tin",
        credit_hours: 3,
        exam_duration_minutes: 90,
        exam_format: "Trắc nghiệm",
        department_id: deptIT.department_id,
      },
      {
        course_code: "EN101",
        course_name: "Tiếng Anh tổng quát",
        credit_hours: 3,
        exam_duration_minutes: 90,
        exam_format: "Trắc nghiệm",
        department_id: deptEng.department_id,
      },
      {
        course_code: "ECO201",
        course_name: "Kinh tế vi mô",
        credit_hours: 3,
        exam_duration_minutes: 90,
        exam_format: "Tự luận",
        department_id: deptEco.department_id,
      },
    ];
    const createdCourses = await Course.bulkCreate(coursesData);
    console.log(`✅ Đã thêm ${createdCourses.length} môn học.`);

    // --- 4. Thêm dữ liệu Phòng thi (Rooms) ---
    console.log("Adding Rooms...");
    const roomsData = [
      {
        room_name: "P101",
        capacity: 50,
        room_type: "Phòng lý thuyết",
        description: "Tầng 1",
        is_active: true,
      },
      {
        room_name: "P102",
        capacity: 30,
        room_type: "Phòng lý thuyết",
        description: "Tầng 1",
        is_active: true,
      },
      {
        room_name: "P103",
        capacity: 70,
        room_type: "Phòng lý thuyết",
        description: "Tầng 1",
        is_active: true,
      },
      {
        room_name: "P104",
        capacity: 40,
        room_type: "Phòng lý thuyết",
        description: "Tầng 1",
        is_active: true,
      },
      {
        room_name: "P105",
        capacity: 60,
        room_type: "Phòng lý thuyết",
        description: "Tầng 1",
        is_active: true,
      },
      {
        room_name: "Lab201",
        capacity: 25,
        room_type: "Phòng máy tính",
        description: "Máy tính Core i7",
        is_active: true,
      },
      {
        room_name: "Lab202",
        capacity: 35,
        room_type: "Phòng máy tính",
        description: "Máy tính cũ",
        is_active: true,
      },
      {
        room_name: "P203",
        capacity: 80,
        room_type: "Phòng lý thuyết",
        description: "Tầng 2",
        is_active: true,
      },
      {
        room_name: "P204",
        capacity: 45,
        room_type: "Phòng lý thuyết",
        description: "Tầng 2",
        is_active: true,
      },
      {
        room_name: "P205",
        capacity: 55,
        room_type: "Phòng lý thuyết",
        description: "Tầng 2",
        is_active: true,
      },
      {
        room_name: "HoiTruongLon",
        capacity: 200,
        room_type: "Hội trường",
        description: "Sức chứa lớn",
        is_active: true,
      },
      {
        room_name: "PhongTrong",
        capacity: 10,
        room_type: "Phòng nhỏ",
        description: "Đang bảo trì",
        is_active: false,
      }, // Phòng không hoạt động
    ];
    const createdRooms = await Room.bulkCreate(roomsData);
    console.log(`✅ Đã thêm ${createdRooms.length} phòng thi.`);

    // --- 5. Thêm dữ liệu Sinh viên (Students) ---
    console.log("Adding Students...");
    const studentsData = [];
    const genders = ["Nam", "Nữ", "Khác"];
    const addresses = [
      "Hà Nội",
      "TP. Hồ Chí Minh",
      "Đà Nẵng",
      "Hải Phòng",
      "Cần Thơ",
      "Huế",
      "Nha Trang",
      "Đà Lạt",
      "Vũng Tàu",
      "Bình Dương",
    ];

    for (let i = 1; i <= 100; i++) {
      const studentCode = `SV${String(i).padStart(3, "0")}`;
      let departmentIdForStudent;
      // Gán sinh viên ngẫu nhiên vào các khoa
      if (i <= 50) departmentIdForStudent = deptIT.department_id; // 50 SV CNTT
      else if (i <= 75)
        departmentIdForStudent = deptElec.department_id; // 25 SV Điện tử
      else if (i <= 90)
        departmentIdForStudent = deptEco.department_id; // 15 SV Kinh tế
      else departmentIdForStudent = deptEng.department_id; // 10 SV Tiếng Anh

      studentsData.push({
        student_code: studentCode,
        full_name: `Sinh Viên ${i}`,
        gender: genders[Math.floor(Math.random() * genders.length)], // Gán giới tính ngẫu nhiên
        date_of_birth: `2003-01-${String((i % 28) + 1).padStart(2, "0")}`,
        class_name: `K${18 + Math.floor(i / 20)}PM${(i % 5) + 1}`,
        email: `${studentCode.toLowerCase()}@example.com`,
        phone_number: `09${Math.floor(Math.random() * 100000000)
          .toString()
          .padStart(8, "0")}`,
        address: addresses[Math.floor(Math.random() * addresses.length)], // Gán địa chỉ ngẫu nhiên
        department_id: departmentIdForStudent, // Gán khoa cho sinh viên
      });
    }
    const createdStudents = await Student.bulkCreate(studentsData);
    console.log(`✅ Đã thêm ${createdStudents.length} sinh viên.`);

    // --- 6. Thêm dữ liệu Đăng ký môn học (Course Registrations) ---
    console.log("Adding Course Registrations...");
    const registrationsData = [];
    const semester = "2025-2026/1"; // Học kỳ cho các đăng ký này

    // Mỗi sinh viên đăng ký ngẫu nhiên 2-4 môn
    for (const student of createdStudents) {
      const numCoursesToRegister = Math.floor(Math.random() * 3) + 2; // 2 đến 4 môn
      const shuffledCourses = createdCourses.sort(() => 0.5 - Math.random()); // Xáo trộn môn học

      const selectedCourseIds = new Set();
      for (let i = 0; i < numCoursesToRegister; i++) {
        if (
          shuffledCourses[i] &&
          !selectedCourseIds.has(shuffledCourses[i].course_id)
        ) {
          registrationsData.push({
            student_id: student.student_id,
            course_id: shuffledCourses[i].course_id,
            registration_date: new Date(),
            semester: semester,
          });
          selectedCourseIds.add(shuffledCourses[i].course_id);
        }
      }
    }
    const createdRegistrations = await CourseRegistration.bulkCreate(
      registrationsData
    );
    console.log(`✅ Đã thêm ${createdRegistrations.length} đăng ký môn học.`);

    // --- 7. Thêm dữ liệu Lịch thi (Exam Schedules) ---
    console.log("Adding Exam Schedules...");
    const examSchedulesData = [];
    const examDate = "2025-06-20"; // Ngày thi mẫu
    const examSlots = [
      { slot: "Ca 1", start: "07:30", end: "09:00" },
      { slot: "Ca 2", start: "09:30", end: "11:00" },
      { slot: "Ca 3", start: "13:00", end: "14:30" },
    ];
    const examTypes = ["Final", "Midterm"];

    // Tạo một số lịch thi mẫu
    // Giả sử mỗi môn học sẽ có một kỳ thi
    for (let i = 0; i < createdCourses.length; i++) {
      const course = createdCourses[i];
      const room = createdRooms[i % createdRooms.length]; // Chọn phòng ngẫu nhiên
      const slot = examSlots[i % examSlots.length]; // Chọn ca ngẫu nhiên
      const examType = examTypes[i % examTypes.length]; // Chọn loại kỳ thi ngẫu nhiên

      // Kiểm tra xem đã có lịch thi cho môn này trong ca này vào ngày này chưa
      // Hoặc phòng này đã được sử dụng trong ca này vào ngày này chưa
      // Logic này phức tạp hơn với `bulkCreate`, thường sẽ được xử lý khi tạo từng lịch.
      // Để đơn giản hóa seeding, chúng ta giả định không có xung đột trong dữ liệu mẫu này.

      examSchedulesData.push({
        course_id: course.course_id,
        room_id: room.room_id,
        exam_date: examDate,
        exam_slot: slot.slot,
        start_time: slot.start,
        end_time: slot.end,
        // Số sinh viên dự kiến thi: lấy ngẫu nhiên một số nhỏ hơn sức chứa phòng
        scheduled_students_count: Math.min(
          room.capacity,
          Math.floor(Math.random() * 50) + 10 // Ít nhất 10 SV, tối đa 59
        ),
        semester: semester,
        exam_type: examType,
      });
    }
    const createdExamSchedules = await ExamSchedule.bulkCreate(
      examSchedulesData
    );
    console.log(`✅ Đã thêm ${createdExamSchedules.length} lịch thi.`);

    // --- 8. Thêm dữ liệu Phân công Giám thị (Exam Invigilators) ---
    console.log("Adding Exam Invigilators...");
    const invigilatorsData = [];
    // Mỗi lịch thi cần 2 giám thị
    for (const schedule of createdExamSchedules) {
      // Lấy ngẫu nhiên 2 giảng viên có sẵn để coi thi
      const availableLecturers = createdLecturers.filter(
        (l) => l.is_available_for_invigilation
      );
      if (availableLecturers.length < 2) {
        console.warn(
          `⚠️ Không đủ giảng viên sẵn sàng cho lịch thi ${schedule.schedule_id}. Bỏ qua phân công giám thị.`
        );
        continue;
      }

      // Xáo trộn và chọn 2 giảng viên duy nhất
      const selectedLecturers = availableLecturers
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

      invigilatorsData.push({
        schedule_id: schedule.schedule_id,
        lecturer_id: selectedLecturers[0].lecturer_id,
        role: "Giám thị 1",
        invigilator_order: 1,
      });
      invigilatorsData.push({
        schedule_id: schedule.schedule_id,
        lecturer_id: selectedLecturers[1].lecturer_id,
        role: "Giám thị 2",
        invigilator_order: 2,
      });
    }
    const createdInvigilators = await ExamInvigilator.bulkCreate(
      invigilatorsData
    );
    console.log(`✅ Đã thêm ${createdInvigilators.length} phân công giám thị.`);

    console.log("--- Hoàn tất thêm dữ liệu mẫu ---");
  } catch (error) {
    console.error("❌ Lỗi khi thêm dữ liệu mẫu:", error);
  } finally {
    // Đảm bảo đóng kết nối Sequelize sau khi hoàn tất hoặc gặp lỗi
    if (sequelize.authenticate) {
      // Kiểm tra xem sequelize có được khởi tạo và kết nối không
      await sequelize.close();
      console.log("Đóng kết nối cơ sở dữ liệu.");
    }
  }
}

// Chạy hàm seedDatabase
seedDatabase();
