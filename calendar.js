// Calendar Logic

const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

// Limits: Dec 2025 (11, 2025) to Dec 2026 (11, 2026)
let currentMonth = 11; // Dec
let currentYear = 2025;

const grid = document.getElementById('calendar-grid');
const monthDisplay = document.getElementById('month-year-display');

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Initial Render
    renderCalendar(currentMonth, currentYear);

    // Navigation with Animation
    document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => changeMonth(1));

    // Modal
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('save-event').addEventListener('click', saveEvent);
});

function changeMonth(delta) {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;

    if (newMonth > 11) {
        newMonth = 0;
        newYear++;
    } else if (newMonth < 0) {
        newMonth = 11;
        newYear--;
    }

    // Bounds Check
    if (newYear < 2025 || (newYear === 2025 && newMonth < 11)) return;
    if (newYear > 2026 || (newYear === 2026 && newMonth > 11)) return;

    // Animation Logic
    const direction = delta > 0 ? 'next' : 'prev';
    animateChange(direction, newMonth, newYear);
}

function animateChange(direction, newMonth, newYear) {
    // 1. Add Exit Class to CURRENT grid
    if (direction === 'next') {
        grid.classList.add('slide-out-left');
    } else {
        grid.classList.add('slide-out-right');
    }

    // 2. Wait for exit animation (500ms), then swap and enter
    setTimeout(() => {
        // Update State
        currentMonth = newMonth;
        currentYear = newYear;

        // Render New Grid (invisible yet)
        renderCalendar(currentMonth, currentYear);

        // Remove Exit Classes
        grid.classList.remove('slide-out-left', 'slide-out-right');

        // Add Entry Class
        if (direction === 'next') {
            grid.classList.add('slide-in-right');
        } else {
            grid.classList.add('slide-in-left');
        }

        // Clean up Entry Class after animation
        setTimeout(() => {
            grid.classList.remove('slide-in-right', 'slide-in-left');
        }, 500);

    }, 500);
}

function renderCalendar(month, year) {
    monthDisplay.textContent = `${monthNames[month]} ${year}`;
    grid.innerHTML = '';

    // Headers
    dayNames.forEach(name => {
        const div = document.createElement('div');
        div.className = 'day-name';
        div.textContent = name;
        grid.appendChild(div);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Empties
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        grid.appendChild(empty);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement('div');
        cell.className = 'day-cell';

        const dayNum = document.createElement('div');
        dayNum.className = 'day-num';
        dayNum.textContent = d;
        cell.appendChild(dayNum);

        const editBtn = document.createElement('div');
        editBtn.className = 'add-event-btn';
        editBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
        editBtn.onclick = () => openModal(d, month, year);
        cell.appendChild(editBtn);

        // Markers
        const dateKey = `${year}-${month + 1}-${d}`;
        const events = getEvents(dateKey);
        events.forEach(evt => {
            const marker = document.createElement('div');
            marker.className = 'event-marker';
            marker.textContent = evt;
            cell.appendChild(marker);
        });

        grid.appendChild(cell);
    }
}

// Data Logic
function getEvents(dateKey) {
    const data = localStorage.getItem('calendarEvents');
    const events = data ? JSON.parse(data) : {};
    return events[dateKey] || [];
}

let selectedDateKey = null;

function openModal(day, month, year) {
    selectedDateKey = `${year}-${month + 1}-${day}`;
    document.getElementById('modal-date-display').textContent = `${day} de ${monthNames[month]} ${year}`;
    document.getElementById('event-input').value = "";

    renderEventList();

    document.getElementById('event-modal').style.display = 'flex';
}

function renderEventList() {
    const list = document.getElementById('event-list');
    list.innerHTML = '';

    const events = getEvents(selectedDateKey);

    if (events.length === 0) {
        list.innerHTML = '<li style="justify-content:center; color:#888;">Sin eventos</li>';
    } else {
        events.forEach((evt, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${evt}</span>
                <button class="delete-btn" onclick="deleteEvent(${index})"><i class="fa-solid fa-trash"></i></button>
            `;
            list.appendChild(li);
        });
    }
}

function deleteEvent(index) {
    const data = localStorage.getItem('calendarEvents');
    const allEvents = data ? JSON.parse(data) : {};

    if (allEvents[selectedDateKey]) {
        allEvents[selectedDateKey].splice(index, 1); // Remove
        // Cleanup if empty
        if (allEvents[selectedDateKey].length === 0) {
            delete allEvents[selectedDateKey];
        }
        localStorage.setItem('calendarEvents', JSON.stringify(allEvents));
        renderEventList(); // Update Modal
        renderCalendar(currentMonth, currentYear); // Update Grid background
    }
}

function closeModal() {
    document.getElementById('event-modal').style.display = 'none';
}

function saveEvent() {
    const text = document.getElementById('event-input').value;
    if (!text) return;

    const data = localStorage.getItem('calendarEvents');
    const allEvents = data ? JSON.parse(data) : {};

    if (!allEvents[selectedDateKey]) {
        allEvents[selectedDateKey] = [];
    }
    allEvents[selectedDateKey].push(text);

    localStorage.setItem('calendarEvents', JSON.stringify(allEvents));

    document.getElementById('event-input').value = ""; // Clear input
    renderEventList(); // Show newly added
    renderCalendar(currentMonth, currentYear); // Update Grid
}
