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
  
async function fetchArtistData(id) {
    try {
        const response = await fetch(`/listArtistById?artistId=${id}`);
        const items = await response.json();
        
        const inputDate = new Date(items.items[0]["dob"]);
        const year = inputDate.getFullYear();
        const month = (inputDate.getMonth() + 1).toString().padStart(2, "0");
        const day = inputDate.getDate().toString().padStart(2, "0");
        
        const formattedDate = `${year}-${month}-${day}`;

        document.getElementById("name").value = items.items[0]["name"];
        document.getElementById("dob").value = formattedDate;
        document.getElementById("gender").value = items.items[0]["gender"];
        document.getElementById("address").value = items.items[0]["address"];
        document.getElementById("first_release_year").value = items.items[0]["first_release_year"];
        document.getElementById("no_of_albums_released").value = items.items[0]["no_of_albums_released"];

    } catch (error) {
        console.error("Error fetching artist data:", error);
    }
}
  
async function fetchManagers() {
    try {
        const cookies = parseCookies(document.cookie);
        const userId = atob(cookies.userid);
        const role = atob(cookies.role);

        if (role === 'artist_manager' || role === 'super_admin') {
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
            if (role === 'artist_manager') {
                managerDropdown.value = userId;
                managerDropdown.disabled = true;
            }
        }
    }
    catch (error) {
        console.error("Error fetching managers:", error);
    }
}

async function fetchUsers() {
    try {
            const response = await fetch('/usersList');
            const users = await response.json();

            const userDropdown = document.getElementById("user_id");
            userDropdown.innerHTML = '<option value="">Select User</option>';

            users.users.forEach(user => {
                const option = document.createElement("option");
                option.value = user.id;
                option.textContent = user.name;
                userDropdown.appendChild(option);
            });
    }
    catch (error) {
        console.error("Error fetching managers:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const cookies = parseCookies(document.cookie);
    const userId = atob(cookies.userid);
    const role = atob(cookies.role);
    
    if (role === 'super_admin' || role === 'artist_manager') {
        fetchManagers();
        fetchUsers();
        const encryptedId = getQueryParam("artistId");
        const artistForm = document.getElementById("artistForm");
        var url = "";
        var artistId = "";
        if (encryptedId) {
        artistId = decrypt(encryptedId);
        fetchArtistData(artistId);
        url = "/updateArtist"
        }
        else url = "/artists";
        artistForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = {
                id: artistId,
                name: document.getElementById("name").value,
                dob: document.getElementById("dob").value,
                gender: document.getElementById("gender").value,
                address: document.getElementById("address").value,
                first_release_year: document.getElementById("first_release_year").value,
                no_of_albums_released: document.getElementById("no_of_albums_released").value || 0,
                managed_by: document.getElementById("managed_by").value,
                user_id: document.getElementById("user_id").value,
            };

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
    
            if (response.ok) {
                window.location.href = "dashboard";
            } else {
                console.error("Error submitting form");
            }
        });
    }
    else {
        window.location.href = '/forbidden'
    }
});