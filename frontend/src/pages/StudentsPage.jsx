// frontend/src/pages/StudentsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

// Import các component
import StudentForm from '../components/StudentForm';
import StudentTable from '../components/StudentTable';

const StudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingStudent, setEditingStudent] = useState(null);
    const fileInputRef = useRef(null);
    const [excelData, setExcelData] = useState(null);
    const [excelFileName, setExcelFileName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [showConfirmImport, setShowConfirmImport] = useState(false);

    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            // Bao gồm thông tin khoa khi lấy danh sách sinh viên
            const response = await api.get('/students'); // Backend sẽ tự động include Department do cấu hình trong controller
            setStudents(response.data.data);
            toast.success('Tải danh sách sinh viên thành công!');
        } catch (err) {
            console.error('Lỗi khi tải sinh viên:', err);
            setError('Không thể tải danh sách sinh viên. Vui lòng thử lại.');
            toast.error('Không thể tải danh sách sinh viên.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleFormSubmit = async (data) => {
        try {
            // Định dạng lại ngày sinh về YYYY-MM-DD
            const formattedData = {
                ...data,
                date_of_birth: data.date_of_birth ? new Date(data.date_of_birth).toISOString().split('T')[0] : null,
            };

            if (editingStudent) {
                const response = await toast.promise(
                    api.put(`/students/${editingStudent.student_id}`, formattedData),
                    {
                        loading: 'Đang cập nhật sinh viên...',
                        success: 'Cập nhật sinh viên thành công!',
                        error: (err) => `Cập nhật thất bại: ${err.response?.data?.error || err.message}`
                    }
                );
                // Sau khi cập nhật, backend trả về student kèm Department, dùng luôn
                setStudents(students.map(std =>
                    std.student_id === editingStudent.student_id ? response.data.data : std
                ));
                setEditingStudent(null);
            } else {
                const response = await toast.promise(
                    api.post('/students', formattedData),
                    {
                        loading: 'Đang thêm sinh viên...',
                        success: 'Thêm sinh viên thành công!',
                        error: (err) => `Thêm thất bại: ${err.response?.data?.error || err.message}`
                    }
                );
                // Sau khi tạo mới, backend trả về student kèm Department, dùng luôn
                setStudents([...students, response.data.data]);
            }
        } catch (err) {
            console.error('Lỗi khi submit form:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sinh viên này không?')) {
            try {
                await toast.promise(
                    api.delete(`/students/${id}`),
                    {
                        loading: 'Đang xóa sinh viên...',
                        success: 'Xóa sinh viên thành công!',
                        error: (err) => `Xóa thất bại: ${err.response?.data?.error || err.message}`
                    }
                );
                setStudents(students.filter(std => std.student_id !== id));
            } catch (err) {
                console.error('Lỗi khi xóa sinh viên:', err);
            }
        }
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
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

            // Cập nhật header mong đợi theo thứ tự trong file mẫu
            const expectedHeaders = ['Mã sinh viên', 'Tên sinh viên', 'Giới tính', 'Ngày sinh', 'Email', 'Số điện thoại', 'Địa chỉ', 'Mã khoa'];
            const actualHeaders = jsonData[0];

            const isHeaderValid = expectedHeaders.every((header, index) =>
                actualHeaders[index] && String(actualHeaders[index]).trim() === header
            );

            if (!isHeaderValid) {
                toast.error('File Excel không đúng định dạng cột. Vui lòng sử dụng file mẫu và đảm bảo đúng thứ tự: Mã sinh viên, Tên sinh viên, Giới tính, Ngày sinh, Email, Số điện thoại, Địa chỉ, Mã khoa.');
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

            setExcelData(dataRows);
            setShowConfirmImport(true);
        };
        reader.readAsArrayBuffer(file);
    };

    const confirmImport = async () => {
        if (!selectedFile) {
            toast.error('Không có file nào để import.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await toast.promise(
                api.post('/students/import', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }),
                {
                    loading: 'Đang import sinh viên từ Excel...',
                    success: (res) => `Import hoàn tất: Tạo ${res.data.created} | Cập nhật ${res.data.updated} | Lỗi ${res.data.failed}`,
                    error: (err) => `Import thất bại: ${err.response?.data?.error || err.message}`
                }
            );
            fileInputRef.current.value = null;
            setExcelData(null);
            setExcelFileName('');
            setSelectedFile(null);
            setShowConfirmImport(false);
            fetchStudents(); // Tải lại danh sách sau khi import
        } catch (err) {
            console.error('Lỗi khi gửi dữ liệu import:', err);
        }
    };

    const handleCancelEdit = () => {
        setEditingStudent(null);
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

    if (loading) return <div className="text-center py-4 text-gray-600 font-sans">Đang tải dữ liệu sinh viên...</div>;
    if (error) return <p className="text-red-600 text-center py-4 font-sans">{error}</p>;

    return (
        <div className="container mx-auto p-4 font-sans">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Quản lý Sinh viên</h1>

            <StudentForm
                onSubmit={handleFormSubmit}
                initialData={editingStudent}
                onCancelEdit={handleCancelEdit}
            />

            <div className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-xl mx-auto border border-dashed border-gray-300">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Import Sinh viên từ Excel</h2>
                <p className="text-gray-600 mb-4">
                    Tải lên file Excel (.xlsx hoặc .xls) chứa danh sách sinh viên. Vui lòng sử dụng file mẫu để đảm bảo đúng định dạng.
                </p>
                <div className="mb-4">
                    <a
                        href="/students_template.xlsx"
                        download="students_template.xlsx"
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
                                        {['Mã sinh viên', 'Tên sinh viên', 'Giới tính', 'Ngày sinh', 'Email', 'Số điện thoại', 'Địa chỉ', 'Mã khoa'].map((header, idx) => (
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-100">{String(row[2] || '')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-100">
                                                {row[3] ? new Date(Math.round((row[3] - 25569) * 86400 * 1000)).toLocaleDateString('vi-VN') : ''}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-100">{String(row[4] || '')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-100">{String(row[5] || '')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-100">{String(row[6] || '')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-100 last:border-r-0">{String(row[7] || '')}</td>
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

            <StudentTable
                students={students}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default StudentsPage;