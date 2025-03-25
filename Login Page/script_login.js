document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim(); // Trim spaces
    const password = document.getElementById("password").value.trim();

    fetch("https://homeautomation-xnln.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Response:", data); // Debugging

        if (data.message === "Login successful!") {
            window.location.href = "../Main Page/main.html";  // Redirect
        } else {
            alert("Invalid login");
        }
    })
    .catch(error => console.error("Error:", error));
});