// frontend/src/components/DepartmentTable.jsx
import React from 'react';

const DepartmentTable = ({ departments, onEdit, onDelete }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto overflow-x-auto">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Danh sách Khoa Hiện Có</h2>
            {departments.length === 0 ? (
                <p className="text-gray-600">Chưa có khoa nào được thêm.</p>
            ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã Khoa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Khoa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {departments.map((dept) => (
                            <tr key={dept.department_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.department_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.department_code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.department_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => onEdit(dept)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4 p-2 rounded-md hover:bg-indigo-50 transition-colors duration-200"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => onDelete(dept.department_id)}
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

export default DepartmentTable;