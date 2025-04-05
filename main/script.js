document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("authToken");

    if (!token) {
        alert("Access denied. Please log in first.");
        window.location.href = "../login/login.html"; // Redirect to login if no token
    }
});
function logout() {
    localStorage.removeItem("authToken");
    window.location.href = "../login/login.html";
}

// Highlight Active Menu
function selectMenu(element, page = null) {
    document.querySelectorAll(".sidebar li").forEach(item => item.classList.remove("active"));
    element.classList.add("active");
    window.location.href = page;
}

function toggleSidebar() {
    let sidebar = document.querySelector(".sidebar");
    let mainContent = document.querySelector(".main-content");
    let hamburger = document.querySelector(".hamburger");

    sidebar.classList.toggle("hidden");

    // Show the hamburger menu only when sidebar is hidden
    if (sidebar.classList.contains("hidden")) {
        hamburger.style.display = "block";
    } else {
        hamburger.style.display = "none";
    }
}
function toggleSidebar() {
    document.querySelector(".sidebar").classList.toggle("hidden");
}



document.addEventListener("DOMContentLoaded", function () {
    const miniTile = document.getElementById("master-switch");

    miniTile.addEventListener("click", function () {
        // Check if tile is currently "on"
        const isOn = this.classList.contains("active");
        const textElement = this.querySelector("p");

        // Apply sliding and color change
        if (isOn) {
            this.style.transform = "translateX(0%)"; // Move to right (ON)
            this.style.background = "#00C853"; // Green for ON
            textElement.textContent = "ON";
        } else {
            this.style.transform = "translateX(-100%)"; // Move to left (OFF)
            this.style.background = "#D32F2F"; // Red for OFF
            textElement.textContent = "OFF";
        }

        // Toggle active state
        this.classList.toggle("active");

        // Reset to default color after 500ms
        setTimeout(() => {
            this.style.background = ""; // Revert to default
        }, 500);
    });
});

// middle tile start
function togglePower(button) {
    const isOn = button.classList.contains("on"); // Check if it's ON

    if (isOn) {
        // Turning OFF: Flash Red
        button.classList.add("flash-red");
        setTimeout(() => {
            button.classList.remove("flash-red");
            button.classList.remove("on"); // Remove ON state
        }, 450);
    } else {
        // Turning ON: Flash Green
        button.classList.add("flash-green");
        setTimeout(() => {
            button.classList.remove("flash-green");
            button.classList.add("on"); // Set ON state
        }, 450);
    }
}
let modes = ["Cool", "Heat", "Fan"];
let currentModeIndex = 0;

function toggleMode() {
    const knob = document.getElementById("sliderKnob");
    currentModeIndex = (currentModeIndex + 1) % modes.length;

    knob.textContent = modes[currentModeIndex];

    // Move knob position
    if (currentModeIndex === 0) {
        knob.style.left = "0%";
        knob.style.backgroundColor = "#76F8FF"  
    } else if (currentModeIndex === 1) {
        knob.style.left = "30%";
        knob.style.backgroundColor = "#e79720"
    } else {
        knob.style.left = "60%";
        knob.style.backgroundColor = "#a7e7ec"
    }
}
function changeTemp(value) {
    let tempDisplay = document.querySelector(".temperature");
    let currentTemp = parseInt(tempDisplay.innerText);
    tempDisplay.innerText = (currentTemp + value) + "°C";
}

function toggleSwing(button) {
    button.classList.add("on");
    setTimeout(() => button.classList.remove("on"), 300);
}

document.addEventListener("DOMContentLoaded", function () {
    const fanSpeedSlider = document.getElementById("fan-speed-slider");
    const fanSpeedLabel = document.getElementById("fan-speed-label");

    // Define snapping points
    const speedLevels = ["OFF", "LOW", "MEDIUM", "HIGH"];

    fanSpeedSlider.addEventListener("input", function () {
        // Force the slider to snap to exact values
        let snappedValue = Math.round(fanSpeedSlider.value);
        fanSpeedSlider.value = snappedValue; // Force snap
        fanSpeedLabel.textContent = speedLevels[snappedValue]; // Update label
    });
});
// middle tile end


