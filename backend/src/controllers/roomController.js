// backend/src/controllers/roomController.js
const { Room } = require('../models');

// 1. Lấy danh sách tất cả các phòng
exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.findAll();
        res.status(200).json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách phòng.', error: error.message });
    }
};

// 2. Lấy thông tin chi tiết một phòng bằng ID
exports.getRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findByPk(id);

        if (!room) {
            return res.status(404).json({ message: 'Không tìm thấy phòng.' });
        }
        res.status(200).json(room);
    } catch (error) {
        console.error('Error fetching room by ID:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin phòng.', error: error.message });
    }
};

// 3. Tạo phòng mới
exports.createRoom = async (req, res) => {
    try {
        const { room_name, capacity, room_type, description } = req.body;

        if (!room_name || !capacity || !room_type) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin phòng (Tên, Sức chứa, Loại phòng).' });
        }
        if (capacity <= 0) {
            return res.status(400).json({ message: 'Sức chứa phải lớn hơn 0.' });
        }

        const newRoom = await Room.create({
            room_name,
            capacity,
            room_type,
            description
        });
        res.status(201).json({ message: 'Phòng đã được tạo thành công!', room: newRoom });
    } catch (error) {
        console.error('Error creating room:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Tên phòng đã tồn tại.' });
        }
        res.status(500).json({ message: 'Lỗi khi tạo phòng mới.', error: error.message });
    }
};

// 4. Cập nhật thông tin phòng
exports.updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { room_name, capacity, room_type, description, is_active } = req.body;

        const room = await Room.findByPk(id);
        if (!room) {
            return res.status(404).json({ message: 'Không tìm thấy phòng để cập nhật.' });
        }

        room.room_name = room_name || room.room_name;
        room.capacity = capacity || room.capacity;
        room.room_type = room_type || room.room_type;
        room.description = description !== undefined ? description : room.description; // Có thể cập nhật null/empty
        room.is_active = is_active !== undefined ? is_active : room.is_active;

        if (room.capacity <= 0) { // Kiểm tra lại sau khi gán
            return res.status(400).json({ message: 'Sức chứa phải lớn hơn 0.' });
        }

        await room.save();

        res.status(200).json({ message: 'Phòng đã được cập nhật thành công!', room });
    } catch (error) {
        console.error('Error updating room:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Tên phòng đã tồn tại.' });
        }
        res.status(500).json({ message: 'Lỗi khi cập nhật phòng.', error: error.message });
    }
};

// 5. Xóa một phòng
exports.deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findByPk(id);

        if (!room) {
            return res.status(404).json({ message: 'Không tìm thấy phòng để xóa.' });
        }

        await room.destroy();

        res.status(200).json({ message: 'Phòng đã được xóa thành công!' });
    } catch (error) {
        console.error('Error deleting room:', error);
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ message: 'Không thể xóa phòng này vì có dữ liệu lịch thi liên quan.', error: error.message });
        }
        res.status(500).json({ message: 'Lỗi khi xóa phòng.', error: error.message });
    }
};