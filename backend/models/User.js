const { pool, poolConnect, sql } = require("../config/db");

const User = {
  findByUsername: async (username) => {
    await poolConnect;
    const request = pool.request();
    const query = `SELECT * FROM Users WHERE Username = @username`;
    request.input("username", sql.NVarChar, username);
    const result = await request.query(query);
    return result.recordset[0];
  },
  findByUserID: async (userID) => {
    await poolConnect;
    const request = pool.request();
    const query = `SELECT * FROM Users WHERE UserID = @userID`;
    request.input("userID", sql.Int, userID);
    const result = await request.query(query);
    return result.recordset[0];
  },
  updateUserType: async (userID, userType) => {
    await poolConnect;
    const request = pool.request();
    const query = `
            UPDATE Users
            SET UserType = @userType
            WHERE UserID = @userID
        `;
    request.input("userID", sql.Int, userID);
    request.input("userType", sql.NVarChar, userType);
    await request.query(query);
  },
  createTechnician: async (
    username,
    passwordHash,
    email,
    skills,
    experience,
    serviceType
  ) => {
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin(); // เริ่ม Transaction

      const request = new sql.Request(transaction);

      // ตรวจสอบว่า UserType ยังไม่เป็น Technician
      const checkUserTypeQuery = `
                SELECT UserID, UserType FROM Users WHERE Username = @username
            `;
      request.input("username", sql.NVarChar, username);
      const user = await request.query(checkUserTypeQuery);

      if (user.recordset.length === 0) {
        throw new Error("User not found");
      }

      const userID = user.recordset[0].UserID;
      const userType = user.recordset[0].UserType;

      if (userType === "Technician") {
        throw new Error("User is already a technician");
      }

      // อัปเดต UserType เป็น 'Technician' ในตาราง Users
      const updateUserQuery = `
                UPDATE Users
                SET UserType = 'Technician'
                WHERE UserID = @userID
            `;
      request.input("userID", sql.Int, userID);
      await request.query(updateUserQuery);

      // ลบข้อมูลจากตาราง Customers (ถ้ามีและ UserType เป็น Customer หรือ Admin)
      if (userType === "Customer" || userType === "Admin") {
        const deleteCustomerQuery = `
                    DELETE FROM Customers
                    WHERE UserID = @userID
                `;
        request.input("userID", sql.Int, userID);
        await request.query(deleteCustomerQuery);
      }

      // เพิ่มข้อมูลใหม่ในตาราง Technicians
      const insertTechnicianQuery = `
                INSERT INTO Technicians (UserID, Skills, Experience, ServiceType)
                VALUES (@userID, @skills, @experience, @serviceType)
            `;
      request.input("skills", sql.NVarChar, skills);
      request.input("experience", sql.NVarChar, experience);
      request.input("serviceType", sql.NVarChar, serviceType);
      await request.query(insertTechnicianQuery);

      await transaction.commit(); // ยืนยัน Transaction
    } catch (error) {
      await transaction.rollback(); // ยกเลิก Transaction หากเกิดข้อผิดพลาด
      throw error;
    }
  },
  updateCustomerProfile: async (userID, address, phoneNumber, email) => {
    await poolConnect; // รอการเชื่อมต่อฐานข้อมูล
    const request = pool.request();

    const query = `
            UPDATE Users
            SET Address = @address, PhoneNumber = @phoneNumber, Email = @email
            WHERE UserID = @userID
        `;
    request.input("userID", sql.Int, userID);
    request.input("address", sql.NVarChar, address);
    request.input("phoneNumber", sql.NVarChar, phoneNumber);
    request.input("email", sql.NVarChar, email);
    await request.query(query);
  },
};

module.exports = User;
