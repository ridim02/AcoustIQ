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
        const response = await fetch(`/artists/${id}`);
        const artist = await response.json();
        
        document.getElementById("name").value = artist.name;
        document.getElementById("dob").value = artist.dob;
        document.getElementById("gender").value = artist.gender;
        document.getElementById("address").value = artist.address;
        document.getElementById("first_release_year").value = artist.first_release_year;
        document.getElementById("no_of_albums_released").value = artist.no_of_albums_released;
    } catch (error) {
        console.error("Error fetching artist data:", error);
    }
}
  
document.addEventListener("DOMContentLoaded", () => {
    const encryptedId = getQueryParam("artistId");
    const artistForm = document.getElementById("artistForm");
  
    if (encryptedId) {
      const artistId = decrypt(encryptedId);
      fetchArtistData(artistId);
    }
  
    artistForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const formData = {
            name: document.getElementById("name").value,
            dob: document.getElementById("dob").value,
            gender: document.getElementById("gender").value,
            address: document.getElementById("address").value,
            first_release_year: document.getElementById("first_release_year").value,
            no_of_albums_released: document.getElementById("no_of_albums_released").value || 0,
      };
  
      const method = encryptedId ? "PUT" : "POST";
      const url = encryptedId ? `/artists/${decrypt(encryptedId)}` : "/artists";
      
      const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
      });
  
      if (response.ok) {
            window.location.href = "artists.html";
      } else {
            console.error("Error submitting form");
      }
    });
});
  