const API_BASE_URL = "http://127.0.0.1:5000";

function toggleSidebar() {
    document.querySelector(".sidebar").classList.toggle("hidden");
}
function logout() {
    localStorage.removeItem("authToken");
    window.location.href = "../login/login.html";
}

function selectMenu(element, page) {
    document.querySelectorAll(".sidebar li").forEach(item => item.classList.remove("active"));
    element.classList.add("active");
    window.location.href = page;
}

document.addEventListener("DOMContentLoaded", function () {
    const addRuleBtn = document.getElementById("addRuleBtn");
    const rulePopup = document.getElementById("rulePopup");
    const closeBtn = document.querySelector(".close");

    addRuleBtn.onclick = function () {
        rulePopup.style.display = "flex";
    };
    closeBtn.onclick = function () {
        rulePopup.style.display = "none";
    };
    window.onclick = function (event) {
        if (event.target === rulePopup) {
            rulePopup.style.display = "none";
        }
    };

    fetchRules();
});

// document.getElementById("device").addEventListener("change", function () {
//     let deviceType = this.value;
//     document.getElementById("onOffControl").style.display = "none";
//     document.getElementById("speedControl").style.display = "none";
//     document.getElementById("acControl").style.display = "none";

//     if (deviceType === "light") {
//         document.getElementById("onOffControl").style.display = "block";
//     } else if (deviceType === "fan") {
//         document.getElementById("speedControl").style.display = "block";
//     } else if (deviceType === "ac") {
//         document.getElementById("acControl").style.display = "flex";
//     }
// });

document.getElementById("device").addEventListener("change", function () {
    const selectedId = this.value;
    const selectedDevice = devicesMap[selectedId];

    if (!selectedDevice) return;

    // Hide all control sections first
    document.getElementById("onOffControl").style.display = "none";
    document.getElementById("speedControl").style.display = "none";
    document.getElementById("acControl").style.display = "none";

    // Show only the relevant section based on device type
    if (selectedDevice.type === "light") {
        document.getElementById("onOffControl").style.display = "block";
    } else if (selectedDevice.type === "fan") {
        document.getElementById("speedControl").style.display = "block";
    } else if (selectedDevice.type === "ac") {
        document.getElementById("acControl").style.display = "block";
    }
});


function toggleTimeFields() {
    var sensorType = document.getElementById("sensor").value;
    var timeFields = document.getElementById("time_fields");
    var conditionValue = document.getElementById("value");

    if (sensorType === "time") {
        timeFields.style.display = "block";
        conditionValue.style.display = "none"; // Hide number input
    } else {
        timeFields.style.display = "none";
        conditionValue.style.display = "block"; // Show number input
    }
}

