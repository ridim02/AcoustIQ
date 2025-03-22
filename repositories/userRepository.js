const db = require('../db');

// Basic CRUD operations for User

async function CreateUser(data) {
    const { first_name, last_name, email, password, role } = data;
    const query = `
        INSERT INTO users (first_name, last_name, email, password, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, role
    `;
    const { rows } = await db.query(query, [first_name, last_name, email, password, role]);
    return rows[0];
}

async function UpdateUser(id, data) {
    const { first_name, last_name, email, role } = data;
    const query = `
        UPDATE users SET first_name=$1, last_name=$2, email=$3, role=$4, updated_at=NOW()
        WHERE id=$5 
        RETURNING id, email, role
    `;
    const { rows } = await db.query(query, [first_name, last_name, email, role, id]);
    return rows[0];
}

async function DeleteUser(id) {
    const query = `DELETE FROM users WHERE id = $1`;
    await db.query(query, [id]);
    return true;
}

module.exports = {
    CreateUser, UpdateUser, DeleteUser,
};