require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const authRepository = require('./repositories/authRepository');

const PORT = process.env.PORT;

// to server static files like html, css, js and image files
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
  const parsedUrl = url.parse(req.url);

  if (req.method === 'GET') {
    // for js, css and image files
    if (parsedUrl.pathname.startsWith('/public/')) {
      const filePath = path.join(__dirname, parsedUrl.pathname);
      const ext = path.extname(filePath);
      const contentType = ext === '.js' ? 'text/javascript' : ext === '.css'
        ? 'text/css' : 'text/plain';
      return serveStaticFile(res, filePath, contentType);
    }

    if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/login') {
      const cookies = parseCookies(req.headers.cookie);
      const token = cookies.token;
      if (token) {
        try {
          await authRepository.verifyToken(token);
          res.writeHead(302, { Location: '/dashboard' });
          return res.end();
        } catch {}
      }
      return serveStaticFile(res, path.join(__dirname, 'views', 'login.html'), 'text/html');
    }
    if (parsedUrl.pathname === '/register') {
      return serveStaticFile(res, path.join(__dirname, 'views', 'register.html'), 'text/html');
    }
    if (parsedUrl.pathname === '/dashboard') {
        const cookies = {};
        if(req.headers.cookie){
            req.headers.cookie.split(';').forEach(cookie => {
                const [key, value] = cookie.trim().split('=');
                cookies[key] = decodeURIComponent(value);
            });
        }
      
        const token = cookies.token;

        try {
            await authRepository.verifyToken(token);
            return serveStaticFile(res, path.join(__dirname, 'views', 'dashboard.html'), 'text/html');
        } catch {
            res.writeHead(302, { Location: '/login' });
            return res.end();
        }
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
