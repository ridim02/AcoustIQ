function decrypt(text) {
    return atob(text);
  }
  
  function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  }
  
  async function fetchSongsByArtist(artistId, page = 1, limit = 5) {
    try {
      const response = await fetch(`/artistSongsById?artistId=${artistId}&page=${page}&limit=${limit}`);
      const data = await response.json();

      if (!data || !data.items || !data.totalItems) {
        console.error("Invalid response format:", data);
        return;
      }
      const items = data.items;
      const totalItems = data.totalItems;
      const totalPages = Math.ceil(totalItems / limit);
      
      const tableBody = document.querySelector("#songsByArtistTable tbody");
      tableBody.innerHTML = '';
  
      items.forEach(item => {
        const row = document.createElement("tr");
        const artistName = item.name;
        document.getElementById('songsbyartist').textContent = 'Songs by ' + artistName;
        row.innerHTML = `
          <td>${item.id || ''}</td>
          <td>${item.title || ''}</td>
          <td>${item.album_name || ''}</td>
          <td>${item.genre || ''}</td>
          <td>${item.created_at || ''}</td>
        `;
        tableBody.appendChild(row);
      });
      
      updatePaginationControls(artistId, page, totalPages, limit);
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  }
  
  function updatePaginationControls(artistId, currentPage, totalPages, limit) {
    const paginationControls = document.getElementById("songsByArtistTable-pagination");
    paginationControls.innerHTML = '';
    
    if (currentPage > 1) {
      const prevButton = document.createElement("button");
      prevButton.textContent = "Previous";
      prevButton.onclick = () => fetchSongsByArtist(artistId, currentPage - 1, limit);
      paginationControls.appendChild(prevButton);
    }
    
    const pageInfo = document.createElement("span");
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    paginationControls.appendChild(pageInfo);
    
    if (currentPage < totalPages) {
      const nextButton = document.createElement("button");
      nextButton.textContent = "Next";
      nextButton.onclick = () => fetchSongsByArtist(artistId, currentPage + 1, limit);
      paginationControls.appendChild(nextButton);
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const encryptedArtistId = getQueryParam("artistId");
    if (!encryptedArtistId) {
      console.error("Artist id not provided");
      return;
    }
    const artistId = decrypt(encryptedArtistId);
    fetchSongsByArtist(artistId);
  });
  