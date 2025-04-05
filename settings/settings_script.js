function logout() {
    localStorage.removeItem("authToken");
    window.location.href = "../login/login.html";
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



function toggleSidebar() {
    document.querySelector(".sidebar").classList.toggle("hidden");
}
// Highlight Active Menu
function selectMenu(element, page) {
    document.querySelectorAll(".sidebar li").forEach(item => item.classList.remove("active"));
    element.classList.add("active");
    window.location.href = page;
}

let currentIndex = 0;
const containers = document.querySelectorAll(".container");

function updateView() {
    containers.forEach((container, index) => {
        container.classList.toggle("active", index === currentIndex);
    });
}

function showNext() {
    let button_nxt = document.getElementById("nextBtn");
    let button_prev = document.getElementById("prevBtn");
    const rootStyles = getComputedStyle(document.documentElement);
    if (currentIndex < containers.length - 1) {
        currentIndex++;
        updateView();
        button_nxt.style.backgroundColor = rootStyles.getPropertyValue('--disabled-button-bg').trim();
        button_nxt.style.transform = "translateX(5px)";
        button_prev.style.backgroundColor = rootStyles.getPropertyValue('--primary-button-bg').trim();
         
        setTimeout(() => {
            button_nxt.style.transform = "translateX(0)"; // Move back
        }, 200); // 200ms delay
    }
}

function showPrev() {
    let button_nxt = document.getElementById("nextBtn");
    let button_prev = document.getElementById("prevBtn");
    const rootStyles = getComputedStyle(document.documentElement);
    if (currentIndex > 0) {
        currentIndex--;
        updateView();
        button_nxt.style.backgroundColor = rootStyles.getPropertyValue('--primary-button-bg').trim();
        // button_prev.style.backgroundColor = "#ff5733";
        button_prev.style.backgroundColor = rootStyles.getPropertyValue('--disabled-button-bg').trim();
        button_prev.style.transform = "translateX(-5px)";
                 
        setTimeout(() => {
            button_prev.style.transform = "translateX(0)"; // Move back
        }, 200); // 200ms delay
    }
}

// Show the first section initially
updateView();








document.addEventListener("DOMContentLoaded", function () {
    fetchRooms();
    document.getElementById("addRoomBtn").addEventListener("click", addRoom);
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

    // Fetch devices for the selected room
    if (rooms && rooms[index]) {
        fetchDevices(rooms[index].id);
    }
}


function fetchDevices(roomId) {
    fetch(`http://127.0.0.1:5000/rooms/${roomId}/devices`)
        .then(response => response.json())
        .then(data => {
            console.log("API Response:", data); // Debugging output

            if (!Array.isArray(data)) {
                console.error("Expected an array but got:", data);
                return;
            }
            console.log(data);
            const container_buttons = document.getElementById("button-container-devices");
            container_buttons.innerHTML =` <button onclick="openDeviceModal(${roomId})">+ Add Device</button>
                                    <button class="delete-room-btn" onclick="deleteRoom(${roomId})">Remove Room</button>`;
            const container = document.getElementById("devicesContainer");

            container.innerHTML = "";
            data.forEach(device => {
                if (!device.name || !device.status || !device.type || !device.id) {
                    console.warn("Incomplete device data:", device);
                    return;
                }

                const deviceElement = document.createElement("div");
                deviceElement.classList.add("device-card");

                let extraInfo = ""; // Stores additional device-specific details

                if (device.type === "light") {
                    extraInfo = `<span>&nbsp;Status: ${device.status}</span>`;
                } else if (device.type === "fan") {
                    extraInfo = `
                        <span>&nbsp;Status: ${device.status}&nbsp;</span>
                        <span>|&nbsp;Speed: ${device.speed || "N/A"}</span>
                    `;
                } else if (device.type === "ac") {
                    extraInfo = `
                        <span>&nbsp;Status: ${device.status} |</span>
                        <span>&nbsp;Mode: ${device.mode || "N/A" } |</span>
                        <span>&nbsp;Temperature: ${device.temperature || "N/A"}°C </span>`;
                }

                deviceElement.innerHTML = `
                    <span><strong>${device.name}</strong> (${device.type.toUpperCase()})</span>
                    ${extraInfo}
                    <button class="delete-btn-device" onclick="deleteDevice(${device.id},${roomId})">Delete</button>
                `;
                
                container.appendChild(deviceElement);
            });

        })
        .catch(error => console.error("Error fetching devices:", error));
}


function addRoom() {
    const roomName = prompt("Enter room name:");
    if (roomName) {
        fetch("http://127.0.0.1:5000/rooms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: roomName })
        }).then(() => fetchRooms());
    }
}

// Open the modal
// function openDeviceModal() {
//     document.getElementById("deviceModal").style.visibility = "visible";
//     document.getElementById("deviceModal").style.opacity = "1";
// }
function openDeviceModal(roomId) {
    const modal = document.getElementById("deviceModal");

    // Store the room ID in a data attribute
    // modal.setAttribute("data-room-id", roomId);

    // Make the modal visible
    modal.style.visibility = "visible";
    modal.style.opacity = "1";

    // Ensure the Add button has the correct room ID
    const addButton = document.getElementById("confirmAddDevice");
    addButton.onclick = function() {
        addDevice(roomId);
    };
}

// Close the modal
function closeDeviceModal() {
    document.getElementById("deviceModal").style.visibility = "hidden";
    document.getElementById("deviceModal").style.opacity = "0";
}

// Toggle extra fields dynamically based on device type
function toggleDeviceFields() {
    const type = document.getElementById("deviceType").value;
    const extraFields = document.getElementById("extraFields");

    if (type === "fan") {
        extraFields.innerHTML = '<label>Speed: <input type="number" id="deviceSpeed" min="1" max="5"></label>';
    } else if (type === "ac") {
        extraFields.innerHTML = `
            <label>Temperature: <input type="number" id="deviceTemp" min="16" max="30"></label>
            <label>Mode: 
                <select id="deviceMode">
                    <option value="cool">Cool</option>
                    <option value="fan">Fan</option>
                    <option value="heat">Heat</option>
                </select>
            </label>
        `;
    } else {
        extraFields.innerHTML = ""; // No extra fields for light
    }
}


function addDevice(roomId) {
    const modal = document.getElementById("DeviceModal");
    // const roomId = modal.getAttribute("data-room-id");
    const deviceName = document.getElementById("deviceName").value;
    const deviceType = document.getElementById("deviceType").value;

    // const roomId = modal.getAttribute("data-room-id");
    if (!roomId) {
        console.error("Room ID not found!");
        return;
    }

    
    fetch(`http://127.0.0.1:5000/rooms/${roomId}/devices`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: deviceName,
            type: deviceType,
            room_id: parseInt(roomId, 10)
        })
    })
    .then(response => response.json())
    .then(() => {
        // modal.style.display = "none";
        document.getElementById("deviceModal").style.visibility = "hidden";
        document.getElementById("deviceModal").style.opacity = "0";
        fetchDevices(roomId);
    })
    .catch(error => console.error("Error adding device:", error));
}

