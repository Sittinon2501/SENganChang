const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../config/db');
const register = async (req, res) => {
    const { Name, Email, Password, Phone, Address, Role, Skills, Experience, AvailableTime } = req.body;

    const pool = await connectToDatabase();

    // Default the Role to 'customer' if not provided
    const userRole = Role || 'customer';

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
        .input('Role', userRole)  // Use userRole which defaults to 'customer' if Role is undefined
        .query('INSERT INTO Users (Name, Email, Password, Phone, Address, Role) OUTPUT Inserted.UserID VALUES (@Name, @Email, @Password, @Phone, @Address, @Role)');

    const userId = insertUserResult.recordset[0].UserID;

    // ถ้าผู้ใช้สมัครเป็นช่าง (Technician), บันทึกข้อมูลในตาราง Technicians
    if (userRole === 'technician') {
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
    const { Name, Phone, Address, Skills, Experience, AvailableTime, Role } = req.body;

    // ตรวจสอบและดึง userId จาก JWT token
    const token = req.headers.authorization?.split(' ')[1]; // เอา token จาก Authorization header
    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET); // ตรวจสอบและ decode token
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const userId = decoded.userId; // ดึง userId จาก token

    // เชื่อมต่อฐานข้อมูล
    const pool = await connectToDatabase();

    if (!Name || !Phone || !Address) {
        return res.status(400).json({ message: 'Name, Phone, and Address are required' });
    }

    // ตรวจสอบว่า UserID ตรงกับผู้ใช้ที่ล็อกอินหรือไม่
    const userResult = await pool.request()
        .input('UserID', userId)
        .query('SELECT Role FROM Users WHERE UserID = @UserID');
    
    const user = userResult.recordset[0];

    if (!user || (user.Role !== Role)) {
        return res.status(403).json({ message: 'You are not authorized to update this profile' });
    }

    // อัปเดตข้อมูลในตาราง Users
    await pool.request()
        .input('UserID', userId)
        .input('Name', Name)
        .input('Phone', Phone)
        .input('Address', Address)
        .query('UPDATE Users SET Name = @Name, Phone = @Phone, Address = @Address WHERE UserID = @UserID');

    // ถ้าเป็นช่าง (Technician), อัปเดตข้อมูลในตาราง Technicians
    if (Role === 'technician' && (Skills || Experience || AvailableTime)) {
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
const getUserProfile = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // ดึง token จาก header
    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET); // ตรวจสอบและ decode token
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const userId = decoded.userId; // ดึง userId จาก token

    // เชื่อมต่อฐานข้อมูล
    const pool = await connectToDatabase();

    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล Users
    const userResult = await pool.request()
        .input('UserID', userId)
        .query('SELECT UserID, Name, Email, Phone, Address, Role FROM Users WHERE UserID = @UserID');

    if (userResult.recordset.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.recordset[0];

    // หากผู้ใช้มีบทบาทเป็น technician ให้ดึงข้อมูลจากตาราง Technicians
    if (user.Role === 'technician') {
        const technicianResult = await pool.request()
            .input('UserID', userId)
            .query('SELECT Skills, Experience, AvailableTime FROM Technicians WHERE UserID = @UserID');

        if (technicianResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Technician profile not found' });
        }

        const technician = technicianResult.recordset[0];

        // รวมข้อมูลทั้งสองตาราง
        return res.status(200).json({
            user: {
                ...user,
                Skills: technician.Skills,
                Experience: technician.Experience,
                AvailableTime: technician.AvailableTime
            }
        });
    }

    // หากไม่ใช่ technician ให้ส่งข้อมูลของ user ไป
    res.status(200).json({ user });
};


module.exports = { login,register, updateProfile, registerTechnician, getUserProfile,  };
