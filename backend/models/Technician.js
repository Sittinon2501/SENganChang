const { pool, sql, poolConnect } = require("../config/db");

const Technician = {
  // สร้างช่างใหม่
  create: async (
    userID,
    fullName,
    skills,
    experience,
    serviceType,
    availability,
    latitude, // เพิ่ม latitude
    longitude // เพิ่ม longitude
  ) => {
    await poolConnect; // รอการเชื่อมต่อฐานข้อมูล
    const request = pool.request();

    // อัปเดต UserType เป็น 'Technician' ในตาราง Users
    const updateUserQuery = `
      UPDATE Users
      SET UserType = 'Technician'
      WHERE UserID = @userID
    `;
    request.input("userID", sql.Int, userID);
    await request.query(updateUserQuery);

    // บันทึกข้อมูลช่างใหม่ในตาราง Technicians
    const insertTechnicianQuery = `
      INSERT INTO Technicians (UserID, FullName, Skills, Experience, ServiceType, Availability, Latitude, Longitude)
      VALUES (@userID, @fullName, @skills, @experience, @serviceType, @availability, @latitude, @longitude)
    `;
    request.input("fullName", sql.NVarChar, fullName);
    request.input("skills", sql.NVarChar, skills);
    request.input("experience", sql.NVarChar, experience);
    request.input("serviceType", sql.NVarChar, serviceType);
    request.input("availability", sql.NVarChar, availability);
    request.input("latitude", sql.Float, latitude); // เพิ่ม latitude
    request.input("longitude", sql.Float, longitude); // เพิ่ม longitude
    await request.query(insertTechnicianQuery);
  },

  // อัปเดตข้อมูลช่าง
  updateTechnicianProfile: async (
    userID,
    fullName,
    skills,
    experience,
    serviceType,
    availability
  ) => {
    await poolConnect; // รอการเชื่อมต่อฐานข้อมูล
    const request = pool.request();
    const query = `
            UPDATE Technicians
            SET FullName = @fullName, Skills = @skills, Experience = @experience, ServiceType = @serviceType, Availability = @availability
            WHERE UserID = @userID
        `;
    request.input("userID", sql.Int, userID);
    request.input("fullName", sql.NVarChar, fullName);
    request.input("skills", sql.NVarChar, skills);
    request.input("experience", sql.NVarChar, experience);
    request.input("serviceType", sql.NVarChar, serviceType);
    request.input("availability", sql.NVarChar, availability);
    await request.query(query);
  },
  // ค้นหาช่างเทคนิคที่อยู่ใกล้เคียง
  async findNearbyTechnicians(customerLat, customerLng, radius) {
    try {
      // หาก latitude หรือ longitude ของลูกค้าเป็น null หรือ 0
      if (!customerLat || !customerLng) {
        // คืนค่าช่างเทคนิคทั้งหมดที่ไม่มี latitude และ longitude เป็น null
        const query = `
                    SELECT * FROM Technicians
                    WHERE Latitude IS NOT NULL AND Longitude IS NOT NULL
                `;
        const result = await pool.request().query(query);
        return result.recordset;
      }

      // ค้นหาช่างเทคนิคที่อยู่ใกล้เคียง
      const query = `
                SELECT * FROM Technicians
                WHERE Latitude IS NOT NULL AND Longitude IS NOT NULL
                AND (6371 * ACOS(
                    COS(RADIANS(@customerLat)) * COS(RADIANS(Latitude)) * 
                    COS(RADIANS(Longitude) - RADIANS(@customerLng)) + 
                    SIN(RADIANS(@customerLat)) * SIN(RADIANS(Latitude))
                )) <= @radius
            `;

      const result = await pool
        .request()
        .input("customerLat", sql.Decimal(9, 6), customerLat)
        .input("customerLng", sql.Decimal(9, 6), customerLng)
        .input("radius", sql.Float, radius)
        .query(query);

      return result.recordset;
    } catch (error) {
      throw error;
    }
  },
};
module.exports = Technician; // ส่งออก Technician object
