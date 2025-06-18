// backend/src/app.js
const express = require("express");
const cors = require("cors"); // Để xử lý CORS
const dotenv = require("dotenv"); // Để tải biến môi trường từ .env
const path = require("path"); // Module để làm việc với đường dẫn file/thư mục

// Tải biến môi trường từ file .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Import database connection and models (chỉ import để định nghĩa models và thiết lập quan hệ)
// Việc đồng bộ hóa DB sẽ diễn ra ở server.js
require("./models");

// Import main routes
const apiRoutes = require("./routes/index");

const app = express();

// --- Middleware ---

// Enable CORS
// Cho phép tất cả các miền truy cập API của bạn.
// Trong môi trường production, bạn nên giới hạn chỉ các miền đáng tin cậy.
app.use(cors());

// Body parser: Cho phép Express đọc dữ liệu JSON được gửi trong body của request
app.use(express.json());

// --- Routes ---

// Gắn tất cả các API routes dưới tiền tố /api
app.use("/api", apiRoutes);

// --- Xử lý lỗi (Error Handling Middleware) ---
// Middleware này sẽ bắt tất cả các lỗi xảy ra trong các route hoặc middleware trước đó.
app.use((err, req, res, next) => {
  console.error(err.stack); // Ghi log stack trace của lỗi để debug
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Đã xảy ra lỗi server nội bộ.",
    // Chỉ gửi chi tiết lỗi trong môi trường phát triển
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// Xuất ứng dụng Express để được sử dụng bởi server.js
module.exports = app;
