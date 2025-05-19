// This file contains JavaScript functions for managing car-related functionalities.

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

let cars = [];
let locations = [];

document.addEventListener('DOMContentLoaded', function() {
    loadCars();
    setupEventListeners();
});

// Function to load and display available cars
async function loadCars() {
    const carList = document.getElementById('car-list');
    try {
    carList.innerHTML = `
        <div class="col-12 text-center">
            <div class="spinner-border text-success" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;

        const response = await fetch(`${API_BASE_URL}/cars`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        
        const data = await response.json();
        console.log('Received data:', data);
        
        // Handle both single car and array responses
        cars = Array.isArray(data) ? data : [data];
        console.log('Processed cars:', cars);
        
            carList.innerHTML = '';
            
        if (cars.length === 0) {
            carList.innerHTML = '<div class="col-12"><div class="alert alert-dark">No cars available at the moment.</div></div>';
                return;
            }
            
        cars.forEach(car => {
                const carCol = document.createElement('div');
                carCol.className = 'col-md-4 mb-4';
                carCol.innerHTML = `
                <div class="card car-card h-100 bg-dark text-light border-success" data-category="${car.category}">
                    <img src="${car.image_url || 'images/default-car.jpg'}" 
                         class="card-img-top" 
                             alt="${car.brand} ${car.model}"
                         style="height: 200px; object-fit: cover; border-bottom: 2px solid #2ecc71;">
                        <div class="card-body">
                        <h5 class="card-title text-success">${car.brand} ${car.model}</h5>
                        <p class="card-text text-muted">${car.year} • ${car.transmission} • ${car.fuel_type}</p>
                        <p class="card-text text-light">
                            <strong>Price:</strong> $${car.price}/day
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                            <button class="btn btn-success" 
                                    onclick="showBookingModal(${car.id})">
                                Book Now
                            </button>
                            <button class="btn btn-outline-success" 
                                    onclick="viewCarDetails(${car.id})">
                                Details
                            </button>
                        </div>
                        </div>
                    </div>
                `;
                carList.appendChild(carCol);
        });
    } catch (error) {
        console.error('Error loading cars:', error);
        carList.innerHTML = '<div class="col-12"><div class="alert alert-danger">Error loading cars. Please try again later.</div></div>';
    }
}

// Fetch locations and cache them
async function fetchLocations() {
    try {
        const response = await fetch(`${API_BASE_URL}/locations`);
        if (!response.ok) throw new Error('Failed to fetch locations');
        locations = await response.json();
    } catch (error) {
        console.error('Error fetching locations:', error);
        locations = [];
    }
}

// Update showBookingModal to use a dropdown for pickup location
async function showBookingModal(carId) {
    // Fetch locations if not already loaded
    if (locations.length === 0) await fetchLocations();
    const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
    const modalBody = document.querySelector('#bookingModal .modal-body');
    
    // Build the location dropdown
    let locationOptions = '<option value="">Select a location</option>';
    locations.forEach(loc => {
        locationOptions += `<option value="${loc.id}">${loc.name} - ${loc.address}, ${loc.city}</option>`;
    });

    modalBody.innerHTML = `
        <form id="booking-form" class="bg-dark text-light p-3 rounded">
            <input type="hidden" name="carId" value="${carId}">
            <div class="mb-3">
                <label for="startDate" class="form-label text-success">Start Date</label>
                <input type="date" class="form-control bg-dark text-light border-success" id="startDate" name="startDate" required>
            </div>
            <div class="mb-3">
                <label for="endDate" class="form-label text-success">End Date</label>
                <input type="date" class="form-control bg-dark text-light border-success" id="endDate" name="endDate" required>
            </div>
            <div class="mb-3">
                <label for="pickupLocationId" class="form-label text-success">Pickup Location</label>
                <select class="form-control bg-dark text-light border-success" id="pickupLocationId" name="pickupLocationId" required>
                    ${locationOptions}
                </select>
            </div>
            <div class="mb-3">
                <label for="driverLicenseNumber" class="form-label text-success">Driver License Number</label>
                <input type="text" class="form-control bg-dark text-light border-success" id="driverLicenseNumber" name="driverLicenseNumber" required placeholder="Enter your driver license number">
            </div>
            <div class="text-end">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-success">Confirm Booking</button>
            </div>
        </form>`;
    
    // Attach the event listener after the form is added to the DOM
    const bookingForm = modalBody.querySelector('#booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }

    modal.show();
}

// Function to view car details
function viewCarDetails(carId) {
    const car = cars.find(c => c.id === carId);
    if (!car) return;

    const modal = new bootstrap.Modal(document.getElementById('carDetailsModal'));
    const modalBody = document.querySelector('#carDetailsModal .modal-body');
    
    modalBody.innerHTML = `
        <div class="card bg-dark text-light border-success">
            <img src="${car.image_url || 'images/default-car.jpg'}" 
                 class="card-img-top" 
                 alt="${car.brand} ${car.model}"
                 style="height: 300px; object-fit: cover; border-bottom: 2px solid #28a745;">
            <div class="card-body">
                <h5 class="card-title text-success">${car.brand} ${car.model}</h5>
                <div class="car-details">
                    <p class="text-light"><strong>Year:</strong> ${car.year}</p>
                    <p class="text-light"><strong>Transmission:</strong> ${car.transmission}</p>
                    <p class="text-light"><strong>Fuel Type:</strong> ${car.fuel_type}</p>
                    <p class="text-light"><strong>Seats:</strong> ${car.seats}</p>
                    <p class="text-light"><strong>Mileage:</strong> ${car.mileage} km</p>
                    <p class="text-light"><strong>Price:</strong> $${car.price}/day</p>
                </div>
                <div class="text-end mt-3">
                    <button class="btn btn-success" onclick="showBookingModal(${car.id})">
                        Book Now
                    </button>
                </div>
            </div>
        </div>`;
    
    modal.show();
}

// Helper function to check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Setup event listeners for filters and other UI elements
function setupEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            // Get the filter value
            const filter = button.getAttribute('data-filter');
            // Filter cars based on category
            filterCars(filter);
        });
    });
}

// Function to filter cars by category
function filterCars(category) {
    const carCards = document.querySelectorAll('.car-card');
    carCards.forEach(card => {
        const carCategory = card.getAttribute('data-category')?.toLowerCase() || '';
        if (category === 'all' || carCategory === category.toLowerCase()) {
            card.closest('.col-md-4').style.display = 'block';
            card.closest('.col-md-4').style.opacity = 0;
            setTimeout(() => {
                card.closest('.col-md-4').style.opacity = 1;
                card.closest('.col-md-4').style.transition = 'opacity 0.4s';
            }, 10);
        } else {
            card.closest('.col-md-4').style.opacity = 1;
            card.closest('.col-md-4').style.transition = 'opacity 0.4s';
            setTimeout(() => {
                card.closest('.col-md-4').style.opacity = 0;
                setTimeout(() => {
                    card.closest('.col-md-4').style.display = 'none';
                }, 400);
            }, 10);
        }
    });
}

async function handleBookingSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const carId = form.querySelector('[name="carId"]').value;
    const startDate = form.querySelector('[name="startDate"]').value;
    const endDate = form.querySelector('[name="endDate"]').value;
    const pickupLocationId = form.querySelector('[name="pickupLocationId"]').value;
    const driverLicenseNumber = form.querySelector('[name="driverLicenseNumber"]').value;

    // Enhanced validation
    const validationErrors = [];
    
    if (!carId) validationErrors.push('Car selection is required');
    if (!startDate) validationErrors.push('Start date is required');
    if (!endDate) validationErrors.push('End date is required');
    if (!pickupLocationId) validationErrors.push('Pickup location is required');
    if (!driverLicenseNumber) validationErrors.push('Driver license number is required');
    
    if (validationErrors.length > 0) {
        showNotification(validationErrors.join('\n'), notificationTypes.ERROR);
        return;
    }

    // Validate pickup location
    if (isNaN(parseInt(pickupLocationId))) {
        showNotification('Please select a valid pickup location', notificationTypes.ERROR);
        return;
    }

    // Enhanced date validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (start < now) {
        showNotification('Start date cannot be in the past', notificationTypes.ERROR);
        return;
    }

    if (end <= start) {
        showNotification('End date must be after start date', notificationTypes.ERROR);
        return;
    }

    // Validate user session
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user && user.id ? user.id : null;
    if (!userId) {
        showNotification('Your session has expired. Please log in again.', notificationTypes.WARNING);
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating booking...';

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Authentication required. Please log in again.', notificationTypes.WARNING);
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }

        const payload = {
            user_id: userId,
            car_id: parseInt(carId),
            start_date: startDate,
            end_date: endDate,
            pickup_location_id: parseInt(pickupLocationId),
            dropoff_location_id: null,
            driver_license_number: driverLicenseNumber
        };

        console.log('Booking payload:', payload);
        
        const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('Booking response:', result);

        if (!response.ok) {
            throw new Error(result.message || 'Failed to create booking');
        }

        // Close modal and show success message
        const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
        if (modal) modal.hide();
        
        showNotification('Booking successful! Redirecting to bookings page...', notificationTypes.SUCCESS);
        
        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = 'bookings.html';
        }, 2000);

    } catch (error) {
        console.error('Booking error:', error);
        showNotification(error.message || 'An error occurred while processing your booking', notificationTypes.ERROR);
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Confirm Booking';
    }
}
window.handleBookingSubmit = handleBookingSubmit;