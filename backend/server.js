// backend/server.js
require('dotenv').config(); // Luôn đặt ở đầu để load biến môi trường
const app = require('./src/app'); // Import app từ file app.js
const { sequelize } = require('./src/models'); // Import sequelize instance và các models

const PORT = process.env.PORT || 5000;

// Kết nối DB và đồng bộ Models trước khi khởi động server
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    // Đồng bộ hóa các model với database (chỉ dùng trong dev)
    // Dùng { alter: true } để cập nhật cấu trúc bảng mà không xóa dữ liệu
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Database & tables synchronized!');
    // Khởi động server sau khi DB đã sẵn sàng
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database or sync models:', err);
    process.exit(1); // Thoát ứng dụng nếu không kết nối được DB
  });