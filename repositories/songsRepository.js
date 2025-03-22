const db = require('../db/db');

// Basic CRUD operations for Songs

async function listSongsByArtist(artistId) {
    const query = `SELECT * FROM songs WHERE artist_id=$1 ORDER BY id`;
    const { rows } = await db.query(query, [artistId]);
    return rows;
}

async function listSongs() {
    const query = `SELECT * FROM songs`;
    const { rows } = await db.query(query, []);
    return rows;
}

async function createSong(data) {
    const { artist_id, title, album_name, genre } = data;
    const query = `
        INSERT INTO songs (artist_id, title, album_name, genre)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const { rows } = await db.query(query, [artist_id, title, album_name, genre]);
    return rows[0];
}

async function updateSong(id, data) {
    const { title, album_name, genre } = data;
    const query = `
        UPDATE songs SET title=$1, album_name=$2, genre=$3, updated_at=NOW()
        WHERE id=$4 RETURNING *
    `;
    const { rows } = await db.query(query, [title, album_name, genre, id]);
    return rows[0];
}

async function deleteSong(id) {
    const query = `DELETE FROM songs WHERE id=$1`;
    await db.query(query, [id]);
    return true;
}

module.exports = {
    listSongsByArtist,
    listSongs,
    createSong,
    updateSong,
    deleteSong,
};