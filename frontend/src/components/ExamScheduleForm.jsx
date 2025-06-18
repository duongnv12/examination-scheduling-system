// frontend/src/components/ExamScheduleForm.jsx
import React, { useState, useEffect } from 'react';
import * as courseApi from '../api/courseApi';
import * as roomApi from '../api/roomApi';

const ExamScheduleForm = ({ initialData = {}, onSubmit, onCancel }) => {
    const [schedule, setSchedule] = useState({
        course_id: '',
        room_id: '',
        exam_date: '',
        start_time: '',
        end_time: '',
        number_of_students: '', // Number of students actually registered for this specific exam time
        semester: '',
        exam_type: '',
    });
    const [courses, setCourses] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loadingDropdowns, setLoadingDropdowns] = useState(true);
    const [dropdownError, setDropdownError] = useState(null);

    useEffect(() => {
        const fetchDropdownData = async () => {
            setLoadingDropdowns(true);
            setDropdownError(null);
            try {
                const fetchedCourses = await courseApi.getAllCourses();
                const fetchedRooms = await roomApi.getAllRooms();
                setCourses(fetchedCourses);
                setRooms(fetchedRooms);
            } catch (err) {
                setDropdownError('Không thể tải dữ liệu cho dropdown (môn học, phòng học).');
                console.error('Error fetching dropdown data:', err);
            } finally {
                setLoadingDropdowns(false);
            }
        };
        fetchDropdownData();
    }, []);

    useEffect(() => {
        if (initialData?.schedule_id) {
            const formattedDate = initialData.exam_date
                ? new Date(initialData.exam_date).toISOString().split('T')[0]
                : '';
            setSchedule({
                ...initialData,
                exam_date: formattedDate,
            });
        } else {
            setSchedule({
                course_id: '',
                room_id: '',
                exam_date: '',
                start_time: '',
                end_time: '',
                number_of_students: '',
                semester: '',
                exam_type: '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSchedule(prevSchedule => ({
            ...prevSchedule,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...schedule,
            course_id: Number(schedule.course_id),
            room_id: Number(schedule.room_id),
            number_of_students: Number(schedule.number_of_students),
            // Backend expects date string, already formatted by input type="date" or ISOString above
            // Time strings should be fine
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
            <h3 className="text-lg font-semibold mb-4">{initialData?.schedule_id ? 'Chỉnh sửa Lịch thi' : 'Thêm mới Lịch thi'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="course_id" className="block text-sm font-medium text-gray-700">Môn học:</label>
                    <select
                        id="course_id"
                        name="course_id"
                        value={schedule.course_id}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    >
                        <option value="">Chọn môn học</option>
                        {courses.map(course => (
                            <option key={course.course_id} value={course.course_id}>
                                {course.course_code} - {course.course_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="room_id" className="block text-sm font-medium text-gray-700">Phòng học:</label>
                    <select
                        id="room_id"
                        name="room_id"
                        value={schedule.room_id}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    >
                        <option value="">Chọn phòng học</option>
                        {rooms.map(room => (
                            <option key={room.room_id} value={room.room_id}>
                                {room.room_name} (Sức chứa: {room.capacity})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="exam_date" className="block text-sm font-medium text-gray-700">Ngày thi:</label>
                    <input
                        type="date"
                        id="exam_date"
                        name="exam_date"
                        value={schedule.exam_date}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">Thời gian bắt đầu:</label>
                    <input
                        type="time"
                        id="start_time"
                        name="start_time"
                        value={schedule.start_time}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">Thời gian kết thúc:</label>
                    <input
                        type="time"
                        id="end_time"
                        name="end_time"
                        value={schedule.end_time}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="number_of_students" className="block text-sm font-medium text-gray-700">Số lượng sinh viên:</label>
                    <input
                        type="number"
                        id="number_of_students"
                        name="number_of_students"
                        value={schedule.number_of_students}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Học kỳ:</label>
                    <input
                        type="text"
                        id="semester"
                        name="semester"
                        value={schedule.semester}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                        placeholder="VD: 2024-2025/1"
                    />
                </div>
                <div>
                    <label htmlFor="exam_type" className="block text-sm font-medium text-gray-700">Hình thức thi:</label>
                    <select
                        id="exam_type"
                        name="exam_type"
                        value={schedule.exam_type}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    >
                        <option value="">Chọn hình thức</option>
                        <option value="Giữa kỳ">Giữa kỳ</option>
                        <option value="Cuối kỳ">Cuối kỳ</option>
                        <option value="Bổ sung">Bổ sung</option>
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
                    {initialData?.schedule_id ? 'Cập nhật' : 'Thêm'}
                </button>
            </div>
        </form>
    );
};

export default ExamScheduleForm;