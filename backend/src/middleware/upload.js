// backend/src/middleware/upload.js
const multer = require("multer");
const path = require("path"); // Cần để lấy extension của file

// Cấu hình storage (có thể là memoryStorage nếu bạn xử lý file ngay,
// hoặc diskStorage nếu bạn muốn lưu file tạm thời)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Tạo thư mục 'uploads' nếu chưa có
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir); // Lưu file vào thư mục 'uploads/'
  },
  filename: (req, file, cb) => {
    // Đặt tên file để tránh trùng lặp
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /xlsx|xls/; // Chỉ chấp nhận file Excel
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error("INVALID_FILE_TYPE", "Chỉ chấp nhận file Excel (.xlsx, .xls)"),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  },
});

module.exports = upload;
