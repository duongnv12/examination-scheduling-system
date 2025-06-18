// backend/src/models/Lecturer.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Lecturer = sequelize.define(
    "Lecturer",
    {
      lecturer_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      lecturer_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      full_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        // Trường email đã được thêm vào db.sql và là NOT NULL
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true, // Thêm validation email
        },
      },
      phone_number: {
        // Trường phone_number đã được thêm vào db.sql
        type: DataTypes.STRING(20),
        allowNull: true, // Cho phép NULL nếu không bắt buộc nhập số điện thoại
      },
      department_id: {
        // Khóa ngoại tới Departments đã được thêm vào db.sql và là NOT NULL
        type: DataTypes.UUID,
        allowNull: false,
        // Không cần references ở đây, sẽ định nghĩa trong associate
      },
      is_available_for_invigilation: {
        // Trường này cũng đã được thêm vào db.sql
        type: DataTypes.BOOLEAN,
        defaultValue: true, // Mặc định là true
        allowNull: false,
      },
    },
    {
      tableName: "Lecturers", // Tên bảng trong DB
      timestamps: true, // Tự động quản lý createdAt và updatedAt
      // Bỏ underscored: true nếu các cột createdAt, updatedAt trong DB là camelCase.
      // Dựa trên db.sql của bạn, bạn đang dùng "createdAt", "updatedAt" => BỎ underscored: true hoặc set false.
      underscored: false, // Để khớp với createdAt, updatedAt trong db.sql của bạn
    }
  );

  // Định nghĩa mối quan hệ
  Lecturer.associate = (models) => {
    Lecturer.belongsTo(models.Department, {
      foreignKey: "department_id",
      as: "department",
    });
    Lecturer.hasMany(models.ExamInvigilator, {
      foreignKey: "lecturer_id",
      as: "examInvigilators",
    });
  };

  return Lecturer;
};
