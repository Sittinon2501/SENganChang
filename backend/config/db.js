const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // สำหรับ Azure
    trustServerCertificate: true, // สำหรับการพัฒนา
  },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();
poolConnect
  .then(() => {
    console.log("Connect database"); // แสดงข้อความเมื่อเชื่อมต่อสำเร็จ
  })
  .catch((err) => {
    console.error("Database connection failed:", err); // แสดงข้อความเมื่อเชื่อมต่อล้มเหลว
  });
module.exports = {
  sql,
  pool,
  poolConnect,
};
