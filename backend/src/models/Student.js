// backend/src/models/Student.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Students', {
    student_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    student_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    full_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    class_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
});

module.exports = Student;