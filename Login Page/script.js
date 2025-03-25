document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("https://your-api-url.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("token", data.token);  // Save token in localStorage
            window.location.href = "main.html";  // Redirect to main page
        } else {
            alert("Invalid login");
        }
    })
    .catch(error => console.error("Error:", error));
});