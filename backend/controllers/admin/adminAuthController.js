const Admin = require('../../models/Admin');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id);
    if (admin) {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      });
    } else {
      res.status(404).json({ message: 'Admin not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Seed initial admin
const seedAdmin = async (req, res) => {
  try {
    const adminExists = await Admin.findOne({ email: 'admin@kisanmithr.com' });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@kisanmithr.com',
      password: 'adminpassword123',
      role: 'superadmin'
    });

    res.status(201).json({
      message: 'Admin created successfully',
      email: admin.email
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  loginAdmin,
  getAdminProfile,
  seedAdmin
};
