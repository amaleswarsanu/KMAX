const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// API Routes

// Get all movies
app.get('/api/movies', (req, res) => {
    try {
        const movies = db.prepare('SELECT * FROM movies').all();
        res.json(movies.map(m => ({
            ...m,
            cast: JSON.parse(m.cast || '[]'),
            price: { bed: m.price_bed, chair: m.price_chair }
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a movie
app.post('/api/movies', upload.single('image'), (req, res) => {
    try {
        const { title, genre, rating, duration, synopsis, price_bed, price_chair, format, cast } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

        const info = db.prepare(`
            INSERT INTO movies (title, genre, rating, duration, synopsis, image, backdrop, price_bed, price_chair, format, cast)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(title, genre, rating, duration, synopsis, image, image, price_bed, price_chair, format, cast);

        res.json({ id: info.lastInsertRowid, message: 'Movie added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a movie
app.delete('/api/movies/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM movies WHERE id = ?').run(req.params.id);
        res.json({ message: 'Movie deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all bookings
app.get('/api/bookings', (req, res) => {
    try {
        const bookings = db.prepare(`
            SELECT b.*, m.title as movie_title, m.image as movie_image 
            FROM bookings b 
            JOIN movies m ON b.movie_id = m.id
        `).all();
        res.json(bookings.map(b => ({
            ...b,
            seats: JSON.parse(b.seats),
            movie: { title: b.movie_title, image: b.movie_image }
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a booking
app.post('/api/bookings', (req, res) => {
    try {
        const { id, movie_id, seats, total, date, time } = req.body;
        db.prepare(`
            INSERT INTO bookings (id, movie_id, seats, total, date, time)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(id, movie_id, JSON.stringify(seats), total, date, time);
        res.json({ message: 'Booking successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
