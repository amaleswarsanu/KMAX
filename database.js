const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'kmax.db'));

// Initialize Database Schema
db.exec(`
    CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        genre TEXT,
        rating REAL,
        duration TEXT,
        synopsis TEXT,
        image TEXT,
        backdrop TEXT,
        price_bed REAL,
        price_chair REAL,
        format TEXT,
        cast TEXT
    );

    CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        movie_id INTEGER,
        seats TEXT,
        total REAL,
        date TEXT,
        time TEXT,
        FOREIGN KEY (movie_id) REFERENCES movies(id)
    );
`);

// Insert default movies if table is empty
const movieCount = db.prepare('SELECT COUNT(*) as count FROM movies').get().count;

if (movieCount === 0) {
    const insertMovie = db.prepare(`
        INSERT INTO movies (title, genre, rating, duration, synopsis, image, backdrop, price_bed, price_chair, format, cast)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Default movies removed to prevent reappearing on server restart.
    // To add permanent movies, use the Admin Portal (Note: on Render Free Tier, these will reset daily)
    // or uncomment and edit the lines below to seed specific movies.

    /*
    insertMovie.run(
        "Interstellar",
        "Sci-Fi",
        4.8,
        "169 min",
        "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop",
        50,
        25,
        "2D, IMAX",
        JSON.stringify(["Matthew McConaughey", "Anne Hathaway"])
    );
    */
}

module.exports = db;
