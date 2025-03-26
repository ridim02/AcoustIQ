const db = require('../db/db');

async function listSongs(page, limit) {
    try {
        const offset = (page - 1) * limit;
        
        const query = `SELECT * FROM songs LEFT JOIN artists ON artists.id = songs.artist_id ORDER BY songs.id LIMIT $1 OFFSET $2`;
        const { rows: songs } = await db.query(query, [limit, offset]);
        
        const countQuery = 'SELECT COUNT(*) FROM songs';
        const { rows: countResult } = await db.query(countQuery);
        const totalSongs = parseInt(countResult[0].count, 10);

        return { songs, totalSongs };
    }
    catch (error) {
        console.error("Error while listing songs: " + error);
    }
}

async function listSongById(songId) {
    try{
        const query = `SELECT * FROM songs WHERE id=$1`;
        const { rows: songs } = await db.query(query, [songId]);
        return { songs };
    }
    catch (error) {
        console.error("Error while fetching song by ID: " + error);
    }
}
  
async function listSongsByArtist(artistId, page = 1, limit = 5) {
    try {
        const offset = (page - 1) * limit;
        const query = `SELECT * FROM songs LEFT JOIN artists ON artists.id = songs.artist_id WHERE artist_id = $1 ORDER BY songs.id LIMIT $2 OFFSET $3`;
        const { rows: songs } = await db.query(query, [artistId, limit, offset]);
    
        const countQuery = `SELECT COUNT(*) FROM songs WHERE artist_id = $1`;
        const { rows: countResult } = await db.query(countQuery, [artistId]);
    
        const totalSongs = parseInt(countResult[0].count, 10);
        return { songs, totalSongs };
    }
    catch (error) {
        console.error(`Erro while listing songs by artist: ${artistId} - ${error}`);
    }
}

async function createSong(data) {
    try {
        data = JSON.parse(data);
        const { title, album_name, genre } = data;
        const query = `
            INSERT INTO songs (id, title, album_name, genre)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const { rows } = await db.query(query, [title, album_name, genre]);
        return rows[0];
    }
    catch (error) {
        console.error("Error in creating song: " + error);
    }
}

async function updateSong(data) {
    try {
        data = JSON.parse(data);
        const { id, title, album_name, genre } = data;
        const query = `
            UPDATE songs SET title=$1, album_name=$2, genre=$3, updated_at=NOW()
            WHERE id=$4 RETURNING *
        `;
        const { rows } = await db.query(query, [title, album_name, genre, id]);
        return rows[0];
    }
    catch (error) {
        console.error("Error while updating songs: " + error);
    }
}

async function deleteSong(id) {
    const query = `DELETE FROM songs WHERE id=$1`;
    await db.query(query, [id]);
    return true;
}

module.exports = {
    listSongsByArtist, listSongById, listSongs, createSong, updateSong, deleteSong,
};