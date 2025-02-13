const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../config/db');
const register = async (req, res) => {
    const { Name, Email, Password, Phone, Address, Role, Skills, Experience, AvailableTime } = req.body;

    const pool = await connectToDatabase();
    // ตรวจสอบว่ามีผู้ใช้ด้วยอีเมลนี้หรือไม่
    const result = await pool.request()
        .input('Email', Email)
        .query('SELECT * FROM Users WHERE Email = @Email');
    
    if (result.recordset.length > 0) {
        return res.status(400).json({ message: 'Email already in use' });
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(Password, 10);

    // สร้างผู้ใช้ใหม่ในตาราง Users
    const insertUserResult = await pool.request()
        .input('Name', Name)
        .input('Email', Email)
        .input('Password', hashedPassword)
        .input('Phone', Phone)
        .input('Address', Address)
        .input('Role', Role)
        .query('INSERT INTO Users (Name, Email, Password, Phone, Address, Role) OUTPUT Inserted.UserID VALUES (@Name, @Email, @Password, @Phone, @Address, @Role)');

    const userId = insertUserResult.recordset[0].UserID;

    // ถ้าผู้ใช้สมัครเป็นช่าง (Technician), บันทึกข้อมูลในตาราง Technicians
    if (Role === 'technician') {
        await pool.request()
            .input('UserID', userId)
            .input('Skills', Skills)
            .input('Experience', Experience)
            .input('AvailableTime', AvailableTime)
            .query('INSERT INTO Technicians (UserID, Skills, Experience, AvailableTime) VALUES (@UserID, @Skills, @Experience, @AvailableTime)');
    }

    res.status(201).json({ message: 'User registered successfully' });
};

// ฟังก์ชันสำหรับเข้าสู่ระบบ
// ฟังก์ชันสำหรับเข้าสู่ระบบ
const login = async (req, res) => {
    const { Email, Password } = req.body;

    const pool = await connectToDatabase();
    const result = await pool.request()
        .input('Email', Email)
        .query('SELECT * FROM Users WHERE Email = @Email');
    
    if (result.recordset.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.recordset[0];
    const validPassword = await bcrypt.compare(Password, user.Password);

    if (!validPassword) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // สร้าง JWT Token
    const token = jwt.sign({ userId: user.UserID, role: user.Role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // ส่งข้อมูล user พร้อมกับ token
    res.json({
        message: 'Login successful',
        token,
        user: { UserID: user.UserID, Email: user.Email, Role: user.Role }
    });
};


// ฟังก์ชันสำหรับแก้ไขโปรไฟล์ของลูกค้าและช่าง
const updateProfile = async (req, res) => {
    const { userId, Name, Phone, Address, Skills, Experience, AvailableTime } = req.body;

    const pool = await connectToDatabase();

    if (!Name || !Phone || !Address) {
        return res.status(400).json({ message: 'Name, Phone, and Address are required' });
    }

    // อัปเดตข้อมูลในตาราง Users
    await pool.request()
        .input('UserID', userId)
        .input('Name', Name)
        .input('Phone', Phone)
        .input('Address', Address)
        .query('UPDATE Users SET Name = @Name, Phone = @Phone, Address = @Address WHERE UserID = @UserID');

    // ถ้าเป็นช่าง (Technician), อัปเดตข้อมูลในตาราง Technicians
    if (Skills && Experience && AvailableTime) {
        await pool.request()
            .input('UserID', userId)
            .input('Skills', Skills)
            .input('Experience', Experience)
            .input('AvailableTime', AvailableTime)
            .query('UPDATE Technicians SET Skills = @Skills, Experience = @Experience, AvailableTime = @AvailableTime WHERE UserID = @UserID');
    }

    res.status(200).json({ message: 'Profile updated successfully' });
};
// ฟังก์ชันสำหรับสมัครสมาชิกเป็นช่าง
const registerTechnician = async (req, res) => {
    const { Name, Email, Password, Phone, Address, Skills, Experience, AvailableTime } = req.body;

    const pool = await connectToDatabase();

    // ตรวจสอบว่ามีผู้ใช้ด้วยอีเมลนี้หรือไม่
    const result = await pool.request()
        .input('Email', Email)
        .query('SELECT * FROM Users WHERE Email = @Email');
    
    if (result.recordset.length > 0) {
        return res.status(400).json({ message: 'Email already in use' });
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(Password, 10);

    // สร้างผู้ใช้ใหม่ในตาราง Users
    const insertUserResult = await pool.request()
        .input('Name', Name)
        .input('Email', Email)
        .input('Password', hashedPassword)
        .input('Phone', Phone)
        .input('Address', Address)
        .input('Role', 'technician') // กำหนดเป็นช่าง
        .query('INSERT INTO Users (Name, Email, Password, Phone, Address, Role) OUTPUT Inserted.UserID VALUES (@Name, @Email, @Password, @Phone, @Address, @Role)');

    const userId = insertUserResult.recordset[0].UserID;

    // บันทึกข้อมูลช่างในตาราง Technicians
    await pool.request()
        .input('UserID', userId)
        .input('Skills', Skills)
        .input('Experience', Experience)
        .input('AvailableTime', AvailableTime)
        .query('INSERT INTO Technicians (UserID, Skills, Experience, AvailableTime) VALUES (@UserID, @Skills, @Experience, @AvailableTime)');

    res.status(201).json({ message: 'Technician registered successfully' });
};
module.exports = { register, login, updateProfile, registerTechnician };
