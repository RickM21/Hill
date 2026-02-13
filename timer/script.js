let timerInterval;
let timeLeft = 720; // Default 12 minutes
let isRunning = false;
let timersData = [
    { id: "Spaghetti", time: 720 },
    { id: "Hard Boiled Egg", time: 540 },
    { id: "Pizza", time: 900 },
    { id: "Tea", time: 180 }
];

const timerDisplay = document.getElementById('timerDisplay');
const timerSelect = document.getElementById('timerSelect');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const addTimerBtn = document.getElementById('addTimerBtn');
const removeTimerBtn = document.getElementById('removeTimerBtn');
const newIdInput = document.getElementById('newId');
const newTimeInput = document.getElementById('newTime');

// Load timers from JSON/LocalStorage
async function loadTimers() {
    try {
        const saved = localStorage.getItem('userTimers');
        if (saved) {
            timersData = JSON.parse(saved);
        } else {
            try {
                const response = await fetch('timers.json');
                if (response.ok) {
                    timersData = await response.json();
                }
            } catch (e) {
                console.warn('Could not fetch timers.json, using defaults', e);
            }
            saveToLocal();
        }
        populateDropdown();

        // Find Spaghetti and set it
        const spaghetti = timersData.find(t => t.id === "Spaghetti");
        if (spaghetti) {
            timerSelect.value = "Spaghetti";
            timeLeft = spaghetti.time;
        } else if (timersData.length > 0) {
            timerSelect.value = timersData[0].id;
            timeLeft = timersData[0].time;
        }

        updateDisplay();
        startTimer(); // Auto-start as requested
    } catch (error) {
        console.error('Error loading timers:', error);
    }
}

function populateDropdown() {
    timerSelect.innerHTML = '';
    timersData.forEach(timer => {
        const option = document.createElement('option');
        option.value = timer.id;
        option.textContent = `${timer.id} (${Math.floor(timer.time / 60)}:00)`;
        timerSelect.appendChild(option);
    });
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.title = `${timerDisplay.textContent} - ${timerSelect.value}`;
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            alert('Time is up!');
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
}

function resetTimer() {
    stopTimer();
    const selected = timersData.find(t => t.id === timerSelect.value);
    timeLeft = selected ? selected.time : 720;
    updateDisplay();
}

function saveToLocal() {
    localStorage.setItem('userTimers', JSON.stringify(timersData));
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);

timerSelect.addEventListener('change', () => {
    stopTimer();
    const selected = timersData.find(t => t.id === timerSelect.value);
    timeLeft = selected.time;
    updateDisplay();
});

addTimerBtn.addEventListener('click', () => {
    const id = newIdInput.value.trim();
    const mins = parseInt(newTimeInput.value);

    if (id && !isNaN(mins)) {
        timersData.push({ id, time: mins * 60 });
        saveToLocal();
        populateDropdown();
        newIdInput.value = '';
        newTimeInput.value = '';
    }
});

removeTimerBtn.addEventListener('click', () => {
    const currentId = timerSelect.value;
    if (currentId === "Spaghetti") {
        alert("Cannot remove the default timer.");
        return;
    }
    timersData = timersData.filter(t => t.id !== currentId);
    saveToLocal();
    populateDropdown();
    // Select first available
    if (timersData.length > 0) {
        timerSelect.value = timersData[0].id;
        timeLeft = timersData[0].time;
        updateDisplay();
    }
});

// Init
loadTimers();
updateDisplay();
