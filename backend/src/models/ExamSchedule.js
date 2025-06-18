// backend/src/models/ExamSchedule.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ExamSchedule = sequelize.define(
    "ExamSchedule",
    {
      schedule_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      course_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Courses",
          key: "course_id",
        },
      },
      room_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Rooms",
          key: "room_id",
        },
      },
      exam_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      start_time: {
        type: DataTypes.STRING, // Dạng 'HH:MM'
        allowNull: false,
      },
      end_time: {
        type: DataTypes.STRING, // Dạng 'HH:MM'
        allowNull: false,
      },
      exam_slot: {
        // ID của ca thi (ví dụ: '1', '2', '5')
        type: DataTypes.STRING,
        allowNull: false,
      },
      scheduled_students_count: {
        // Số lượng sinh viên được xếp vào lịch này
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      semester: {
        // Học kỳ của kỳ thi
        type: DataTypes.STRING,
        allowNull: false,
      },
      exam_type: {
        // Ví dụ: 'Midterm', 'Final', 'Make-up'
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "ExamSchedules",
      timestamps: true,
    }
  );
  return ExamSchedule;
};
