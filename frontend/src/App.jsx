// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import các trang (pages) đã tạo
import HomePage from './pages/HomePage';
import DepartmentsPage from './pages/DepartmentsPage';
import RoomsPage from './pages/RoomsPage';
import StudentsPage from './pages/StudentsPage'; // Import StudentsPage

const Navbar = () => {
    return (
        <nav className="bg-gray-800 p-4 shadow-lg font-sans">
            <ul className="flex justify-center space-x-6 text-lg">
                <li>
                    <Link to="/" className="text-white hover:text-blue-300 transition duration-200">Trang chủ</Link>
                </li>
                <li>
                    <Link to="/departments" className="text-white hover:text-blue-300 transition duration-200">Khoa</Link>
                </li>
                <li>
                    <Link to="/rooms" className="text-white hover:text-blue-300 transition duration-200">Phòng</Link>
                </li>
                <li>
                    <Link to="/students" className="text-white hover:text-blue-300 transition duration-200">Sinh viên</Link>
                </li>
                {/* Thêm các liên kết khác ở đây khi bạn tạo thêm trang */}
            </ul>
        </nav>
    );
};

function App() {
    return (
        <Router>
            <Toaster position="top-right" reverseOrder={false} />
            <Navbar />
            <div className="min-h-screen bg-gray-100 py-6">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/departments" element={<DepartmentsPage />} />
                    <Route path="/rooms" element={<RoomsPage />} />
                    <Route path="/students" element={<StudentsPage />} /> {/* Thêm Route cho StudentsPage */}
                    {/* Thêm các Route khác ở đây khi bạn tạo thêm trang */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;