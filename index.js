require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

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
            '/test' : 'test.html'
        };

        if (pages[parsedUrl.pathname]) {
            const cookies = parseCookies(req.headers.cookie);
            if (parsedUrl.pathname === '/dashboard' && cookies.token) {
                try {
                    await authRepository.verifyToken(cookies.token);
                    return serveStaticFile(res, path.join(__dirname, 'views', 'dashboard.html'), 'text/html');
                } catch {
                    res.writeHead(302, { Location: '/login' });
                    return res.end();
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
          
            try {
                const { songs, totalSongs } = await songsRepository.listSongs(page, limit);
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
            try {
                const queryParams = new URLSearchParams(parsedUrl.query);
                const artistId = queryParams.get("artistId");
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
    }

    // Handle POST requests
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', async () => {
            try {
                if (req.url === '/register') {
                    await authRepository.register(body);
                    res.writeHead(302, { Location: '/login' });
                    return res.end();
                }
                if (req.url === '/login') {
                    const result = await authRepository.login(body);
                    const parsedResult = JSON.parse(result);
                    try{
                        res.setHeader('Access-Control-Expose-Headers', 'Userid, Role');
                        res.writeHead(302, {
                          'Set-Cookie': `token=${parsedResult.token}; HttpOnly; Secure; SameSite=Lax HttpOnly; Secure; SameSite=Lax`,
                          Location: '/dashboard',
                          'userid': parsedResult.user.id,
                          'role': parsedResult.user.role
                        });
                    }
                    catch(err){
                      console.log("Error while writing head: " + err);
                    }
                    return res.end();
                }
                if (req.url === '/logout') {
                    res.writeHead(302, { 'Set-Cookie': 'token=; Max-Age=0', Location: '/login' });
                    return res.end();
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                return res.end(error.message);
            }
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});