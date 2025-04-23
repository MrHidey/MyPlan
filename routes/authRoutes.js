// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  verifyAdmin,
  logoutAdmin
} = require('../controllers/authController');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/logout',  logoutAdmin);
router.get('/verify', verifyAdmin);

module.exports = router;