// MOBILE
document.addEventListener("DOMContentLoaded", function () {
    const scrollContainer = document.querySelector(".mobile_bigtile_flex");
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    if (mediaQuery.matches) {
        setTimeout(() => {
            const secondItem = scrollContainer.children[1]; // Get the second item
            if (secondItem) {
                scrollContainer.scrollLeft = secondItem.offsetLeft - (scrollContainer.clientWidth / 2) + (secondItem.clientWidth / 2);
            }
        }, 100); // Delay ensures the layout is loaded
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const scrollContainer = document.querySelector(".mobile_flex_strip");
    const mediaQuery = window.matchMedia("(max-width: 480px)");

    if (mediaQuery.matches) {
        setTimeout(() => {
            const secondItem = scrollContainer.children[1]; // Get the second item
            if (secondItem) {
                scrollContainer.scrollLeft = secondItem.offsetLeft - (scrollContainer.clientWidth / 2) + (secondItem.clientWidth / 2);
            }
        }, 100); // Delay ensures the layout is loaded
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const scrollContainer = document.querySelector(".mobile_bigtile_flex");
    const sliders = document.querySelectorAll("input[type='range']");

    sliders.forEach(slider => {
        slider.addEventListener("touchstart", (e) => {
            e.stopPropagation(); // Prevents scroll while touching the slider
        });
    });
});




function fetchSensorData() {
    fetch("http://127.0.0.1:5000/sensor-data")
    .then(response => response.json())
    .then(data => {
        document.getElementById("temperature_label").innerText = `${data.temperature}°C`;
        document.getElementById("humidity_label").innerText = `${data.humidity}%`;
    })
    .catch(error => console.error("Error fetching sensor data:", error));
}

// Fetch sensor data every 10 seconds
setInterval(fetchSensorData, 10000);
fetchSensorData(); // Call immediately on page load




function fetchSensorHistory() {
    fetch(`http://127.0.0.1:5000/sensor-history`)
    .then(response => response.json())
    .then(data => {
        const timestamps = data.map(entry => {
            let date = new Date(entry.timestamp); // Parse timestamp directly
                    
            // Manually adjust to IST (UTC+5:30)
            date.setHours(date.getHours() + 6 +12);
            date.setMinutes(date.getMinutes() + 30 );
        
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit', 
                hour12: true 
            });
        });
        const temperatures = data.map(entry => entry.temperature);
        const humidities = data.map(entry => entry.humidity);

        updateChart(timestamps, temperatures);
        updateChart_humidity(timestamps, humidities);
    })
    .catch(error => console.error("Error fetching sensor history:", error));
}

// Initialize Chart.js
const ctx = document.getElementById('sensorChart_temp').getContext('2d');
const sensorChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Temperature (°C)',
                borderColor: 'red',
                backgroundColor: 'rgba(255, 0, 0, 0.2)', // Light red fill
                pointBackgroundColor: 'red',
                data: [],
                fill: true,
                tension: 0.4 // Smooth line
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { 
                display: true, 
                title: { 
                    display: true, 
                    text: 'Time',
                    color: '#ffffff', // White text
                    font: { size: 14, family: 'YourWebsiteFont, sans-serif' }
                },
                ticks: { color: '#ffffff' }, // White tick labels
                grid: { color: 'rgba(255, 255, 255, 0.2)' } // Light white grid lines
            },
            y: { 
                display: true, 
                title: { 
                    display: true, 
                    text: 'Value',
                    color: '#ffffff', // White text
                    font: { size: 14, family: 'YourWebsiteFont, sans-serif' }
                },
                ticks: { color: '#ffffff' }, // White tick labels
                grid: { color: 'rgba(255, 255, 255, 0.2)' } // Light white grid lines
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#ffffff', // White legend text
                    font: { family: 'YourWebsiteFont, sans-serif' }
                }
            },
            tooltip: {
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark tooltip background
                borderWidth: 1,
                borderColor: '#ffffff'
            }
        }
    }
});
// Update Chart with New Data
function updateChart(labels, tempData) {
    // console.log("Updating Chart: Labels =", labels, "Temp Data =", tempData); // Debugging
    sensorChart.data.labels = labels;
    sensorChart.data.datasets[0].data = tempData;
    sensorChart.update();
}



