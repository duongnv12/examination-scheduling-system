// frontend/src/components/StudentTable.jsx
import React from 'react';

const StudentTable = ({ students, onEdit, onDelete }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto overflow-x-auto font-sans">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Danh sách Sinh viên Hiện Có</h2>
            {students.length === 0 ? (
                <p className="text-gray-600">Chưa có sinh viên nào được thêm.</p>
            ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã SV</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên SV</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giới tính</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày sinh</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điện thoại</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ</th>
                            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lớp</th> */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khoa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                            <tr key={student.student_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.student_code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.full_name}</td> {/* Đã đổi */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.gender}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('vi-VN') : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.phone_number || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.address || 'N/A'}</td>
                                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.class_name || 'N/A'}</td> */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {student.Department ? student.Department.department_name : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => onEdit(student)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4 p-2 rounded-md hover:bg-indigo-50 transition-colors duration-200"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => onDelete(student.student_id)}
                                        className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors duration-200"
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default StudentTable;