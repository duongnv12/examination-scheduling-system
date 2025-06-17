// backend/src/models/CourseRegistration.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Student = require('./Student');
const Course = require('./Course');

const CourseRegistration = sequelize.define('CourseRegistrations', {
    registration_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Student,
            key: 'student_id'
        }
    },
    course_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Course,
            key: 'course_id'
        }
    },
    semester: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['student_id', 'course_id', 'semester']
        }
    ]
});

// Define associations
Student.hasMany(CourseRegistration, { foreignKey: 'student_id' });
CourseRegistration.belongsTo(Student, { foreignKey: 'student_id' });

Course.hasMany(CourseRegistration, { foreignKey: 'course_id' });
CourseRegistration.belongsTo(Course, { foreignKey: 'course_id' });

module.exports = CourseRegistration;