// script.js - Cleaned up to be a working client-side only app with localStorage

// Function to generate a unique ID for appointments (used by localStorage version)
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Data structure to hold appointments.
// We are reverting to localStorage for guaranteed client-side interaction.
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

// Pre-defined time slots - these remain on the frontend as display options
const allTimeSlots = [
    { time: '09:00', status: 'available' },
    { time: '10:00', status: 'available' },
    { time: '11:00', status: 'available' },
    { time: '13:00', status: 'available' },
    { time: '14:00', status: 'available' },
    { time: '15:00', status: 'available' },
    { time: '16:00', status: 'available' },
];

// --- DOM Elements ---
const appointmentSlotsContainer = document.getElementById('appointment-slots');
const bookingForm = document.getElementById('booking-form');
const confirmationMessage = document.getElementById('confirmation-message');
const selectedTimeDisplay = document.getElementById('selected-time-display');
const userNameInput = document.getElementById('user-name');
const confirmBookingBtn = document.getElementById('confirm-booking-btn');
const cancelBookingBtn = document.getElementById('cancel-booking-btn');
const finalBookedTimeSpan = document.getElementById('final-booked-time');
const mainContainer = document.querySelector('.container'); // For initial fade-in

let selectedSlotElement = null; // To keep track of the currently selected slot div
let selectedTime = ''; // To store the time of the selected slot

// --- UI Rendering Logic ---

function renderTimeSlots() {
    appointmentSlotsContainer.innerHTML = ''; // Clear existing slots
    const currentAppointments = JSON.parse(localStorage.getItem('appointments')) || [];

    allTimeSlots.forEach(slot => {
        const slotDiv = document.createElement('div');
        slotDiv.classList.add('slot');
        slotDiv.setAttribute('data-time', slot.time);
        slotDiv.textContent = `${slot.time} ${slot.time < '12:00' ? 'AM' : 'PM'}`;

        // Check if this slot is booked by an existing appointment
        const existingBooking = currentAppointments.find(
            app => app.time === slot.time && (app.status === 'pending' || app.status === 'accepted')
        );

        if (existingBooking) {
            slotDiv.classList.add('booked'); // Mark as booked
            slotDiv.classList.remove('available');
            if (existingBooking.status === 'accepted') {
                slotDiv.classList.add('accepted');
            }
        } else {
            slotDiv.classList.add('available');
            slotDiv.addEventListener('click', handleSlotClick); // Attach listener to available slots
        }
        appointmentSlotsContainer.appendChild(slotDiv);
    });
}

// --- Event Handlers ---

// Handle clicking on a time slot
function handleSlotClick(event) {
    // If a slot is already selected, unmark it
    if (selectedSlotElement) {
        selectedSlotElement.classList.remove('selected');
    }

    selectedSlotElement = event.target;
    selectedTime = selectedSlotElement.dataset.time;

    selectedSlotElement.classList.add('selected');

    selectedTimeDisplay.textContent = `${selectedTime} ${selectedTime < '12:00' ? 'AM' : 'PM'}`;

    // Hide confirmation message first
    confirmationMessage.classList.remove('visible');
    confirmationMessage.style.display = 'none';

    // Show booking form with animation
    bookingForm.style.display = 'block';
    setTimeout(() => {
        bookingForm.classList.add('visible');
        userNameInput.value = ''; // Clear previous input
        userNameInput.focus(); // Focus on the name input
        bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 10);
}

// Handle confirming the booking
confirmBookingBtn.addEventListener('click', () => {
    const userName = userNameInput.value.trim();

    if (!userName) {
        alert('Please enter your name to book the appointment.');
        return;
    }

    // Create a new appointment object
    const newAppointment = {
        id: generateId(),
        time: selectedTime,
        userName: userName,
        status: 'pending', // Initial status is pending
        bookedAt: new Date().toLocaleString()
    };

    // Add to our appointments array (or update existing if re-booking)
    appointments.push(newAppointment);
    localStorage.setItem('appointments', JSON.stringify(appointments)); // Save to local storage

    // Update the UI
    selectedSlotElement.classList.remove('available', 'selected');
    selectedSlotElement.classList.add('booked');
    selectedSlotElement.removeEventListener('click', handleSlotClick); // Make it unclickable

    bookingForm.classList.remove('visible'); // Hide the booking form
    setTimeout(() => {
        bookingForm.style.display = 'none';
    }, 500); // Match this duration with CSS transition time

    confirmationMessage.style.display = 'block'; // Show confirmation message
    setTimeout(() => {
        confirmationMessage.classList.add('visible');
        finalBookedTimeSpan.textContent = `${selectedTime} ${selectedTime < '12:00' ? 'AM' : 'PM'}`;
        confirmationMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500); // Start showing after form hides

    renderTimeSlots(); // Re-render slots to ensure status is updated correctly
});

// Handle canceling the booking form
cancelBookingBtn.addEventListener('click', () => {
    if (selectedSlotElement) {
        selectedSlotElement.classList.remove('selected'); // Unmark the selected slot
        selectedSlotElement = null;
        selectedTime = '';
    }
    bookingForm.classList.remove('visible'); // Hide the booking form
    setTimeout(() => {
        bookingForm.style.display = 'none';
    }, 500); // Match this duration with CSS transition time
});

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    renderTimeSlots(); // Render slots immediately on load
    mainContainer.style.opacity = '1';
    mainContainer.style.transform = 'translateY(0)';
});

// NOTE: All backend/auth related code (API functions, login/register handlers,
// my-appointments logic, provider view logic) has been REMOVED from this script.
// This version uses localStorage for temporary data storage.