// backend/src/models/Student.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Student = sequelize.define(
    "Student",
    {
      student_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      student_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      full_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      gender: {
        // Đã thêm trường này
        type: DataTypes.ENUM("Nam", "Nữ", "Khác"),
        allowNull: false,
      },
      date_of_birth: {
        // Đã sửa thành NOT NULL
        type: DataTypes.DATEONLY, // Chỉ lưu ngày, không có thời gian
        allowNull: false,
      },
      class_name: {
        type: DataTypes.STRING(100),
        allowNull: true, // Có thể cho phép NULL
      },
      email: {
        // Đã sửa thành NOT NULL
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true, // Thêm validation email
        },
      },
      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: true, // Có thể cho phép NULL
      },
      address: {
        // Đã thêm trường này
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      department_id: {
        // Đã thêm khóa ngoại này
        type: DataTypes.UUID,
        allowNull: false,
        // Không cần references ở đây, sẽ định nghĩa trong associate
      },
    },
    {
      tableName: "Students", // Tên bảng trong DB
      timestamps: true, // Tự động quản lý createdAt và updatedAt
      // BỎ underscored: true NẾU CÁC CỘT createdAt, updatedAt TRONG DB LÀ camelCase
      // Nếu các cột trong DB là created_at, updated_at (snake_case), thì giữ underscored: true
      // Dựa trên db.sql mới nhất của bạn, bạn đang dùng "createdAt", "updatedAt" => BỎ underscored: true hoặc set false.
      underscored: false, // Để khớp với createdAt, updatedAt trong db.sql của bạn
    }
  );

  // Định nghĩa mối quan hệ
  Student.associate = (models) => {
    Student.belongsTo(models.Department, {
      foreignKey: "department_id",
      as: "department",
    });
    Student.hasMany(models.CourseRegistration, {
      foreignKey: "student_id",
      as: "courseRegistrations",
    });
  };

  return Student;
};
