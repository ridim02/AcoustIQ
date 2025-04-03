window.addEventListener('DOMContentLoaded', () => {
  const cookies = parseCookies(document.cookie);
  const userId = atob(cookies.userid);
  const role = atob(cookies.role);

  if (role === "super_admin") {
    fetchData("/users", "usersTable", ["id", "first_name", "last_name", "email", "phone", "dob", "gender", "address", "role", "created_at"], 1, 5);
    fetchData("/artists", "artistsTable", ["id", "name", "dob", "gender", "address", "first_release_year", "no_of_albums_released", "created_at"], 1, 5);
    fetchData("/songs", "songsTable", ["id", "name", "title", "album_name", "genre", "created_at"], 1, 5);
  } else {
    window.location.href = 'forbidden';
  }

});  

function encrypt(text) {
  return btoa(text.toString());
}

function decrypt(text) {
  return atob(text);
}

function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

async function fetchUserData(id) {
  try {
    const response = await fetch(`/users/${id}`);
    const user = await response.json();

    document.getElementById("first_name").value = user.first_name || "";
    document.getElementById("last_name").value = user.last_name || "";
    document.getElementById("email").value = user.email || "";
    document.getElementById("phone").value = user.phone || "";
    document.getElementById("dob").value = user.dob || "";
    document.getElementById("gender").value = user.gender || "";
    document.getElementById("address").value = user.address || "";
    document.getElementById("role").value = user.role || "";
    
    if (user.role === "artist") {
      document.getElementById("managedByContainer").style.display = "block";
      document.getElementById("managed_by").value = user.managed_by || "";
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

async function fetchManagers() {
  try {
    const response = await fetch('/managersList');
    const managers = await response.json();
    
    const managerDropdown = document.getElementById("managed_by");
    managerDropdown.innerHTML = '<option value="">Select Manager</option>';

    managers.managers.forEach(manager => {
      const option = document.createElement("option");
      option.value = manager.id;
      option.textContent = manager.name;
      managerDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching managers:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const encryptedId = getQueryParam("userId");
  const userForm = document.getElementById("userForm");

  if (encryptedId) {
    const userId = decrypt(encryptedId);
    fetchUserData(userId);
  }

  document.getElementById("email").addEventListener("input", function () {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.setCustomValidity(emailRegex.test(this.value) ? "" : "Please enter a valid email address.");
  });

  document.getElementById("confirm_password").addEventListener("input", function () {
    const password = document.getElementById("password").value;
    this.setCustomValidity(this.value === password ? "" : "Passwords do not match.");
  });

  userForm.addEventListener("submit", async (e) => {
    debugger;
    e.preventDefault();

    const formData = {
      first_name: document.getElementById("first_name").value,
      last_name: document.getElementById("last_name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      phone: document.getElementById("phone").value,
      dob: document.getElementById("dob").value,
      gender: document.getElementById("gender").value,
      address: document.getElementById("address").value,
      role: document.getElementById("role").value
    };

    const method = "POST";
    const url = encryptedId ? `/users/${decrypt(encryptedId)}` : "/users";
    
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      window.location.href = "dashboard";
    } else {
      console.error("Error submitting form");
    }
  });
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