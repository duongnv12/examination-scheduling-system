// frontend/src/components/CourseRegistrationForm.jsx
import React, { useState, useEffect } from 'react';
import * as studentApi from '../api/studentApi'; // Import student API
import * as courseApi from '../api/courseApi';   // Import course API

const CourseRegistrationForm = ({ initialData = {}, onSubmit, onCancel }) => {
    const [registration, setRegistration] = useState({
        student_id: '',
        course_id: '',
        semester: '',
    });
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loadingDropdowns, setLoadingDropdowns] = useState(true);
    const [dropdownError, setDropdownError] = useState(null);

    useEffect(() => {
        const fetchDropdownData = async () => {
            setLoadingDropdowns(true);
            setDropdownError(null);
            try {
                const fetchedStudents = await studentApi.getAllStudents();
                const fetchedCourses = await courseApi.getAllCourses();
                setStudents(fetchedStudents);
                setCourses(fetchedCourses);
            } catch (err) {
                setDropdownError('Không thể tải dữ liệu cho dropdown (sinh viên, môn học).');
                console.error('Error fetching dropdown data:', err);
            } finally {
                setLoadingDropdowns(false);
            }
        };
        fetchDropdownData();
    }, []);

    useEffect(() => {
        if (initialData && initialData.registration_id) {
            setRegistration(initialData); // Load data if editing existing registration
        } else {
            // Reset form for new registration creation
            setRegistration({
                student_id: '',
                course_id: '',
                semester: '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRegistration(prevReg => ({
            ...prevReg,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Không ép kiểu Number, chỉ gửi nguyên chuỗi UUID
        onSubmit({
            ...registration
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
            <h3 className="text-lg font-semibold mb-4">{initialData?.registration_id ? 'Chỉnh sửa Đăng ký' : 'Thêm mới Đăng ký môn học'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">Sinh viên:</label>
                    <select
                        id="student_id"
                        name="student_id"
                        value={registration.student_id}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                        disabled={!!initialData?.registration_id} // Disable if editing existing (usually student/course combination isn't changed)
                    >
                        <option value="">Chọn sinh viên</option>
                        {students.map(student => (
                            <option key={student.student_id} value={student.student_id}>
                                {student.student_code} - {student.full_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="course_id" className="block text-sm font-medium text-gray-700">Môn học:</label>
                    <select
                        id="course_id"
                        name="course_id"
                        value={registration.course_id}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                        disabled={!!initialData?.registration_id} // Disable if editing existing
                    >
                        <option value="">Chọn môn học</option>
                        {courses.map(course => (
                            <option key={course.course_id} value={course.course_id}>
                                {course.course_code} - {course.course_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Học kỳ:</label>
                    <input
                        type="text"
                        id="semester"
                        name="semester"
                        value={registration.semester}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                        placeholder="VD: 2024-2025/1"
                    />
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
                    {initialData?.registration_id ? 'Cập nhật' : 'Thêm'}
                </button>
            </div>
        </form>
    );
};

export default CourseRegistrationForm;