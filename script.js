// script.js - Frontend with Authentication and Backend API Calls

const API_BASE_URL = 'https://slotly-backend.onrender.com/api'; // Base URL for all API calls

// --- DOM Elements ---
const mainContainer = document.querySelector('.container');
const appHeader = document.querySelector('.app-header');
const welcomeMessage = document.getElementById('welcome-message');
const displayUsername = document.getElementById('display-username');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const myAppointmentsBtn = document.getElementById('my-appointments-btn');
const backToBookingBtn = document.getElementById('back-to-booking-btn');

const loginSection = document.getElementById('login-section');
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');
const submitLoginBtn = document.getElementById('submit-login-btn');
const showRegisterLink = document.getElementById('show-register-link');

const registerSection = document.getElementById('register-section');
const registerUsernameInput = document.getElementById('register-username');
const registerPasswordInput = document.getElementById('register-password');
const submitRegisterBtn = document.getElementById('submit-register-btn');
const showLoginLink = document.getElementById('show-login-link');

const bookingUI = document.querySelector('.booking-ui');
const appointmentSlotsContainer = document.getElementById('appointment-slots');
const bookingForm = document.getElementById('booking-form');
const selectedTimeDisplay = document.getElementById('selected-time-display');
const userNameInput = document.getElementById('user-name'); // Now readonly
const confirmBookingBtn = document.getElementById('confirm-booking-btn');
const cancelBookingBtn = document.getElementById('cancel-booking-btn');
const finalBookedTimeSpan = document.getElementById('final-booked-time');
const confirmationMessage = document.getElementById('confirmation-message');

const myAppointmentsSection = document.getElementById('my-appointments-section');
const myAppointmentsList = document.getElementById('my-appointments-list');
const noMyAppointmentsMessage = document.getElementById('no-my-appointments-message');


// --- Global State / Authentication Data ---
let currentUser = null; // Stores { userId, username, role, token }
let currentToken = null;

// Function to store user data and token securely (in localStorage for this demo)
function setAuthData(data) {
    currentUser = {
        userId: data.userId,
        username: data.username,
        role: data.role || 'service_taker', // Default role if not provided by backend
        token: data.accessToken
    };
    currentToken = data.accessToken;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('token', currentToken);
    updateUIForAuthStatus();
}

// Function to retrieve user data and token
function getAuthData() {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
        currentUser = JSON.parse(storedUser);
        currentToken = storedToken;
        updateUIForAuthStatus();
    } else {
        currentUser = null;
        currentToken = null;
        updateUIForAuthStatus();
    }
}

// Function to clear user data and token
function clearAuthData() {
    currentUser = null;
    currentToken = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    updateUIForAuthStatus();
    alert('You have been logged out.');
    showLoginSection(); // Show login form after logout
}

// --- UI Management Functions ---

function hideAllSections() {
    loginSection.classList.remove('visible');
    loginSection.style.display = 'none';
    registerSection.classList.remove('visible');
    registerSection.style.display = 'none';
    bookingUI.classList.add('hidden');
    bookingUI.style.display = 'none'; // Hide content when other forms are visible
    myAppointmentsSection.classList.remove('visible');
    myAppointmentsSection.style.display = 'none';
    confirmationMessage.classList.remove('visible'); // Always hide messages when switching views
    confirmationMessage.style.display = 'none';
    bookingForm.classList.remove('visible');
    bookingForm.style.display = 'none';
}

function showLoginSection() {
    hideAllSections();
    loginSection.style.display = 'block';
    setTimeout(() => loginSection.classList.add('visible'), 10);
    loginUsernameInput.value = '';
    loginPasswordInput.value = '';
    loginUsernameInput.focus();

    // Update header buttons
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    myAppointmentsBtn.style.display = 'none';
    backToBookingBtn.style.display = 'none';
    welcomeMessage.style.display = 'none';
}

