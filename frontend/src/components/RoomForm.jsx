// frontend/src/components/RoomForm.jsx
import React, { useState, useEffect } from 'react';

const RoomForm = ({ initialData = {}, onSubmit, onCancel }) => {
    const [room, setRoom] = useState({
        room_name: '',
        capacity: '',
        room_type: '',
        description: '',
        is_active: true, // Mặc định là active
    });

    useEffect(() => {
        if (initialData && initialData.room_id) {
            setRoom(initialData); // Load data if editing existing room
        } else {
            // Reset form for new room creation
            setRoom({
                room_name: '',
                capacity: '',
                room_type: '',
                description: '',
                is_active: true,
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRoom(prevRoom => ({
            ...prevRoom,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(room);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-sm bg-white mb-4">
            <h3 className="text-lg font-semibold mb-4">{initialData?.room_id ? 'Chỉnh sửa Phòng học' : 'Thêm mới Phòng học'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="room_name" className="block text-sm font-medium text-gray-700">Tên phòng:</label>
                    <input
                        type="text"
                        id="room_name"
                        name="room_name"
                        value={room.room_name}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Sức chứa:</label>
                    <input
                        type="number"
                        id="capacity"
                        name="capacity"
                        value={room.capacity}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                        min="1"
                    />
                </div>
                <div>
                    <label htmlFor="room_type" className="block text-sm font-medium text-gray-700">Loại phòng:</label>
                    <select
                        id="room_type"
                        name="room_type"
                        value={room.room_type}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    >
                        <option value="">Chọn loại phòng</option>
                        <option value="Phòng lý thuyết">Phòng lý thuyết</option>
                        <option value="Phòng máy tính">Phòng máy tính</option>
                        <option value="Phòng Lab">Phòng Lab</option>
                        <option value="Phòng đa năng">Phòng đa năng</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả:</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={room.description || ''} // Handle null/undefined for description
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>
                <div className="md:col-span-2 flex items-center">
                    <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={room.is_active}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700">Đang hoạt động</label>
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
                    {initialData?.room_id ? 'Cập nhật' : 'Thêm'}
                </button>
            </div>
        </form>
    );
};

export default RoomForm;