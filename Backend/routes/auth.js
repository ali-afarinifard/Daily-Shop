const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();


// ** User_________________ **
// ** Register
router.post('/user/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ $or: [{ username }, { email }] });

    if (user) {
      if (user.username === username) {
        return res.status(409).json({ message: 'Username already taken.' });
      }
      if (user.email === email) {
        return res.status(409).json({ message: 'Email already registered.' });
      }
    }

    user = new User({
      username,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    const accessToken = jwt.sign(payload, process.env.JWT_CLIENT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign(payload, process.env.JWT_CLIENT_REFRESH_SECRET, { expiresIn: '30d' });
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// ** LOGIN
router.post('/user/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    const accessToken = jwt.sign(payload, process.env.JWT_CLIENT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign(payload, process.env.JWT_CLIENT_REFRESH_SECRET, { expiresIn: '30d' });
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});



// ** LOGOUT
router.post('/user/logout', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_CLIENT_REFRESH_SECRET);
    const user = await User.findById(decoded.user.id);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    user.refreshToken = null;
    await user.save();

    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});



// ** GET
router.get('/user', async (req, res) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_CLIENT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
});




// ** PUT
router.put('/user', async (req, res) => {
  const { userId, fullName, username, email, password, city, phoneNumber, postalCode, address } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.fullName = fullName || user.fullName;
    user.city = city || user.city;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.postalCode = postalCode || user.postalCode;
    user.address = address || user.address;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});



// ** Reset Password
router.post('/user/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});



// ** Token
router.post('/user/token', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_CLIENT_REFRESH_SECRET);
    const user = await User.findById(decoded.user.id);

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    const accessToken = jwt.sign(payload, process.env.JWT_CLIENT_SECRET, { expiresIn: '7d' });
    const newRefreshToken = jwt.sign(payload, process.env.JWT_CLIENT_REFRESH_SECRET, { expiresIn: '30d' });

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res.status(401).json({ message: 'Refresh token expired or invalid' });
  }
});























// ** Admin _________________ **
// ** Register
router.post('/admin/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let admin = await Admin.findOne({ $or: [{ username }, { email }] });

    if (admin) {
      if (admin.username === username) {
        return res.status(409).json({ message: 'Username already taken.' });
      }
      if (admin.email === email) {
        return res.status(409).json({ message: 'Email already registered.' });
      }
    }

    admin = new Admin({
      username,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);

    await admin.save();

    const payload = {
      admin: {
        id: admin.id,
      },
    };

    const accessToken = jwt.sign(payload, process.env.JWT_ADMIN_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign(payload, process.env.JWT_ADMIN_REFRESH_SECRET, { expiresIn: '30d' });
    admin.refreshToken = refreshToken;
    await admin.save();

    res.status(201).json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// ** LOGIN
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {

    let admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      admin: {
        id: admin.id,
      },
    };

    const accessToken = jwt.sign(payload, process.env.JWT_ADMIN_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign(payload, process.env.JWT_ADMIN_REFRESH_SECRET, { expiresIn: '30d' });
    admin.refreshToken = refreshToken;
    await admin.save();

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});



// ** LOGOUT
router.post('/admin/logout', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_REFRESH_SECRET);
    const admin = await Admin.findById(decoded.admin.id);

    if (!admin) {
      return res.status(400).json({ message: 'Admin not found' });
    }

    admin.refreshToken = null;
    await admin.save();

    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});



// ** GET
router.get('/admin', async (req, res) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    const admin = await Admin.findById(decoded.admin.id).select('-password -refreshToken');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(admin);
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
});




// ** PUT
router.put('/admin', async (req, res) => {
  const { adminId, name, lastName, username, email, password, phoneNumber } = req.body;

  try {
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.username = username || admin.username;
    admin.email = email || admin.email;
    admin.name = name || admin.name;
    admin.lastName = lastName || admin.lastName;
    admin.phoneNumber = phoneNumber || admin.phoneNumber;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    await admin.save();

    res.status(200).json({ message: 'Admin updated successfully', admin });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});



// ** Reset Password
router.post('/admin/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);

    await admin.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});



// ** Token
router.post('/admin/token', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_REFRESH_SECRET);
    const admin = await Admin.findById(decoded.admin.id);

    if (!admin || admin.refreshToken !== token) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const payload = {
      admin: {
        id: admin.id,
      },
    };

    const accessToken = jwt.sign(payload, process.env.JWT_ADMIN_SECRET, { expiresIn: '7d' });
    const newRefreshToken = jwt.sign(payload, process.env.JWT_ADMIN_REFRESH_SECRET, { expiresIn: '30d' });

    admin.refreshToken = newRefreshToken;
    await admin.save();

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res.status(401).json({ message: 'Refresh token expired or invalid' });
  }
});




module.exports = router;
