// controllers/authController.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const asyncHandler= require('express-async-handler');
const bcrypt=require('bcrypt');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '2h'
  });
};

// Register new admin
const registerAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    return res.status(400).json({ message: 'Admin already exists' });
  }

  const newAdmin = await Admin.create({ email, password });

  res.status(201).json({
    _id: newAdmin._id,
    email: newAdmin.email,
    token: generateToken(newAdmin._id)
  });
};

// Login admin
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });

  if (admin && (await bcrypt.compare(password, admin.password))) {
    admin.isActive = true;
    await admin.save();

    res.json({ token: generateToken(admin._id) });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

const logoutAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin.id);

  if (admin) {
    admin.isActive = false;
    await admin.save();
    res.json({ message: 'Logged out successfully' });
  } else {
    res.status(401);
    throw new Error('Unauthorized');
  }
});

// Verify admin (token check)
const verifyAdmin = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) throw new Error('Admin not found');

    res.status(200).json({ verified: true, admin });
  } catch (err) {
    res.status(401).json({ verified: false, message: 'Token is invalid or expired' });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  verifyAdmin,
  logoutAdmin
};
