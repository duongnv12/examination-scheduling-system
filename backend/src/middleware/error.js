// backend/src/middleware/error.js
const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Log to console for dev
  console.error(err.stack.red);

  // Sequelize Bad Request (Validation error)
  if (err.name === "SequelizeValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  // Sequelize Unique Constraint Error
  if (err.name === "SequelizeUniqueConstraintError") {
    const message = `Dữ liệu trùng lặp cho trường ${
      Object.keys(err.fields)[0] || "không xác định"
    }`;
    error = new ErrorResponse(message, 400);
  }

  // Multer Error (e.g., file too large)
  if (err.code === "LIMIT_FILE_SIZE") {
    error = new ErrorResponse("Kích thước file quá lớn. Tối đa 5MB.", 413);
  }
  if (err.code === "INVALID_FILE_TYPE") {
    // Custom error code
    error = new ErrorResponse(
      "Loại file không hợp lệ. Chỉ chấp nhận file Excel (.xlsx, .xls).",
      400
    );
  }

  // Bad ObjectId (if using MongoDB/Mongoose with ObjectId) - Not applicable for Sequelize UUID
  // if (err.name === 'CastError') {
  //     const message = `Resource not found with id of ${err.value}`;
  //     error = new ErrorResponse(message, 404);
  // }

  // Custom ErrorResponse from our ErrorResponse class
  if (err instanceof ErrorResponse) {
    error = err;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Lỗi Server",
  });
};

module.exports = errorHandler;
