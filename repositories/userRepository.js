const db = require('../db/db');

// Basic CRUD operations for User

async function listUsers(page = 1, limit = 5) {
    try {
        const offset = (page - 1) * limit;
        const query = `SELECT * FROM users ORDER BY id LIMIT $1 OFFSET $2`;
        const { rows: users } = await db.query(query, [limit, offset]);

        const countQuery = 'SELECT COUNT(*) FROM users';
        const { rows: countResult } = await db.query(countQuery);
        const totalUsers = parseInt(countResult[0].count, 10);

        return { users, totalUsers };
    } catch (error) {
        console.error("Error while listing users:", error);
        return { users: [], totalUsers: 0 };
    }
}

async function createUser(data) {
    const { first_name, last_name, email, password, role, phone, dob, gender, address } = data;
    const query = `
        INSERT INTO users (first_name, last_name, email, password, role, phone, dob, gender, address)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, email, role
    `;
    const { rows } = await db.query(query, [first_name, last_name, email, password, role, phone, dob, gender, address]);
    return rows[0];
}

async function updateUser(id, data) {
    const { first_name, last_name, email, role } = data;
    const query = `
        UPDATE users SET first_name=$1, last_name=$2, email=$3, role=$4, updated_at=NOW()
        WHERE id=$5 
        RETURNING id, email, role
    `;
    const { rows } = await db.query(query, [first_name, last_name, email, role, id]);
    return rows[0];
}

async function deleteUser(id) {
    const query = `DELETE FROM users WHERE id = $1`;
    await db.query(query, [id]);
    return true;
}

module.exports = {
    listUsers, createUser, updateUser, deleteUser,
};