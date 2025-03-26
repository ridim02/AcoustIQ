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
  
document.addEventListener("DOMContentLoaded", () => {
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
});
  