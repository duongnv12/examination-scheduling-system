// frontend/src/components/StudentForm.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';
import toast from 'react-hot-toast';

// Schema validation với Yup
const studentSchema = yup.object().shape({
    student_code: yup.string().required('Mã sinh viên không được để trống'),
    full_name: yup.string().required('Tên sinh viên không được để trống'), // Đã đổi
    gender: yup.string().required('Giới tính không được để trống'),
    date_of_birth: yup.string().required('Ngày sinh không được để trống'),
    email: yup.string().email('Email không hợp lệ').required('Email không được để trống'),
    phone_number: yup.string().nullable().matches(/^[0-9]{10,11}$/, { message: 'Số điện thoại không hợp lệ', excludeEmptyString: true }),
    address: yup.string().nullable(),
    // class_name: yup.string().nullable(), // Thêm class_name nếu cần validation
    department_id: yup.string() // UUID là string
        .required('Vui lòng chọn khoa')
        .uuid('ID khoa không hợp lệ'), // Validate là UUID
});

const StudentForm = ({ onSubmit, initialData, onCancelEdit }) => {
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const [departmentError, setDepartmentError] = useState(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(studentSchema),
        defaultValues: initialData || {
            student_code: '',
            full_name: '',
            gender: '',
            date_of_birth: '',
            email: '',
            phone_number: '',
            address: '',
            // class_name: '', // Khởi tạo class_name
            department_id: ''
        }
    });

    useEffect(() => {
        const fetchDepartments = async () => {
            setLoadingDepartments(true);
            try {
                const response = await api.get('/departments');
                setDepartments(response.data.data);
            } catch (err) {
                console.error('Lỗi khi tải danh sách khoa:', err);
                setDepartmentError('Không thể tải danh sách khoa.');
                toast.error('Không thể tải danh sách khoa cho form sinh viên.');
            } finally {
                setLoadingDepartments(false);
            }
        };
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (initialData) {
            setValue('student_code', initialData.student_code);
            setValue('full_name', initialData.full_name); // Đã đổi
            setValue('gender', initialData.gender);
            setValue('date_of_birth', initialData.date_of_birth ? new Date(initialData.date_of_birth).toISOString().split('T')[0] : '');
            setValue('email', initialData.email);
            setValue('phone_number', initialData.phone_number);
            setValue('address', initialData.address);
            // setValue('class_name', initialData.class_name); // Set class_name
            setValue('department_id', initialData.department_id);
        } else {
            reset();
        }
    }, [initialData, setValue, reset]);

    if (loadingDepartments) {
        return <div className="text-center py-4 text-gray-600 font-sans">Đang tải dữ liệu khoa...</div>;
    }

    if (departmentError) {
        return <p className="text-red-600 text-center py-4 font-sans">{departmentError}</p>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-2xl mx-auto font-sans">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                {initialData ? 'Chỉnh sửa Sinh viên' : 'Thêm Sinh viên Mới'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                        <label htmlFor="student_code" className="block text-gray-700 text-sm font-bold mb-2">Mã Sinh viên:</label>
                        <input
                            id="student_code"
                            {...register('student_code')}
                            readOnly={!!initialData}
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${!!initialData ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                        />
                        {errors.student_code && <p className="text-red-500 text-xs italic mt-1">{errors.student_code.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="full_name" className="block text-gray-700 text-sm font-bold mb-2">Tên Sinh viên:</label>
                        <input
                            id="full_name"
                            {...register('full_name')} // Đã đổi
                            className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        {errors.full_name && <p className="text-red-500 text-xs italic mt-1">{errors.full_name.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="gender" className="block text-gray-700 text-sm font-bold mb-2">Giới tính:</label>
                        <select
                            id="gender"
                            {...register('gender')}
                            className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="">Chọn giới tính</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                        {errors.gender && <p className="text-red-500 text-xs italic mt-1">{errors.gender.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="date_of_birth" className="block text-gray-700 text-sm font-bold mb-2">Ngày sinh:</label>
                        <input
                            id="date_of_birth"
                            type="date"
                            {...register('date_of_birth')}
                            className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        {errors.date_of_birth && <p className="text-red-500 text-xs italic mt-1">{errors.date_of_birth.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                        <input
                            id="email"
                            type="email"
                            {...register('email')}
                            className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        {errors.email && <p className="text-red-500 text-xs italic mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="phone_number" className="block text-gray-700 text-sm font-bold mb-2">Số điện thoại:</label>
                        <input
                            id="phone_number"
                            type="tel"
                            {...register('phone_number')}
                            className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        {errors.phone_number && <p className="text-red-500 text-xs italic mt-1">{errors.phone_number.message}</p>}
                    </div>

                    <div className="mb-4 col-span-2">
                        <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Địa chỉ:</label>
                        <textarea
                            id="address"
                            {...register('address')}
                            rows="2"
                            className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-y"
                        ></textarea>
                    </div>
                    {/* Thêm trường class_name */}
                    {/* <div className="mb-4 col-span-2">
                        <label htmlFor="class_name" className="block text-gray-700 text-sm font-bold mb-2">Lớp:</label>
                        <input
                            id="class_name"
                            {...register('class_name')}
                            className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div> */}

                    <div className="mb-4 col-span-2">
                        <label htmlFor="department_id" className="block text-gray-700 text-sm font-bold mb-2">Khoa:</label>
                        <select
                            id="department_id"
                            {...register('department_id')} // department_id là string (UUID)
                            className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="">Chọn khoa</option>
                            {departments.map(dept => (
                                <option key={dept.department_id} value={dept.department_id}>
                                    {dept.department_name} ({dept.department_code})
                                </option>
                            ))}
                        </select>
                        {errors.department_id && <p className="text-red-500 text-xs italic mt-1">{errors.department_id.message}</p>}
                    </div>
                </div>

                <div className="flex items-center justify-end mt-6 space-x-3">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
                    >
                        {initialData ? 'Cập nhật' : 'Thêm Sinh viên'}
                    </button>
                    {initialData && (
                        <button
                            type="button"
                            onClick={onCancelEdit}
                            className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
                        >
                            Hủy
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default StudentForm;