function showRegisterSection() {
    hideAllSections();
    registerSection.style.display = 'block';
    setTimeout(() => registerSection.classList.add('visible'), 10);
    registerUsernameInput.value = '';
    registerPasswordInput.value = '';
    registerUsernameInput.focus();

    // Update header buttons
    loginBtn.style.display = 'block';
    registerBtn.style.display = 'none';
    logoutBtn.style.display = 'none';
    myAppointmentsBtn.style.display = 'none';
    backToBookingBtn.style.display = 'none';
    welcomeMessage.style.display = 'none';
}

async function showBookingUI() {
    hideAllSections();
    bookingUI.style.display = 'block'; // Show the booking UI container
    setTimeout(() => bookingUI.classList.remove('hidden'), 10); // Animate it in
    await renderTimeSlots(); // Re-render slots to reflect global state

    // Update header buttons
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    if (currentUser) {
        logoutBtn.style.display = 'block';
        myAppointmentsBtn.style.display = 'block';
        welcomeMessage.style.display = 'block';
        displayUsername.textContent = currentUser.username;
    } else {
        loginBtn.style.display = 'block'; // Show login/register if not logged in
        registerBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        myAppointmentsBtn.style.display = 'none';
        welcomeMessage.style.display = 'none';
    }
    backToBookingBtn.style.display = 'none';
}

async function showMyAppointments() {
    if (!currentUser) {
        alert('Please login to view your appointments.');
        showLoginSection();
        return;
    }
    hideAllSections();
    myAppointmentsSection.style.display = 'block';
    setTimeout(() => myAppointmentsSection.classList.add('visible'), 10);
    await renderMyAppointments(); // Fetch and render user's appointments

    // Update header buttons
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    myAppointmentsBtn.style.display = 'none'; // Hide this button when already in 'My Appointments'
    backToBookingBtn.style.display = 'block';
    welcomeMessage.style.display = 'block';
    displayUsername.textContent = currentUser.username;
}

function updateUIForAuthStatus() {
    if (currentUser) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        myAppointmentsBtn.style.display = 'block';
        welcomeMessage.style.display = 'block';
        displayUsername.textContent = currentUser.username;
        userNameInput.value = currentUser.username; // Prefill booking form
    } else {
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        myAppointmentsBtn.style.display = 'none';
        welcomeMessage.style.display = 'none';
        userNameInput.value = ''; // Clear username if logged out
    }
    // Decide which primary section to show based on login status
    if (!loginSection.classList.contains('visible') && !registerSection.classList.contains('visible') && !myAppointmentsSection.classList.contains('visible')) {
        showBookingUI(); // Default to booking if no other specific section is active
    }
}

// --- API Functions (now includes authentication headers) ---