let devicesMap = {};
document.addEventListener("DOMContentLoaded", async function () {
    const deviceDropdown = document.getElementById("device");

    fetch(`${API_BASE_URL}/rooms/get_devices`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(devices => {
        const deviceDropdown = document.getElementById("device");

        if (!Array.isArray(devices)) {
            throw new Error("Invalid JSON format received");
        }

        // Clear existing options
        deviceDropdown.innerHTML = `<option value="" disabled selected>Select a device</option>`;

        // Populate dropdown
        devices.forEach(device => {
            const option = document.createElement("option");
            option.value = device.id;
            option.textContent =  `${device.name} (${device.room_name})`;
            deviceDropdown.appendChild(option);
            devicesMap[device.id] = device;
            console.log(devicesMap)
        });
    })
    .catch(error => console.error("Error fetching devices:", error));
});

document.getElementById("saveRule").addEventListener("click", function () {
    const sensor_type = document.getElementById("sensor").value;
    const condition_type = document.getElementById("condition").value;
    const condition_value = parseFloat(document.getElementById("value").value);
    const deviceId = document.getElementById("device").value;
    const time = document.getElementById("condition_time").value;
    console.log(time);

    const selectedDevice = devicesMap[deviceId];
    if (!selectedDevice) {
        console.error("Invalid device selected");
        return;
    }

    const device_type = selectedDevice.type;
    let action_type = "";
    let toggle_state = null;
    let fan_speed = null;
    let ac_mode = null;
    let temperature = null;
    let power_state = null;

    if (device_type === "light") {
        action_type = "toggle";
        toggle_state = document.getElementById("onOff")?.value || null;
    } else if (device_type === "fan") {
        action_type = "fan_speed";
        fan_speed = parseInt(document.getElementById("speed")?.value) || null;
    } else if (device_type === "ac") {
        action_type = "ac_control";
        
        ac_mode= document.getElementById("acMode")?.value || null,
        temperature= parseInt(document.getElementById("acTemp")?.value) || null,
        power_state= parseInt(document.getElementById("acPower")?.value) || null
    
    }

    const ruleData = {
        sensor_type,
        condition_type,
        condition_value: isNaN(condition_value) ? null : condition_value,
        action_type,
        time,
        toggle_state,
        fan_speed,
        ac_mode,
        temperature,
        power_state,
        device_id: deviceId
    };

    console.log("Sending Rule:", ruleData);

    fetch(`${API_BASE_URL}/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ruleData)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Response:", data);
        if (data.id) {
            fetchRules(); // Refresh the rule list
        }
    })
    .catch(error => console.error("Error:", error));
});

function fetchRules() {
    // Fetch favorite rules first
    fetch(`${API_BASE_URL}/favorites`)
        .then(response => response.json())
        .then(favoriteRules => {
            fetch(`${API_BASE_URL}/rules`)
                .then(response => response.json())
                .then(rules => {
                    const rulesContainer = document.getElementById("rulesList");
                    rulesContainer.innerHTML = ""; // Clear old rules



                    rules.forEach(rule => {
                        console.log(rule);
                        addRuleToList(rule, rule.id, favoriteRules);
                    });
                })
                .catch(error => console.error("Error fetching rules:", error));
        })
        .catch(error => console.error("Error fetching favorites:", error));
}

function formatTime(timeString) {
    if (!timeString) return "";  // Handle null/undefined cases
    let [hours, minutes] = timeString.split(":").map(Number);  // Extract hours & minutes
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;  // Convert 24-hour to 12-hour format
    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

function addRuleToList(rule, ruleId, favoriteRules) {
    const rulesContainer = document.getElementById("rulesList");
    const ruleElement = document.createElement("div");
    ruleElement.classList.add("rule-item");

    let actionDesc = "";
    if (rule.action_type === "ac_control") {
        let parts = [];
    
        if (rule.temperature) {
            parts.push(`Temperature to ${rule.temperature}`);
        }
        if (rule.ac_mode) {
            parts.push(`Mode: ${rule.ac_mode}`);
        }
        if (rule.power_state) {
            parts.push(`Power: ${rule.power_state}`);
        }
        
        actionDesc = `Set AC ${parts.join(", ")}`;
    
    } else if (rule.action_type === "fan_speed") {
        actionDesc = `Set ${rule.device_name}'s(${rule.room_name}) speed to ${rule.fan_speed ?? 0}`;
    } else if (rule.action_type === "toggle") {
        actionDesc = `Turn ${rule.toggle_state} ${rule.device_name}(${rule.room_name})`;
    }

    // Check if the rule is a favorite
    const isFavorite = favoriteRules.includes(ruleId);
    const comparisonWord = (rule.condition_type === "equal") ? "to" : "than";
    
    ruleElement.innerHTML = `
        <span class="rule-name">
            If ${rule.sensor_type} is ${rule.condition_type} ${comparisonWord} 
            ${rule.condition_value ? rule.condition_value : formatTime(rule.time)}, ${actionDesc}
        </span>
        <div class="rule-buttons">
            <button class="edit-btn" onclick='openRulePopup(${JSON.stringify(rule)})'>Edit</button>
            <button class="delete-btn" onclick="deleteRule(${ruleId})">Delete</button>
            <button class="fav-btn ${isFavorite ? "favorite" : ""}" onclick="toggleFavorite(${ruleId}, this)">★</button>
        </div>
    `;
    rulesContainer.appendChild(ruleElement);
}


function deleteRule(ruleId) {
    console.log(ruleId);
    fetch(`${API_BASE_URL}/rules/${ruleId}`, { method: "DELETE" })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            fetchRules();
        } else {
            alert("Error deleting rule");
        }
    })
    .catch(error => console.error("Error:", error));
}