const ctx_humidity = document.getElementById('sensorChart_humidity').getContext('2d');
const sensorChart_humidity = new Chart(ctx_humidity, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Humidity (%)',
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.2)', // Light blue fill
                pointBackgroundColor: 'blue',
                data: [],
                fill: true,
                tension: 0.4 // Smooth line
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { 
                display: true, 
                title: { 
                    display: true, 
                    text: 'Time',
                    color: '#ffffff', // White text
                    font: { size: 14, family: 'YourWebsiteFont, sans-serif' }
                },
                ticks: { color: '#ffffff' }, // White tick labels
                grid: { color: 'rgba(255, 255, 255, 0.2)' } // Light white grid lines
            },
            y: { 
                display: true, 
                title: { 
                    display: true, 
                    text: 'Value',
                    color: '#ffffff', // White text
                    font: { size: 14, family: 'YourWebsiteFont, sans-serif' }
                },
                ticks: { color: '#ffffff' }, // White tick labels
                grid: { color: 'rgba(255, 255, 255, 0.2)' } // Light white grid lines
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#ffffff', // White legend text
                    font: { family: 'YourWebsiteFont, sans-serif' }
                }
            },
            tooltip: {
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark tooltip background
                borderWidth: 1,
                borderColor: '#ffffff'
            }
        }
    }
});
// Update Chart with New Data
function updateChart_humidity(labels, humData) {
    // console.log("Updating Chart: Labels =", labels, "Hum Data =", humData); // Debugging
    sensorChart_humidity.data.labels = labels;
    sensorChart_humidity.data.datasets[0].data = humData;
    sensorChart_humidity.update();
}

