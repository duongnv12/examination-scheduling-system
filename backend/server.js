// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors"); // Import colors for console output
const cors = require("cors"); // Import CORS
const { connectDB } = require("./src/config/database"); // Import connectDB và các models
const errorHandler = require("./src/middleware/error"); // Import error handler

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

const app = express();

// Body parser (for JSON)
app.use(express.json());

// Enable CORS
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Route files
const departmentRoutes = require("./src/routes/departmentRoutes");
const roomRoutes = require("./src/routes/roomRoutes");
const studentRoutes = require("./src/routes/studentRoutes"); // Import student routes

// Mount routers
app.use("/api/departments", departmentRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/students", studentRoutes); // Sử dụng student routes

// Error handling middleware (phải đặt sau các route)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server chạy ở chế độ ${process.env.NODE_ENV} trên cổng ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Lỗi: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
