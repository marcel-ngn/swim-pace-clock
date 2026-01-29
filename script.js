// script.js
document.addEventListener('DOMContentLoaded', () => {
    // State
    let heatCount = 0;
    let sessionInterval; // Interval for new heats
    let countdownInterval; // Interval for the visual countdown
    let currentCountdown = 0;
    let intervalSeconds = 0; // Store the selected interval

    // Screens
    const configScreen = document.getElementById('config-screen');
    const heatsContainer = document.getElementById('heats-container');
    const sessionStatus = document.getElementById('session-status');
    const countdownDisplay = document.getElementById('countdown-display');
    const countdownTimerElement = document.getElementById('countdown-timer');

    // Controls
    const startBtn = document.getElementById('start-session');
    const resetBtn = document.getElementById('reset-session');
    const delaySelect = document.getElementById('delay-select');
    const iterationInput = document.getElementById('iteration-count');
    const statusText = document.getElementById('session-status-text');

    // --- Event Listeners ---

    startBtn.addEventListener('click', () => {
        const totalHeats = parseInt(iterationInput.value);
        if (isNaN(totalHeats) || totalHeats < 1) {
            alert("Please enter a valid number of heats.");
            return;
        }

        // --- UI Transition ---
        configScreen.classList.add('hidden');
        resetBtn.classList.remove('hidden');
        sessionStatus.classList.add('hidden');
        countdownDisplay.classList.remove('hidden'); // Show countdown

        // --- Session Logic ---
        intervalSeconds = parseInt(delaySelect.value); // Store selected interval
        const intervalMs = intervalSeconds * 1000;

        // Function to manage the countdown and start next heat
        const manageHeatStart = () => {
            if (heatCount < totalHeats) {
                startNewHeat();
                // Reset countdown for the *next* heat
                currentCountdown = intervalSeconds;
                countdownTimerElement.innerText = currentCountdown;
            } else {
                clearInterval(sessionInterval);
                clearInterval(countdownInterval); // Stop countdown
                countdownDisplay.classList.add('hidden'); // Hide countdown
                statusText.innerText = "Session Complete";
                sessionStatus.classList.remove('hidden');
            }
        };

        // Start the first heat immediately and initialize countdown
        manageHeatStart();

        // Start the interval for subsequent heats and countdown updates
        sessionInterval = setInterval(manageHeatStart, intervalMs);

        // Start the visual countdown timer
        countdownInterval = setInterval(() => {
            currentCountdown--;
            if (currentCountdown < 0) {
                // This condition should ideally not be met if manageHeatStart resets it correctly.
                // However, as a safeguard, if it goes negative, reset it to the intervalSeconds - 1
                // because manageHeatStart will set it to intervalSeconds at the start of the next interval.
                currentCountdown = intervalSeconds - 1;
            }
            countdownTimerElement.innerText = currentCountdown;
        }, 1000); // Update every second
    });

    resetBtn.addEventListener('click', () => {
        // Stop any running session and countdown
        clearInterval(sessionInterval);
        clearInterval(countdownInterval);

        // Reset state
        heatCount = 0;
        currentCountdown = 0;
        intervalSeconds = 0;

        // Reset UI
        heatsContainer.innerHTML = '';
        configScreen.classList.remove('hidden');
        resetBtn.classList.add('hidden');
        sessionStatus.classList.add('hidden');
        countdownDisplay.classList.add('hidden'); // Hide countdown
    });

    // --- Core Functions ---

    function startNewHeat() {
        heatCount++;
        const startTime = Date.now();
        const heatCard = document.createElement('div');
        heatCard.className = 'heat-card';

        heatCard.innerHTML = `
            <div class="heat-card-header">Heat ${heatCount}</div>
            <div class="lanes-container">
                <div class="lane">
                    <span class="time-display" id="time-h${heatCount}-l1">0.00</span>
                    <button class="stop-btn" data-timer-id="h${heatCount}-l1" data-start-time="${startTime}">Stop</button>
                </div>
                <div class="lane">
                    <span class="time-display" id="time-h${heatCount}-l2">0.00</span>
                    <button class="stop-btn" data-timer-id="h${heatCount}-l2" data-start-time="${startTime}">Stop</button>
                </div>
            </div>
        `;
        heatsContainer.prepend(heatCard);

        // Use event delegation for stop buttons
        heatCard.addEventListener('click', handleStopClick);

        // Update clock
        const updateInterval = setInterval(() => {
            const displays = heatCard.querySelectorAll('.time-display:not(.stopped)');
            if (displays.length === 0) {
                clearInterval(updateInterval);
                return;
            }
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
            displays.forEach(display => {
                display.innerText = elapsed;
            });
        }, 20); // ~50fps
    }

    function handleStopClick(event) {
        if (!event.target.classList.contains('stop-btn') || event.target.disabled) {
            return;
        }

        const button = event.target;
        const timerId = button.dataset.timerId;
        const startTime = parseInt(button.dataset.startTime);

        const display = document.getElementById(`time-${timerId}`);
        const finalTime = ((Date.now() - startTime) / 1000).toFixed(2);

        display.innerText = finalTime;
        display.classList.add('stopped');

        button.disabled = true;
        button.innerHTML = `<i class="fa-solid fa-check"></i>`;
    }
});