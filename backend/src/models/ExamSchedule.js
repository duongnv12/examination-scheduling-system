// backend/src/models/ExamSchedule.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Course = require('./Course');
const Room = require('./Room');

const ExamSchedule = sequelize.define('ExamSchedules', {
    schedule_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    course_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Course,
            key: 'course_id'
        }
    },
    room_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Room,
            key: 'room_id'
        }
    },
    exam_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    exam_slot: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    scheduled_students_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['room_id', 'exam_date', 'exam_slot']
        },
        {
            unique: true,
            fields: ['course_id', 'exam_date', 'exam_slot']
        }
    ],
    // Custom validation to ensure start_time < end_time
    validate: {
        isStartTimeBeforeEndTime() {
            if (this.start_time && this.end_time && this.start_time >= this.end_time) {
                throw new Error('Start time must be before end time.');
            }
        }
    }
});

// Define associations
Course.hasMany(ExamSchedule, { foreignKey: 'course_id' });
ExamSchedule.belongsTo(Course, { foreignKey: 'course_id' });

Room.hasMany(ExamSchedule, { foreignKey: 'room_id' });
ExamSchedule.belongsTo(Room, { foreignKey: 'room_id' });

module.exports = ExamSchedule;