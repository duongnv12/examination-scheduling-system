// frontend/src/pages/FacultyManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import * as facultyApi from '../api/facultyApi';
import FacultyForm from '../components/FacultyForm';
import axios from 'axios';

const FacultyManagement = () => {
    const [facultyMembers, setFacultyMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // State for bulk import
    const [importFile, setImportFile] = useState(null);
    const [importMessage, setImportMessage] = useState(null);
    const [importError, setImportError] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await facultyApi.getAllFaculty();
            setFacultyMembers(data);
        } catch (err) {
            setError('Không thể tải danh sách cán bộ/giảng viên. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUpdateFaculty = async (facultyData) => {
        setLoading(true);
        setError(null);
        try {
            if (editingFaculty) {
                await facultyApi.updateFaculty(editingFaculty.faculty_id, facultyData);
                alert('Cán bộ/Giảng viên đã được cập nhật thành công!');
            } else {
                await facultyApi.createFaculty(facultyData);
                alert('Cán bộ/Giảng viên đã được thêm mới thành công!');
            }
            setShowForm(false);
            setEditingFaculty(null);
            fetchFaculty();
        } catch (err) {
            setError(`Lỗi: ${err.response?.data?.message || err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFaculty = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa cán bộ/giảng viên này không?')) {
            setLoading(true);
            setError(null);
            try {
                await facultyApi.deleteFaculty(id);
                alert('Cán bộ/Giảng viên đã được xóa thành công!');
                fetchFaculty();
            } catch (err) {
                setError(`Lỗi: ${err.response?.data?.message || err.message}`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEditClick = (faculty) => {
        setEditingFaculty(faculty);
        setShowForm(true);
    };

    const handleAddFacultyClick = () => {
        setEditingFaculty(null);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingFaculty(null);
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
            const response = await axios.post('http://localhost:5000/api/import/faculty', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setImportMessage(response.data.message);
            if (response.data.errors && response.data.errors.length > 0) {
                setImportError(response.data.errors.map(err => `Dòng ${err.row}: ${err.message}`).join('\n'));
            }
            fetchFaculty();
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
            <h1 className="text-3xl font-bold mb-6 text-center">Quản lý Cán bộ / Giảng viên</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            {/* Manual Add/Edit Section */}
            <div className="mb-8 p-4 border rounded-lg bg-white shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Thêm/Chỉnh sửa thủ công</h2>
                <button
                    onClick={handleAddFacultyClick}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                    Thêm Cán bộ/Giảng viên mới
                </button>
                {showForm && (
                    <FacultyForm
                        initialData={editingFaculty}
                        onSubmit={handleCreateUpdateFaculty}
                        onCancel={handleCancelForm}
                    />
                )}
            </div>

            {/* Bulk Import Section */}
            <div className="mb-8 p-4 border rounded-lg bg-white shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Nhập dữ liệu hàng loạt từ Excel/CSV</h2>
                <p className="text-sm text-gray-600 mb-2">
                    Tải xuống mẫu file Excel tại đây:
                    <a href="/faculty_template.xlsx" download className="text-blue-600 hover:underline ml-1">Tải mẫu</a>
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

            {/* Display Faculty Table */}
            {loading && !importMessage && !importError ? (
                <p className="text-center text-lg">Đang tải dữ liệu...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã CB/GV</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khoa/Phòng ban</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sẵn sàng coi thi</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {facultyMembers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-4 px-6 text-center text-gray-500">
                                        Chưa có cán bộ/giảng viên nào.
                                    </td>
                                </tr>
                            ) : (
                                facultyMembers.map(member => (
                                    <tr key={member.faculty_id}>
                                        <td className="py-4 px-6 whitespace-nowrap">{member.faculty_code}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{member.full_name}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{member.department || 'N/A'}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">{member.is_available_for_invigilation ? 'Có' : 'Không'}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <button
                                                onClick={() => handleEditClick(member)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm mr-2"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDeleteFaculty(member.faculty_id)}
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

export default FacultyManagement;