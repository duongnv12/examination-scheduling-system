// backend/src/models/index.js
const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const db = {};

// Khởi tạo tất cả các models
db.Course = require("./Course")(sequelize);
db.CourseRegistration = require("./CourseRegistration")(sequelize);
db.Department = require("./Department")(sequelize); // MỚI
db.ExamInvigilator = require("./ExamInvigilator")(sequelize);
db.ExamSchedule = require("./ExamSchedule")(sequelize);
db.Lecturer = require("./Lecturer")(sequelize); // Đổi tên từ Faculty
db.Room = require("./Room")(sequelize);
db.Student = require("./Student")(sequelize);

// Thiết lập các mối quan hệ (Associations)
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Quan hệ cho Course
db.Course.belongsTo(db.Department, {
  foreignKey: "department_id",
  as: "Department",
});
db.Department.hasMany(db.Course, {
  foreignKey: "department_id",
  as: "Courses",
});

// Quan hệ cho CourseRegistration
db.CourseRegistration.belongsTo(db.Student, {
  foreignKey: "student_id",
  as: "Student",
});
db.Student.hasMany(db.CourseRegistration, {
  foreignKey: "student_id",
  as: "CourseRegistrations",
});
db.CourseRegistration.belongsTo(db.Course, {
  foreignKey: "course_id",
  as: "Course",
});
db.Course.hasMany(db.CourseRegistration, {
  foreignKey: "course_id",
  as: "CourseRegistrations",
});

// Quan hệ cho ExamInvigilator
db.ExamInvigilator.belongsTo(db.ExamSchedule, {
  foreignKey: "schedule_id",
  as: "ExamSchedule",
});
db.ExamSchedule.hasMany(db.ExamInvigilator, {
  foreignKey: "schedule_id",
  as: "Invigilators",
});
db.ExamInvigilator.belongsTo(db.Lecturer, {
  foreignKey: "lecturer_id",
  as: "Lecturer",
}); // Đổi từ Faculty
db.Lecturer.hasMany(db.ExamInvigilator, {
  foreignKey: "lecturer_id",
  as: "InvigilationAssignments",
}); // Đổi từ Faculty

// Quan hệ cho ExamSchedule
db.ExamSchedule.belongsTo(db.Course, { foreignKey: "course_id", as: "Course" });
db.Course.hasMany(db.ExamSchedule, {
  foreignKey: "course_id",
  as: "ExamSchedules",
});
db.ExamSchedule.belongsTo(db.Room, { foreignKey: "room_id", as: "Room" });
db.Room.hasMany(db.ExamSchedule, {
  foreignKey: "room_id",
  as: "ExamSchedules",
});

// Quan hệ cho Lecturer (giảng viên thuộc khoa)
db.Lecturer.belongsTo(db.Department, {
  foreignKey: "department_id",
  as: "Department",
});
db.Department.hasMany(db.Lecturer, {
  foreignKey: "department_id",
  as: "Lecturers",
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
