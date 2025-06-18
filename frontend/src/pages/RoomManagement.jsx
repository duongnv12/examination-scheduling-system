// frontend/src/pages/RoomManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import * as roomApi from '../api/roomApi';
import RoomForm from '../components/RoomForm';
import axios from 'axios';

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingRoom, setEditingRoom] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // State for bulk import
    const [importFile, setImportFile] = useState(null);
    const [importMessage, setImportMessage] = useState(null);
    const [importError, setImportError] = useState(null);
    const fileInputRef = useRef(null);

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

    // --- Bulk Import Handlers ---
    const handleFileChange = (e) => {
        setImportFile(e.target.files[0]);
        setImportMessage(null);
        setImportError(null);
    };

    const handleImportSubmit = async () => {
        if (!importFile) {
            setImportError('Vui lòng chọn một file để tải lên.');
            return;
        }

        setLoading(true);
        setImportMessage(null);
        setImportError(null);

        const formData = new FormData();
        formData.append('file', importFile);

        try {
            const response = await axios.post('http://localhost:5000/api/import/rooms', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setImportMessage(response.data.message);
            if (response.data.errors && response.data.errors.length > 0) {
                setImportError(response.data.errors.map(err => `Dòng ${err.row}: ${err.message}`).join('\n'));
            }
            fetchRooms();
        } catch (err) {
            console.error('Error during import:', err);
            setImportError(`Lỗi khi nhập file: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
            setImportFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Quản lý Phòng học</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            {/* Manual Add/Edit Section */}
            <div className="mb-8 p-4 border rounded-lg bg-white shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Thêm/Chỉnh sửa thủ công</h2>
                <button
                    onClick={handleAddRoomClick}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
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
            </div>

            {/* Bulk Import Section */}
            <div className="mb-8 p-4 border rounded-lg bg-white shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Nhập dữ liệu hàng loạt từ Excel/CSV</h2>
                <p className="text-sm text-gray-600 mb-2">
                    Tải xuống mẫu file Excel tại đây:
                    <a href="/room_template.xlsx" download className="text-blue-600 hover:underline ml-1">Tải mẫu</a>
                </p>
                <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                    onClick={handleImportSubmit}
                    disabled={!importFile || loading}
                    className={`mt-4 px-4 py-2 rounded font-bold text-white ${!importFile || loading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                    {loading ? 'Đang tải lên...' : 'Tải lên và Nhập dữ liệu'}
                </button>

                {importMessage && (
                    <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        {importMessage}
                    </div>
                )}
                {importError && (
                    <pre className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative whitespace-pre-wrap text-sm">
                        {importError}
                    </pre>
                )}
            </div>


            {/* Display Rooms Table */}
            {loading && !importMessage && !importError ? (
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