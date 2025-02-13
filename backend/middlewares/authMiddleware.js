const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
    return (req, res, next) => {
        // ตรวจสอบว่า request มี header "Authorization" หรือไม่
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Access Denied, No token provided' });
        }

        try {
            // ตรวจสอบว่า token ถูกต้องและยังไม่หมดอายุ
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // เพิ่มข้อมูลผู้ใช้ลงใน request
            req.user = decoded;

            // ถ้ามีการตรวจสอบ role และไม่ตรงกับ role ของผู้ใช้ ก็จะไม่อนุญาตให้เข้าถึง
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Access Denied, insufficient permissions' });
            }

            next();
        } catch (error) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
    };
};

module.exports = authMiddleware;
