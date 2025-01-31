const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    // ดึง token จาก header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // ถ้าไม่มี token ส่งข้อความผิดพลาดกลับ
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // ตรวจสอบและถอดรหัส token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ตรวจสอบ role ของผู้ใช้
        if (decoded.role.toLowerCase() === 'customer') {
            req.customer = decoded; // เก็บข้อมูลลูกค้าใน req.customer
        } else if (decoded.role === 'technician') {
            req.technician = decoded; // เก็บข้อมูลช่างเทคนิคใน req.technician
        } else {
            return res.status(403).json({ message: 'Unauthorized role.' });
        }

        next(); // ไปยัง middleware หรือฟังก์ชันถัดไป
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports = authMiddleware; // ส่งออกฟังก์ชัน