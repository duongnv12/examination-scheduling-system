// frontend/src/pages/DepartmentsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

// Import các component mới
import DepartmentForm from '../components/DepartmentForm';
import DepartmentTable from '../components/DepartmentTable';

const DepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const fileInputRef = useRef(null);
    const [excelData, setExcelData] = useState(null);
    const [excelFileName, setExcelFileName] = useState(''); // Thêm state để hiển thị tên file
    const [showConfirmImport, setShowConfirmImport] = useState(false); // Điều khiển hiển thị nút xác nhận import

    const fetchDepartments = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/departments');
            setDepartments(response.data.data);
            toast.success('Tải danh sách khoa thành công!');
        } catch (err) {
            console.error('Lỗi khi tải khoa:', err);
            setError('Không thể tải danh sách khoa. Vui lòng thử lại.');
            toast.error('Không thể tải danh sách khoa.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    // Hàm xử lý khi gửi form (thêm/cập nhật) từ DepartmentForm
    const handleFormSubmit = async (data) => {
        try {
            if (editingDepartment) {
                // Cập nhật khoa hiện có
                const response = await toast.promise(
                    api.put(`/departments/${editingDepartment.department_id}`, data),
                    {
                        loading: 'Đang cập nhật khoa...',
                        success: 'Cập nhật khoa thành công!',
                        error: (err) => `Cập nhật thất bại: ${err.response?.data?.message || err.message}`
                    }
                );
                // Cập nhật state departments
                setDepartments(departments.map(dept =>
                    dept.department_id === editingDepartment.department_id ? response.data.data : dept
                ));
                setEditingDepartment(null); // Thoát chế độ chỉnh sửa
            } else {
                // Thêm khoa mới
                const response = await toast.promise(
                    api.post('/departments', data),
                    {
                        loading: 'Đang thêm khoa...',
                        success: 'Thêm khoa thành công!',
                        error: (err) => `Thêm thất bại: ${err.response?.data?.message || err.message}`
                    }
                );
                // Cập nhật state departments
                setDepartments([...departments, response.data.data]);
            }
        } catch (err) {
            console.error('Lỗi khi submit form:', err);
        }
    };

    // Hàm xóa khoa
    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khoa này không?')) {
            try {
                await toast.promise(
                    api.delete(`/departments/${id}`),
                    {
                        loading: 'Đang xóa khoa...',
                        success: 'Xóa khoa thành công!',
                        error: (err) => `Xóa thất bại: ${err.response?.data?.message || err.message}`
                    }
                );
                // Lọc bỏ khoa đã xóa khỏi state
                setDepartments(departments.filter(dept => dept.department_id !== id));
            } catch (err) {
                console.error('Lỗi khi xóa khoa:', err);
            }
        }
    };

    // Hàm chuẩn bị dữ liệu cho việc chỉnh sửa
    const handleEdit = (department) => {
        setEditingDepartment(department);
    };

    // Hàm xử lý khi chọn file Excel
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) {
            setExcelData(null);
            setExcelFileName('');
            setShowConfirmImport(false);
            return;
        }

        setExcelFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            // Đọc dữ liệu thành mảng các mảng, bao gồm hàng đầu tiên (header)
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length === 0) {
                toast.error('File Excel không có dữ liệu.');
                setExcelData(null);
                setExcelFileName('');
                setShowConfirmImport(false);
                return;
            }

            // Kiểm tra header: Chú ý sắp xếp cột và tên cột phải khớp với logic ở backend
            const expectedHeaders = ['Mã khoa', 'Tên khoa', 'Mô tả'];
            const actualHeaders = jsonData[0];

            const isHeaderValid = expectedHeaders.every((header, index) =>
                actualHeaders[index] && actualHeaders[index].trim() === header
            );

            if (!isHeaderValid) {
                toast.error('File Excel không đúng định dạng cột. Vui lòng sử dụng file mẫu và đảm bảo đúng thứ tự: Mã khoa, Tên khoa, Mô tả.');
                setExcelData(null);
                setExcelFileName('');
                setShowConfirmImport(false);
                return;
            }

            // Lấy dữ liệu không bao gồm hàng header
            const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== '')); // Lọc bỏ hàng trống

            if (dataRows.length === 0) {
                toast.error('File Excel không chứa dữ liệu hợp lệ (ngoài hàng tiêu đề).');
                setExcelData(null);
                setExcelFileName('');
                setShowConfirmImport(false);
                return;
            }

            setExcelData(dataRows);
            setShowConfirmImport(true);
        };
        reader.readAsArrayBuffer(file);
    };

    // Hàm xác nhận và gửi dữ liệu Excel lên backend
    const confirmImport = async () => {
        if (!excelData || excelData.length === 0) {
            toast.error('Không có dữ liệu nào để import.');
            return;
        }

        const formattedData = excelData.map(row => ({
            department_code: String(row[0] || '').trim(), // Đảm bảo là string và loại bỏ khoảng trắng
            department_name: String(row[1] || '').trim(),
            description: String(row[2] || '').trim() || null // Nếu rỗng thì để null
        }));

        try {
            await toast.promise(
                api.post('/departments/import', formattedData), // Backend của chúng ta nhận JSON Array
                {
                    loading: 'Đang import khoa từ Excel...',
                    success: (res) => `Import hoàn tất: Tạo ${res.data.created} | Cập nhật ${res.data.updated} | Lỗi ${res.data.failed}`,
                    error: (err) => `Import thất bại: ${err.response?.data?.message || err.message}`
                }
            );
            // Sau khi import thành công, reset trạng thái và tải lại dữ liệu
            fileInputRef.current.value = null;
            setExcelData(null);
            setExcelFileName('');
            setShowConfirmImport(false);
            fetchDepartments();
        } catch (err) {
            console.error('Lỗi khi gửi dữ liệu import:', err);
            // Lỗi đã được xử lý bởi toast.promise
        }
    };

    const handleCancelEdit = () => {
        setEditingDepartment(null);
    };

    const handleCancelImport = () => {
        setExcelData(null);
        setExcelFileName('');
        setShowConfirmImport(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };


    if (loading) return <div className="text-center py-4 text-gray-600">Đang tải dữ liệu khoa...</div>;
    if (error) return <p className="text-red-600 text-center py-4">{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Quản lý Khoa</h1>

            {/* Form thêm/cập nhật khoa */}
            <DepartmentForm
                onSubmit={handleFormSubmit}
                initialData={editingDepartment}
                onCancelEdit={handleCancelEdit}
            />

            {/* Phần Import từ Excel */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-xl mx-auto border border-dashed border-gray-300">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Import Khoa từ Excel</h2>
                <p className="text-gray-600 mb-4">
                    Tải lên file Excel (.xlsx hoặc .xls) chứa danh sách khoa. Vui lòng sử dụng file mẫu để đảm bảo đúng định dạng.
                </p>
                <div className="mb-4">
                    <a
                        href="/departments_template.xlsx"
                        download="departments_template.xlsx"
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

                {/* Xem trước dữ liệu Excel */}
                {excelData && excelData.length > 0 && (
                    <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h3 className="text-xl font-semibold mb-3 text-gray-800">Xem trước dữ liệu từ File Excel:</h3>
                        <p className="text-gray-600 text-sm mb-2">Vui lòng kiểm tra dữ liệu dưới đây trước khi xác nhận import.</p>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {['Mã khoa', 'Tên khoa', 'Mô tả'].map((header, idx) => (
                                            <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {excelData.map((row, rowIndex) => (
                                        <tr key={rowIndex} className="hover:bg-gray-50">
                                            {row.map((cell, cellIndex) => (
                                                <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-100 last:border-r-0">
                                                    {cell !== null && cell !== undefined ? String(cell) : ''}
                                                </td>
                                            ))}
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

            {/* Danh sách khoa */}
            <DepartmentTable
                departments={departments}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default DepartmentsPage;