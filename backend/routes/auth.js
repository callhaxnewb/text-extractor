const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  console.log('Received registration request');
  console.log('Body:', req.body);

  try {
    if (!req.body || !req.body.email || !req.body.password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({ email, password });
    await user.save();
    console.log('User saved successfully:', user);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ user: { id: user._id, email: user.email }, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ 
      user: { id: user._id, email: user.email },
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;