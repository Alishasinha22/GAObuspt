let currentActiveContentSection = 'dashboard-section';
let isLoggedInAs = null;
let registeredBusId = null;
let conductorRoute = {};

const busStops = ["Apaji", "AI Centre", "Ratan Mandir", "Vigyan Mandir", "Jeev Mandir", "Surya Mandir"];

// Helper function to hide all sections
function hideAllSections() {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active', 'active-content');
        section.classList.add('hidden', 'hidden-content');
    });
}

// Helper function to show a specific section and hide others
function showSection(sectionId) {
    hideAllSections();
    document.getElementById(sectionId).classList.remove('hidden');
    document.getElementById(sectionId).classList.add('active');
}

// Helper function to show a main content area
function showContent(sectionId, clickedButton) {
    hideAllSections();
    document.getElementById(sectionId).classList.remove('hidden-content');
    document.getElementById(sectionId).classList.add('active-content');

    document.querySelectorAll('.bottom-taskbar .nav-button').forEach(button => {
        button.classList.remove('active');
    });
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    // For specific pages, run their init logic
    if (sectionId === 'live-tracker-section') {
        updateLastUpdatedTime();
        populateLiveTrackerDropdowns();
        document.getElementById('live-bus-results').classList.add('hidden-content');
    }
    if (sectionId === 'route-tracker-section') {
        populateRouteOverview();
    }
    if (sectionId === 'notification-centre-section') {
        loadNotifications();
    }
    if (sectionId === 'municipal-admin-dashboard-page') {
        loadMunicipalAdminDashboardData();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    showContent('dashboard-section', document.querySelector('.bottom-taskbar .nav-button'));
    updateLiveBusesOnDashboard();
});

// --- Navigation Functions ---
function backToDashboard() {
    showContent('dashboard-section', document.querySelector('.bottom-taskbar .nav-button'));
}

function backToLiveTrackerResults() {
    showContent('live-tracker-section', document.querySelector('[onclick="showContent(\'live-tracker-section\', this)"]'));
}

// --- Live Tracker Logic ---
function populateLiveTrackerDropdowns() {
    const fromSelect = document.getElementById('live-from-location');
    const toSelect = document.getElementById('live-to-location');
    fromSelect.innerHTML = '<option value="">Select From</option>';
    toSelect.innerHTML = '<option value="">Select To</option>';
    busStops.forEach(stop => {
        fromSelect.innerHTML += `<option value="${stop}">${stop}</option>`;
        toSelect.innerHTML += `<option value="${stop}">${stop}</option>`;
    });
}

function updateLastUpdatedTime() {
    const now = new Date();
    const twoMinsAgo = new Date(now.getTime() - 2 * 60000); // 2 minutes in milliseconds
    const timeString = twoMinsAgo.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    document.getElementById('last-updated-time').textContent = timeString;
}

