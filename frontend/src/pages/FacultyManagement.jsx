// frontend/src/pages/FacultyManagement.jsx
import React, { useState, useEffect } from 'react';
import * as facultyApi from '../api/facultyApi';
import FacultyForm from '../components/FacultyForm';

const FacultyManagement = () => {
    const [facultyMembers, setFacultyMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await facultyApi.getAllFaculty();
            setFacultyMembers(data);
        } catch (err) {
            setError('Không thể tải danh sách cán bộ/giảng viên. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUpdateFaculty = async (facultyData) => {
        setLoading(true);
        setError(null);
        try {
            if (editingFaculty) {
                await facultyApi.updateFaculty(editingFaculty.faculty_id, facultyData);
                alert('Cán bộ/Giảng viên đã được cập nhật thành công!');
            } else {
                await facultyApi.createFaculty(facultyData);
                alert('Cán bộ/Giảng viên đã được thêm mới thành công!');
            }
            setShowForm(false);
            setEditingFaculty(null);
            fetchFaculty();
        } catch (err) {
            setError(`Lỗi: ${err.response?.data?.message || err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFaculty = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa cán bộ/giảng viên này không?')) {
            setLoading(true);
            setError(null);
            try {
                await facultyApi.deleteFaculty(id);
                alert('Cán bộ/Giảng viên đã được xóa thành công!');
                fetchFaculty();
            } catch (err) {
                setError(`Lỗi: ${err.response?.data?.message || err.message}`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEditClick = (faculty) => {
        setEditingFaculty(faculty);
        setShowForm(true);
    };

    const handleAddFacultyClick = () => {
        setEditingFaculty(null);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingFaculty(null);
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Quản lý Cán bộ / Giảng viên</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            <button
                onClick={handleAddFacultyClick}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-6"
            >
                Thêm Cán bộ/Giảng viên mới
            </button>

            {showForm && (
                <FacultyForm
                    initialData={editingFaculty}
                    onSubmit={handleCreateUpdateFaculty}
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
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã CB/GV</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khoa/Phòng ban</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sẵn sàng coi thi</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {facultyMembers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-4 px-6 text-center text-gray-500">
                                        Chưa có cán bộ/giảng viên nào.
                                    </td>
                                </tr>
                            ) : (
                                facultyMembers.map(member => (
                                    <tr key={member.faculty_id}>
                                        <td className="py-4 px-6 whitespace-nowrap">{member.faculty_code}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{member.full_name}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{member.department || 'N/A'}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{member.is_available_for_invigilation ? 'Có' : 'Không'}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <button
                                                onClick={() => handleEditClick(member)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm mr-2"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDeleteFaculty(member.faculty_id)}
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

export default FacultyManagement;