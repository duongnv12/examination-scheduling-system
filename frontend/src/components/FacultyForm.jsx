// frontend/src/components/FacultyForm.jsx
import React, { useState, useEffect } from 'react';

const FacultyForm = ({ initialData = {}, onSubmit, onCancel }) => {
    const [faculty, setFaculty] = useState({
        faculty_code: '',
        full_name: '',
        department: '',
        is_available_for_invigilation: true,
    });

    useEffect(() => {
        if (initialData && initialData.faculty_id) {
            setFaculty(initialData); // Load data if editing existing faculty member
        } else {
            // Reset form for new faculty creation
            setFaculty({
                faculty_code: '',
                full_name: '',
                department: '',
                is_available_for_invigilation: true,
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFaculty(prevFaculty => ({
            ...prevFaculty,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(faculty);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-sm bg-white mb-4">
            <h3 className="text-lg font-semibold mb-4">{initialData?.faculty_id ? 'Chỉnh sửa Cán bộ/Giảng viên' : 'Thêm mới Cán bộ/Giảng viên'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="faculty_code" className="block text-sm font-medium text-gray-700">Mã cán bộ/giảng viên:</label>
                    <input
                        type="text"
                        id="faculty_code"
                        name="faculty_code"
                        value={faculty.faculty_code}
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
                        value={faculty.full_name}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">Khoa/Phòng ban:</label>
                    <input
                        type="text"
                        id="department"
                        name="department"
                        value={faculty.department || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="is_available_for_invigilation"
                        name="is_available_for_invigilation"
                        checked={faculty.is_available_for_invigilation}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_available_for_invigilation" className="ml-2 block text-sm font-medium text-gray-700">Sẵn sàng coi thi</label>
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
                    {initialData?.faculty_id ? 'Cập nhật' : 'Thêm'}
                </button>
            </div>
        </form>
    );
};

export default FacultyForm;