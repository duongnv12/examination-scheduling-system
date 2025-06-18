// frontend/src/components/DepartmentForm.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Schema validation với Yup
const departmentSchema = yup.object().shape({
    department_code: yup.string().required('Mã khoa không được để trống'),
    department_name: yup.string().required('Tên khoa không được để trống'),
    description: yup.string().nullable()
});

const DepartmentForm = ({ onSubmit, initialData, onCancelEdit }) => {
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(departmentSchema),
        defaultValues: initialData || { // Sử dụng initialData nếu có, hoặc giá trị mặc định trống
            department_code: '',
            department_name: '',
            description: ''
        }
    });

    // Cập nhật form khi initialData thay đổi (khi người dùng click "Sửa")
    useEffect(() => {
        if (initialData) {
            setValue('department_code', initialData.department_code);
            setValue('department_name', initialData.department_name);
            setValue('description', initialData.description);
        } else {
            reset(); // Reset form khi không có dữ liệu khởi tạo (thêm mới)
        }
    }, [initialData, setValue, reset]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                {initialData ? 'Chỉnh sửa Khoa' : 'Thêm Khoa Mới'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                    <label htmlFor="department_code" className="block text-gray-700 text-sm font-bold mb-2">Mã Khoa:</label>
                    <input
                        id="department_code"
                        {...register('department_code')}
                        readOnly={!!initialData}
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${!!initialData ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                    />
                    {errors.department_code && <p className="text-red-500 text-xs italic mt-1">{errors.department_code.message}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="department_name" className="block text-gray-700 text-sm font-bold mb-2">Tên Khoa:</label>
                    <input
                        id="department_name"
                        {...register('department_name')}
                        className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    {errors.department_name && <p className="text-red-500 text-xs italic mt-1">{errors.department_name.message}</p>}
                </div>

                <div className="mb-6">
                    <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Mô tả:</label>
                    <textarea
                        id="description"
                        {...register('description')}
                        rows="3"
                        className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-y"
                    ></textarea>
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        {initialData ? 'Cập nhật' : 'Thêm Khoa'}
                    </button>
                    {initialData && (
                        <button
                            type="button"
                            onClick={onCancelEdit}
                            className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Hủy
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default DepartmentForm;