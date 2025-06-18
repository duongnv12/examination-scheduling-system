// backend/src/config/database.js
const { Sequelize } = require("sequelize");
const path = require("path");
const dotenv = require("dotenv");

// Load env vars
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false, // Thay đổi thành console.log để thấy các query Sequelize tạo ra
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Import Models
const Department = require("../models/Department")(sequelize); // Chú ý cách import model
const Room = require("../models/Room")(sequelize);
const Student = require("../models/Student")(sequelize); // Import Student model

// Define Associations
// Department - Student (One-to-Many)
Department.hasMany(Student, {
  foreignKey: {
    name: "department_id",
    allowNull: false, // Đảm bảo khóa ngoại không null nếu sinh viên luôn thuộc về một khoa
  },
  onDelete: "CASCADE", // Tùy chọn: Khi xóa khoa, xóa luôn sinh viên thuộc khoa đó
  as: "students", // Alias cho quan hệ
});
Student.belongsTo(Department, {
  foreignKey: {
    name: "department_id",
    allowNull: false,
  },
  as: "Department", // Alias cho quan hệ
});

// Các quan hệ khác nếu có (ví dụ Room - ExamSlot, v.v.)
// Room.hasMany(ExamSlot, { foreignKey: 'room_id' });
// ExamSlot.belongsTo(Room, { foreignKey: 'room_id' });

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Kết nối cơ sở dữ liệu thành công!".cyan.underline);

    // Đồng bộ hóa tất cả các model (tạo bảng nếu chưa có)
    // Lưu ý: `alter: true` sẽ cố gắng thay đổi bảng hiện có để khớp với model,
    // nhưng có thể gây mất dữ liệu trong một số trường hợp với các thay đổi lớn.
    // `force: true` sẽ xóa bảng và tạo lại, dùng cẩn thận trong dev.
    // Trong production, bạn nên dùng migration.
    await sequelize.sync({ alter: true });
    console.log(
      "Đồng bộ hóa các models với cơ sở dữ liệu thành công!".green.bold
    );
  } catch (error) {
    console.error("Lỗi kết nối cơ sở dữ liệu:".red.bold, error);
    process.exit(1); // Thoát ứng dụng nếu lỗi kết nối DB
  }
};

console.log("DB_PASSWORD:", process.env.DB_PASSWORD);

module.exports = {
  sequelize,
  Sequelize, // Export Sequelize class
  Department,
  Room,
  Student,
  Lecturer,
  connectDB,
};
