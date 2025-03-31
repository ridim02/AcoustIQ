require('dotenv').config();
const db = require('../db/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

async function register(data) {
    try {
        data = JSON.parse(data);
        console.log(data);
        const { first_name, last_name, email, password, role } = data;
        if (!password) throw new Error("Password is required");

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        const query = `INSERT INTO users (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role;`;
        const { rows } = await db.query(query, [first_name, last_name, email, hashedPassword, role]);
        
        return rows[0];
    } catch (error) {
        console.error("Register Error:", error);
    }
}

async function login(data) {
    try{
        data = JSON.parse(data);
        
        const { email, password } = data;
        const query = `SELECT id, email, role, password FROM users WHERE email = $1`;
        const { rows } = await db.query(query, [email]);
        if (rows.length === 0) throw new Error('Invalid credentials');
    
        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new Error('Invalid credentials');
        }
    
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        var resultData = {
            token: token,
            user: {
                id: user.id, 
                email: user.email, 
                role: user.role
            }
        }
    }
    catch (error){
        console.log("Login error: " + error);
    }
    return JSON.stringify(resultData);
}

async function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded);
        });
    });
}

function checkRole(requiredRoles) {
    return async (req, res, next) => {
        try {
            const cookies = parseCookies(req);
            if (!cookies.token) throw new Error("Unauthorized");

            const decoded = await verifyToken(cookies.token);
            if (!requiredRoles.includes(decoded.role)) {
                res.writeHead(403, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ error: "Forbidden: Access denied" }));
            }

            req.user = decoded;
            next();
        } catch (error) {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Unauthorized" }));
        }
    };
}

function parseCookies(req) {
    const cookies = {};
    req.headers.cookie?.split(";").forEach(cookie => {
        const [name, value] = cookie.trim().split("=");
        cookies[name] = decodeURIComponent(value);
    });
    return cookies;
}

module.exports = {
  register, login, verifyToken, checkRole
};
