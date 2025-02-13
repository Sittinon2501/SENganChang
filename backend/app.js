// app.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectToDatabase = require("./config/db"); // เชื่อมต่อกับฐานข้อมูล
const {
  register,
  login,
  updateProfile,
  registerTechnician,
  getUserProfile,

} = require("./controllers/authController");
const authMiddleware = require("./middlewares/authMiddleware");
require("dotenv").config(); // โหลดค่าจากไฟล์ .env

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.get("/api/getUserProfile/:userId", getUserProfile); 
// เส้นทางการสมัครสมาชิกและเข้าสู่ระบบ
app.post("/api/register", register);
app.post("/api/login", login);
app.post("/api/register-technician", registerTechnician);
// เส้นทางการแก้ไขโปรไฟล์ช่าง
app.put(
  "/api/update-profile",
  authMiddleware(["customer", "technician", "admin"]),
  updateProfile
);

// เชื่อมต่อกับฐานข้อมูลและเริ่มต้นเซิร์ฟเวอร์
connectToDatabase()
  .then(() => {
    // เชื่อมต่อฐานข้อมูลสำเร็จแล้วเริ่มต้นเซิร์ฟเวอร์
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Server could not start due to database connection failure");
  });
