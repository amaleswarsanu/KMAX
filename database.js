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
        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
    );
`);

// Insert default movies if table is empty
const movieCount = db.prepare('SELECT COUNT(*) as count FROM movies').get().count;

if (movieCount === 0) {
    const insertMovie = db.prepare(`
        INSERT INTO movies (title, genre, rating, duration, synopsis, image, backdrop, price_bed, price_chair, format, cast)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Seed Data: REQUIRED for Render Free Tier (Ephemeral Storage)
    // Since the filesystem resets, we must re-insert default movies on every restart 
    // to ensure the site isn't empty.

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

    insertMovie.run(
        "Dune: Part Two",
        "Sci-Fi/Adventure",
        4.9,
        "166 min",
        "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators.",
        "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1976&auto=format&fit=crop",
        60,
        30,
        "2D, IMAX 3D",
        JSON.stringify(["Timothée Chalamet", "Zendaya"])
    );
}

module.exports = db;
