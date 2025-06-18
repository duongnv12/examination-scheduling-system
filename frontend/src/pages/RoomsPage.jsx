// frontend/src/pages/RoomsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx'; // Vẫn cần để xem trước, nhưng không dùng để gửi

// Import các component
import RoomForm from '../components/RoomForm';
import RoomTable from '../components/RoomTable';

const RoomsPage = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingRoom, setEditingRoom] = useState(null);
    const fileInputRef = useRef(null);
    const [excelData, setExcelData] = useState(null); // Dữ liệu chỉ để xem trước
    const [excelFileName, setExcelFileName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null); // Lưu trữ file gốc
    const [showConfirmImport, setShowConfirmImport] = useState(false);

    const fetchRooms = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/rooms');
            setRooms(response.data.data);
            toast.success('Tải danh sách phòng học thành công!');
        } catch (err) {
            console.error('Lỗi khi tải phòng học:', err);
            setError('Không thể tải danh sách phòng học. Vui lòng thử lại.');
            toast.error('Không thể tải danh sách phòng học.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleFormSubmit = async (data) => {
        try {
            if (editingRoom) {
                const response = await toast.promise(
                    api.put(`/rooms/${editingRoom.room_id}`, data),
                    {
                        loading: 'Đang cập nhật phòng học...',
                        success: 'Cập nhật phòng học thành công!',
                        error: (err) => `Cập nhật thất bại: ${err.response?.data?.message || err.message}`
                    }
                );
                setRooms(rooms.map(room =>
                    room.room_id === editingRoom.room_id ? response.data.data : room
                ));
                setEditingRoom(null);
            } else {
                const response = await toast.promise(
                    api.post('/rooms', data),
                    {
                        loading: 'Đang thêm phòng học...',
                        success: 'Thêm phòng học thành công!',
                        error: (err) => `Thêm thất bại: ${err.response?.data?.message || err.message}`
                    }
                );
                setRooms([...rooms, response.data.data]);
            }
        } catch (err) {
            console.error('Lỗi khi submit form:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa phòng học này không?')) {
            try {
                await toast.promise(
                    api.delete(`/rooms/${id}`),
                    {
                        loading: 'Đang xóa phòng học...',
                        success: 'Xóa phòng học thành công!',
                        error: (err) => `Xóa thất bại: ${err.response?.data?.message || err.message}`
                    }
                );
                setRooms(rooms.filter(room => room.room_id !== id));
            } catch (err) {
                console.error('Lỗi khi xóa phòng học:', err);
            }
        }
    };

    const handleEdit = (room) => {
        setEditingRoom(room);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) {
            setExcelData(null);
            setExcelFileName('');
            setSelectedFile(null);
            setShowConfirmImport(false);
            return;
        }

        setSelectedFile(file); // Lưu trữ file gốc
        setExcelFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length === 0) {
                toast.error('File Excel không có dữ liệu.');
                setExcelData(null);
                setExcelFileName('');
                setSelectedFile(null);
                setShowConfirmImport(false);
                return;
            }

            const expectedHeaders = ['Tên phòng', 'Sức chứa', 'Loại phòng'];
            const actualHeaders = jsonData[0];

            const isHeaderValid = expectedHeaders.every((header, index) =>
                actualHeaders[index] && actualHeaders[index].trim() === header
            );

            if (!isHeaderValid) {
                toast.error('File Excel không đúng định dạng cột. Vui lòng sử dụng file mẫu và đảm bảo đúng thứ tự: Tên phòng, Sức chứa, Loại phòng.');
                setExcelData(null);
                setExcelFileName('');
                setSelectedFile(null);
                setShowConfirmImport(false);
                return;
            }

            const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== ''));

            if (dataRows.length === 0) {
                toast.error('File Excel không chứa dữ liệu hợp lệ (ngoài hàng tiêu đề).');
                setExcelData(null);
                setExcelFileName('');
                setSelectedFile(null);
                setShowConfirmImport(false);
                return;
            }

            // Chỉ dùng excelData để hiển thị xem trước, không gửi lên backend
            setExcelData(dataRows);
            setShowConfirmImport(true);
        };
        reader.readAsArrayBuffer(file);
    };

    // Hàm xác nhận và gửi file Excel lên backend
    const confirmImport = async () => {
        if (!selectedFile) {
            toast.error('Không có file nào để import.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile); // Tên 'file' phải khớp với multer trong backend

        try {
            await toast.promise(
                api.post('/rooms/import', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data' // Quan trọng: phải là multipart/form-data
                    }
                }),
                {
                    loading: 'Đang import phòng học từ Excel...',
                    success: (res) => `Import hoàn tất: Tạo ${res.data.created} | Cập nhật ${res.data.updated} | Lỗi ${res.data.failed}`,
                    error: (err) => `Import thất bại: ${err.response?.data?.message || err.message}`
                }
            );
            // Sau khi import thành công, reset trạng thái và tải lại dữ liệu
            fileInputRef.current.value = null;
            setExcelData(null);
            setExcelFileName('');
            setSelectedFile(null);
            setShowConfirmImport(false);
            fetchRooms();
        } catch (err) {
            console.error('Lỗi khi gửi dữ liệu import:', err);
            // Lỗi đã được xử lý bởi toast.promise
        }
    };

    const handleCancelEdit = () => {
        setEditingRoom(null);
    };

    const handleCancelImport = () => {
        setExcelData(null);
        setExcelFileName('');
        setSelectedFile(null);
        setShowConfirmImport(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    if (loading) return <div className="text-center py-4 text-gray-600 font-sans">Đang tải dữ liệu phòng học...</div>;
    if (error) return <p className="text-red-600 text-center py-4 font-sans">{error}</p>;

    return (
        <div className="container mx-auto p-4 font-sans">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Quản lý Phòng Học</h1>

            <RoomForm
                onSubmit={handleFormSubmit}
                initialData={editingRoom}
                onCancelEdit={handleCancelEdit}
            />

            <div className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-xl mx-auto border border-dashed border-gray-300">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Import Phòng Học từ Excel</h2>
                <p className="text-gray-600 mb-4">
                    Tải lên file Excel (.xlsx hoặc .xls) chứa danh sách phòng học. Vui lòng sử dụng file mẫu để đảm bảo đúng định dạng.
                </p>
                <div className="mb-4">
                    <a
                        href="/rooms_template.xlsx" // Cần tạo file này trong public/
                        download="rooms_template.xlsx"
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Tải file Excel mẫu
                    </a>
                </div>
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-violet-50 file:text-violet-700
                    hover:file:bg-violet-100"
                />
                {excelFileName && (
                    <p className="text-gray-700 text-sm mt-2">File đã chọn: <span className="font-medium">{excelFileName}</span></p>
                )}

                {excelData && excelData.length > 0 && showConfirmImport && (
                    <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h3 className="text-xl font-semibold mb-3 text-gray-800">Xem trước dữ liệu từ File Excel:</h3>
                        <p className="text-gray-600 text-sm mb-2">Vui lòng kiểm tra dữ liệu dưới đây trước khi xác nhận import.</p>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {['Tên phòng', 'Sức chứa', 'Loại phòng'].map((header, idx) => (
                                            <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {excelData.map((row, rowIndex) => (
                                        <tr key={rowIndex} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-100">{String(row[0] || '')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-100">{String(row[1] || '')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-100 last:border-r-0">{String(row[2] || '')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                onClick={confirmImport}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
                            >
                                Xác nhận Import ({excelData.length} dòng)
                            </button>
                            <button
                                onClick={handleCancelImport}
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
                            >
                                Hủy Import
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <RoomTable
                rooms={rooms}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default RoomsPage;