const User = require('../models/User');
const Customer = require('../models/Customer');

const updateCustomerProfile = async (req, res) => {
    const { fullName, address, phoneNumber, email } = req.body; // รับค่าจาก Request Body
    const userID = req.user.id; // ได้จาก Middleware

    try {
        // อัปเดตข้อมูลในตาราง Users
        await User.updateCustomerProfile(userID, address, phoneNumber, email);

        // อัปเดต FullName ในตาราง Customers
        await Customer.updateFullName(userID, fullName);

        res.status(200).json({ message: 'Customer profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { updateCustomerProfile };