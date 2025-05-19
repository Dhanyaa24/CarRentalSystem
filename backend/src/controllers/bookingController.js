// Fixed bookingController.js
const Booking = require('../models/booking');
const User = require('../models/user');
const Car = require('../models/car');

// Create a new booking with detailed logging
exports.createBooking = async (req, res) => {
    console.log('=== CREATE BOOKING REQUEST ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request params:', req.params);
    console.log('Request query:', req.query);
    
    // Extract data from request body
    const { user_id, car_id, start_date, end_date, pickup_location_id, dropoff_location_id, driver_license_number } = req.body;
    
    console.log('Extracted values:');
    console.log('- user_id:', user_id, typeof user_id);
    console.log('- car_id:', car_id, typeof car_id);
    console.log('- start_date:', start_date, typeof start_date);
    console.log('- end_date:', end_date, typeof end_date);
    console.log('- pickup_location_id:', pickup_location_id, typeof pickup_location_id);
    console.log('- dropoff_location_id:', dropoff_location_id, typeof dropoff_location_id);
    console.log('- driver_license_number:', driver_license_number, typeof driver_license_number);

    try {
        // Validate required fields with detailed logging
        console.log('Validating required fields...');
        
        const missingFields = [];
        if (!user_id) missingFields.push('user_id');
        if (!car_id) missingFields.push('car_id');
        if (!start_date) missingFields.push('start_date');
        if (!end_date) missingFields.push('end_date');
        
        if (missingFields.length > 0) {
            console.error('Missing fields:', missingFields);
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}`,
                received: { user_id, car_id, start_date, end_date },
                missingFields
            });
        }

        console.log('All required fields present');

        // Convert and validate data types
        let userIdNum, carIdNum, pickupLocationIdNum, dropoffLocationIdNum;
        
        try {
            userIdNum = parseInt(user_id);
            carIdNum = parseInt(car_id);
            // Convert optional fields if they exist
            if (pickup_location_id) pickupLocationIdNum = parseInt(pickup_location_id);
            if (dropoff_location_id) dropoffLocationIdNum = parseInt(dropoff_location_id);
            
            console.log('Converted IDs:', { userIdNum, carIdNum, pickupLocationIdNum, dropoffLocationIdNum });
        } catch (conversionError) {
            console.error('Error converting IDs:', conversionError);
            return res.status(400).json({
                message: 'Invalid ID format',
                error: conversionError.message
            });
        }

        if (isNaN(userIdNum) || isNaN(carIdNum)) {
            console.error('Invalid numeric IDs:', { userIdNum, carIdNum });
            return res.status(400).json({
                message: 'User ID and Car ID must be valid numbers',
                received: { user_id, car_id }
            });
        }

        // Validate dates
        console.log('Validating dates...');
        const start = new Date(start_date);
        const end = new Date(end_date);
        const now = new Date();

        console.log('Parsed dates:', { start, end, now });

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.error('Invalid date format');
            return res.status(400).json({
                message: 'Invalid date format. Please use YYYY-MM-DD format',
                received: { start_date, end_date }
            });
        }

        if (start < now) {
            console.error('Start date is in the past');
            return res.status(400).json({ 
                message: 'Start date cannot be in the past',
                start_date: start,
                currentDate: now
            });
        }

        if (end <= start) {
            console.error('End date is not after start date');
            return res.status(400).json({ 
                message: 'End date must be after start date',
                start_date: start,
                end_date: end
            });
        }

        console.log('Date validation passed');

        // Check if user exists
        console.log('Checking if user exists...');
        const userExists = await User.findById(userIdNum);
        if (!userExists) {
            console.error('User not found:', userIdNum);
            return res.status(404).json({ message: 'User not found', user_id: userIdNum });
        }
        console.log('User found:', userExists);

        // Check if car exists
        console.log('Checking if car exists...');
        const carExists = await Car.findById(carIdNum);
        if (!carExists) {
            console.error('Car not found:', carIdNum);
            return res.status(404).json({ message: 'Car not found', car_id: carIdNum });
        }
        console.log('Car found:', carExists);

        // Check for conflicting bookings
        console.log('Checking for conflicting bookings...');
        const conflictingBookings = await Booking.findConflictingBookings(carIdNum, start_date, end_date);
        if (conflictingBookings && conflictingBookings.length > 0) {
            console.error('Conflicting bookings found:', conflictingBookings);
            return res.status(400).json({ 
                message: 'Car is not available for the selected dates',
                conflictingBookings
            });
        }
        console.log('No conflicts found');

        // Calculate total amount based on car price and booking duration
        let totalAmount = 0;
        if (carExists.price) {
            // Calculate days difference between start and end dates
            const durationMs = end.getTime() - start.getTime();
            const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
            totalAmount = carExists.price * durationDays;
        }
        console.log('Calculated total amount:', totalAmount);

        // Create the booking
        console.log('Creating booking...');
        const bookingData = {
            user_id: userIdNum,
            car_id: carIdNum,
            start_date,
            end_date,
            status: 'pending',
            total_amount: totalAmount,
            driver_license_number
        };
        
        // Add optional fields if they exist
        if (pickupLocationIdNum) bookingData.pickup_location_id = pickupLocationIdNum;
        if (dropoffLocationIdNum) bookingData.dropoff_location_id = dropoffLocationIdNum;
        
        console.log('Booking data to insert:', bookingData);
        
        const bookingId = await Booking.create(bookingData);
        console.log('Booking created with ID:', bookingId);

        // Fetch the created booking with all details
        console.log('Fetching created booking...');
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            console.error('Could not retrieve created booking');
            return res.status(500).json({ message: 'Booking created but could not be retrieved' });
        }
        
        console.log('Successfully created and retrieved booking:', booking);
        console.log('=== CREATE BOOKING SUCCESS ===');
        
        res.status(201).json({ 
            message: 'Booking created successfully', 
            booking,
            success: true 
        });
    } catch (error) {
        console.error('=== CREATE BOOKING ERROR ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Handle specific database errors
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            console.error('Foreign key constraint error');
            return res.status(400).json({ 
                message: 'Invalid user ID or car ID provided',
                error: 'Foreign key constraint failed',
                details: error.message
            });
        }
        
        if (error.code === 'ER_DUP_ENTRY') {
            console.error('Duplicate entry error');
            return res.status(400).json({
                message: 'Duplicate booking entry',
                error: error.message
            });
        }
        
        res.status(500).json({ 
            message: 'Error creating booking', 
            error: error.message,
            errorCode: error.code,
            errorType: error.constructor.name
        });
    }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll();
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ 
            message: 'Error fetching bookings',
            error: error.message 
        });
    }
};

// Get bookings for a specific user
exports.getUserBookings = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        const bookings = await Booking.findByUserId(userId);
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ 
            message: 'Error fetching user bookings',
            error: error.message 
        });
    }
};

// Get a specific booking by ID
exports.getBooking = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        if (isNaN(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ 
            message: 'Error fetching booking',
            error: error.message 
        });
    }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const { status } = req.body;
        
        if (isNaN(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }
        
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }
        
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        const updatedBooking = await Booking.updateStatus(bookingId, status);
        res.json(updatedBooking);
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ 
            message: 'Error updating booking status',
            error: error.message 
        });
    }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.bookingId);
        if (isNaN(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }
        
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        const updatedBooking = await Booking.updateStatus(bookingId, 'cancelled');
        res.json(updatedBooking);
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ 
            message: 'Error cancelling booking',
            error: error.message 
        });
    }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        if (isNaN(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }
        
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        await Booking.delete(bookingId);
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ 
            message: 'Error deleting booking',
            error: error.message 
        });
    }
};