function findLiveBuses() {
    const from = document.getElementById('live-from-location').value;
    const to = document.getElementById('live-to-location').value;
    if (!from || !to) {
        showCustomModal('Please select both a starting point and a destination.');
        return;
    }

    const liveBusResults = document.getElementById('live-bus-results');
    liveBusResults.innerHTML = '';
    liveBusResults.classList.remove('hidden-content');
    liveBusResults.classList.add('active-content');

    const buses = [
        { id: '101', fare: '₹20', occupancy: 'green', route: `${from} to ${to} via Ratan Mandir, Surya Mandir` },
        { id: '102', fare: '₹25', occupancy: 'orange', route: `${from} to ${to} via Apaji, AI Centre` },
        { id: '103', fare: '₹15', occupancy: 'red', route: `${from} to ${to} via Jeev Mandir, Vigyan Mandir` }
    ];

    const ul = document.createElement('ul');
    buses.forEach(bus => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>Bus ${bus.id} - Fare: ${bus.fare}</div>
            <div class="occupancy ${bus.occupancy}"></div>
        `;
        li.onclick = () => showLiveBusDetails(bus);
        ul.appendChild(li);
    });
    liveBusResults.appendChild(ul);
}

function showLiveBusDetails(bus) {
    document.getElementById('live-bus-results').classList.remove('active-content');
    document.getElementById('live-bus-results').classList.add('hidden-content');

    document.getElementById('live-bus-details').classList.remove('hidden-content');
    document.getElementById('live-bus-details').classList.add('active-content');

    document.getElementById('live-bus-title').textContent = `Details for Bus ${bus.id}`;
    document.getElementById('live-bus-path').textContent = bus.route;
    
    const arrivalTime = Math.floor(Math.random() * 20) + 5;
    const status = Math.random() > 0.5 ? 'On Time' : 'Delayed';
    document.getElementById('live-arrival-time').textContent = `${arrivalTime} mins`;
    document.getElementById('live-bus-status-text').textContent = `Status: ${status}`;
    document.getElementById('live-bus-status-text').style.color = status === 'On Time' ? 'var(--accent-green)' : 'var(--accent-red)';
}

// --- Route Tracker Logic ---
function toggleFilterBox() {
    document.getElementById('filter-box').classList.toggle('visible');
}

function populateRouteOverview() {
    const routeOverviewGrid = document.getElementById('route-overview-grid');
    routeOverviewGrid.innerHTML = '';
    const mockBuses = [
        { id: '101', occupancy: 'green', fare: '₹20-50', route: 'Apaji to Jeev Mandir', status: 'Running' },
        { id: '102', occupancy: 'orange', fare: '₹15-40', route: 'Ratan Mandir to Surya Mandir', status: 'Delayed' },
        { id: '103', occupancy: 'red', fare: '₹10-30', route: 'AI Centre to Vigyan Mandir', status: 'Running' },
        { id: '104', occupancy: 'green', fare: '₹25-60', route: 'Surya Mandir to Apaji', status: 'Running' },
    ];

    mockBuses.forEach(bus => {
        const card = document.createElement('div');
        card.className = 'route-bus-card';
        let occupancyClass = bus.occupancy === 'empty' ? 'green' : bus.occupancy === 'moderate' ? 'orange' : 'red';
        const routeInfo = document.createElement('div');
        routeInfo.className = 'bus-info-top';
        routeInfo.innerHTML = `
            <div>
                <strong>Bus ${bus.id}</strong><br>
                <span>Status: ${bus.status}</span>
            </div>
            <div style="text-align: right;">
                <span>Fare: ${bus.fare}</span><br>
                <div class="occupancy-label">
                    Occupancy:
                    <div class="occupancy ${occupancyClass}"></div>
                </div>
            </div>
        `;
        const detailsBtn = document.createElement('button');
        detailsBtn.textContent = 'View Details';
        card.appendChild(routeInfo);
        card.appendChild(detailsBtn);
        routeOverviewGrid.appendChild(card);
    });
}

// --- Notification Centre Logic ---
function loadNotifications() {
    const notificationList = document.getElementById('notification-list');
    notificationList.innerHTML = '';
    const mockNotifications = [
        { type: 'arrival', bus: '101', stop: 'Apaji', time: '5 minutes' },
        { type: 'delayed', bus: '102', stop: 'Ratan Mandir', reason: 'Heavy traffic' },
        { type: 'arrival', bus: '104', stop: 'Surya Mandir', time: '10 minutes' },
    ];

    mockNotifications.forEach(notif => {
        const card = document.createElement('div');
        card.className = `notification-card ${notif.type}`;
        if (notif.type === 'arrival') {
            card.innerHTML = `
                <i class="fas fa-bus-alt"></i>
                <div class="notification-content">
                    <p><strong>Bus ${notif.bus}</strong> is arriving at <strong>${notif.stop}</strong> in approximately <strong>${notif.time}</strong>.</p>
                    <p class="time">${new Date().toLocaleTimeString()}</p>
                </div>
            `;
        } else if (notif.type === 'delayed') {
            card.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <div class="notification-content">
                    <p><strong>Bus ${notif.bus}</strong> is delayed at <strong>${notif.stop}</strong> due to <strong>${notif.reason}</strong>.</p>
                    <p class="time">${new Date().toLocaleTimeString()}</p>
                </div>
            `;
        }
        notificationList.appendChild(card);
    });
}

function toggleNotificationSettings() {
    document.getElementById('notification-settings').classList.toggle('hidden');
}

// --- Registration Logic ---

function registerCommuter() {
    const name = document.getElementById('commuter-name').value;
    const phone = document.getElementById('commuter-phone').value;
    if (name && phone) {
        showCustomModal('Commuter Registration Successful!');
        backToDashboard();
    } else {
        showCustomModal('Please fill in all fields.');
    }
}

function registerConductor() {
    const name = document.getElementById('conductor-name').value;
    const busId = document.getElementById('conductor-bus-id').value;
    const vehicleReg = document.getElementById('conductor-vehicle-reg').value;
    const license = document.getElementById('conductor-license').value;
    const phone = document.getElementById('conductor-phone').value;
    if (name && busId && vehicleReg && license && phone) {
        registeredBusId = busId;
        populateConductorRouteForm();
        showSection('conductor-route-form');
    } else {
        showCustomModal('Please fill in all fields.');
    }
}

function populateConductorRouteForm() {
    const startSelect = document.getElementById('conductor-start-point');
    const endSelect = document.getElementById('conductor-end-point');
    busStops.forEach(stop => {
        startSelect.innerHTML += `<option value="${stop}">${stop}</option>`;
        endSelect.innerHTML += `<option value="${stop}">${stop}</option>`;
    });
}

function addStopPoint() {
    const container = document.getElementById('stop-points-container');
    if (container.children.length < 5) {
        const div = document.createElement('div');
        div.className = 'stop-point-input';
        div.innerHTML = `
            <input type="text" placeholder="Stop Point Name" class="stop-name" required>
            <input type="number" placeholder="Fare" class="stop-fare" required>
        `;
        container.appendChild(div);
    } else {
        showCustomModal('You can only add up to 5 stop points.');
    }
}

