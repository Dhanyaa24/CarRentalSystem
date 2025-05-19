// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    // Update profile information
    updateProfileInfo(user);
    loadDashboardData();
});

function updateProfileInfo(user) {
    document.querySelector('.user-fullname').textContent = user.name;
    document.querySelector('.user-email').textContent = user.email;
    document.querySelector('.user-name').textContent = user.name.split(' ')[0];

    // Populate edit profile form
    document.getElementById('fullName').value = user.name;
    document.getElementById('email').value = user.email;
    document.getElementById('phone').value = user.phone || '';
}

async function loadDashboardData() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/bookings/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateDashboardStats(data);
            updateRecentActivity(data.recentActivity);
            updateCurrentBooking(data.currentBooking);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function updateDashboardStats(data) {
    document.querySelector('.total-bookings').textContent = data.totalBookings || 0;
    document.querySelector('.active-bookings').textContent = data.activeBookings || 0;
}

function updateRecentActivity(activities) {
    const activityContainer = document.querySelector('.recent-activity');
    if (!activities || activities.length === 0) {
        activityContainer.innerHTML = `
            <div class="text-center">
                <p>No recent activity</p>
            </div>
        `;
        return;
    }

    activityContainer.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <i class="fas ${getActivityIcon(activity.type)} text-success me-2"></i>
                    <span>${activity.description}</span>
                </div>
                <span class="activity-time">${formatDate(activity.timestamp)}</span>
            </div>
        </div>
    `).join('');
}

function updateCurrentBooking(booking) {
    const bookingContainer = document.querySelector('.current-booking');
    if (!booking) {
        return;
    }

    bookingContainer.innerHTML = `
        <div class="card bg-dark">
            <div class="card-body">
                <div class="d-flex flex-wrap align-items-center gap-2" style="font-size: 1.1rem;">
                    <span class="fw-bold text-success">${booking.car.name}</span>
                    <span class="text-white">|</span>
                    <span><i class="fas fa-calendar me-1"></i>${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}</span>
                    <span class="text-white">|</span>
                    <span><i class="fas fa-map-marker-alt me-1"></i>${booking.pickupLocation}</span>
                    <span class="text-white">|</span>
                    <span class="badge bg-success">${booking.status}</span>
                    <a href="bookings.html" class="btn btn-outline-success btn-sm ms-3">View Details</a>
                </div>
            </div>
        </div>
    `;
}

function getActivityIcon(type) {
    const icons = {
        booking: 'fa-calendar-plus',
        cancellation: 'fa-calendar-minus',
        payment: 'fa-credit-card',
        profile: 'fa-user-edit',
        default: 'fa-info-circle'
    };
    return icons[type] || icons.default;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Handle profile edit form submission
document.getElementById('editProfileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        currentPassword: document.getElementById('currentPassword').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const updatedUser = await response.json();
            localStorage.setItem('user', JSON.stringify(updatedUser));
            updateProfileInfo(updatedUser);
            alert('Profile updated successfully!');
            bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();
        } else {
            const error = await response.json();
            alert(error.message || 'Error updating profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('An error occurred while updating your profile');
    }
});
