// frontend/src/pages/CourseManagement.jsx
import React, { useState, useEffect } from 'react';
import * as courseApi from '../api/courseApi';
import CourseForm from '../components/CourseForm';

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null); // Course being edited
    const [showForm, setShowForm] = useState(false); // Toggle form visibility

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await courseApi.getAllCourses();
            setCourses(data);
        } catch (err) {
            setError('Không thể tải danh sách môn học. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUpdateCourse = async (courseData) => {
        setLoading(true);
        setError(null);
        try {
            if (editingCourse) {
                // Update existing course
                await courseApi.updateCourse(editingCourse.course_id, courseData);
                alert('Môn học đã được cập nhật thành công!');
            } else {
                // Create new course
                await courseApi.createCourse(courseData);
                alert('Môn học đã được thêm mới thành công!');
            }
            setShowForm(false); // Hide form
            setEditingCourse(null); // Clear editing state
            fetchCourses(); // Re-fetch courses to update list
        } catch (err) {
            setError(`Lỗi: ${err.response?.data?.message || err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa môn học này không?')) {
            setLoading(true);
            setError(null);
            try {
                await courseApi.deleteCourse(id);
                alert('Môn học đã được xóa thành công!');
                fetchCourses(); // Re-fetch courses
            } catch (err) {
                setError(`Lỗi: ${err.response?.data?.message || err.message}`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEditClick = (course) => {
        setEditingCourse(course);
        setShowForm(true);
    };

    const handleAddCourseClick = () => {
        setEditingCourse(null); // Clear any previous editing state
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingCourse(null);
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Quản lý Môn học</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            <button
                onClick={handleAddCourseClick}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-6"
            >
                Thêm Môn học mới
            </button>

            {showForm && (
                <CourseForm
                    initialData={editingCourse}
                    onSubmit={handleCreateUpdateCourse}
                    onCancel={handleCancelForm}
                />
            )}

            {loading ? (
                <p className="text-center text-lg">Đang tải dữ liệu...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã môn học</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên môn học</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tín chỉ</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời lượng thi (phút)</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình thức thi</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đã đăng ký</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {courses.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-4 px-6 text-center text-gray-500">
                                        Chưa có môn học nào.
                                    </td>
                                </tr>
                            ) : (
                                courses.map(course => (
                                    <tr key={course.course_id}>
                                        <td className="py-4 px-6 whitespace-nowrap">{course.course_code}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{course.course_name}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{course.credits}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{course.exam_duration_minutes}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{course.exam_format}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{course.total_students_registered}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <button
                                                onClick={() => handleEditClick(course)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm mr-2"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCourse(course.course_id)}
                                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CourseManagement;