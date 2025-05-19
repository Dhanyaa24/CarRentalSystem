const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to protect admin routes
router.use(authMiddleware.isAdmin);

// Route to get all users
router.get('/users', adminController.getAllUsers);

// Route to get user by ID
router.get('/users/:id', adminController.getUserById);

// Route to delete a user
router.delete('/users/:id', adminController.deleteUser);

// Route to get booking metrics
router.get('/metrics/bookings', adminController.getBookingMetrics);

// Route to get car metrics
router.get('/metrics/cars', adminController.getCarMetrics);

module.exports = router;