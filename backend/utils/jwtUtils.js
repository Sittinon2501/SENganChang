const jwt = require('jsonwebtoken');
require('dotenv').config();

// ฟังก์ชันสร้าง Token
const generateToken = (user) => {
    // ตรวจสอบว่า user มีข้อมูลที่จำเป็นหรือไม่
    if (!user || !user.id || !user.role) {
        throw new Error('Invalid user data for token generation');
    }

    // สร้าง payload สำหรับ token
    const payload = {
        id: user.id, // ID ของผู้ใช้
        email: user.email, // อีเมลของผู้ใช้
        role: user.role, // Role ของผู้ใช้ (customer หรือ technician)
    };

    // เพิ่ม latitude และ longitude ถ้ามีค่า
    if (user.latitude !== null && user.longitude !== null) {
        payload.latitude = user.latitude;
        payload.longitude = user.longitude;
    }

    // สร้าง token
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token หมดอายุใน 1 ชั่วโมง
    });
};

// ฟังก์ชันตรวจสอบ Token
const verifyToken = (token) => {
    try {
        // ตรวจสอบและถอดรหัส token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ตรวจสอบค่า latitude และ longitude
        if (decoded.latitude === null || decoded.longitude === null) {
            console.warn('Latitude or longitude is missing in the token');
        }

        return decoded; // ส่งกลับข้อมูลที่ถอดรหัสได้
    } catch (error) {
        throw new Error('Invalid or expired token'); // หาก token ไม่ถูกต้องหรือหมดอายุ
    }
};

module.exports = { generateToken, verifyToken };