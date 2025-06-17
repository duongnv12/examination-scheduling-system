// frontend/src/components/CourseForm.jsx
import React, { useState, useEffect } from 'react';

const CourseForm = ({ initialData = {}, onSubmit, onCancel }) => { // <--- Giữ lại initialData = {} để cung cấp giá trị mặc định, giúp tránh lỗi ban đầu
    const [course, setCourse] = useState({
        course_code: '',
        course_name: '',
        credits: '',
        exam_duration_minutes: '',
        exam_format: '',
    });

    useEffect(() => {
        // Kiểm tra initialData có tồn tại và có course_id không
        if (initialData && initialData.course_id) {
            setCourse(initialData); // Load data if editing existing course
        } else {
            // Reset form if initialData is empty or no course_id (for new course creation)
            setCourse({
                course_code: '',
                course_name: '',
                credits: '',
                exam_duration_minutes: '',
                exam_format: '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCourse(prevCourse => ({
            ...prevCourse,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(course);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-sm bg-white mb-4">
            {/* Dòng gây lỗi: initialData có thể là null */}
            {/* Sửa thành: */}
            <h3 className="text-lg font-semibold mb-4">{initialData?.course_id ? 'Chỉnh sửa Môn học' : 'Thêm mới Môn học'}</h3>
            {/* ^^^^^^ Thêm optional chaining ở đây */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="course_code" className="block text-sm font-medium text-gray-700">Mã môn học:</label>
                    <input
                        type="text"
                        id="course_code"
                        name="course_code"
                        value={course.course_code}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="course_name" className="block text-sm font-medium text-gray-700">Tên môn học:</label>
                    <input
                        type="text"
                        id="course_name"
                        name="course_name"
                        value={course.course_name}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="credits" className="block text-sm font-medium text-gray-700">Số tín chỉ:</label>
                    <input
                        type="number"
                        id="credits"
                        name="credits"
                        value={course.credits}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                        min="1"
                    />
                </div>
                <div>
                    <label htmlFor="exam_duration_minutes" className="block text-sm font-medium text-gray-700">Thời lượng thi (phút):</label>
                    <input
                        type="number"
                        id="exam_duration_minutes"
                        name="exam_duration_minutes"
                        value={course.exam_duration_minutes}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                        min="1"
                    />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="exam_format" className="block text-sm font-medium text-gray-700">Hình thức thi:</label>
                    <select
                        id="exam_format"
                        name="exam_format"
                        value={course.exam_format}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    >
                        <option value="">Chọn hình thức thi</option>
                        <option value="Tự luận">Tự luận</option>
                        <option value="Trắc nghiệm">Trắc nghiệm</option>
                        <option value="Vấn đáp">Vấn đáp</option>
                        <option value="Thực hành">Thực hành</option>
                    </select>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {initialData?.course_id ? 'Cập nhật' : 'Thêm'} {/* Thêm optional chaining ở đây nếu cần */}
                </button>
            </div>
        </form>
    );
};

export default CourseForm;