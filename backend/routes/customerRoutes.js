const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const customerController = require('../controllers/customerController');

const router = express.Router();

// PUT /api/customers/profile
router.put('/profile', authMiddleware, customerController.updateCustomerProfile);

module.exports = router;