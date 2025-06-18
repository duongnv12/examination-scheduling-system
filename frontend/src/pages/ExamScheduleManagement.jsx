// frontend/src/pages/ExamScheduleManagement.jsx
import React, { useState, useEffect } from 'react';
import * as examScheduleApi from '../api/examScheduleApi';
import ExamScheduleForm from '../components/ExamScheduleForm';

const ExamScheduleManagement = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchExamSchedules();
    }, []);

    const fetchExamSchedules = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await examScheduleApi.getAllExamSchedules();
            setSchedules(data);
        } catch (err) {
            setError('Không thể tải danh sách lịch thi. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUpdateSchedule = async (scheduleData) => {
        setLoading(true);
        setError(null);
        try {
            if (editingSchedule) {
                const res = await examScheduleApi.updateExamSchedule(editingSchedule.schedule_id, scheduleData);
                alert('Lịch thi đã được cập nhật thành công!');
                // Cập nhật trực tiếp vào state
                setSchedules(prev =>
                    prev.map(sch => sch.schedule_id === res.schedule.schedule_id ? res.schedule : sch)
                );
            } else {
                const res = await examScheduleApi.createExamSchedule(scheduleData);
                alert('Lịch thi đã được thêm mới thành công!');
                // Thêm mới vào state
                setSchedules(prev => [res.schedule, ...prev]);
            }
            setShowForm(false);
            setEditingSchedule(null);
        } catch (err) {
            setError(`Lỗi: ${err.response?.data?.message || err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSchedule = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa lịch thi này không?')) {
            setLoading(true);
            setError(null);
            try {
                await examScheduleApi.deleteExamSchedule(id);
                alert('Lịch thi đã được xóa thành công!');
                fetchExamSchedules();
            } catch (err) {
                setError(`Lỗi: ${err.response?.data?.message || err.message}`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEditClick = (schedule) => {
        setEditingSchedule(schedule);
        setShowForm(true);
    };

    const handleAddScheduleClick = () => {
        setEditingSchedule(null);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingSchedule(null);
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Quản lý Lịch thi</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            <button
                onClick={handleAddScheduleClick}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-6"
            >
                Thêm Lịch thi mới
            </button>

            {showForm && (
                <ExamScheduleForm
                    initialData={editingSchedule}
                    onSubmit={handleCreateUpdateSchedule}
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
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã môn</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên môn</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày thi</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giờ bắt đầu</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giờ kết thúc</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số SV</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học kỳ</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình thức</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {schedules.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="py-4 px-6 text-center text-gray-500">
                                        Chưa có lịch thi nào.
                                    </td>
                                </tr>
                            ) : (
                                schedules.map(schedule => (
                                    <tr key={schedule.schedule_id}>
                                        <td className="py-4 px-6 whitespace-nowrap">{schedule.Course?.course_code || 'N/A'}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{schedule.Course?.course_name || 'N/A'}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{schedule.Room?.room_name || 'N/A'}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            {schedule.exam_date ? new Date(schedule.exam_date).toLocaleDateString('vi-VN') : 'N/A'}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">{schedule.start_time}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{schedule.end_time}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{schedule.number_of_students}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{schedule.semester}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{schedule.exam_type}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <button
                                                onClick={() => handleEditClick(schedule)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm mr-2"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSchedule(schedule.schedule_id)}
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

export default ExamScheduleManagement;