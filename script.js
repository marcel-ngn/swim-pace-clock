// script.js
document.addEventListener('DOMContentLoaded', () => {
    // State
    let heatCount = 0;
    let countdownInterval; // Only for visual countdown
    let sessionTimeout; // For scheduling next heat/session end
    let currentCountdownValue = 0;
    let intervalSeconds = 0;
    let totalHeats = 0;

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

    // --- Helper Functions ---

    // This function now only marks the session as complete and cleans up timers.
    // It does NOT reset the UI to the config screen.
    const markSessionComplete = () => {
        clearInterval(countdownInterval);
        clearTimeout(sessionTimeout); // Clear any pending session timeout

        // Ensure countdown is hidden
        countdownDisplay.classList.add('hidden');
        countdownTimerElement.innerText = '--';

        // Show session complete status
        sessionStatus.classList.remove('hidden');
        statusText.innerText = "Session Complete";

        // The reset button should remain visible to allow going back to config
        resetBtn.classList.remove('hidden');
    };

    const startNextHeatOrEndSession = () => {
        if (heatCount < totalHeats) {
            startNewHeat();
            // If this is the last heat, hide countdown immediately after starting it
            if (heatCount === totalHeats) {
                clearInterval(countdownInterval); // Stop visual countdown
                countdownDisplay.classList.add('hidden');
                countdownTimerElement.innerText = '--';
            } else {
                // Reset countdown for the *next* heat
                currentCountdownValue = intervalSeconds;
            }
            // Schedule the next heat or session end
            sessionTimeout = setTimeout(startNextHeatOrEndSession, intervalSeconds * 1000);
        } else {
            // All heats have been started and their intervals completed.
            markSessionComplete(); // Call the new function
        }
    };

    // --- Event Listeners ---

    startBtn.addEventListener('click', () => {
        totalHeats = parseInt(iterationInput.value);
        if (isNaN(totalHeats) || totalHeats < 1) {
            alert("Please enter a valid number of heats.");
            return;
        }

        // --- UI Transition ---
        configScreen.classList.add('hidden');
        resetBtn.classList.remove('hidden'); // Reset button should be visible after starting
        sessionStatus.classList.add('hidden'); // Hide previous status
        countdownDisplay.classList.add('hidden'); // Hide by default

        // --- Session Logic ---
        intervalSeconds = parseInt(delaySelect.value);
        heatCount = 0; // Reset heatCount for new session

        // Start the first heat immediately
        startNewHeat();

        if (totalHeats > 1) {
            // Only show and start countdown if there's more than one heat
            countdownDisplay.classList.remove('hidden');
            currentCountdownValue = intervalSeconds; // Countdown for the *next* heat
            countdownTimerElement.innerText = currentCountdownValue;

            // Start visual countdown
            countdownInterval = setInterval(() => {
                currentCountdownValue--;
                if (currentCountdownValue < 0) currentCountdownValue = 0; // Prevent negative display
                countdownTimerElement.innerText = currentCountdownValue;
            }, 1000);

            // Schedule the next heat/session end
            sessionTimeout = setTimeout(startNextHeatOrEndSession, intervalSeconds * 1000);
        } else {
            // If only one heat, session ends after its interval. No countdown needed.
            sessionTimeout = setTimeout(markSessionComplete, intervalSeconds * 1000); // Call new function
        }
    });

    resetBtn.addEventListener('click', () => {
        // This is now the "go to menu" functionality
        clearInterval(countdownInterval);
        clearTimeout(sessionTimeout);

        // Reset state
        heatCount = 0;
        currentCountdownValue = 0;
        intervalSeconds = 0;
        totalHeats = 0;

        // Reset UI to config screen
        heatsContainer.innerHTML = '';
        configScreen.classList.remove('hidden');
        resetBtn.classList.add('hidden'); // Hide reset button until next session starts
        sessionStatus.classList.add('hidden');
        countdownDisplay.classList.add('hidden');
        countdownTimerElement.innerText = '--';
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
                    <div class="lane-label">Lane 1</div>
                    <span class="time-display" id="time-h${heatCount}-l1">0.00</span>
                    <button class="stop-btn" data-timer-id="h${heatCount}-l1" data-start-time="${startTime}">Stop</button>
                </div>
                <div class="lane">
                    <div class="lane-label">Lane 2</div>
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
