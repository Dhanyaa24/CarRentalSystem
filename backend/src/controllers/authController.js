const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { validateUserRegistration, validateUserLogin } = require('../utils/validators');

exports.register = async (req, res) => {
  try {
    console.log('=== REGISTRATION REQUEST ===');
    console.log('Request body:', { ...req.body, password: '***' });

    const validation = validateUserRegistration(req.body);
    if (!validation.isValid) {
      console.error('Validation failed:', validation.errors);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validation.errors 
      });
    }

    const { name, email, password } = req.body;
    console.log('Validated data:', { name, email, password: '***' });

    // Check if user already exists
    console.log('Checking if user exists:', email);
    const userExists = await User.emailExists(email);
    if (userExists) {
      console.error('User already exists:', email);
      return res.status(400).json({ 
        message: 'User already exists', 
        errors: { email: 'Email address is already registered' } 
      });
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Creating new user...');
    const newUser = await User.create({ 
      name, 
      email, 
      hashed_password: hashedPassword, 
      role: 'user' 
    });
    console.log('User created successfully:', { id: newUser.id, name: newUser.name, email: newUser.email });

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Error registering user', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const validation = validateUserLogin(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validation.errors 
      });
    }

    const { email, password } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({ 
        message: 'Authentication failed',
        errors: { email: 'Invalid email or password' }
      });
    }

    const isMatch = await bcrypt.compare(password, user.hashed_password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Authentication failed',
        errors: { password: 'Invalid email or password' }
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        email: user.email 
      }, 
      process.env.JWT_SECRET || 'your-secret-key-here', 
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error processing login request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
};

// Optional: Add a logout endpoint for token blacklisting (if needed)
exports.logout = async (req, res) => {
  try {
    // In a simple JWT setup, logout is handled client-side by removing the token
    // If you want server-side logout, you'd need to implement token blacklisting
    res.status(200).json({ 
      message: 'Logout successful',
      note: 'Please remove the token from client storage'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      message: 'Error processing logout request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
};