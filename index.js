require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const cookie = require("cookie");

const db = require('./db/db');

const authRepository = require('./repositories/authRepository');
const userRepository = require('./repositories/userRepository');
const songsRepository = require('./repositories/songsRepository');
const artistRepository = require('./repositories/artistRepository');

const PORT = process.env.PORT;

function serveStaticFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500);
            res.end('Error occurred');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}

function parseCookies(cookieHeader) {
    const cookies = {};
    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const [key, value] = cookie.trim().split('=');
            cookies[key] = decodeURIComponent(value);
        });
    }
    return cookies;
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'GET') {
        if (parsedUrl.pathname.startsWith('/public/')) {
            const filePath = path.join(__dirname, parsedUrl.pathname);
            const ext = path.extname(filePath);
            const contentType = ext === '.js' ? 'text/javascript' : ext === '.css' ? 'text/css' : 'text/plain';
            return serveStaticFile(res, filePath, contentType);
        }

        if (['/', '/login'].includes(parsedUrl.pathname)) {
            const cookies = parseCookies(req.headers.cookie);
            if (cookies.token) {
                try {
                    await authRepository.verifyToken(cookies.token);
                    res.writeHead(302, { Location: '/dashboard' });
                    return res.end();
                } catch { }
            }
            return serveStaticFile(res, path.join(__dirname, 'views', 'login.html'), 'text/html');
        }

        const pages = {
            '/register': 'register.html',
            '/artistForm': 'artistForm.html',
            '/songForm': 'songForm.html',
            '/userForm': 'userForm.html',
            '/dashboard': 'dashboard.html',
            '/artistSongs' : 'artistSongs.html',
            '/test' : 'test.html',
            '/login' : 'login.html'
        };

        if (pages[parsedUrl.pathname]) {
            const cookies = parseCookies(req.headers.cookie);
            if (parsedUrl.pathname === '/dashboard' ) {
                if (cookies.token) {
                    try {
                        await authRepository.verifyToken(cookies.token);
                        return serveStaticFile(res, path.join(__dirname, 'views', 'dashboard.html'), 'text/html');
                    } catch {
                        res.writeHead(302, { Location: '/login' });
                        return res.end();
                    }
                }
            }
            return serveStaticFile(res, path.join(__dirname, 'views', pages[parsedUrl.pathname]), 'text/html');
        }

        if (parsedUrl.pathname === '/users') {
            const queryParams = new URLSearchParams(parsedUrl.query);
            const page = parseInt(queryParams.get('page')) || 1;
            const limit = parseInt(queryParams.get('limit')) || 5;
          
            try {
                const { users, totalUsers } = await userRepository.listUsers(page, limit);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ items: users, totalItems: totalUsers }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error fetching users', error: error.message }));
            }
        }
        
        if (parsedUrl.pathname === '/songs') {
            const queryParams = new URLSearchParams(parsedUrl.query);
            const page = parseInt(queryParams.get('page')) || 1;
            const limit = parseInt(queryParams.get('limit')) || 5;
            
            const cookies = parseCookies(req.headers.cookie);
            console.log(atob(cookies.role));
            
            const role = cookies.role;

            // atob(text)
            let songsData;

            try {
                if (role === "artist") {
                    songsData = await songsRepository.listSongsByArtist(id, page, limit);
                }
                else if (role === "artist_manager") {
                    songsData = await songsRepository.listSongsUnderArtistManager(id, page, limit);
                } 
                else {
                    songsData = await songsRepository.listSongs(page, limit);
                }
            
                const { songs, totalSongs } = songsData;

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ items: songs, totalItems: totalSongs }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error fetching songs', error: error.message }));
            }
        }

        if (parsedUrl.pathname === '/artists') {
            const queryParams = new URLSearchParams(parsedUrl.query);
            const page = parseInt(queryParams.get('page')) || 1;
            const limit = parseInt(queryParams.get('limit')) || 5;
          
            try {
                const { artists, totalArtists } = await artistRepository.listArtists(page, limit);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ items: artists, totalItems: totalArtists }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error fetching artists', error: error.message }));
            }
        }
        
        if (parsedUrl.pathname === '/artistSongsById') {
            const queryParams = new URLSearchParams(parsedUrl.query);
            const artistId = queryParams.get("artistId");

            try {
                if (!artistId) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Missing artistId parameter' }));
                    return;
                }
                const page = parseInt(queryParams.get("page")) || 1;
                const limit = parseInt(queryParams.get("limit")) || 5;

                const { songs, totalSongs } = await songsRepository.listSongsByArtist(artistId, page, limit);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ items: songs, totalItems: totalSongs }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: error.message }));
            }
            return;
        }
        
        if (parsedUrl.pathname === '/listArtistById') {
            try {
                const queryParams = new URLSearchParams(parsedUrl.query);
                const artistId = queryParams.get("artistId");
                if (!artistId) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Missing artistId parameter' }));
                    return;
                }
                const { artists } = await artistRepository.listArtistById(artistId);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ items: artists }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: error.message }));
            }
            return;
        }

        if (parsedUrl.pathname === '/listSongById') {
            try {
                const queryParams = new URLSearchParams(parsedUrl.query);
                const songId = queryParams.get("songId");
                if (!songId) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Missing songId parameter' }));
                    return;
                }
                const { songs } = await songsRepository.listSongById(songId);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ items: songs }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: error.message }));
            }
            return;
        }

        if(parsedUrl.pathname === '/logout'){
            const cookies = parseCookies(req.headers.cookie);
            console.log(cookies);
        }

        if (parsedUrl.pathname === '/artistsList') {
            try {
                debugger;
                const { rows: artists } = await db.query('SELECT id, name FROM artists ORDER BY name');
                res.writeHead(200, { 'Content-Type': 'application/json' });
              
                res.end(JSON.stringify({ artists }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error fetching artists', error: error.message }));
            }
        }

        if (parsedUrl.pathname === '/managersList') {
            try {
                const { rows: managers } = await db.query("select id, first_name || ' ' || last_name as name from users where role = 'artist_manager';");
                res.writeHead(200, { 'Content-Type': 'application/json' });
              
                return { managers }
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Error fetching artists', error: error.message }));
            }
        }  

        if (parsedUrl.pathname === '/artists/export') {
            const { rows: artists } = await db.query('SELECT name, dob, gender, address, first_release_year, no_of_albums_released FROM artists ORDER BY id');
            const header = "name,dob,gender,address,first_release_year,no_of_albums_released";
            const csvRows = artists.map(artist => {
            const dob = artist.dob ? artist.dob.toISOString().split('T')[0] : "";
            return [artist.name, dob, artist.gender || "", artist.address || "", artist.first_release_year || "", artist.no_of_albums_released || 0].join(",");
            });
            const csvData = header + "\n" + csvRows.join("\n");
            res.writeHead(200, {
                "Content-Type": "text/csv",
                "Content-Disposition": "attachment; filename=artists.csv"
            });
            res.end(csvData);

        }
    }

    // Handle POST requests
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', async () => {
            try {
                if (req.url === '/artists/import') {
                    const lines = body.split("\n").map(line => line.trim()).filter(line => line);
                    if (lines.length < 2) {
                        res.writeHead(400, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ message: "CSV data is empty or missing header" }));
                    }
                    const header = lines[0].split(",").map(h => h.trim());
                    const requiredColumns = ["name", "dob", "gender", "address", "first_release_year", "no_of_albums_released"];
                    for (const col of requiredColumns) {
                        if (!header.includes(col)) {
                        res.writeHead(400, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ message: `Missing required column: ${col}` }));
                        }
                    }
                    for (let i = 1; i < lines.length; i++) {
                        const values = lines[i].split(",").map(v => v.trim());
                        const artistData = {};
                        header.forEach((col, idx) => { artistData[col] = values[idx]; });

                        console.log(JSON.stringify(artistData));
                        await artistRepository.createArtist(JSON.stringify(artistData));
                    }
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "Artists imported successfully" }));
                }

                if (req.url === '/register') {
                    await authRepository.register(body);
                    res.writeHead(302, { Location: '/login' });
                    return res.end();
                }
                if (req.url === '/login') {
                    const result = await authRepository.login(body);
                    const parsedResult = JSON.parse(result);
                    try{
                        if(parsedResult.error) {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            return res.end(JSON.stringify({ message: parsedResult.error }));
                        }
                            res.writeHead(200, {
                                "Content-Type": "application/json",
                                "Set-Cookie": [
                                    `token=${parsedResult.token};`,
                                    `userid=${encrypt(parsedResult.user.id)};`,
                                    `role=${encrypt(parsedResult.user.role)};`
                                ]
                            });
                        res.end(JSON.stringify({
                            token: parsedResult.token,
                            user: {
                                id: parsedResult.user.id,
                                role: parsedResult.user.role
                            }
                        }));
                    }
                    catch (error){
                      console.log("Error while writing head: " + error);
                    }
                    return res.end();
                }
                if (req.url === '/logout') {
                    res.writeHead(302, { 
                        "Set-Cookie": [
                            "token=; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
                            "userid=; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
                            "role=; Max-Age=0; HttpOnly; Secure; SameSite=Lax"
                        ],
                        "Location": "/login"
                    });
                    return res.end();
                }

                if(req.url === '/artists'){
                    await artistRepository.createArtist(body);
                    res.writeHead(302, { Location: '/dashboard' });
                    return res.end();
                }

                if(req.url === '/updateArtist'){
                    await artistRepository.updateArtist(body);
                    res.writeHead(302, { Location: '/dashboard' });
                    return res.end();
                }

                if(req.url === '/users'){
                    await userRepository.createUser(body);
                    res.writeHead(302, { Location: '/dashboard' });
                    return res.end();
                }

                if(req.url === '/updateUser'){
                    await userRepository.updateUser(body);
                    res.writeHead(302, { Location: '/dashboard' });
                    return res.end();
                }

                if(req.url === '/songs'){
                    await songsRepository.createSong(body);
                    res.writeHead(302, { Location: '/dashboard' });
                    return res.end();
                }

                if(req.url === '/updateSong'){
                    console.log(body);
                    await songsRepository.updateSong(body);
                    res.writeHead(302, { Location: '/dashboard' });
                    return res.end();
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                return res.end(error.message);
            }
        });
    }
});

function encrypt(text) {
    return btoa(text.toString());
}
  
function decrypt(text) {
    return atob(text);
}

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});