function deleteDevice(deviceId, roomId) {
    // Confirm before deleting the device
    const confirmDelete = confirm("Are you sure you want to delete this device?");
    if (!confirmDelete) {
        return; // Exit if the user cancels
    }

    // Make the DELETE request to the Flask API
    fetch(`http://127.0.0.1:5000/devices/${deviceId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Device deleted") {
            alert("Device successfully deleted");
            fetchDevices(roomId);
            // Optionally, you can update the UI to reflect the deleted device
        } else {
            alert("Failed to delete device");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("An error occurred while deleting the device");
    });
}

function deleteRoom(roomId) {
    if (!confirm("Are you sure you want to delete this room? This will also remove all devices inside it.")) {
        return; // Exit if user cancels
    }

    fetch(`http://127.0.0.1:5000/rooms/${roomId}`, {
        method: "DELETE",
    })
    .then(response => response.json())
    .then(data => {
        console.log("Room deleted:", data);
        alert(data.message); // Notify user

        // Optionally refresh or remove the room from UI
        // document.getElementById(`room-${roomId}`)?.remove();
        fetchRooms();
    })
    .catch(error => {
        console.error("Error deleting room:", error);
        alert("Failed to delete room. Please try again.");
    });
}

// Event listener to close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById("deviceModal");
    if (event.target === modal) {
        document.getElementById("deviceModal").style.visibility = "hidden";
        document.getElementById("deviceModal").style.opacity = "0";
    }
};


document.addEventListener("DOMContentLoaded", () => {
    fetch("http://127.0.0.1:5000/user/latest")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }
            return response.json();
        })
        .then(user => {
            document.getElementById("display-username").textContent = user.username;
            document.getElementById("display-email").textContent = user.email;

            // Optionally update welcome message too
            document.querySelector(".profile-picture p").textContent = `Welcome, ${user.username}`;
        })
        .catch(error => {
            console.error("Error loading user info:", error);
        });
});

