document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const first_name = document.getElementById("first_name").value;
    const last_name = document.getElementById("last_name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    const userData = {
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: password,
        role: role
    };
    const body = JSON.stringify(userData);
    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: body
        });
        const data = await response.json();
        if (response.ok) {
            alert("Registration successful! Please login.");
            window.location.href = "/login";
        } else {
            alert(data.message || "Registration failed.");
        }
    } catch (error) {
        console.error("Registration error:", error);
        alert("Registration failed. Please try again.");
    }
});