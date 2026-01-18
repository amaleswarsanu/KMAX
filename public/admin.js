// Shared State Management (now via API)
let movies = [];
let bookings = [];

// Initial Render
async function init() {
    await renderAdminMovies();
    await fetchTickets();
}

async function renderAdminMovies() {
    try {
        const response = await fetch('/api/movies');
        movies = await response.json();
    } catch (error) {
        console.error('Error fetching movies:', error);
    }

    const list = document.getElementById('admin-movie-list');
    list.innerHTML = movies.map(movie => `
        <div class="admin-movie-item">
            <img src="${movie.image}" class="admin-movie-thumb" alt="${movie.title}">
            <div class="admin-movie-details">
                <span class="admin-movie-title">${movie.title}</span>
                <span class="admin-movie-genre">${movie.genre}</span>
                <div style="font-size: 0.8rem; color: var(--text-muted);">$${movie.price.chair}</div>
            </div>
            <button onclick="window.deleteMovie('${movie.id}')" class="delete-btn"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join('');
}

async function fetchTickets() {
    try {
        const response = await fetch('/api/bookings');
        bookings = await response.json();
    } catch (error) {
        console.error('Error fetching tickets:', error);
    }
}

// Tab Switching
window.switchTab = (tab) => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('onclick').includes(tab)) btn.classList.add('active');
    });

    document.getElementById('manual-form').classList.add('hidden');
    document.getElementById('imdb-form').classList.add('hidden');
    document.getElementById('verify-form').classList.add('hidden');
    document.getElementById('bookings-view').classList.add('hidden');

    if (tab === 'manual') document.getElementById('manual-form').classList.remove('hidden');
    if (tab === 'imdb') document.getElementById('imdb-form').classList.remove('hidden');
    if (tab === 'verify') document.getElementById('verify-form').classList.remove('hidden');
    if (tab === 'bookings') {
        document.getElementById('bookings-view').classList.remove('hidden');
        renderAdminBookings();
    }
};

function renderAdminBookings() {
    const tbody = document.getElementById('bookings-table-body');
    if (!bookings.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No bookings found</td></tr>';
        return;
    }

    tbody.innerHTML = bookings.map(b => `
        <tr style="border-bottom: 1px solid var(--glass-border);">
            <td style="padding: 1rem; font-family: monospace;">${b.id}</td>
            <td style="padding: 1rem;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${b.movie.image}" style="width: 30px; height: 45px; border-radius: 4px; object-fit: cover;">
                    <span>${b.movie.title}</span>
                </div>
            </td>
            <td style="padding: 1rem;">${b.date} <br> <span style="font-size: 0.8rem; opacity: 0.7">${b.time}</span></td>
            <td style="padding: 1rem;">${b.seats.map(s => s.id).join(', ')}</td>
            <td style="padding: 1rem; font-weight: bold;">$${b.total}</td>
            <td style="padding: 1rem;"><span style="background: rgba(75, 181, 67, 0.2); color: #4BB543; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">Confirmed</span></td>
        </tr>
    `).join('');
}

// Image Upload Logic
let selectedFile = null;

window.handleImageUpload = (input) => {
    const file = input.files[0];
    if (file) {
        selectedFile = file;
        document.getElementById('file-name').textContent = file.name;
    }
};

// Manual Add Logic
window.addManualMovie = async () => {
    const title = document.getElementById('movie-title').value;
    const genre = document.getElementById('movie-genre').value;
    const rating = document.getElementById('movie-rating').value;
    const price = document.getElementById('movie-price').value;

    if (!title || !genre || !rating || !price) {
        return alert('Please fill in all fields');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('genre', genre);
    formData.append('rating', parseFloat(rating));
    formData.append('duration', "120 min");
    formData.append('synopsis', "Added manually via admin panel.");
    formData.append('price_bed', parseInt(price) * 2);
    formData.append('price_chair', parseInt(price));
    formData.append('format', "20");
    formData.append('cast', JSON.stringify(["Cast N/A"]));

    if (selectedFile) {
        formData.append('image', selectedFile);
    } else {
        formData.append('image', "https://via.placeholder.com/300x450?text=No+Image");
    }

    try {
        const response = await fetch('/api/movies', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Movie added successfully!');
            await renderAdminMovies();
            // Reset Form
            document.getElementById('movie-title').value = '';
            document.getElementById('movie-genre').value = '';
            document.getElementById('movie-rating').value = '';
            document.getElementById('file-name').textContent = 'Click to upload image';
            selectedFile = null;
        } else {
            alert('Failed to add movie');
        }
    } catch (error) {
        console.error('Error adding movie:', error);
    }
};

// IMDb Logic
let tempMovie = null;

window.searchIMDb = async () => {
    const input = document.getElementById('imdb-query').value.trim();
    if (!input) return alert('Please enter a movie title or IMDb link');

    const btn = document.querySelector('.icon-btn.primary');
    const originalIcon = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    try {
        const apiKey = '8a0c4a03';
        const searchParam = input.startsWith('tt') ? `i=${input}` : `t=${encodeURIComponent(input)}`;
        const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&${searchParam}`);
        const data = await response.json();

        if (data.Response === "True") {
            tempMovie = {
                id: Date.now(),
                title: data.Title,
                rating: data.imdbRating,
                genre: data.Genre.split(',')[0],
                duration: data.Runtime,
                synopsis: data.Plot,
                image: data.Poster !== "N/A" ? data.Poster : "https://via.placeholder.com/300x450?text=No+Image",
                backdrop: data.Poster !== "N/A" ? data.Poster : null,
                price: { bed: 50, chair: 25 }
            };
            showPreview(tempMovie);
        } else {
            throw new Error(data.Error || 'Movie not found');
        }
    } catch (error) {
        alert('Search failed: ' + error.message);
    } finally {
        btn.innerHTML = originalIcon;
    }
};

