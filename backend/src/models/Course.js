// backend/src/models/Course.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Courses', {
    course_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    course_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    course_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    exam_duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    exam_format: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    total_students_registered: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

module.exports = Course;