function openRulePopup(rule = null) {
    const popup = document.getElementById("rulePopup");
    popup.style.display = "flex";

    // Reset inputs
    document.getElementById("sensor").value = rule?.sensor_type || "";
    document.getElementById("condition").value = rule?.condition_type || "";
    document.getElementById("value").value = rule?.threshold || "";

    document.getElementById("device").value = rule?.device || "";
    
    // Prefill action values
    if (rule) {
        if (rule.device === "light") {
            document.getElementById("onOff").value = rule.action_value || "turn_on";
        } else if (rule.device === "fan") {
            document.getElementById("speed").value = rule.action_value || "1";
        } else if (rule.device === "ac") {
            document.getElementById("acMode").value = rule.ac_mode || "cool";
            document.getElementById("acTemp").value = rule.temperature || "24";
            document.getElementById("acPower").value = rule.power_state || "off";
        }
    }

    // Show correct controls based on device
    updateDeviceControls();

    // Change button text for editing
    const saveBtn = document.getElementById("saveRule");
    saveBtn.innerText = rule ? "Update Rule" : "Save Rule";
    saveBtn.onclick = rule ? () => updateRule(rule.id) : saveNewRule;
}
function fetchFavorites() {
    fetch(`${API_BASE_URL}/favorites`)
        .then(response => response.json())
        .then(favorites => {
            const favoriteContainer = document.getElementById("favoriteRules");
            favoriteContainer.innerHTML = "";

            favorites.forEach(rule => {
                const tile = document.createElement("div");
                tile.classList.add("fav-tile");
                tile.innerHTML = `<span>${rule.name}</span>`;
                favoriteContainer.appendChild(tile);
            });
        })
        .catch(error => console.error("Error fetching favorites:", error));
}
function toggleFavorite(ruleId, button) {
    const isFavorite = button.classList.contains("favorite");

    if (isFavorite) {
        fetch(`${API_BASE_URL}/favorites/${ruleId}`, { method: "DELETE" })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    button.classList.remove("favorite");
                } else {
                    alert(data.error || "Failed to remove favorite");
                }
            })
            .catch(error => console.error("Error:", error));
    } else {
        fetch(`${API_BASE_URL}/favorites/${ruleId}`, { method: "POST" })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    button.classList.add("favorite");
                } else {
                    alert(data.error || "Failed to add favorite");
                }
            })
            .catch(error => console.error("Error:", error));
    }
}




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


// Sidebar Rooms fetch and update
document.addEventListener("DOMContentLoaded", function () {
    fetchRooms();
});

let rooms = [];
function fetchRooms() {
    fetch(`${API_BASE_URL}/rooms`)
        .then(response => response.json())
        .then(data => {
            rooms = data;
            renderSidebarRooms();
        });
}
function renderSidebarRooms() {
    const sidebarRoomList = document.getElementById("sidebarRoomList");
    sidebarRoomList.innerHTML = "";

    rooms.forEach((room, index) => {
        const li = document.createElement("li");
        li.innerText = room.name;
        li.onclick = () => {
            switchRoom(index);
            selectMenu(li); // Optionally highlight the selected item
        };
        sidebarRoomList.appendChild(li);
    });
}
