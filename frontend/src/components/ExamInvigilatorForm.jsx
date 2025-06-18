// frontend/src/components/ExamInvigilatorForm.jsx
import React, { useState, useEffect } from 'react';
import * as examScheduleApi from '../api/examScheduleApi';
import * as facultyApi from '../api/facultyApi';

const ExamInvigilatorForm = ({ initialData = {}, onSubmit, onCancel }) => {
    const [invigilatorAssignment, setInvigilatorAssignment] = useState({
        schedule_id: '',
        faculty_id: '',
        role: '', // E.g., 'Giám thị 1', 'Giám thị 2'
    });
    const [examSchedules, setExamSchedules] = useState([]);
    const [facultyMembers, setFacultyMembers] = useState([]);
    const [loadingDropdowns, setLoadingDropdowns] = useState(true);
    const [dropdownError, setDropdownError] = useState(null);

    useEffect(() => {
        const fetchDropdownData = async () => {
            setLoadingDropdowns(true);
            setDropdownError(null);
            try {
                const fetchedSchedules = await examScheduleApi.getAllExamSchedules();
                const fetchedFaculty = await facultyApi.getAllFaculty();
                setExamSchedules(fetchedSchedules);
                setFacultyMembers(fetchedFaculty);
            } catch (err) {
                setDropdownError('Không thể tải dữ liệu cho dropdown (lịch thi, cán bộ/giảng viên).');
                console.error('Error fetching dropdown data:', err);
            } finally {
                setLoadingDropdowns(false);
            }
        };
        fetchDropdownData();
    }, []);

    useEffect(() => {
        if (initialData?.invigilator_id) {
            setInvigilatorAssignment(initialData);
        } else {
            setInvigilatorAssignment({
                schedule_id: '',
                faculty_id: '',
                role: '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInvigilatorAssignment(prevAssignment => ({
            ...prevAssignment,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...invigilatorAssignment,
            schedule_id: Number(invigilatorAssignment.schedule_id),
            faculty_id: Number(invigilatorAssignment.faculty_id),
        });
    };

    if (loadingDropdowns) {
        return <div className="text-center text-lg">Đang tải dữ liệu lựa chọn...</div>;
    }

    if (dropdownError) {
        return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{dropdownError}</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-sm bg-white mb-4">
            <h3 className="text-lg font-semibold mb-4">{initialData?.invigilator_id ? 'Chỉnh sửa Phân công Giám thị' : 'Thêm mới Phân công Giám thị'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="schedule_id" className="block text-sm font-medium text-gray-700">Lịch thi:</label>
                    <select
                        id="schedule_id"
                        name="schedule_id"
                        value={invigilatorAssignment.schedule_id}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                        disabled={!!initialData?.invigilator_id} // Typically don't change assigned schedule
                    >
                        <option value="">Chọn lịch thi</option>
                        {examSchedules.map(schedule => (
                            <option key={schedule.schedule_id} value={schedule.schedule_id}>
                                {schedule.Course?.course_code || 'N/A'} - {schedule.Room?.room_name || 'N/A'} - {new Date(schedule.exam_date).toLocaleDateString('vi-VN')} {schedule.start_time}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="faculty_id" className="block text-sm font-medium text-gray-700">Cán bộ/Giảng viên:</label>
                    <select
                        id="faculty_id"
                        name="faculty_id"
                        value={invigilatorAssignment.faculty_id}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                        disabled={!!initialData?.invigilator_id} // Typically don't change assigned faculty
                    >
                        <option value="">Chọn cán bộ/giảng viên</option>
                        {facultyMembers.map(faculty => (
                            <option key={faculty.faculty_id} value={faculty.faculty_id}>
                                {faculty.faculty_code} - {faculty.full_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Vai trò:</label>
                    <select
                        id="role"
                        name="role"
                        value={invigilatorAssignment.role}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    >
                        <option value="">Chọn vai trò</option>
                        <option value="Giám thị 1">Giám thị 1</option>
                        <option value="Giám thị 2">Giám thị 2</option>
                    </select>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                    {initialData?.invigilator_id ? 'Cập nhật' : 'Thêm'}
                </button>
            </div>
        </form>
    );
};

export default ExamInvigilatorForm;