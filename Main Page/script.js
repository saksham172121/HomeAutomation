// Toggle Sidebar
function toggleSidebar() {
    document.querySelector(".sidebar").classList.toggle("hidden");
    document.querySelector(".main-content").classList.toggle("shifted");
}

// Highlight Active Menu
function selectMenu(element) {
    document.querySelectorAll(".sidebar li").forEach(item => item.classList.remove("active"));
    element.classList.add("active");
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
    mainContent.classList.toggle("shifted");

    // Show the hamburger menu only when sidebar is hidden
    if (sidebar.classList.contains("hidden")) {
        hamburger.style.display = "block";
    } else {
        hamburger.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    new Sortable(document.getElementById("tile-grid"), {
        animation: 200, // Smooth animation
        ghostClass: "ghost", // Class to style the dragged tile
        dragClass: "dragging",
        handle: ".drag-handle" 
    });
});
