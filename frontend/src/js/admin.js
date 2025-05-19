// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    loadUsers();
    loadCars();
    loadBookingMetrics();
});

function loadUsers() {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const userTable = document.getElementById('userTableBody');
        userTable.innerHTML = '';
        data.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button onclick="viewUserDetails(${user.id})" class="btn btn-info btn-sm">View</button>
                    ${user.role !== 'admin' ? 
                        `<button onclick="deleteUser(${user.id})" class="btn btn-danger btn-sm ml-2">Delete</button>` : 
                        ''}
                </td>
            `;
            userTable.appendChild(row);
        });
    })
    .catch(error => console.error('Error loading users:', error));
}

function loadCars() {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/admin/cars`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const carTable = document.getElementById('carTableBody');
        carTable.innerHTML = '';
        data.forEach(car => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${car.id}</td>
                <td>${car.model}</td>
                <td>${car.brand}</td>
                <td>${car.year}</td>
                <td>$${car.price}/day</td>
                <td><span class="badge ${getAvailabilityBadge(car.availability)}">${car.availability ? 'Available' : 'Not Available'}</span></td>
                <td>
                    <button onclick="editCar(${car.id})" class="btn btn-primary btn-sm">Edit</button>
                    <button onclick="deleteCar(${car.id})" class="btn btn-danger btn-sm ml-2">Delete</button>
                </td>
            `;
            carTable.appendChild(row);
        });
    })
    .catch(error => console.error('Error loading cars:', error));
}

function loadBookingMetrics() {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/admin/metrics/bookings`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('totalBookings').textContent = data.totalBookings;
        document.getElementById('completedBookings').textContent = data.completedBookings;
        document.getElementById('pendingBookings').textContent = data.pendingBookings;
    })
    .catch(error => console.error('Error loading metrics:', error));
}

function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            alert('User deleted successfully');
            loadUsers();
        } else {
            throw new Error('Failed to delete user');
        }
    })
    .catch(error => {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
    });
}

function deleteCar(carId) {
    if (!confirm('Are you sure you want to delete this car?')) return;

    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/admin/cars/${carId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            alert('Car deleted successfully');
            loadCars();
        } else {
            throw new Error('Failed to delete car');
        }
    })
    .catch(error => {
        console.error('Error deleting car:', error);
        alert('Error deleting car. Please try again.');
    });
}

function viewUserDetails(userId) {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(user => {
        // Show user details in modal
        const modal = document.getElementById('userDetailsModal');
        const modalContent = modal.querySelector('.modal-body');
        modalContent.innerHTML = `
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Role:</strong> ${user.role}</p>
            <p><strong>Created:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
            <h5 class="mt-4">Booking History</h5>
            ${user.bookings?.length ? generateBookingsTable(user.bookings) : '<p>No bookings found</p>'}
        `;
        modal.style.display = 'block';
    })
    .catch(error => console.error('Error loading user details:', error));
}

function editCar(carId) {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/admin/cars/${carId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(car => {
        // Show edit car form in modal
        const modal = document.getElementById('editCarModal');
        const form = modal.querySelector('form');
        form.elements['carId'].value = car.id;
        form.elements['model'].value = car.model;
        form.elements['brand'].value = car.brand;
        form.elements['year'].value = car.year;
        form.elements['price'].value = car.price;
        form.elements['availability'].checked = car.availability;
        modal.style.display = 'block';
    })
    .catch(error => console.error('Error loading car details:', error));
}

function getAvailabilityBadge(availability) {
    return availability ? 'bg-success' : 'bg-danger';
}

function generateBookingsTable(bookings) {
    return `
        <table class="table table-sm">
            <thead>
                <tr>
                    <th>Car</th>
                    <th>Dates</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(booking => `
                    <tr>
                        <td>${booking.car.brand} ${booking.car.model}</td>
                        <td>${new Date(booking.start_date).toLocaleDateString()} - ${new Date(booking.end_date).toLocaleDateString()}</td>
                        <td><span class="badge ${getStatusBadgeClass(booking.status)}">${booking.status}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'confirmed':
            return 'bg-success';
        case 'pending':
            return 'bg-warning text-dark';
        case 'cancelled':
            return 'bg-danger';
        case 'completed':
            return 'bg-info';
        default:
            return 'bg-secondary';
    }
}

// Helper function to check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (const modal of modals) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}