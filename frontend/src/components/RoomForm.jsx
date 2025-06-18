// frontend/src/components/RoomForm.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const roomSchema = yup.object().shape({
    room_name: yup.string().required('Tên phòng không được để trống'),
    capacity: yup.number()
        .typeError('Sức chứa phải là số')
        .integer('Sức chứa phải là số nguyên')
        .min(1, 'Sức chứa phải lớn hơn 0')
        .required('Sức chứa không được để trống'),
    room_type: yup.string().required('Loại phòng không được để trống')
});

const RoomForm = ({ onSubmit, initialData, onCancelEdit }) => {
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(roomSchema),
        defaultValues: initialData || {
            room_name: '',
            capacity: '',
            room_type: ''
        }
    });

    useEffect(() => {
        if (initialData) {
            setValue('room_name', initialData.room_name);
            setValue('capacity', initialData.capacity);
            setValue('room_type', initialData.room_type);
        } else {
            reset();
        }
    }, [initialData, setValue, reset]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-xl mx-auto font-sans">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                {initialData ? 'Chỉnh sửa Phòng' : 'Thêm Phòng Mới'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                    <label htmlFor="room_name" className="block text-gray-700 text-sm font-bold mb-2">Tên Phòng:</label>
                    <input
                        id="room_name"
                        {...register('room_name')}
                        readOnly={!!initialData} // Không cho phép sửa tên phòng khi chỉnh sửa
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${!!initialData ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}`}
                    />
                    {errors.room_name && <p className="text-red-500 text-xs italic mt-1">{errors.room_name.message}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="capacity" className="block text-gray-700 text-sm font-bold mb-2">Sức chứa:</label>
                    <input
                        id="capacity"
                        type="number"
                        {...register('capacity')}
                        className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    {errors.capacity && <p className="text-red-500 text-xs italic mt-1">{errors.capacity.message}</p>}
                </div>

                <div className="mb-6">
                    <label htmlFor="room_type" className="block text-gray-700 text-sm font-bold mb-2">Loại Phòng:</label>
                    <select
                        id="room_type"
                        {...register('room_type')}
                        className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="">Chọn loại phòng</option>
                        <option value="Lý thuyết">Lý thuyết</option>
                        <option value="Thực hành">Thực hành</option>
                        <option value="Phòng Lab">Phòng Lab</option>
                    </select>
                    {errors.room_type && <p className="text-red-500 text-xs italic mt-1">{errors.room_type.message}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ease-in-out"
                    >
                        {initialData ? 'Cập nhật' : 'Thêm Phòng'}
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

export default RoomForm;