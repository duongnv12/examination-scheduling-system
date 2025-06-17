// backend/src/models/Faculty.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Faculty = sequelize.define('Faculty', {
    faculty_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    faculty_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    full_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    department: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    is_available_for_invigilation: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = Faculty;