// frontend/src/pages/CourseManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import * as courseApi from '../api/courseApi';
import CourseForm from '../components/CourseForm';
import axios from 'axios'; // Import axios for file upload

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // State for bulk import
    const [importFile, setImportFile] = useState(null);
    const [importMessage, setImportMessage] = useState(null);
    const [importError, setImportError] = useState(null);
    const fileInputRef = useRef(null);

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
                await courseApi.updateCourse(editingCourse.course_id, courseData);
                alert('Môn học đã được cập nhật thành công!');
            } else {
                await courseApi.createCourse(courseData);
                alert('Môn học đã được thêm mới thành công!');
            }
            setShowForm(false);
            setEditingCourse(null);
            fetchCourses();
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
                fetchCourses();
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
        setEditingCourse(null);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingCourse(null);
    };

    // --- Bulk Import Handlers ---
    const handleFileChange = (e) => {
        setImportFile(e.target.files[0]);
        setImportMessage(null);
        setImportError(null);
    };

    const handleImportSubmit = async () => {
        if (!importFile) {
            setImportError('Vui lòng chọn một file để tải lên.');
            return;
        }

        setLoading(true);
        setImportMessage(null);
        setImportError(null);

        const formData = new FormData();
        formData.append('file', importFile);

        try {
            const response = await axios.post('http://localhost:5000/api/import/courses', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setImportMessage(response.data.message);
            if (response.data.errors && response.data.errors.length > 0) {
                setImportError(response.data.errors.map(err => `Dòng ${err.row}: ${err.message}`).join('\n'));
            }
            fetchCourses();
        } catch (err) {
            console.error('Error during import:', err);
            setImportError(`Lỗi khi nhập file: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
            setImportFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Quản lý Môn học</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            {/* Manual Add/Edit Section */}
            <div className="mb-8 p-4 border rounded-lg bg-white shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Thêm/Chỉnh sửa thủ công</h2>
                <button
                    onClick={handleAddCourseClick}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
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
            </div>

            {/* Bulk Import Section */}
            <div className="mb-8 p-4 border rounded-lg bg-white shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Nhập dữ liệu hàng loạt từ Excel/CSV</h2>
                <p className="text-sm text-gray-600 mb-2">
                    Tải xuống mẫu file Excel tại đây:
                    <a href="/course_template.xlsx" download className="text-blue-600 hover:underline ml-1">Tải mẫu</a>
                </p>
                <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                    onClick={handleImportSubmit}
                    disabled={!importFile || loading}
                    className={`mt-4 px-4 py-2 rounded font-bold text-white ${!importFile || loading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                    {loading ? 'Đang tải lên...' : 'Tải lên và Nhập dữ liệu'}
                </button>

                {importMessage && (
                    <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        {importMessage}
                    </div>
                )}
                {importError && (
                    <pre className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative whitespace-pre-wrap text-sm">
                        {importError}
                    </pre>
                )}
            </div>

            {/* Display Courses Table */}
            {loading && !importMessage && !importError ? (
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