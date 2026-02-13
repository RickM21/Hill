let timerInterval;
let timeLeft = 720; // Default 12 minutes
let isRunning = false;
let timersData = [
    { id: "Spaghetti", time: 720 },
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
const newMinsInput = document.getElementById('newMins');
const newSecsInput = document.getElementById('newSecs');

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
        const mins = Math.floor(timer.time / 60);
        const secs = timer.time % 60;
        const option = document.createElement('option');
        option.value = timer.id;
        option.textContent = `${timer.id} (${mins}:${secs.toString().padStart(2, '0')})`;
        timerSelect.appendChild(option);
    });
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.title = `${timerDisplay.textContent} - ${timerSelect.value}`;
}

function playDing() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function strike(time) {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, time); // A5 note

        gainNode.gain.setValueAtTime(0.5, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(time);
        oscillator.stop(time + 0.5);
    }

    // Ding Ding Ding
    strike(audioCtx.currentTime);
    strike(audioCtx.currentTime + 0.6);
    strike(audioCtx.currentTime + 1.2);
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
            playDing();
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
    const mins = parseInt(newMinsInput.value) || 0;
    const secs = parseInt(newSecsInput.value) || 0;

    if (id && (mins > 0 || secs > 0)) {
        timersData.push({ id, time: (mins * 60) + secs });
        saveToLocal();
        populateDropdown();
        newIdInput.value = '';
        newMinsInput.value = '';
        newSecsInput.value = '';
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
