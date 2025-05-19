const User = require('../models/user');
const Booking = require('../models/booking');
const Car = require('../models/car');
const { sequelize } = require('../models');

// Admin: Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
};

// Admin: Delete a user
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await User.destroy({ where: { id } });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};

// Admin: View booking metrics
exports.getBookingMetrics = async (req, res) => {
    try {
        const totalBookings = await Booking.count();
        const completedBookings = await Booking.count({ where: { status: 'completed' } });
        const pendingBookings = await Booking.count({ where: { status: 'pending' } });

        res.status(200).json({
            totalBookings,
            completedBookings,
            pendingBookings
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving booking metrics', error });
    }
};

// Admin: Get user by ID
exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByPk(id, {
            include: [
                {
                    model: Booking,
                    attributes: ['id', 'start_date', 'end_date', 'status']
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user details', error });
    }
};

// Admin: Get car metrics
exports.getCarMetrics = async (req, res) => {
    try {
        const totalCars = await Car.count();
        const availableCars = await Car.count({ where: { availability: true } });
        const unavailableCars = await Car.count({ where: { availability: false } });

        // Get metrics by category
        const categoryMetrics = await Car.findAll({
            attributes: ['category', [sequelize.fn('COUNT', '*'), 'count']],
            group: ['category']
        });

        res.status(200).json({
            totalCars,
            availableCars,
            unavailableCars,
            byCategory: categoryMetrics
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving car metrics', error });
    }
};