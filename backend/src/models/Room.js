// backend/src/models/Room.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Room = sequelize.define('Rooms', { // 'Rooms' là tên bảng trong DB
    room_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    room_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    room_type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = Room;