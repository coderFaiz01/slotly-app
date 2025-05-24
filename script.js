// Function to generate a unique ID for appointments
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Data structure to hold appointments.
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

// Pre-defined time slots (these could also come from a backend)
const allTimeSlots = [
    { time: '09:00', status: 'available' },
    { time: '10:00', status: 'available' },
    { time: '11:00', status: 'available' },
    { time: '13:00', status: 'available' },
    { time: '14:00', status: 'available' },
    { time: '15:00', status: 'available' },
    { time: '16:00', status: 'available' },
];

const appointmentSlotsContainer = document.getElementById('appointment-slots');
const bookingForm = document.getElementById('booking-form');
const confirmationMessage = document.getElementById('confirmation-message');
const selectedTimeDisplay = document.getElementById('selected-time-display');
const userNameInput = document.getElementById('user-name');
const confirmBookingBtn = document.getElementById('confirm-booking-btn');
const cancelBookingBtn = document.getElementById('cancel-booking-btn');
const finalBookedTimeSpan = document.getElementById('final-booked-time');
const mainContainer = document.querySelector('.container');

let selectedSlotElement = null;
let selectedTime = '';

function renderTimeSlots() {
    appointmentSlotsContainer.innerHTML = '';
    const currentAppointments = JSON.parse(localStorage.getItem('appointments')) || [];

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

function handleSlotClick(event) {
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
    // Use a small delay to ensure 'display: block' is applied before 'visible' for smooth transition
    setTimeout(() => {
        bookingForm.classList.add('visible');
        userNameInput.value = '';
        userNameInput.focus();
        // Smooth scroll to the form
        bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' }); // NEW: Smooth scroll
    }, 10);
}

confirmBookingBtn.addEventListener('click', () => {
    const userName = userNameInput.value.trim();

    if (!userName) {
        alert('Please enter your name to book the appointment.');
        return;
    }

    const newAppointment = {
        id: generateId(),
        time: selectedTime,
        userName: userName,
        status: 'pending',
        bookedAt: new Date().toLocaleString()
    };

    appointments.push(newAppointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));

    selectedSlotElement.classList.remove('available', 'selected');
    selectedSlotElement.classList.add('booked');
    selectedSlotElement.removeEventListener('click', handleSlotClick);

    // Hide booking form with animation
    bookingForm.classList.remove('visible');
    // Use a small delay to ensure the form fully transitions out before setting display: none
    setTimeout(() => {
        bookingForm.style.display = 'none';
    }, 500); // Match this duration with CSS transition time

    // Show confirmation message with animation
    confirmationMessage.style.display = 'block';
    setTimeout(() => {
        confirmationMessage.classList.add('visible');
        finalBookedTimeSpan.textContent = `${selectedTime} ${selectedTime < '12:00' ? 'AM' : 'PM'}`;
        // Smooth scroll to confirmation message
        confirmationMessage.scrollIntoView({ behavior: 'smooth', block: 'center' }); // NEW: Smooth scroll
    }, 500); // Start showing after form hides

    renderTimeSlots();
});

cancelBookingBtn.addEventListener('click', () => {
    if (selectedSlotElement) {
        selectedSlotElement.classList.remove('selected');
        selectedSlotElement = null;
        selectedTime = '';
    }
    bookingForm.classList.remove('visible');
    setTimeout(() => {
        bookingForm.style.display = 'none';
    }, 500); // Match this duration with CSS transition time
});

document.addEventListener('DOMContentLoaded', () => {
    renderTimeSlots();
    mainContainer.style.opacity = '1';
    mainContainer.style.transform = 'translateY(0)';
});

// --- Provider View Logic (for completeness in a single file for now) ---
// This part remains unchanged for now, as we're focusing on client-side.
const providerViewContainer = document.getElementById('provider-view');
const appointmentList = document.getElementById('appointment-list');
const noAppointmentsMessage = document.getElementById('no-appointments-message');

function renderProviderAppointments() {
    if (!appointmentList) return;

    const currentAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
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
            case 'pending':
                statusClass = 'pending';
                break;
            case 'accepted':
                statusClass = 'accepted';
                break;
            default:
                statusClass = 'pending';
        }

        appItem.innerHTML = `
            <span>Name: ${app.userName}</span>
            <span>Time: ${app.time} ${app.time < '12:00' ? 'AM' : 'PM'}</span>
            <span class="status ${statusClass}">${app.status.toUpperCase()}</span>
            <div class="actions">
                ${app.status === 'pending' ?
                `<button class="accept-btn" data-id="${app.id}">Accept</button>` :
                (app.status === 'accepted' ?
                    `<button class="reject-btn" data-id="${app.id}">Mark Completed</button>` : ''
                )
            }
            </div>
            <small>Booked at: ${app.bookedAt}</small>
        `;
        appointmentList.appendChild(appItem);
    });

    appointmentList.querySelectorAll('.accept-btn').forEach(button => {
        button.addEventListener('click', handleAcceptAppointment);
    });
    appointmentList.querySelectorAll('.reject-btn').forEach(button => {
        button.addEventListener('click', handleCompleteAppointment);
    });
}

function handleAcceptAppointment(event) {
    const appId = event.target.dataset.id;
    appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const appointmentIndex = appointments.findIndex(app => app.id === appId);

    if (appointmentIndex !== -1) {
        appointments[appointmentIndex].status = 'accepted';
        localStorage.setItem('appointments', JSON.stringify(appointments));
        renderProviderAppointments();
        renderTimeSlots();
    }
}

function handleCompleteAppointment(event) {
    const appId = event.target.dataset.id;
    appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const appointmentIndex = appointments.findIndex(app => app.id === appId);

    if (appointmentIndex !== -1) {
        appointments.splice(appointmentIndex, 1);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        renderProviderAppointments();
        renderTimeSlots();
    }
}