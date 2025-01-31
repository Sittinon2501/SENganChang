const Technician = require("../models/Technician");
const User = require("../models/User"); // นำเข้าโมดูล User
const Customer = require("../models/Customer"); // นำเข้าโมดูล Customer

const registerAsTechnician = async (req, res) => {
  const {
    fullName,
    skills,
    experience,
    serviceType,
    availability,
    Latitude,
    Longitude,
  } = req.body;
  const userID = req.user.id; // ได้จาก Middleware (ผู้ใช้ที่เข้าสู่ระบบแล้ว)

  try {
    // ตรวจสอบว่า UserType ยังไม่เป็น Technician
    const user = await User.findByUserID(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.UserType === "Technician") {
      return res.status(400).json({ message: "User is already a technician" });
    }

    // แปลง skills เป็นสตริงที่จัดรูปแบบให้ถูกต้อง (ถ้าเป็น Array)
    const formattedSkills = Array.isArray(skills) ? skills.join(", ") : skills;

    // บันทึกข้อมูลช่างใหม่ (รวมถึง latitude และ longitude)
    await Technician.create(
      userID,
      fullName,
      formattedSkills, // ใช้ skills ที่จัดรูปแบบแล้ว
      experience,
      serviceType,
      availability,
      Latitude, // ส่งค่า latitude
      Longitude // ส่งค่า longitude
    );

    // อัปเดต UserType เป็น 'Technician' ในตาราง Users
    await User.updateUserType(userID, "Technician");

    // ลบข้อมูลจากตาราง Customers (ถ้ามีและ UserType เป็น Customer หรือ Admin)
    if (user.UserType === "Customer" || user.UserType === "Admin") {
      await Customer.deleteByUserID(userID);
    }

    res.status(201).json({ message: "Registered as technician successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateTechnicianProfile = async (req, res) => {
  const { fullName, skills, experience, serviceType, availability } = req.body;
  const userID = req.user.id; // ได้จาก Middleware

  try {
    await Technician.updateTechnicianProfile(
      userID,
      fullName,
      skills,
      experience,
      serviceType,
      availability
    );
    res
      .status(200)
      .json({ message: "Technician profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const findNearbyTechnicians = async (req, res) => {
  try {
      if (!req.customer) {
          console.error("Unauthorized access: No customer data found in request.");
          return res.status(403).json({ message: "Unauthorized access." });
      }

      // กำหนดค่าเริ่มต้นให้กับ latitude และ longitude หากไม่มีข้อมูล
      const { latitude: customerLat = 0, longitude: customerLng = 0 } = req.customer;

      const radius = req.query.radius || 10; // กำหนดรัศมีเริ่มต้น (10 กิโลเมตร)
      const nearbyTechnicians = await Technician.findNearbyTechnicians(
          customerLat,
          customerLng,
          radius
      );

      res.status(200).json(nearbyTechnicians);
  } catch (error) {
      console.error("Error in findNearbyTechnicians:", {
          message: error.message,
          stack: error.stack,
          request: {
              customer: req.customer,
              query: req.query,
          },
      });
      res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  registerAsTechnician,
  updateTechnicianProfile,
  findNearbyTechnicians,
};