function showPreview(movie) {
    const preview = document.getElementById('imdb-preview');
    document.getElementById('preview-poster').src = movie.image;
    document.getElementById('preview-title').textContent = movie.title;
    document.getElementById('preview-meta').textContent = `${movie.genre} • ⭐ ${movie.rating}`;
    preview.classList.remove('hidden');
}

window.addMovieFromPreview = async () => {
    if (!tempMovie) return;

    const formData = new FormData();
    formData.append('title', tempMovie.title);
    formData.append('genre', tempMovie.genre);
    formData.append('rating', tempMovie.rating);
    formData.append('duration', tempMovie.duration);
    formData.append('synopsis', tempMovie.synopsis);
    formData.append('price_bed', tempMovie.price.bed);
    formData.append('price_chair', tempMovie.price.chair);
    formData.append('image', tempMovie.image);
    formData.append('format', "2D");
    formData.append('cast', JSON.stringify(["Cast N/A"]));

    try {
        const response = await fetch('/api/movies', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Movie added successfully!');
            await renderAdminMovies();
            document.getElementById('imdb-query').value = '';
            document.getElementById('imdb-preview').classList.add('hidden');
            tempMovie = null;
        } else {
            alert('Failed to add movie');
        }
    } catch (error) {
        console.error('Error adding movie from IMDb:', error);
    }
};

// Ticket Verification
window.verifyTicket = () => {
    const input = document.getElementById('ticket-id-input').value.trim().toUpperCase();
    const resultDiv = document.getElementById('ticket-result');

    const booking = bookings.find(b => b.id === input);

    if (booking) {
        resultDiv.classList.remove('hidden');
        resultDiv.innerHTML = `
            <div style="text-align: center; margin-bottom: 1rem;">
                <i class="fa-solid fa-circle-check" style="color: #4BB543; font-size: 3rem;"></i>
                <h3 style="margin-top: 1rem; color: #4BB543;">Verified Ticket</h3>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.9rem;">
                <div><span style="color: var(--text-muted);">Movie:</span><br><strong>${booking.movie.title}</strong></div>
                <div><span style="color: var(--text-muted);">Date/Time:</span><br><strong>${booking.date} ${booking.time}</strong></div>
                <div><span style="color: var(--text-muted);">Seats:</span><br><strong>${booking.seats.map(s => s.id).join(', ')}</strong></div>
                <div><span style="color: var(--text-muted);">Total:</span><br><strong>$${booking.total}</strong></div>
            </div>
            <button onclick="confirmEntry('${booking.id}')" class="add-btn" style="width: 100%; margin-top: 1.5rem; background: #4BB543; color: white;">Confirm Entry</button>
        `;
    } else {
        resultDiv.classList.remove('hidden');
        resultDiv.innerHTML = `
            <div style="text-align: center; padding: 1rem; color: #ff4444;">
                <i class="fa-solid fa-circle-xmark" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>Invalid Ticket ID</p>
                <p style="font-size: 0.8rem; margin-top: 0.5rem;">The ticket was not found in our records.</p>
            </div>
        `;
    }
};

window.confirmEntry = (id) => {
    alert('Entry Confirmed for booking: ' + id);
    document.getElementById('ticket-result').classList.add('hidden');
    document.getElementById('ticket-id-input').value = '';
};


window.deleteMovie = async (id) => {
    if (confirm('Are you sure you want to remove this movie?')) {
        try {
            const response = await fetch(`/api/movies/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                // Show toast
                alert('Movie deleted successfully');
                await renderAdminMovies();
            } else {
                const errorData = await response.json();
                alert('Failed to delete movie: ' + (errorData.error || response.statusText));
            }
        } catch (error) {
            console.error('Error deleting movie:', error);
            alert('Error deleting movie: ' + error.message);
        }
    }
};

init();