async function makeAuthenticatedRequest(url, options = {}) {
    if (!currentToken) {
        alert('You need to be logged in for this action.');
        clearAuthData();
        showLoginSection();
        return null;
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`, // Add JWT to header
        ...options.headers, // Allow overriding headers
    };

    try {
        const response = await fetch(url, { ...options, headers });
        if (response.status === 401 || response.status === 403) {
            alert('Your session has expired or is unauthorized. Please log in again.');
            clearAuthData();
            showLoginSection();
            return null;
        }
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        // Handle 204 No Content for DELETE requests
        if (response.status === 204) {
            return true;
        }
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        alert(`An error occurred: ${error.message}. Please try again.`);
        return null;
    }
}

async function fetchAppointments() {
    // GET /api/appointments doesn't require auth (for general public view)
    try {
        const response = await fetch(`${API_BASE_URL}/appointments`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return [];
    }
}

async function createAppointment(appointmentData) {
    // POST /api/appointments now requires auth
    return makeAuthenticatedRequest(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        body: JSON.stringify(appointmentData),
    });
}

async function fetchMyAppointments() {
    // GET /api/my-appointments requires auth
    return makeAuthenticatedRequest(`${API_BASE_URL}/my-appointments`);
}

async function updateAppointmentStatus(id, status) {
    // PUT /api/appointments/:id requires auth
    return makeAuthenticatedRequest(`${API_BASE_URL}/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
}

async function deleteAppointment(id) {
    // DELETE /api/appointments/:id requires auth
    return makeAuthenticatedRequest(`${API_BASE_URL}/appointments/${id}`, {
        method: 'DELETE',
    });
}


// --- UI Rendering Logic (Slots and My Appointments) ---

const allTimeSlots = [
    { time: '09:00', status: 'available' }, { time: '10:00', status: 'available' },
    { time: '11:00', status: 'available' }, { time: '13:00', status: 'available' },
    { time: '14:00', status: 'available' }, { time: '15:00', status: 'available' },
    { time: '16:00', status: 'available' },
];

let selectedSlotElement = null;
let selectedTime = '';

async function renderTimeSlots() {
    appointmentSlotsContainer.innerHTML = '';
    const currentAppointments = await fetchAppointments(); // Fetch from backend

    allTimeSlots.forEach(slot => {
        const slotDiv = document.createElement('div');
        slotDiv.classList.add('slot');
        slotDiv.setAttribute('data-time', slot.time);
        slotDiv.textContent = `${slot.time} ${slot.time < '12:00' ? 'AM' : 'PM'}`;

        const existingBooking = currentAppointments.find(
            app => app.time === slot.time && (app.status === 'pending' || app.status === 'accepted')
        );

        if (existingBooking) {
            slotDiv.classList.add('booked');
            slotDiv.classList.remove('available');
            if (existingBooking.status === 'accepted') {
                slotDiv.classList.add('accepted');
            }
        } else {
            slotDiv.classList.add('available');
            slotDiv.addEventListener('click', handleSlotClick);
        }
        appointmentSlotsContainer.appendChild(slotDiv);
    });
}

async function renderMyAppointments() {
    myAppointmentsList.innerHTML = '';
    const userAppointments = await fetchMyAppointments(); // Fetch only current user's appointments

    if (!userAppointments || userAppointments.length === 0) {
        noMyAppointmentsMessage.style.display = 'block';
        return;
    } else {
        noMyAppointmentsMessage.style.display = 'none';
    }

    userAppointments.forEach(app => {
        const appItem = document.createElement('div');
        appItem.classList.add('my-appointment-item');
        appItem.setAttribute('data-id', app.id);

        let statusClass = '';
        switch (app.status) {
            case 'pending': statusClass = 'pending'; break;
            case 'accepted': statusClass = 'accepted'; break;
            case 'cancelled': statusClass = 'cancelled'; break;
            default: statusClass = 'pending';
        }

        appItem.innerHTML = `
            <div class="app-info">
                <p>Time: <strong>${app.time} ${app.time < '12:00' ? 'AM' : 'PM'}</strong></p>
                <p>Status: <span class="app-status ${statusClass}">${app.status.toUpperCase()}</span></p>
                <small>Booked by: ${app.userName}</small>
                <small>Booked at: ${new Date(app.bookedAt).toLocaleString()}</small>
            </div>
            ${app.status === 'pending' ?
                `<button class="cancel-btn" data-id="${app.id}">Cancel</button>` : ''
            }
        `;
        myAppointmentsList.appendChild(appItem);
    });

    // Add event listeners for cancel buttons
    myAppointmentsList.querySelectorAll('.cancel-btn').forEach(button => {
        button.addEventListener('click', handleCancelMyAppointment);
    });
}


// --- Event Handlers ---

// Authentication Handlers
loginBtn.addEventListener('click', showLoginSection);
registerBtn.addEventListener('click', showRegisterSection);
logoutBtn.addEventListener('click', clearAuthData);
myAppointmentsBtn.addEventListener('click', showMyAppointments);
backToBookingBtn.addEventListener('click', showBookingUI);

showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterSection();
});
showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginSection();
});

