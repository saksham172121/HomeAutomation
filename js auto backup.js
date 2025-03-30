function toggleSidebar() {
    document.querySelector(".sidebar").classList.toggle("hidden");
}
// Highlight Active Menu
function selectMenu(element) {
    document.querySelectorAll(".sidebar li").forEach(item => item.classList.remove("active"));
    element.classList.add("active");
}

document.addEventListener("DOMContentLoaded", function () {
    const addRuleBtn = document.getElementById("addRuleBtn");
    const rulePopup = document.getElementById("rulePopup");
    const closeBtn = document.querySelector(".close");

    // Show popup
    addRuleBtn.onclick = function () {
        rulePopup.style.display = "flex";
    };

    // Hide popup
    closeBtn.onclick = function () {
        rulePopup.style.display = "none";
    };

    // Hide popup when clicking outside the box
    window.onclick = function (event) {
        if (event.target === rulePopup) {
            rulePopup.style.display = "none";
        }
    };

    // Fetch existing rules when page loads
    fetchRules();
});

// Handle device-specific action UI
document.getElementById("device").addEventListener("change", function () {
    let deviceType = this.value;

    // Hide all controls
    document.getElementById("onOffControl").style.display = "none";
    document.getElementById("speedControl").style.display = "none";
    document.getElementById("acControl").style.display = "none";

    // Show relevant controls
    if (deviceType === "light") {
        document.getElementById("onOffControl").style.display = "block";
    } else if (deviceType === "fan") {
        document.getElementById("speedControl").style.display = "block";
    } else if (deviceType === "ac") {
        document.getElementById("acControl").style.display = "flex";
    }
});

// Function to save a new rule
document.getElementById("saveRule").addEventListener("click", function () {
    const sensor = document.getElementById("sensor").value;
    const condition = document.getElementById("condition").value;
    const value = document.getElementById("value").value;
    const device = document.getElementById("device").value;

    let action = null;
    let actionValue = null;

    if (device === "light") {
        let lightActionElement = document.getElementById("lightAction");
        action = lightActionElement ? lightActionElement.value : null; // Check if element exists
    } else if (device === "fan") {
        action = "set_speed";
        let fanSpeedElement = document.getElementById("fanSpeed");
        actionValue = fanSpeedElement ? fanSpeedElement.value : null;
    } else if (device === "ac") {
        let acActionElement = document.getElementById("acAction");
        action = acActionElement ? acActionElement.value : null;

        if (action === "set_temperature") {
            let acTemperatureElement = document.getElementById("acTemperature");
            actionValue = acTemperatureElement ? acTemperatureElement.value : null;
        }
    }

    const ruleData = {
        sensor_type: sensor,
        condition_type: condition,
        value: parseFloat(value),
        device: device,
        action: action,
        action_value: actionValue ? parseFloat(actionValue) : null
    };

    fetch("http://127.0.0.1:5000/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ruleData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        addRuleToList(ruleData, data.rule_id); // Dynamically add rule
    })
    .catch(error => console.error("Error:", error));
});

// Function to fetch and display rules from Flask API
function fetchRules() {
    fetch("http://127.0.0.1:5000/rules")
        .then(response => response.json())
        .then(rules => {
            const rulesContainer = document.getElementById("rulesList");
            rulesContainer.innerHTML = ""; // Clear the list

            rules.forEach(rule => {
                addRuleToList(rule, rule.id);
            });
        })
        .catch(error => console.error("Error:", error));
}

// Function to dynamically add a rule to the list
function addRuleToList(rule, ruleId) {
    const rulesContainer = document.getElementById("rulesList");
    const ruleElement = document.createElement("div");
    ruleElement.classList.add("rule-item");

    // Replace "set_temperature" with "temperature" and "set_speed" with "speed"
    let actionType = rule.action_type;
    if (actionType === "set_temperature") {
        actionType = "temperature";
    } else if (actionType === "set_speed") {
        actionType = "speed";
    }

    ruleElement.innerHTML = `
        <span class="rule-name">If ${rule.sensor_type} is ${rule.operator} than ${rule.threshold}. Set ${rule.device} ${actionType} to ${rule.action_value || ""}</span>
        <div class="rule-buttons">
            <button class="edit-btn">Edit</button>
            <button class="delete-btn" onclick="deleteRule(${ruleId})">Delete</button>
            <button class="fav-btn">★</button>
        </div>
    `;

    rulesContainer.appendChild(ruleElement);
}
// Function to delete a rule
function deleteRule(ruleId) {
    fetch(`http://127.0.0.1:5000/rules/${ruleId}`, {
        method: "DELETE"
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            fetchRules(); // Refresh rules after deletion
        } else {
            alert("Error deleting rule");
        }
    })
    .catch(error => console.error("Error:", error));
}