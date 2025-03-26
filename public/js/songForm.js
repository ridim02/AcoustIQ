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
        const response = await fetch(`/listSongById?songId=${id}`);
        const items = await response.json();
        
        document.getElementById("artist_id").value = items.items[0]["id"];
        document.getElementById("title").value = items.items[0]["title"];
        document.getElementById("album_name").value = items.items[0]["album_name"];
        document.getElementById("genre").value = items.items[0]["genre"];

    } catch (error) {
        console.error("Error fetching artist data:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const encryptedId = getQueryParam("songId");
    const songForm = document.getElementById("songForm");

    var url = "";
    var songId = "";
    if (encryptedId) {
      const songId = decrypt(encryptedId);
      fetchSongData(songId);
      url = "/updateSong"
    }
    else url = "/songs"

    songForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const formData = {
            artist_id: document.getElementById("artist_id").value,
            title: document.getElementById("title").value,
            album_name: document.getElementById("album_name").value,
            genre: document.getElementById("genre").value,
        };

        const response = await fetch(url, {
            method: "POST",
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

async function fetchArtists() {
    try {
        const response = await fetch('/artistsList');
        const artists = await response.json();
        
        const artistDropdown = document.getElementById("artist_id");
        artistDropdown.innerHTML = '<option value="">Select an Artist</option>';

        artists.forEach(artist => {
          const option = document.createElement("option");
          option.value = artist.id;
          option.textContent = artist.name;
          artistDropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching artists:", error);
    }
}

document.addEventListener("DOMContentLoaded", fetchArtists);