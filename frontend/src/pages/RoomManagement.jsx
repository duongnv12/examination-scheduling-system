// frontend/src/pages/RoomManagement.jsx
import React, { useState, useEffect } from 'react';
import * as roomApi from '../api/roomApi';
import RoomForm from '../components/RoomForm';

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingRoom, setEditingRoom] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await roomApi.getAllRooms();
            setRooms(data);
        } catch (err) {
            setError('Không thể tải danh sách phòng. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUpdateRoom = async (roomData) => {
        setLoading(true);
        setError(null);
        try {
            if (editingRoom) {
                await roomApi.updateRoom(editingRoom.room_id, roomData);
                alert('Phòng học đã được cập nhật thành công!');
            } else {
                await roomApi.createRoom(roomData);
                alert('Phòng học đã được thêm mới thành công!');
            }
            setShowForm(false);
            setEditingRoom(null);
            fetchRooms();
        } catch (err) {
            setError(`Lỗi: ${err.response?.data?.message || err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRoom = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa phòng học này không?')) {
            setLoading(true);
            setError(null);
            try {
                await roomApi.deleteRoom(id);
                alert('Phòng học đã được xóa thành công!');
                fetchRooms();
            } catch (err) {
                setError(`Lỗi: ${err.response?.data?.message || err.message}`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEditClick = (room) => {
        setEditingRoom(room);
        setShowForm(true);
    };

    const handleAddRoomClick = () => {
        setEditingRoom(null);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingRoom(null);
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Quản lý Phòng học</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            <button
                onClick={handleAddRoomClick}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-6"
            >
                Thêm Phòng học mới
            </button>

            {showForm && (
                <RoomForm
                    initialData={editingRoom}
                    onSubmit={handleCreateUpdateRoom}
                    onCancel={handleCancelForm}
                />
            )}

            {loading ? (
                <p className="text-center text-lg">Đang tải dữ liệu...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên phòng</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sức chứa</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại phòng</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {rooms.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-4 px-6 text-center text-gray-500">
                                        Chưa có phòng học nào.
                                    </td>
                                </tr>
                            ) : (
                                rooms.map(room => (
                                    <tr key={room.room_id}>
                                        <td className="py-4 px-6 whitespace-nowrap">{room.room_name}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{room.capacity}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{room.room_type}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{room.description || 'N/A'}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{room.is_active ? 'Hoạt động' : 'Không hoạt động'}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <button
                                                onClick={() => handleEditClick(room)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm mr-2"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRoom(room.room_id)}
                                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RoomManagement;