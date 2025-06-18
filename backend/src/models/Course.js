// backend/src/models/Course.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Course = sequelize.define(
    "Course",
    {
      course_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      course_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      course_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      credit_hours: {
        // Số tín chỉ
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      exam_duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 30, // Thời lượng thi tối thiểu 30 phút
        },
      },
      exam_format: {
        type: DataTypes.STRING, // Ví dụ: 'Tự luận', 'Trắc nghiệm', 'Thực hành'
        allowNull: true,
      },
      // Khóa ngoại đến bảng Departments (khoa quản lý môn học)
      department_id: {
        type: DataTypes.UUID,
        allowNull: false, // Môn học phải thuộc một khoa
        references: {
          model: "Departments", // Tên bảng Departments
          key: "department_id",
        },
      },
      total_students_registered: {
        // Có thể dùng để lưu cache số SV đăng ký, hoặc tính toán lúc xếp lịch
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
    },
    {
      tableName: "Courses",
      timestamps: true,
    }
  );
  return Course;
};
