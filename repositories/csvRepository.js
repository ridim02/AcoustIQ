function exportArtistsCSV(artists) {
    const header = ["name", "dob", "gender", "address", "first_release_year", "no_of_albums_released"];
    const csvHeader = header.join(",");
    const rows = artists.map(artist => {
      const dob = artist.dob ? new Date(artist.dob).toISOString().split("T")[0] : "";
      return [
        artist.name,
        dob,
        artist.gender || "",
        artist.address || "",
        artist.first_release_year || "",
        artist.no_of_albums_released || 0
      ].join(",");
    });
    return csvHeader + "\n" + rows.join("\n");
  }
  
  function importArtistsFromCSV(csvData) {
    const lines = csvData.split("\n").map(line => line.trim()).filter(line => line);
    if (lines.length < 2) throw new Error("CSV does not contain data");
    const header = lines[0].split(",").map(h => h.trim());
    const requiredColumns = ["name", "dob", "gender", "address", "first_release_year", "no_of_albums_released"];
    requiredColumns.forEach(col => {
      if (!header.includes(col)) {
        throw new Error(`Missing required column: ${col}`);
      }
    });
    const artists = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      const artist = {};
      header.forEach((col, idx) => {
        artist[col] = values[idx];
      });
      artists.push(artist);
    }
    return artists;
  }
  
  module.exports = { exportArtistsCSV, importArtistsFromCSV };
  