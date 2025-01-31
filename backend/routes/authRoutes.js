const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/login
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/register-technician', authController.registerTechnician);

module.exports = router;