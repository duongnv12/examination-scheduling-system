// backend/src/models/Department.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Department = sequelize.define(
    "Department",
    {
      department_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      department_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      department_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // createdAt và updatedAt được Sequelize tự động thêm vào nếu timestamps là true
    },
    {
      tableName: "Departments", // Tên bảng trong DB
      timestamps: true, // Tự động quản lý createdAt và updatedAt
      underscored: true, // Chuyển camelCase sang snake_case cho tên cột (ví dụ: createdAt -> created_at)
    }
  );

  // Định nghĩa mối quan hệ sau khi tất cả models đã được định nghĩa
  Department.associate = (models) => {
    Department.hasMany(models.Student, {
      foreignKey: "department_id",
      as: "students", // Alias cho quan hệ
    });
    Department.hasMany(models.Lecturer, {
      // Thêm quan hệ với Lecturer
      foreignKey: "department_id",
      as: "lecturers",
    });
    Department.hasMany(models.Course, {
      foreignKey: "department_id",
      as: "courses",
    });
  };

  return Department;
};
