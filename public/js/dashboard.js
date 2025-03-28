function toggleSubmenu(id, element) {
    const submenu = document.getElementById(id);
    submenu.classList.toggle('open');
    document.querySelectorAll('.menu-item').forEach(item => {
      if (item !== element) item.classList.remove('active');
    });
    element.classList.toggle('active');
  }
  
    window.addEventListener('DOMContentLoaded', () => {
        const firstMenu = document.querySelector('.menu-item');
        if (firstMenu) {
        firstMenu.classList.add('active');
        const onclickAttr = firstMenu.getAttribute('onclick');
        const match = onclickAttr.match(/toggleSubmenu\('([^']+)'/);
        if (match) {
            const submenu = document.getElementById(match[1]);
            if (submenu) submenu.classList.add('open');
        }
    }
});  

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
}

function editArtist(encryptedArtistId) {
  window.location.href = `artistForm?artistId=${encryptedArtistId}`;
}

function editSong(encryptedSongId) {
  window.location.href = `songForm?songId=${encryptedSongId}`;
}