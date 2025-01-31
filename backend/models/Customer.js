const { pool, poolConnect, sql } = require("../config/db");

const Customer = {
  // ค้นหาข้อมูลลูกค้าโดย UserID
  findByUserID: async (userID) => {
    await poolConnect;
    const request = pool.request();
    const query = `SELECT * FROM Customers WHERE UserID = @userID`;
    request.input("userID", sql.Int, userID);
    const result = await request.query(query);
    return result.recordset[0];
  },

  // สร้างข้อมูลลูกค้าใหม่
  create: async (userID, fullName, latitude, longitude) => {
    await poolConnect;
    const request = pool.request();
    const query = `
            INSERT INTO Customers (UserID, FullName, Latitude, Longitude)
            VALUES (@userID, @fullName, @latitude, @longitude)
        `;
    request.input("userID", sql.Int, userID);
    request.input("fullName", sql.NVarChar, fullName);
    request.input("latitude", sql.Decimal(9, 6), latitude); // เพิ่ม latitude
    request.input("longitude", sql.Decimal(9, 6), longitude); // เพิ่ม longitude
    await request.query(query);
},
  // อัปเดต FullName ในตาราง Customers
  updateFullName: async (userID, fullName) => {
    await poolConnect;
    const request = pool.request();
    const query = `
            UPDATE Customers
            SET FullName = @fullName
            WHERE UserID = @userID
        `;
    request.input("userID", sql.Int, userID);
    request.input("fullName", sql.NVarChar, fullName);
    await request.query(query);
  },
  deleteByUserID: async (userID) => {
    await poolConnect;
    const request = pool.request();
    const query = `
            DELETE FROM Customers
            WHERE UserID = @userID
        `;
    request.input("userID", sql.Int, userID);
    await request.query(query);
  },
};

module.exports = Customer;
