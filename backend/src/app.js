// backend/src/app.js
const express = require('express');
const cors = require('cors');
// Import các routes
const courseRoutes = require('./routes/courseRoutes');
const roomRoutes = require('./routes/roomRoutes');
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const courseRegistrationRoutes = require('./routes/courseRegistrationRoutes');
const examScheduleRoutes = require('./routes/examScheduleRoutes');
const examInvigilatorRoutes = require('./routes/examInvigilatorRoutes');

const app = express();

// Middlewares
app.use(cors()); // Cho phép CORS
app.use(express.json()); // Phân tích JSON body của request

// Định nghĩa các API Routes
app.use('/api/courses', courseRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/course-registrations', courseRegistrationRoutes);
app.use('/api/exam-schedules', examScheduleRoutes);
app.use('/api/exam-invigilators', examInvigilatorRoutes);


// Route kiểm tra sức khỏe của API
app.get('/', (req, res) => {
    res.send('Examination Scheduling System Backend API is running!');
});

// Export đối tượng app để server.js có thể sử dụng
module.exports = app;