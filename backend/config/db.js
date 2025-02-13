// config/db.js
const sql = require('mssql');
require('dotenv').config();  // โหลดค่าจากไฟล์ .env

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true  // เปลี่ยนเป็น true ถ้าใช้ self-signed certificate
    }
};

// ฟังก์ชันเชื่อมต่อกับฐานข้อมูล
const connectToDatabase = async () => {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('Connected to SQL Server');
        return pool;  // ส่งกลับ pool สำหรับการใช้งาน
    } catch (err) {
        console.error('Database connection failed:', err.message);
        throw err;  // ขึ้น error หากไม่สามารถเชื่อมต่อได้
    }
};

module.exports = connectToDatabase;  // ส่งออกฟังก์ชัน
