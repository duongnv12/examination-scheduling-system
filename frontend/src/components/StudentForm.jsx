// frontend/src/components/StudentForm.jsx
import React, { useState, useEffect } from 'react';

const StudentForm = ({ initialData = {}, onSubmit, onCancel }) => {
    const [student, setStudent] = useState({
        student_code: '',
        full_name: '',
        date_of_birth: '', // ISO date string: YYYY-MM-DD
        class_name: '',
    });

    useEffect(() => {
        if (initialData && initialData.student_id) {
            // Format date_of_birth to YYYY-MM-DD for input type="date"
            const formattedDate = initialData.date_of_birth
                ? new Date(initialData.date_of_birth).toISOString().split('T')[0]
                : '';
            setStudent({
                ...initialData,
                date_of_birth: formattedDate,
            });
        } else {
            // Reset form for new student creation
            setStudent({
                student_code: '',
                full_name: '',
                date_of_birth: '',
                class_name: '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStudent(prevStudent => ({
            ...prevStudent,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(student);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-sm bg-white mb-4">
            <h3 className="text-lg font-semibold mb-4">{initialData?.student_id ? 'Chỉnh sửa Sinh viên' : 'Thêm mới Sinh viên'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="student_code" className="block text-sm font-medium text-gray-700">Mã sinh viên:</label>
                    <input
                        type="text"
                        id="student_code"
                        name="student_code"
                        value={student.student_code}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Họ và tên:</label>
                    <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={student.full_name}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">Ngày sinh:</label>
                    <input
                        type="date"
                        id="date_of_birth"
                        name="date_of_birth"
                        value={student.date_of_birth}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>
                <div>
                    <label htmlFor="class_name" className="block text-sm font-medium text-gray-700">Lớp:</label>
                    <input
                        type="text"
                        id="class_name"
                        name="class_name"
                        value={student.class_name || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
                    {initialData?.student_id ? 'Cập nhật' : 'Thêm'}
                </button>
            </div>
        </form>
    );
};

export default StudentForm;