function submitConductorRoute() {
    const start = document.getElementById('conductor-start-point').value;
    const end = document.getElementById('conductor-end-point').value;
    const stops = Array.from(document.querySelectorAll('.stop-name')).map(input => input.value);
    const fares = Array.from(document.querySelectorAll('.stop-fare')).map(input => input.value);
    
    if (start && end && stops.every(s => s) && fares.every(f => f)) {
        conductorRoute.start = start;
        conductorRoute.end = end;
        conductorRoute.stops = stops;
        conductorRoute.fares = fares;
        populateOccupancyForm();
        showSection('conductor-occupancy-form');
    } else {
        showCustomModal('Please fill in all route details.');
    }
}

function populateOccupancyForm() {
    const select = document.getElementById('occupancy-stop-select');
    select.innerHTML = '<option value="">Select a stop</option>';
    const allStops = [conductorRoute.start, ...conductorRoute.stops];
    allStops.forEach(stop => {
        if (stop) {
            select.innerHTML += `<option value="${stop}">${stop}</option>`;
        }
    });
}

function updateOccupancy(level) {
    const selectedStop = document.getElementById('occupancy-stop-select').value;
    if (selectedStop) {
        showCustomModal(`Occupancy updated to ${level} at ${selectedStop} for Bus ${registeredBusId}!`);
        backToDashboard();
    } else {
        showCustomModal('Please select a stop to update occupancy.');
    }
}

function registerMunicipal() {
    const name = document.getElementById('municipal-name').value;
    const id = document.getElementById('municipal-id').value;
    const designation = document.getElementById('municipal-designation').value;
    if (name && id && designation) {
        // Corrected logic to ensure page transition
        showCustomModal('Municipal Corporation Registration Successful!');
        setTimeout(() => {
            showContent('municipal-admin-dashboard-page');
            loadMunicipalAdminDashboardData();
        }, 500); // Add a slight delay to allow the modal to render first
    } else {
        showCustomModal('Please fill in all fields.');
    }
}

function loadMunicipalAdminDashboardData() {
    const statusList = document.getElementById('fleet-status-list');
    statusList.innerHTML = '';
    const mockData = [
        { status: 'Running', count: 40, icon: 'fa-bus', color: 'green' },
        { status: 'Delayed', count: 5, icon: 'fa-exclamation-triangle', color: 'red' },
        { status: 'Stopped', count: 3, icon: 'fa-hand-paper', color: 'orange' },
        { status: 'Maintenance', count: 2, icon: 'fa-wrench', color: 'gray' }
    ];
    mockData.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas ${item.icon}" style="color: ${item.color};"></i> ${item.status}: <strong>${item.count}</strong>`;
        statusList.appendChild(li);
    });
}

// --- Dashboard Logic ---
function updateLiveBusesOnDashboard() {
    const liveBusesList = document.getElementById('live-buses-list');
    liveBusesList.innerHTML = '';
    const mockLiveBuses = [
        { id: '101', route: 'Apaji - Ratan Mandir', eta: '5mins', conductor: 'Rajesh Kumar', occupancy: 'moderate' },
        { id: '102', route: 'AI Centre - Surya Mandir', eta: '10mins', conductor: 'Sita Devi', occupancy: 'empty' },
        { id: '103', route: 'Ratan Mandir - Jeev Mandir', eta: '3mins', conductor: 'Amit Sharma', occupancy: 'full' }
    ];

    mockLiveBuses.forEach(bus => {
        const card = document.createElement('div');
        card.className = 'live-bus-card';
        let occupancyClass = bus.occupancy === 'empty' ? 'green' : bus.occupancy === 'moderate' ? 'orange' : 'red';
        card.innerHTML = `
            <div class="bus-info">
                <strong style="color: var(--primary-color);">Bus ${bus.id}</strong>
                <span>${bus.route}</span>
            </div>
            <div class="bus-status-info">
                <small style="color: var(--accent-green);">ETA: ${bus.eta}</small>
                <small>Conductor: ${bus.conductor}</small>
                <div class="occupancy-dot ${occupancyClass}"></div>
            </div>
        `;
        liveBusesList.appendChild(card);
    });
}

// --- Complaint Logic ---
function submitComplaint() {
    const issueType = document.getElementById('issue-type').value;
    const details = document.getElementById('complaint-details').value;

    if (issueType || details) {
        showCustomModal("Complaint Submitted Successfully!");
        document.getElementById('issue-type').value = '';
        document.getElementById('complaint-details').value = '';
    } else {
        showCustomModal("Please select an issue type or provide details.");
    }
}

// --- Custom Modal Functions (Instead of alert) ---
function showCustomModal(message) {
    const modal = document.getElementById('notification-modal');
    const messageElement = document.getElementById('notification-message');
    messageElement.textContent = message;
    modal.style.display = 'block';

    const closeButton = modal.querySelector('.close-button');
    closeButton.onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}
