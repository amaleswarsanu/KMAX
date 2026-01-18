const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'kmax.db'));

try {
    const movieCount = db.prepare('SELECT COUNT(*) as count FROM movies').get().count;
    const bookingCount = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
    const movies = db.prepare('SELECT title, genre FROM movies').all();

    console.log('✅ Connection Successful!');
    console.log(`🎥 Total Movies: ${movieCount}`);
    console.log(`🎫 Total Bookings: ${bookingCount}`);
    console.log('--- Movie List ---');
    movies.forEach(m => console.log(`- ${m.title} (${m.genre})`));

} catch (err) {
    console.error('❌ Connection Failed:', err);
}
