function toggleSubmenu(id, element) {
    const submenu = document.getElementById(id);
    submenu.classList.toggle('open');
    document.querySelectorAll('.menu-item').forEach(item => {
      if (item !== element) item.classList.remove('active');
    });
    element.classList.toggle('active');
  }
  
    window.addEventListener('DOMContentLoaded', () => {
      const cookies = parseCookies(document.cookie);
      const userId = atob(cookies.userid);
      const role = atob(cookies.role);
      configureTableVisibility(role);
    
      if (role === "super_admin") {
        fetchData("/users", "usersTable", ["id", "first_name", "last_name", "email", "phone", "dob", "gender", "address", "role", "created_at"], 1, 5);
        fetchData("/artists", "artistsTable", ["id", "name", "dob", "gender", "address", "first_release_year", "no_of_albums_released", "created_at"], 1, 5);
        fetchData("/songs", "songsTable", ["id", "name", "title", "album_name", "genre", "created_at"], 1, 5);
      } else if (role === "artist_manager") {
        fetchData("/artists", "artistsTable", ["id", "name", "dob", "gender", "address", "first_release_year", "no_of_albums_released", "created_at"], 1, 5);
        fetchData("/songs", "songsTable", ["id", "name", "title", "album_name", "genre", "created_at"], 1, 5);
      } else if (role === "artist") {
        fetchData("/songs", "songsTable", ["id", "name", "title", "album_name", "genre", "created_at"], 1, 5);
      }
    
    });  

function configureTableVisibility(role) {
  const usersTableSection = document.getElementById("usersTable-container");
  const artistsTableSection = document.getElementById("artistsTable-container");
  const songsTableSection = document.getElementById("songsTable-container");

  const usersmenu = document.getElementById("usersmenu");
  const artistsmenu = document.getElementById("artistsmenu");

  usersTableSection.style.display = "none";
  artistsTableSection.style.display = "none";
  songsTableSection.style.display = "none";
  usersmenu.style.display = "none";
  artistsmenu.style.display = "none";
  
  if (role === "super_admin") {
    usersTableSection.style.display = "block";
    artistsTableSection.style.display = "block";
    songsTableSection.style.display = "block";
    usersmenu.style.display = "block";
    artistsmenu.style.display = "block";
  } else if (role === "artist_manager") {
    artistsTableSection.style.display = "block";
    songsTableSection.style.display = "block";
    artistsmenu.style.display = "block";
  } else if (role === "artist") {
    songsTableSection.style.display = "block";
  } else {
    alert("Unauthorized role. Redirecting to login...");
    window.location.href = "/login";
  }
}


async function fetchData(endpoint, tableId, columns, page = 1, limit = 5) {
  try {
    const response = await fetch(`${endpoint}?page=${page}&limit=${limit}`);
    const data = await response.json();

    if (!data || !data.items || !data.totalItems) {
      console.error("Invalid response format:", data);
      return;
    }
    
    const items = data.items;
    const totalItems = data.totalItems;
    const totalPages = Math.ceil(totalItems / limit);

    const tableBody = document.querySelector(`#${tableId} tbody`);
    tableBody.innerHTML = '';

    items.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = columns.map(col => {
        if (tableId === "artistsTable" && col === "name") {
          return `<td><a href="artistSongs?artistId=${encrypt(item.id)}">${item[col] || ''}</a></td>`;
        }
        return `<td>${item[col] || ''}</td>`;
      }).join('');
      if (tableId === "artistsTable") {
        row.innerHTML += `<td><button onclick="editArtist('${encrypt(item.id)}')">Edit</button></td>`;
      }
      if (tableId === "songsTable") {
        row.innerHTML += `<td><button onclick="editSong('${encrypt(item.id)}')">Edit</button></td>`;
      }
      tableBody.appendChild(row);
    });

    updatePaginationControls(endpoint, tableId, columns, page, totalPages, limit);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function updatePaginationControls(endpoint, tableId, columns, currentPage, totalPages, limit) {
  const paginationControls = document.getElementById(`${tableId}-pagination`);
  paginationControls.innerHTML = '';

  if (currentPage > 1) {
    const prevButton = document.createElement("button");
    prevButton.textContent = "Previous";
    prevButton.onclick = () => fetchData(endpoint, tableId, columns, currentPage - 1, limit);
    paginationControls.appendChild(prevButton);
  }

  const pageInfo = document.createElement("span");
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  paginationControls.appendChild(pageInfo);

  if (currentPage < totalPages) {
    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.onclick = () => fetchData(endpoint, tableId, columns, currentPage + 1, limit);
    paginationControls.appendChild(nextButton);
  }
}

function encrypt(text) {
  return btoa(text.toString());
}

function decrypt(text) {
  return atob(text);
}


async function logout(){
  const response = await fetch("/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  window.location.href = 'login';
}

function editArtist(encryptedArtistId) {
  window.location.href = `artistForm?artistId=${encryptedArtistId}`;
}

function editSong(encryptedSongId) {
  window.location.href = `songForm?songId=${encryptedSongId}`;
}

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

document.getElementById("exportBtn").addEventListener("click", () => {
  window.location.href = "/artists/export";
});

document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("csvFileInput").click();
});

document.getElementById("csvFileInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function(e) {
    const csvData = e.target.result;
    try {
      const response = await fetch("/artists/import", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: csvData
      });
      if (response.ok) {
        alert("Artists imported successfully");
      } else {
        const errorData = await response.json();
        alert("Error importing CSV: " + errorData.message);
      }
    } catch (error) {
      console.error("Error uploading CSV file", error);
      alert("Error uploading CSV file");
    }
  };
  reader.readAsText(file);
});
