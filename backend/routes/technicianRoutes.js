const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const technicianController = require('../controllers/technicianController');

const router = express.Router();

// POST /api/technicians/register
router.post('/register', authMiddleware, technicianController.registerAsTechnician);
router.put('/profile', authMiddleware, technicianController.updateTechnicianProfile);
router.get('/nearby', authMiddleware, technicianController.findNearbyTechnicians);

module.exports = router;