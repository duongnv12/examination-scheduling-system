// frontend/src/pages/ScheduleGeneration.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ScheduleGeneration = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [examSlotsPerDay, setExamSlotsPerDay] = useState(4); // Default 4 slots: 2 morning, 2 afternoon
    const [examType, setExamType] = useState('Cuối kỳ'); // Default exam type
    const [semester, setSemester] = useState(''); // E.g., '2024-2025/1'

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null); // To store success/error counts

    useEffect(() => {
        // Set default dates for convenience (e.g., next month)
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

        setStartDate(nextMonth.toISOString().split('T')[0]);
        setEndDate(endOfNextMonth.toISOString().split('T')[0]);

        // Basic semester suggestion (e.g., current year-next year/1)
        const currentYear = today.getFullYear();
        setSemester(`${currentYear}-${currentYear + 1}/1`);

    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);
        setResults(null);

        try {
            const response = await axios.post('http://localhost:5000/api/generate-schedule', {
                startDate,
                endDate,
                examSlotsPerDay: Number(examSlotsPerDay),
                examType,
                semester
            });
            setMessage(response.data.message);
            setResults({
                scheduled_count: response.data.scheduled_count,
                error_count: response.data.error_count,
                errors: response.data.errors,
                warnings: response.data.warnings
            });
            // Optionally, refresh exam schedules list after generation
            // You might want to navigate to ExamScheduleManagement page or trigger a fetch there.

        } catch (err) {
            console.error('Error generating schedule:', err);
            setError(`Lỗi khi tạo lịch thi: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Tạo Lịch thi Tự động</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Ngày bắt đầu:</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Ngày kết thúc:</label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="examSlotsPerDay" className="block text-sm font-medium text-gray-700">Số ca thi mỗi ngày:</label>
                        <select
                            id="examSlotsPerDay"
                            name="examSlotsPerDay"
                            value={examSlotsPerDay}
                            onChange={(e) => setExamSlotsPerDay(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        >
                            <option value="1">1 ca</option>
                            <option value="2">2 ca</option>
                            <option value="3">3 ca</option>
                            <option value="4">4 ca</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            (Ca 1: 07:30-09:00, Ca 2: 09:30-11:00, Ca 3: 13:00-14:30, Ca 4: 15:00-16:30)
                        </p>
                    </div>
                    <div>
                        <label htmlFor="examType" className="block text-sm font-medium text-gray-700">Loại hình thi:</label>
                        <select
                            id="examType"
                            name="examType"
                            value={examType}
                            onChange={(e) => setExamType(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        >
                            <option value="Giữa kỳ">Giữa kỳ</option>
                            <option value="Cuối kỳ">Cuối kỳ</option>
                            <option value="Bổ sung">Bổ sung</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Học kỳ:</label>
                        <input
                            type="text"
                            id="semester"
                            name="semester"
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                            placeholder="VD: 2024-2025/1"
                        />
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-3 rounded-lg font-bold text-white ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {loading ? 'Đang tạo lịch...' : 'Tạo Lịch thi'}
                    </button>
                </div>
            </form>

            {results && (
                <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                    <h2 className="text-xl font-semibold mb-4">Kết quả tạo lịch:</h2>
                    <p className="mb-2">
                        <span className="font-medium">Số lịch thi được xếp thành công:</span> <span className="text-green-600">{results.scheduled_count}</span>
                    </p>
                    {results.error_count > 0 && (
                        <p className="mb-2">
                            <span className="font-medium">Số môn không xếp được lịch:</span> <span className="text-red-600">{results.error_count}</span>
                        </p>
                    )}

                    {results.errors && results.errors.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold text-red-700 mb-2">Lỗi không xếp được lịch:</h3>
                            <ul className="list-disc list-inside text-red-700 text-sm bg-red-50 p-3 rounded">
                                {results.errors.map((err, index) => (
                                    <li key={index}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {results.warnings && results.warnings.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold text-yellow-700 mb-2">Cảnh báo (cần xem xét):</h3>
                            <ul className="list-disc list-inside text-yellow-700 text-sm bg-yellow-50 p-3 rounded">
                                {results.warnings.map((warn, index) => (
                                    <li key={index}>{warn}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ScheduleGeneration;