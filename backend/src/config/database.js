// backend/src/config/database.js

const { Sequelize } = require('sequelize');
require('dotenv').config(); // Load environment variables

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false, // Set to true to see SQL queries in console
        define: {
            timestamps: false, // Tắt timestamps (createdAt, updatedAt) mặc định của Sequelize nếu không dùng
            freezeTableName: true // Không thêm 's' vào tên bảng (ví dụ: 'Rooms' thay vì 'Room')
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = sequelize;