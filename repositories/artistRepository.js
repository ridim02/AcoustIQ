const db = require('../db/db');

// Basic CRUD operations for Artists

async function listArtists(page = 1, limit = 5) {
    try {
        const offset = (page - 1) * limit;
        
        const query = `SELECT * FROM artists ORDER BY id LIMIT $1 OFFSET $2`;
        const { rows: artists } = await db.query(query, [limit, offset]);
    
        const countQuery = 'SELECT COUNT(*) FROM artists';
        const { rows: countResult } = await db.query(countQuery);
        const totalArtists = parseInt(countResult[0].count, 10);
  
      return { artists, totalArtists };
    } 
    catch (error) {
        console.error("Error while listing artists:", error);
        return { artists: [], totalArtists: 0 };
    }
  }

async function listArtistById(artistId) {
    try{
        const offset = (page - 1) * limit;
        
        const query = `SELECT * FROM artists WHERE id = $1 ORDER BY id LIMIT $2 OFFSET $3`;
        const { rows: artists } = await db.query(query, [artistId, limit, offset]);
    
        const countQuery = 'SELECT COUNT(*) FROM artists';
        const { rows: countResult } = await db.query(countQuery);
        const totalArtists = parseInt(countResult[0].count, 10);
  
        return { artists, totalArtists };
    }
    catch (error) {
        console.error("Error while fetching artist by ID: " + error);
    }
}

async function listSongsByArtist(artistId) {
    const query = `SELECT * FROM songs WHERE artist_id=$1`;
    const { rows } = await db.query(query, [artistId]);
    return rows;
}

async function createArtist(data) {
    try{
        data = JSON.parse(data);
        const { name, dob, gender, address, first_release_year, no_of_albums_released, managed_by, user_id } = data;
        const query = `
            INSERT INTO artists (name, dob, gender, address, first_release_year, no_of_albums_released, managed_by, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const { rows } = await db.query(query, [name, dob, gender, address, first_release_year, no_of_albums_released || 0, managed_by, user_id]);
        return rows[0];
    }
    catch (error) {
        console.error("Error while saving artists: " + error);
    }
}

async function updateArtist(data) {
    try{
        data = JSON.parse(data);
        
        const { id, name, dob, gender, address, first_release_year, no_of_albums_released } = data;
        const query = `
            UPDATE artists SET name=$1, dob=$2, gender=$3, address=$4,
            first_release_year=$5, no_of_albums_released=$6, updated_at=NOW()
            WHERE id=$7 RETURNING *
        `;
        
        const { rows } = await db.query(query, [name, dob, gender, address, first_release_year, no_of_albums_released, id]);
        return rows[0];
    }
    catch(error){
        console.error("Error in updating artists: " + error);
    }
}

async function deleteArtist(id) {
    const query = `DELETE FROM artists WHERE id=$1`;
    await db.query(query, [id]);
    return true;
}

async function listArtistsUnderArtistManager(managerid, page = 1, limit = 5) {
    try {
        const offset = (page - 1) * limit;
        const query = `SELECT * FROM artists WHERE managed_by = $1 ORDER BY artists.id LIMIT $2 OFFSET $3`;
        const { rows: artists } = await db.query(query, [managerid, limit, offset]);

        const countQuery = `SELECT COUNT(*) FROM artists WHERE managed_by = $1`;
        const { rows: countResult } = await db.query(countQuery, [managerid]);
        
        const totalArtists = parseInt(countResult[0].count, 10);
        return { artists, totalArtists };
    }
    catch (error) {
        console.error(`Error while listing artists by artist under manager: ${managerid} - ${error}`);
    }
}

module.exports = {
    listArtists, listArtistById, listSongsByArtist, createArtist, updateArtist, deleteArtist, listArtistsUnderArtistManager
};