// backend/src/models/CourseRegistration.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CourseRegistration = sequelize.define(
    "CourseRegistration",
    {
      registration_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Students", // Tên bảng Students
          key: "student_id",
        },
      },
      course_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Courses", // Tên bảng Courses
          key: "course_id",
        },
      },
      registration_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      semester: {
        // Ví dụ: '2024-2025/1'
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "CourseRegistrations", // Tên bảng trong cơ sở dữ liệu
      timestamps: true,
      // Đảm bảo mỗi sinh viên chỉ đăng ký một môn một lần trong một học kỳ cụ thể
      indexes: [
        {
          unique: true,
          fields: ["student_id", "course_id", "semester"],
        },
      ],
    }
  );
  return CourseRegistration;
};
