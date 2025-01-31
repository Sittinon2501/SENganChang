const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken } = require("../utils/jwtUtils");
const { pool, sql } = require("../config/db");
const Customer = require('../models/Customer'); // นำเข้าโมดูล Customer

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
      // ตรวจสอบว่ามีผู้ใช้ในระบบหรือไม่
      const user = await User.findByUsername(username);
      if (!user) {
          return res.status(400).json({ message: 'Invalid username or password' });
      }

      // ตรวจสอบรหัสผ่าน
      const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);
      if (!isPasswordValid) {
          return res.status(400).json({ message: 'Invalid username or password' });
      }

      // หาก UserType เป็น Customer และไม่มีข้อมูลในตาราง Customers ให้สร้างข้อมูลใหม่
      if (user.UserType === 'Customer') {
          const customer = await Customer.findByUserID(user.UserID);
          if (!customer) {
              // สร้างข้อมูลใหม่ในตาราง Customers
              await Customer.create(user.UserID, user.FullName || 'Default FullName');
          }
      }

      // ตรวจสอบข้อมูลที่จำเป็นสำหรับ Token
      const userData = {
          id: user.UserID,
          email: user.Email,
          role: user.UserType, // หรือใช้ role อื่น ๆ ตามที่ต้องการ
          latitude: user.Latitude || null, // ถ้าไม่มีข้อมูล latitude จะส่งเป็น null
          longitude: user.Longitude || null // ถ้าไม่มีข้อมูล longitude จะส่งเป็น null
      };

      // สร้าง Token
      const token = generateToken(userData);

      // แสดงข้อมูล role ใน console
      console.log("User role:", userData.role);  // ตรวจสอบ role ที่จะถูกส่งใน token

      // ส่ง Token กลับไปให้ผู้ใช้
      res.status(200).json({ token });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
};


const register = async (req, res) => {
  const { username, password, email, PhoneNumber, Address, Latitude, Longitude } = req.body;

  try {
    // ตรวจสอบว่ามีผู้ใช้ในระบบหรือไม่
    const userCheckQuery = `SELECT * FROM Users WHERE Username = @username`;
    const userCheckRequest = pool.request();
    userCheckRequest.input("username", sql.NVarChar, username);
    const userCheckResult = await userCheckRequest.query(userCheckQuery);

    if (userCheckResult.recordset.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // เข้ารหัส Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // บันทึกข้อมูลผู้ใช้ใหม่ในตาราง Users
    const insertUserQuery = `
      INSERT INTO Users (Username, PasswordHash, Email, PhoneNumber, Address, UserType)
      VALUES (@username, @passwordHash, @email, @PhoneNumber, @Address, @userType)
      SELECT SCOPE_IDENTITY() AS UserID; -- ดึง UserID ที่เพิ่งถูกสร้าง
    `;
    const insertUserRequest = pool.request();
    insertUserRequest.input("username", sql.NVarChar, username);
    insertUserRequest.input("passwordHash", sql.NVarChar, hashedPassword);
    insertUserRequest.input("email", sql.NVarChar, email);
    insertUserRequest.input("PhoneNumber", sql.NVarChar, PhoneNumber);
    insertUserRequest.input("Address", sql.NVarChar, Address);
    insertUserRequest.input("userType", sql.NVarChar, "Customer"); // กำหนด UserType เป็น 'Customer'
    const userInsertResult = await insertUserRequest.query(insertUserQuery);

    // ดึง UserID ที่เพิ่งถูกสร้าง
    const userID = userInsertResult.recordset[0].UserID;

    // บันทึกข้อมูลในตาราง Customers
    const insertCustomerQuery = `
      INSERT INTO Customers (UserID, FullName, Latitude, Longitude)
      VALUES (@userID, @fullName, @latitude, @longitude)
    `;
    const insertCustomerRequest = pool.request();
    insertCustomerRequest.input("userID", sql.Int, userID);
    insertCustomerRequest.input("fullName", sql.NVarChar, username); // ใช้ username เป็น FullName ชั่วคราว
    insertCustomerRequest.input("latitude", sql.Decimal(9, 6), Latitude); // ใช้ค่าพิกัดจากเบราว์เซอร์
    insertCustomerRequest.input("longitude", sql.Decimal(9, 6), Longitude); // ใช้ค่าพิกัดจากเบราว์เซอร์
    await insertCustomerRequest.query(insertCustomerQuery);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const registerTechnician = async (req, res) => {
  const { username, password, email, skills, experience, serviceType, Latitude, Longitude } =
    req.body;

  try {
    // ตรวจสอบว่ามีผู้ใช้ในระบบหรือไม่
    const user = await User.findByUsername(username);
    if (user) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // เข้ารหัส Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // แปลง skills เป็นสตริงที่จัดรูปแบบให้ถูกต้อง (ถ้าเป็น Array)
    const formattedSkills = Array.isArray(skills) ? skills.join(", ") : skills;

    // สร้างผู้ใช้ใหม่และบันทึกข้อมูลช่าง (รวมถึง latitude และ longitude)
    await User.createTechnician(
      username,
      hashedPassword,
      email,
      formattedSkills, // ใช้ skills ที่จัดรูปแบบแล้ว
      experience,
      serviceType,
      Latitude, // ส่งค่า latitude
      Longitude // ส่งค่า longitude
    );

    res.status(201).json({ message: "Technician registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { login, register, registerTechnician };
