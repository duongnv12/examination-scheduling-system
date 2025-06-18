// frontend/src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", // URL gốc của API backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Bạn có thể thêm interceptor ở đây nếu cần xử lý chung (ví dụ: thêm token xác thực)
// api.interceptors.request.use(
//     config => {
//         const token = localStorage.getItem('token'); // Ví dụ lấy token từ localStorage
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     error => {
//         return Promise.reject(error);
//     }
// );

// api.interceptors.response.use(
//     response => response,
//     error => {
//         if (error.response && error.response.status === 401) {
//             // Xử lý khi token hết hạn hoặc không hợp lệ (ví dụ: đăng xuất người dùng)
//             console.error('Unauthorized, redirecting to login...');
//             // window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );

export default api;
