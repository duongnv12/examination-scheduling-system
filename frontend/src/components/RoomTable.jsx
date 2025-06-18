// frontend/src/components/RoomTable.jsx
import React from 'react';

const RoomTable = ({ rooms, onEdit, onDelete }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto overflow-x-auto font-sans">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Danh sách Phòng Học Hiện Có</h2>
            {rooms.length === 0 ? (
                <p className="text-gray-600">Chưa có phòng học nào được thêm.</p>
            ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Phòng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sức chứa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại Phòng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rooms.map((room) => (
                            <tr key={room.room_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.room_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.room_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.capacity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.room_type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => onEdit(room)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4 p-2 rounded-md hover:bg-indigo-50 transition-colors duration-200"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => onDelete(room.room_id)}
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

export default RoomTable;