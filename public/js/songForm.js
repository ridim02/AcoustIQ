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
  
  async function fetchSongData(id) {
    try {
      const response = await fetch(`/songs/${id}`);
      const song = await response.json();
      
      document.getElementById("artist_id").value = song.artist_id;
      document.getElementById("title").value = song.title;
      document.getElementById("album_name").value = song.album_name;
      document.getElementById("genre").value = song.genre;
    } catch (error) {
      console.error("Error fetching song data:", error);
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const encryptedId = getQueryParam("songId");
    const songForm = document.getElementById("songForm");
  
    if (encryptedId) {
      const songId = decrypt(encryptedId);
      fetchSongData(songId);
    }
  
    songForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const formData = {
        artist_id: document.getElementById("artist_id").value,
        title: document.getElementById("title").value,
        album_name: document.getElementById("album_name").value,
        genre: document.getElementById("genre").value,
      };
  
      const method = encryptedId ? "PUT" : "POST";
      const url = encryptedId ? `/songs/${decrypt(encryptedId)}` : "/songs";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        window.location.href = "songs.html";
      } else {
        console.error("Error submitting form");
      }
    });
  });
  