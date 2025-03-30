function showForm(formId) {
    document.querySelectorAll('.login-form').forEach(form => {
      form.classList.add('hidden');
    });
    document.getElementById(formId).classList.remove('hidden');
  }

  function animateBlob(blob) {
    gsap.to(blob, {
      x: Math.random() * 40 - 20, // Move randomly between -20px to 20px
      y: Math.random() * 40 - 20,
      duration: Math.random() * 3 + 2, // Random duration between 2-5s
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1 // Infinite loop
    });
  }
  // Select all blobs and animate them
  document.querySelectorAll('.blob').forEach(animateBlob);




  document.addEventListener("DOMContentLoaded", function () {
    const API_BASE_URL = "http://127.0.0.1:5000"; // Update if needed

    // 🟢 Handle Login
    document.getElementById("loginForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!username || !password) {
            alert("Please enter both username and password.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Login successful!");
                localStorage.setItem("authToken", data.token); // Store token
                window.location.href = "../Main Page/main.html"; // Redirect (update as needed)
            } else {
                alert(data.error || "Invalid credentials.");
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("An error occurred. Please try again.");
        }
    });

    // 🔵 Handle Registration
    document.getElementById("registerForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("register-username").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value.trim();

        if (!username || !email || !password) {
            alert("All fields are required.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Registration successful! Please log in.");
            } else {
                alert(data.error || "Registration failed.");
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert("An error occurred. Please try again.");
        }
    });

    // 🟠 Handle Forgot Password (Placeholder Function)
    document.getElementById("forgotPasswordForm").addEventListener("submit", function (event) {
        event.preventDefault();
        alert("Password reset link sent to your email! (Functionality not implemented yet)");
    });
});
