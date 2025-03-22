CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(500) NOT NULL,
    phone VARCHAR(20),
    dob DATE,
    gender CHAR(1) CHECK (gender IN ('m', 'f', 'o')),
    address VARCHAR(255),
    role-type VARCHAR(20) CHECK (role IN ('super_admin', 'artist_manager', 'artist')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dob DATE,
    gender CHAR(1) CHECK (gender IN ('m', 'f', 'o')),
    address VARCHAR(255),
    first_release_year INT,
    no_of_albums_released INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE songs (
    id SERIAL PRIMARY KEY,
    artist_id INT REFERENCES artists(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    album_name VARCHAR(255) NOT NULL,
    genre VARCHAR(20) CHECK (genre IN ('rnb', 'country', 'classic', 'rock', 'jazz')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);