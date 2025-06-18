// frontend/src/pages/ExamInvigilatorManagement.jsx
import React, { useState, useEffect } from 'react';
import * as examInvigilatorApi from '../api/examInvigilatorApi';
import ExamInvigilatorForm from '../components/ExamInvigilatorForm';

const ExamInvigilatorManagement = () => {
    const [invigilators, setInvigilators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingInvigilator, setEditingInvigilator] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchExamInvigilators();
    }, []);

    const fetchExamInvigilators = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await examInvigilatorApi.getAllExamInvigilators();
            setInvigilators(data);
        } catch (err) {
            setError('Không thể tải danh sách phân công giám thị. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUpdateInvigilator = async (invigilatorData) => {
        setLoading(true);
        setError(null);
        try {
            if (editingInvigilator) {
                // Đảm bảo dùng đúng key id
                const id = editingInvigilator.exam_invigilator_id || editingInvigilator.invigilator_id;
                if (!id) throw new Error("Không tìm thấy ID của phân công giám thị để cập nhật.");
                const res = await examInvigilatorApi.updateExamInvigilator(id, invigilatorData);
                alert('Phân công giám thị đã được cập nhật thành công!');
                setInvigilators(prev =>
                    prev.map(inv => inv.invigilator_id === res.assignment.invigilator_id ? res.assignment : inv)
                );
            } else {
                const res = await examInvigilatorApi.createExamInvigilator(invigilatorData);
                alert('Phân công giám thị đã được thêm mới thành công!');
                setInvigilators(prev => [res.assignment, ...prev]);
            }
            setShowForm(false);
            setEditingInvigilator(null);
        } catch (err) {
            setError(`Lỗi: ${err.response?.data?.message || err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteInvigilator = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa phân công giám thị này không?')) {
            setLoading(true);
            setError(null);
            try {
                await examInvigilatorApi.deleteExamInvigilator(id);
                alert('Phân công giám thị đã được xóa thành công!');
                fetchExamInvigilators();
            } catch (err) {
                setError(`Lỗi: ${err.response?.data?.message || err.message}`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEditClick = (invigilator) => {
        setEditingInvigilator(invigilator);
        setShowForm(true);
    };

    const handleAddInvigilatorClick = () => {
        setEditingInvigilator(null);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingInvigilator(null);
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Quản lý Phân công Giám thị</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            <button
                onClick={handleAddInvigilatorClick}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-6"
            >
                Thêm Phân công Giám thị mới
            </button>

            {showForm && (
                <ExamInvigilatorForm
                    initialData={editingInvigilator}
                    onSubmit={handleCreateUpdateInvigilator}
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
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lịch thi</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Môn học</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày thi</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảng viên</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã GV</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {invigilators.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-4 px-6 text-center text-gray-500">
                                        Chưa có phân công giám thị nào.
                                    </td>
                                </tr>
                            ) : (
                                invigilators.map(inv => (
                                    <tr key={inv.invigilator_id}>
                                        {/* Display ExamSchedule details */}
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            {inv.ExamSchedule?.Course?.course_code || 'N/A'} - {inv.ExamSchedule?.Room?.room_name || 'N/A'}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">{inv.ExamSchedule?.Course?.course_name || 'N/A'}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{inv.ExamSchedule?.Room?.room_name || 'N/A'}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            {inv.ExamSchedule?.exam_date ? new Date(inv.ExamSchedule.exam_date).toLocaleDateString('vi-VN') : 'N/A'}
                                        </td>
                                        {/* Display Faculty details */}
                                        <td className="py-4 px-6 whitespace-nowrap">{inv.Faculty?.full_name || 'N/A'}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{inv.Faculty?.faculty_code || 'N/A'}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{inv.role}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <button
                                                onClick={() => handleEditClick(inv)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm mr-2"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDeleteInvigilator(inv.invigilator_id)}
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

export default ExamInvigilatorManagement;