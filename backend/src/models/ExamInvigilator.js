// backend/src/models/ExamInvigilator.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ExamInvigilator = sequelize.define(
    "ExamInvigilator",
    {
      invigilator_id: {
        // ID duy nhất cho mỗi bản ghi phân công
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      schedule_id: {
        // Lịch thi mà giám thị được phân công
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "ExamSchedules", // Tên bảng ExamSchedules
          key: "schedule_id",
        },
      },
      lecturer_id: {
        // Giảng viên được phân công (đổi từ faculty_id)
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Lecturers", // Tên bảng Lecturers
          key: "lecturer_id",
        },
      },
      role: {
        // Ví dụ: 'Giám thị 1', 'Giám thị 2', 'Cán bộ phòng thi'
        type: DataTypes.STRING,
        allowNull: true,
      },
      invigilator_order: {
        // Thứ tự giám thị (ví dụ: 1 hoặc 2)
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      tableName: "ExamInvigilators", // Tên bảng trong cơ sở dữ liệu
      timestamps: true,
      // Đảm bảo một giảng viên không được phân công nhiều lần cho cùng một lịch thi
      indexes: [
        {
          unique: true,
          fields: ["schedule_id", "lecturer_id"],
        },
      ],
    }
  );
  return ExamInvigilator;
};