submitRegisterBtn.addEventListener('click', async () => {
    const username = registerUsernameInput.value.trim();
    const password = registerPasswordInput.value.trim();

    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message || 'Registration successful! You can now log in.');
            showLoginSection();
        } else {
            alert(data.message || 'Registration failed.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration. Please try again.');
    }
});

submitLoginBtn.addEventListener('click', async () => {
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value.trim();

    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (response.ok) {
            setAuthData(data); // Store token and user info
            alert(data.message || 'Login successful!');
            showBookingUI(); // Redirect to booking after login
        } else {
            alert(data.message || 'Login failed. Invalid username or password.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login. Please try again.');
    }
});


// Booking Handlers
function handleSlotClick(event) {
    if (!currentUser) {
        alert('Please login to book an appointment.');
        showLoginSection();
        return;
    }

    if (selectedSlotElement) {
        selectedSlotElement.classList.remove('selected');
    }

    selectedSlotElement = event.target;
    selectedTime = selectedSlotElement.dataset.time;

    selectedSlotElement.classList.add('selected');

    selectedTimeDisplay.textContent = `${selectedTime} ${selectedTime < '12:00' ? 'AM' : 'PM'}`;
    userNameInput.value = currentUser.username; // Prefill from logged-in user

    confirmationMessage.classList.remove('visible');
    confirmationMessage.style.display = 'none';

    bookingForm.style.display = 'block';
    setTimeout(() => {
        bookingForm.classList.add('visible');
        bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 10);
}

confirmBookingBtn.addEventListener('click', async () => {
    if (!currentUser) { // Double check
        alert('You must be logged in to book an appointment.');
        showLoginSection();
        return;
    }

    // userName is automatically taken from currentUser during makeAuthenticatedRequest
    const newAppointmentData = { time: selectedTime };

    const bookedAppointment = await createAppointment(newAppointmentData);

    if (bookedAppointment) {
        selectedSlotElement.classList.remove('available', 'selected');
        selectedSlotElement.classList.add('booked');
        selectedSlotElement.removeEventListener('click', handleSlotClick);

        bookingForm.classList.remove('visible');
        setTimeout(() => { bookingForm.style.display = 'none'; }, 500);

        confirmationMessage.style.display = 'block';
        setTimeout(() => {
            confirmationMessage.classList.add('visible');
            finalBookedTimeSpan.textContent = `${selectedTime} ${selectedTime < '12:00' ? 'AM' : 'PM'}`;
            confirmationMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);

        renderTimeSlots(); // Re-render slots to reflect new booking
    }
});

cancelBookingBtn.addEventListener('click', () => {
    if (selectedSlotElement) {
        selectedSlotElement.classList.remove('selected');
        selectedSlotElement = null;
        selectedTime = '';
    }
    bookingForm.classList.remove('visible');
    setTimeout(() => { bookingForm.style.display = 'none'; }, 500);
});

// My Appointments Handlers
async function handleCancelMyAppointment(event) {
    const appId = event.target.dataset.id;
    if (confirm('Are you sure you want to cancel this appointment?')) {
        const updated = await updateAppointmentStatus(appId, 'cancelled'); // Update status to 'cancelled'
        if (updated) {
            alert('Appointment cancelled successfully!');
            renderMyAppointments(); // Re-render user's appointments
            renderTimeSlots(); // Re-render public slots
        }
    }
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', async () => {
    mainContainer.style.opacity = '1';
    mainContainer.style.transform = 'translateY(0)';
    getAuthData(); // Try to load saved session
    if (currentUser) {
        showBookingUI(); // Show booking if already logged in
    } else {
        showLoginSection(); // Show login if not logged in
    }
});

// --- Provider View Logic (Still for separate file) ---
// This part remains conceptual and would be moved to a provider.html's script
// For the provider side, you'd implement specific login/auth for providers,
// and their API calls would be to update/delete appointments.
// The renderProviderAppointments, handleAcceptAppointment, handleCompleteAppointment
// functions will be relevant there.
const providerViewContainer = document.getElementById('provider-view');
const appointmentList = document.getElementById('appointment-list');
const noAppointmentsMessage = document.getElementById('no-appointments-message');

async function renderProviderAppointments() {
    if (!appointmentList) return;

    const currentAppointments = await fetchAppointments(); // Provider fetches ALL appointments
    appointmentList.innerHTML = '';

    if (currentAppointments.length === 0) {
        noAppointmentsMessage.style.display = 'block';
        return;
    } else {
        noAppointmentsMessage.style.display = 'none';
    }

    currentAppointments.forEach(app => {
        const appItem = document.createElement('div');
        appItem.classList.add('appointment-item');
        appItem.setAttribute('data-id', app.id);

        let statusClass = '';
        switch (app.status) {
            case 'pending': statusClass = 'pending'; break;
            case 'accepted': statusClass = 'accepted'; break;
            case 'cancelled': statusClass = 'cancelled'; break; // Added cancelled status
            default: statusClass = 'pending';
        }

        appItem.innerHTML = `
            <span>Name: ${app.userName}</span>
            <span>Time: ${app.time} ${app.time < '12:00' ? 'AM' : 'PM'}</span>
            <span class="status ${statusClass}">${app.status.toUpperCase()}</span>
            <div class="actions">
                ${app.status === 'pending' ?
                `<button class="accept-btn" data-id="${app.id}">Accept</button>` : ''
            }
                ${app.status === 'accepted' ?
                `<button class="reject-btn" data-id="${app.id}">Mark Completed</button>` : ''
            }
                ${app.status === 'cancelled' ?
                `<button class="delete-btn" data-id="${app.id}">Delete</button>` : '' // Option to delete cancelled
            }
            </div>
            <small>Booked at: ${new Date(app.bookedAt).toLocaleString()}</small>
        `;
        appointmentList.appendChild(appItem);
    });

    appointmentList.querySelectorAll('.accept-btn').forEach(button => {
        button.addEventListener('click', handleAcceptAppointment);
    });
    appointmentList.querySelectorAll('.reject-btn').forEach(button => {
        button.addEventListener('click', handleCompleteAppointment);
    });
    appointmentList.querySelectorAll('.delete-btn').forEach(button => { // New delete handler
        button.addEventListener('click', handleDeleteAppointment);
    });
}

// Provider actions use the makeAuthenticatedRequest, but would need a provider token
async function handleAcceptAppointment(event) {
    const appId = event.target.dataset.id;
    if (!currentUser || currentUser.role !== 'service_provider') { alert('Unauthorized.'); return; } // Basic check
    const updated = await updateAppointmentStatus(appId, 'accepted');
    if (updated) {
        alert('Appointment accepted.');
        renderProviderAppointments();
        renderTimeSlots();
    }
}

async function handleCompleteAppointment(event) {
    const appId = event.target.dataset.id;
    if (!currentUser || currentUser.role !== 'service_provider') { alert('Unauthorized.'); return; } // Basic check
    if (confirm('Mark this appointment as completed?')) {
        const deleted = await deleteAppointment(appId); // Deleting means "completed" for simplicity
        if (deleted) {
            alert('Appointment marked as completed.');
            renderProviderAppointments();
            renderTimeSlots();
        }
    }
}

async function handleDeleteAppointment(event) { // New handler for explicit deletion
    const appId = event.target.dataset.id;
    if (!currentUser || currentUser.role !== 'service_provider') { alert('Unauthorized.'); return; } // Basic check
    if (confirm('Are you sure you want to permanently delete this appointment?')) {
        const deleted = await deleteAppointment(appId);
        if (deleted) {
            alert('Appointment deleted.');
            renderProviderAppointments();
            renderTimeSlots();
        }
    }
}