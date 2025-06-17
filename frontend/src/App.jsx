// frontend/src/App.jsx
import './index.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CourseManagement from './pages/CourseManagement';
import RoomManagement from './pages/RoomManagement';
import StudentManagement from './pages/StudentManagement'; // Import StudentManagement
import FacultyManagement from './pages/FacultyManagement';   // Import FacultyManagement

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-100">
        {/* Navbar */}
        <nav className="bg-gray-800 p-4 shadow-md">
          <ul className="flex justify-center space-x-6">
            <li>
              <Link to="/courses" className="text-white hover:text-blue-300 text-lg font-medium">Môn học</Link>
            </li>
            <li>
              <Link to="/rooms" className="text-white hover:text-blue-300 text-lg font-medium">Phòng học</Link>
            </li>
            <li>
              <Link to="/students" className="text-white hover:text-blue-300 text-lg font-medium">Sinh viên</Link>
            </li>
            <li>
              <Link to="/faculty" className="text-white hover:text-blue-300 text-lg font-medium">Cán bộ/Giảng viên</Link>
            </li>
            {/* TODO: Thêm các Link cho CourseRegistrations, ExamSchedules, ExamInvigilators */}
          </ul>
        </nav>

        {/* Main Content Area */}
        <main className="py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<CourseManagement />} />
            <Route path="/rooms" element={<RoomManagement />} />
            <Route path="/students" element={<StudentManagement />} /> {/* Add Student Route */}
            <Route path="/faculty" element={<FacultyManagement />} />   {/* Add Faculty Route */}
            {/* TODO: Thêm các Route cho CourseRegistrations, ExamSchedules, ExamInvigilators */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

const Home = () => (
    <div className="container mx-auto p-6 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Hệ thống Xếp lịch thi</h1>
        <p className="text-lg text-gray-600">Chọn một mục quản lý từ thanh điều hướng để bắt đầu.</p>
    </div>
);

export default App;