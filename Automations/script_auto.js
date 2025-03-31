function toggleSidebar() {
    document.querySelector(".sidebar").classList.toggle("hidden");
}
function logout() {
    localStorage.removeItem("authToken");
    window.location.href = "../Login Page/login.html";
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

document.getElementById("device").addEventListener("change", function () {
    let deviceType = this.value;
    document.getElementById("onOffControl").style.display = "none";
    document.getElementById("speedControl").style.display = "none";
    document.getElementById("acControl").style.display = "none";

    if (deviceType === "light") {
        document.getElementById("onOffControl").style.display = "block";
    } else if (deviceType === "fan") {
        document.getElementById("speedControl").style.display = "block";
    } else if (deviceType === "ac") {
        document.getElementById("acControl").style.display = "flex";
    }
});

document.getElementById("saveRule").addEventListener("click", function () {
    const sensor_type = document.getElementById("sensor").value;
    const condition_type = document.getElementById("condition").value;
    const condition_value = parseFloat(document.getElementById("value").value);
    const device = document.getElementById("device").value; 
    // Ensuring action type comes from ENUM values
    if (device === "light") {
        action_type = "toggle";
        action_value = document.getElementById("onOff")?.value || null; // 'on' or 'off'
    } else if (device === "fan") {
        action_type = "fan_speed";
        action_value = parseInt(document.getElementById("speed")?.value) || null; // 1-5
    } else if (device === "ac") {
        action_type = "ac_control";

        const acMode = document.getElementById("acMode").value;
        const acTemp = parseInt(document.getElementById("acTemp").value) || null;
        const acFanSpeed = parseInt(document.getElementById("acPower").value) || null;

        action_value = {
            ac_mode: acMode,
            temperature: acTemp,
            fan_speed: acFanSpeed
        };
    }
    // Action values initialization
    let toggle_state = null;
    let fan_speed = null;
    let ac_mode = null;
    let temperature = null;
    let power_state = null;

    if (action_type === "toggle") {
        toggle_state = document.getElementById("onOff").value; // "on" or "off"
    } else if (action_type === "fan_speed") {
        fan_speed = parseInt(document.getElementById("speed").value); // 0 to 4
    } else if (action_type === "ac_control") {
        ac_mode = document.getElementById("acMode")?.value || null; // "cool", "fan", "hot"
        temperature = parseInt(document.getElementById("acTemp")?.value) || null; // 16 to 30
        power_state = document.getElementById("acPower")?.value || null; // "on" or "off"
    }

    // Creating JSON object for API request
    const ruleData = {
        sensor_type,
        condition_type,
        condition_value,
        action_type,
        toggle_state,
        fan_speed,
        ac_mode,
        temperature,
        power_state
    };

    console.log("Sending Rule:", ruleData);

    fetch("http://127.0.0.1:5000/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ruleData)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Response:", data);
        if (data.id) {
            fetchRules();
        }
    })
    .catch(error => console.error("Error:", error));
});

function fetchRules() {
    // Fetch favorite rules first
    fetch("http://127.0.0.1:5000/favorites")
        .then(response => response.json())
        .then(favoriteRules => {
            fetch("http://127.0.0.1:5000/rules")
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
        actionDesc = `Set fan speed to ${rule.fan_speed}`;
    } else if (rule.action_type === "toggle") {
        actionDesc = `Turn ${rule.toggle_state}`;
    }

    // Check if the rule is a favorite
    const isFavorite = favoriteRules.includes(ruleId);

    ruleElement.innerHTML = `
        <span class="rule-name">
            If ${rule.sensor_type} is ${rule.condition_type} than ${rule.condition_value}, ${actionDesc}
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
    fetch(`http://127.0.0.1:5000/rules/${ruleId}`, { method: "DELETE" })
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
    fetch("http://127.0.0.1:5000/favorites")
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
        fetch(`http://127.0.0.1:5000/favorites/${ruleId}`, { method: "DELETE" })
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
        fetch(`http://127.0.0.1:5000/favorites/${ruleId}`, { method: "POST" })
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
