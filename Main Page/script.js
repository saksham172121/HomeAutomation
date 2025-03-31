document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("authToken");

    if (!token) {
        alert("Access denied. Please log in first.");
        window.location.href = "../Login Page/login.html"; // Redirect to login if no token
    }
});
function logout() {
    localStorage.removeItem("authToken");
    window.location.href = "../Login Page/login.html";
}
// Toggle Sidebar
function toggleSidebar() {
    document.querySelector(".sidebar").classList.toggle("hidden");
}
// Highlight Active Menu
function selectMenu(element, page) {
    document.querySelectorAll(".sidebar li").forEach(item => item.classList.remove("active"));
    element.classList.add("active");
    window.location.href = page;
}

// Switch Room
function switchRoom(index) {
    const slider = document.querySelector(".room-slider");
    const buttons = document.querySelectorAll(".room-btn");

    slider.style.transform = `translateX(${index * 100}%)`;

    buttons.forEach(btn => btn.classList.remove("active"));
    buttons[index].classList.add("active");
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

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".device-item input[type='checkbox']").forEach(checkbox => {
        checkbox.addEventListener("change", function() {
            const deviceName = this.getAttribute("data-device"); // Get device name
            const state = this.checked ? "on" : "off"; // Determine state

            fetch(`http://127.0.0.1:5000/device/${deviceName}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ state: state })
            })
            .then(response => response.json())
            .then(data => console.log(data.message))
            .catch(error => console.error("Error:", error));
        });
    });
});



function fetchFavoriteDescriptions() {
    fetch("http://127.0.0.1:5000/favorites/descriptions")
        .then(response => response.json())
        .then(favorites => {
            const tiles = document.querySelectorAll(".tile.square-tile p");

            tiles.forEach((tile, index) => {
                if (favorites[index]) {
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