// Fetch data every 10 seconds
setInterval(fetchSensorHistory, 10000);
fetchSensorHistory();
document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("deviceList"); // parent element that holds all the .device-item elements

    container.addEventListener("change", function (event) {
        const checkbox = event.target;
        if (checkbox.matches("input[type='checkbox'][data-device]")) {
            const deviceId = checkbox.getAttribute("data-device");
            const state = checkbox.checked ? "on" : "off";

            console.log("Toggling device ID:", deviceId, "to", state);

            fetch(`http://127.0.0.1:5000/device/${deviceId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ state: state }),
            })
            .then(response => response.json())
            .then(data => console.log("Response:", data))
            .catch(error => console.error("Fetch error:", error));
        }
    });
});


function fetchFavoriteDescriptions() {
    fetch("http://127.0.0.1:5000/favorites/descriptions")
        .then(response => response.json())
        .then(favorites => {
            const tiles = document.querySelectorAll(".tile.square-tile p");

            tiles.forEach((tile, index) => {
                if (favorites[index]) {
                    console.log(favorites[index].description);
                    tile.textContent = favorites[index].description;
                } else {
                    tile.textContent = "No favorite rule assigned";
                }
            });
        })
        .catch(error => console.error("Error fetching favorite descriptions:", error));
}

// Call this function on page load
document.addEventListener("DOMContentLoaded", fetchFavoriteDescriptions);


// Get the button and attach event listener
const themeToggleButton = document.getElementById('theme-toggle');

// Check the current theme in localStorage or default to dark mode
let currentTheme = localStorage.getItem('theme') || 'dark-mode';
if (currentTheme === 'light-mode') {
    document.documentElement.classList.add('light-mode');
} else {
    themeToggleButton.textContent = 'Switch Mode ⏾'; // Update button text for dark mode
}

// Function to update the button text based on the theme
function updateButtonText() {
    if (document.documentElement.classList.contains('light-mode')) {
        themeToggleButton.textContent = 'Switch Mode ⏾'; // Button text for light mode
    } else {
        themeToggleButton.textContent = 'Switch Mode 𖤓'; // Button text for dark mode
    }
}

// Immediately update button text based on current theme
updateButtonText();

// Toggle between dark and light mode when the button is clicked
themeToggleButton.addEventListener('click', () => {
    // Toggle the class on the root element
    document.documentElement.classList.toggle('light-mode');
    
    // Update localStorage with the new theme
    if (document.documentElement.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light-mode');
    } else {
        localStorage.setItem('theme', 'dark-mode');
    }
    
    // Immediately update the button text
    updateButtonText();
});


// Update the Welcome, user tag at the top

document.addEventListener("DOMContentLoaded", () => {
    fetch("http://127.0.0.1:5000/user/latest")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }
            return response.json();
        })
        .then(user => {
            document.getElementById("welcome_tag").textContent = `Welcome, ${user.username}`;

        })
        .catch(error => {
            console.error("Error loading user info:", error);
        });
});


document.addEventListener("DOMContentLoaded", function () {
    fetchRooms();
});


let rooms = [];
let selectedRoomIndex = 0;

function fetchRooms() {
    fetch("http://127.0.0.1:5000/rooms")
        .then(response => response.json())
        .then(data => {
            rooms = data;
            console.log(rooms);
            renderRooms();
            renderSidebarRooms();
            switchRoom(0);
        });
}

function renderRooms() {
    const roomButtonsContainer = document.getElementById("roomButtons");
    const slider = document.getElementById("roomSlider");

    roomButtonsContainer.innerHTML = "";
    rooms.forEach((room, index) => {
        const button = document.createElement("button");
        button.classList.add("room-btn");
        button.innerText = room.name;
        button.onclick = () => switchRoom(index);
        roomButtonsContainer.appendChild(button);
    });

    if (rooms.length > 0) {
        slider.style.width = `${100 / rooms.length}%`;
    }
}

function switchRoom(index) {
    selectedRoomIndex = index;
    const slider = document.getElementById("roomSlider");
    const buttons = document.querySelectorAll(".room-btn");

    if (!buttons[index]) return; // Prevent errors if index is out of bounds

    const activeButton = buttons[index];
    const buttonWidth = activeButton.scrollWidth; // Get button text width
    const buttonLeft = activeButton.offsetLeft;   // Get button position

    // Set slider width & position dynamically
    slider.style.width = `${buttonWidth}px`;
    slider.style.transform = `translateX(${buttonLeft}px)`;

    // Update active state for buttons
    buttons.forEach((btn, i) => btn.classList.toggle("active", i === index));

    if (rooms && rooms[index]) {
        fetchDevices(rooms[index].id);
    }
}


function renderSidebarRooms() {
    const sidebarRoomList = document.getElementById("sidebarRoomList");
    sidebarRoomList.innerHTML = "";

    rooms.forEach((room, index) => {
        const li = document.createElement("li");
        li.innerText = room.name;
        li.style.cursor = "pointer";

        li.addEventListener("click", (e) => {
            switchRoom(index);
            // selectMenu(li); // Optional UI highlight
        });

        sidebarRoomList.appendChild(li);
    });
}


// Get devices and update the main page
function fetchDevices(roomId) {
    fetch(`http://127.0.0.1:5000/rooms/${roomId}/devices`)
        .then(response => response.json())
        .then(devices => {
            const deviceList = document.getElementById("deviceList");
            deviceList.innerHTML = ""; // Clear current list

            if (devices.length === 0) {
                deviceList.innerHTML = "<li class='device-item'>No devices in this room.</li>";
                return;
            }

            devices.forEach(device => {
                const li = document.createElement("li");
                li.classList.add("device-item");

                li.innerHTML = `
                    <span>${device.name}</span>
                    <label class="switch">
                        <input type="checkbox" data-device="${device.id}" ${device.status === "on" ? "checked" : ""}>
                        <span class="slider"></span>
                    </label>
                `;

                deviceList.appendChild(li);
            });
        })
        .catch(error => {
            console.error("Error fetching devices:", error);
        });
}
