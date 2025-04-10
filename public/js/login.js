document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const userData = {
        email: email,
        password: password
    };
    const body = JSON.stringify(userData);

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: body,
        });
        
        const data = await response;
        if (response.ok) {
            const cookies = parseCookies(document.cookie);
            const userId = atob(cookies.userid);
            const role = atob(cookies.role);
            
            alert(`Logged in with user: ${userId} with role ${role}`);
            // document.cookie = `token=${data.token};`;
            window.location.href = "dashboard";
        } else {
            alert(data.message || "Login failed.");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Login failed. Please try again.");
    }
});  

function parseCookies(cookieHeader) {
    const cookies = {};
    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const [key, value] = cookie.trim().split('=');
            cookies[key] = decodeURIComponent(value);
        });
    }
    return cookies;
}