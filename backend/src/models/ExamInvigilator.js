// backend/src/models/ExamInvigilator.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ExamSchedule = require('./ExamSchedule');
const Faculty = require('./Faculty');

const ExamInvigilator = sequelize.define('ExamInvigilators', {
    exam_invigilator_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    schedule_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: ExamSchedule,
            key: 'schedule_id'
        }
    },
    faculty_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Faculty,
            key: 'faculty_id'
        }
    },
    invigilator_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isIn: [[1, 2]] // Must be 1 or 2
        }
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['schedule_id', 'faculty_id'] // A faculty member cannot invigilate the same schedule twice
        },
        {
            unique: true,
            fields: ['schedule_id', 'invigilator_order'] // Ensures only one invigilator with order 1 and one with order 2 per schedule
        }
    ]
});

// Define associations
ExamSchedule.hasMany(ExamInvigilator, { foreignKey: 'schedule_id' });
ExamInvigilator.belongsTo(ExamSchedule, { foreignKey: 'schedule_id' });

Faculty.hasMany(ExamInvigilator, { foreignKey: 'faculty_id' });
ExamInvigilator.belongsTo(Faculty, { foreignKey: 'faculty_id' });

module.exports = ExamInvigilator;