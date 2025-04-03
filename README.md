
# acoustIQ

***acoustIQ*** is a basic Artist Management System which implements a Role Based Access Control (RBAC) system where users: super_admin, artist_manager and artists can access certain pages according to their privilege levels.

***Repository pattern*** is used to develop this system. In this system, repositories such as `authRepository`, `userRepository`, `csvRepository` are used to contain helper functions which are used to query the database and return rows or perform certain tasks such as verifying JWT token, setting cookies, etc. 

_This also helps to implement the **Separation of Concern** design pattern_

### Technologies used:
- **JavaScript** with **Nodejs** as the runtime
- **PostgreSQL** for database and **pg** package
- **JSON Web Token (JWT)** for authentication
- **Fetch API** for connecting the serverside and clientside and vice-versa
- **Cookies** for state management
- **JSON** to transfer data from the serverside to clientside and vice-versa
- **dotenv** to store sensitive environment variables such as database connection credentials, JWT secret token, salt round, etc.
- **bcrypt** for password hashing to store in database 

## Pages
The following is a list of the pages and what they do in the system:

### index.js
The `index.js` page is the entry page to the system, which means the Nodejs server is run by referencing this page as:

```nodejs
nodemon index.js
```

This command runs the server on port 9000.

This page does a lot of things. They are listed as follows:
- Serve static files such as html, css and js files to the browser.
- Create API endpoints to handle calls from Fetch API
- Act as a middleware between the clientside (html pages) and serverside (repos)
- Handle `POST` and `GET` requests separately and call the requirements in the repositories.

### dashboard
The dashboard page, like in all Management Information Systems is used to show an overview of the overall functioning of the system.
The dashboard page consists of, based upon the level of authorization, upto three tables.

*The `super_admin` role can access and perform CRUD operations on all the tables below.* 

The following is the list of tables along with the user roles that can view them:

- users [super_admin]: 
    - The users table is used to list the users that are in the database. This table is visible only to the `super_admin`. They can perform CRUD operations on this table. 

- artists [super_admin, artist_manager]:
    - The `artists` tables consists of records of the artists in the system. In this table, the name of the artist, debut year and number of albums by the artist is shown.
    - The `artist_manager` user can only view the artists that are under them or assigned to them and perform CRUD operations on them. 
    - The `super_admin` role can view all the artists present and perform CRUD operations on them. 
    - You can also click on a certain artist's name and be redirected to another which where a list of songs by that particular artist is shown.
    - The table also contains buttons to either import artists from a CSV file to the system or export the records of the system to a CSV file and download it.

- songs [super_admin, artist_manager, artist]:
    - The songs table, also similarly, is used to display songs along with the artist who the song belongs to.
    - For `artists`, only the songs that belong to the artist themselves are visible.
    - For `artist_manager`, only the songs that belong to the artist that they manage are visible
    - The `super_admin` role can view all the songs present and perform CRUD operations on them.

The dashboard also contains a sidebar which has links to create a new record in a specific table or delete them.

A logout button is also present which is used to log the user out of the system and then are redirected to the login page.

*Only logged in users can access the dashboard page.*

### artistSongs
This page, as the name suggests, shows the list of songs for a certain artist. 
- The artist who's songs are to be displayed is identified by the encrypted querystring that has been passed in the `GET` request.

### artistForm, songForm and userForm
These pages, as the name suggests, are forms that are used to create a new record, or edit an existing record in the system.
- If an encrypted `id` parameter is passed as a querystring to the page, then the page updates the record, else a new record is inserted into the database.
