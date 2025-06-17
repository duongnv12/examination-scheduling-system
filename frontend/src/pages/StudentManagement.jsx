// frontend/src/pages/StudentManagement.jsx
import React, { useState, useEffect } from 'react';
import * as studentApi from '../api/studentApi';
import StudentForm from '../components/StudentForm';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingStudent, setEditingStudent] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await studentApi.getAllStudents();
            setStudents(data);
        } catch (err) {
            setError('Không thể tải danh sách sinh viên. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUpdateStudent = async (studentData) => {
        setLoading(true);
        setError(null);
        try {
            if (editingStudent) {
                await studentApi.updateStudent(editingStudent.student_id, studentData);
                alert('Sinh viên đã được cập nhật thành công!');
            } else {
                await studentApi.createStudent(studentData);
                alert('Sinh viên đã được thêm mới thành công!');
            }
            setShowForm(false);
            setEditingStudent(null);
            fetchStudents();
        } catch (err) {
            setError(`Lỗi: ${err.response?.data?.message || err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sinh viên này không?')) {
            setLoading(true);
            setError(null);
            try {
                await studentApi.deleteStudent(id);
                alert('Sinh viên đã được xóa thành công!');
                fetchStudents();
            } catch (err) {
                setError(`Lỗi: ${err.response?.data?.message || err.message}`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEditClick = (student) => {
        setEditingStudent(student);
        setShowForm(true);
    };

    const handleAddStudentClick = () => {
        setEditingStudent(null);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingStudent(null);
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Quản lý Sinh viên</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            <button
                onClick={handleAddStudentClick}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-6"
            >
                Thêm Sinh viên mới
            </button>

            {showForm && (
                <StudentForm
                    initialData={editingStudent}
                    onSubmit={handleCreateUpdateStudent}
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
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã SV</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày sinh</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lớp</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-4 px-6 text-center text-gray-500">
                                        Chưa có sinh viên nào.
                                    </td>
                                </tr>
                            ) : (
                                students.map(student => (
                                    <tr key={student.student_id}>
                                        <td className="py-4 px-6 whitespace-nowrap">{student.student_code}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{student.full_name}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('vi-VN') : 'N/A'}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">{student.class_name || 'N/A'}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <button
                                                onClick={() => handleEditClick(student)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm mr-2"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStudent(student.student_id)}
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

export default StudentManagement;