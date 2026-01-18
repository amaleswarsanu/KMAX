// State Management
let movies = [];
let bookings = [];

// App Initialization
async function init() {
    await fetchMovies();
    renderHome();
    updateBottomNav('home');

    // Add event listeners for direct clicks on back buttons that might be added dynamically
    document.addEventListener('click', (e) => {
        if (e.target.closest('.back-btn') || e.target.closest('.back-btn-circle')) {
            renderHome();
        }
    });
}

async function fetchMovies() {
    try {
        const response = await fetch('/api/movies');
        movies = await response.json();
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}


// DOM Elements
const mainContent = document.getElementById('main-content');
const bookingModal = document.getElementById('booking-modal');
const successModal = document.getElementById('success-modal');
const bookingInterface = document.getElementById('booking-interface');


// Navigation
window.showHome = (e) => {
    if (e) e.preventDefault();
    renderHome();
    updateBottomNav('home');
};

window.showTickets = (e) => {
    if (e) e.preventDefault();
    renderTickets();
    updateBottomNav('tickets');
};

window.showProfile = (e) => {
    if (e) e.preventDefault();
    renderProfile();
    updateBottomNav('profile');
};

function updateBottomNav(active) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').includes(active) || (active === 'home' && item.getAttribute('href') === '#')) {
            item.classList.add('active');
        }
    });
}

function filterMovies(query) {
    const grid = document.getElementById('movies-grid');
    const cards = grid.getElementsByClassName('movie-card');
    const noResults = document.getElementById('no-results');
    let hasVisible = false;

    query = query.toLowerCase();

    for (let card of cards) {
        const title = card.querySelector('.movie-title').innerText.toLowerCase();
        const genre = card.querySelector('.movie-meta span').innerText.toLowerCase();

        if (title.includes(query) || genre.includes(query)) {
            card.style.display = "block";
            hasVisible = true;
        } else {
            card.style.display = "none";
        }
    }

    noResults.style.display = hasVisible ? "none" : "block";
}

// Notification Handler
document.addEventListener('click', (e) => {
    if (e.target.closest('.fa-bell')) {
        const btn = e.target.closest('button');
        if (btn) {
            btn.style.transform = "scale(0.95)";
            setTimeout(() => btn.style.transform = "scale(1)", 100);

            // Show toast
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--surface-color);
                border: 1px solid var(--glass-border);
                color: white;
                padding: 1rem;
                border-radius: 12px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.5);
                z-index: 2000;
                animation: fadeOut 3s forwards;
                display: flex;
                align-items: center;
                gap: 10px;
            `;
            toast.innerHTML = '<i class="fa-solid fa-check-circle" style="color: var(--primary-color);"></i> <span>No new notifications</span>';
            document.body.appendChild(toast);

            setTimeout(() => toast.remove(), 3000);
        }
    } else if (e.target.closest('.fa-search')) {
        const btn = e.target.closest('button');
        if (btn) {
            btn.style.transform = "scale(0.95)";
            setTimeout(() => btn.style.transform = "scale(1)", 100);
        }
    }
});

// Rendering Views
function renderHome() {
    mainContent.innerHTML = `
        <section class="hero">
            <div class="hero-banner">
                <span class="hero-tag">Trending Now</span>
                <h2 style="color: white; font-size: 1.5rem;">Experience KMAX Cinema</h2>
                <p style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">The future of movie booking is here.</p>
            </div>
        </section>

        <section id="movies">
            <div class="section-title">
                <span>Now Showing</span>
                <span class="view-all" onclick="document.getElementById('movies-grid').scrollIntoView({behavior: 'smooth'})">See all</span>
            </div>
            
            <!-- Search Bar -->
            <div style="padding: 0 1.5rem 1rem;">
                <div style="background: var(--surface-color); border: 1px solid var(--glass-border); border-radius: 12px; padding: 0.8rem; display: flex; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-search" style="color: var(--text-muted);"></i>
                    <input type="text" id="movie-search" placeholder="Search movies..." 
                           style="background: transparent; border: none; color: white; width: 100%; font-family: inherit; outline: none;"
                           oninput="filterMovies(this.value)">
                </div>
            </div>

            <div id="movies-grid" class="movies-grid">
                ${movies.map(movie => `
                    <div class="movie-card animate-fade-in" onclick="openMovieDetails(${movie.id})">
                        <div class="poster-container">
                            <img src="${movie.image}" alt="${movie.title}">
                        </div>
                        <div class="movie-info">
                            <h3 class="movie-title">${movie.title}</h3>
                            <div class="movie-meta">
                                <span>${movie.genre}</span>
                                <span style="color: #FFD700;"><i class="fa-solid fa-star"></i> ${movie.rating}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div id="no-results" style="text-align: center; padding: 2rem; display: none;">
                <p style="color: var(--text-muted);">No movies found matching your search.</p>
            </div>
        </section>
        
        <section style="padding: 1.5rem;">
            <div class="section-title">
                <span>Premium Experiences</span>
            </div>
            <div style="display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem;">
                <div class="premium-card" onclick="filterByExperience('bed')" style="min-width: 140px; background: var(--surface-color); padding: 1rem; border-radius: 12px; border: 1px solid var(--glass-border); text-align: center; cursor: pointer; transition: 0.2s;">
                    <i class="fa-solid fa-bed" style="font-size: 1.5rem; color: var(--secondary-color); margin-bottom: 0.5rem;"></i>
                    <div style="font-size: 0.8rem; font-weight: 600;">Bed Seats</div>
                </div>
                <div class="premium-card" onclick="filterByExperience('chair')" style="min-width: 140px; background: var(--surface-color); padding: 1rem; border-radius: 12px; border: 1px solid var(--glass-border); text-align: center; cursor: pointer; transition: 0.2s;">
                    <i class="fa-solid fa-chair" style="font-size: 1.5rem; color: var(--primary-color); margin-bottom: 0.5rem;"></i>
                    <div style="font-size: 0.8rem; font-weight: 600;">Executive Chair</div>
                </div>
            </div>
        </section>
    `;
}

window.filterByExperience = (type) => {
    const grid = document.getElementById('movies-grid');
    grid.scrollIntoView({ behavior: 'smooth' });

    // Visual feedback
    const cards = document.querySelectorAll('.premium-card');
    cards.forEach(c => c.style.borderColor = 'var(--glass-border)');
    event.currentTarget.style.borderColor = 'var(--primary-color)';

    // Filter Logic (All movies have both, so we'll just flash a message for this demo)
    // In a real app, we'd check if movie.price[type] exists
    alert(`Showing movies with ${type === 'bed' ? 'Bed' : 'Executive'} seating options.`);
};

window.openMovieDetails = (id) => {
    const movie = movies.find(m => m.id === id);
    if (!movie) return;

    mainContent.innerHTML = `
        <div id="movie-details" class="animate-fade-in">
            <div class="details-header">
                <div class="details-backdrop" style="background-image: url('${movie.backdrop || movie.image}')"></div>
                <div class="details-overlay"></div>
                <button class="back-btn-circle" onclick="renderHome()"><i class="fa-solid fa-chevron-left"></i></button>
            </div>
            <div class="details-body">
                <div class="details-main-info">
                    <img src="${movie.image}" class="details-main-poster">
                    <div class="details-title-info">
                        <h1>${movie.title}</h1>
                        <div class="movie-meta">
                            <span>${movie.genre} • ${movie.duration}</span>
                        </div>
                        <div class="details-badges">
                            ${(movie.format || '2D').split(',').map(f => `<span class="format-badge">${f.trim()}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="details-synopsis">
                    <h3 style="color: white; margin-bottom: 0.5rem;">Synopsis</h3>
                    <p>${movie.synopsis}</p>
                </div>
                <button class="book-now-fixed" onclick="openBooking(${movie.id})">Book Tickets • From $${movie.price.chair}</button>
            </div>
        </div>
    `;
    window.scrollTo(0, 0);
};

// Booking Logic
let selectedSeats = [];
let currentMovie = null;

window.openBooking = (movieId) => {
    currentMovie = movies.find(m => m.id === movieId);
    if (!currentMovie) return;

    selectedSeats = [];
    bookingModal.classList.remove('hidden');
    renderBookingInterface();
};

function closeBooking() {
    bookingModal.classList.add('hidden');
}

function renderBookingInterface() {
    bookingInterface.innerHTML = `
        <div class="screen-view">
            <div class="screen-line"></div>
            <div class="screen-text">SCREEN THIS WAY</div>
        </div>

        <div class="seats-layout">
            <h4 style="margin-bottom: 1rem;">Bed Seats ($${currentMovie.price.bed})</h4>
            <div class="seats-grid">
                ${generateSeatHTML('bed', 3)}
            </div>

            <h4 style="margin-bottom: 1rem; margin-top: 2rem;">Chair Seats ($${currentMovie.price.chair})</h4>
            <div class="seats-grid">
                ${generateSeatHTML('chair', 2)}
            </div>
        </div>

        <div class="seat-legend">
            <div class="legend-item"><div class="l-box" style="background: #2a2a2a"></div> Available</div>
            <div class="legend-item"><div class="l-box" style="background: var(--primary-color)"></div> Selected</div>
            <div class="legend-item"><div class="l-box" style="background: #000; opacity: 0.3;"></div> Occupied</div>
        </div>

        <div style="flex-grow: 1;"></div>

        <div class="booking-footer" style="position: absolute; bottom: 0; left: 0; width: 100%;">
            <div class="total-info">
                <span class="total-label" id="seat-details">No seats selected</span>
                <span class="total-price" id="total-price-display">$0</span>
            </div>
            <button class="confirm-btn" onclick="confirmBooking()">Continue</button>
        </div>
    `;

    // Add back listener
    document.querySelector('.back-btn').onclick = closeBooking;
}

function generateSeatHTML(type, count) {
    let html = '';
    for (let i = 1; i <= count; i++) {
        const id = `${type === 'bed' ? 'B' : 'C'}${i}`;
        const isOccupied = Math.random() < 0.1; // Simulated
        html += `
            <div class="seat-container">
                <div class="seat ${type} ${isOccupied ? 'occupied' : ''}" 
                     data-id="${id}" 
                     data-type="${type}" 
                     onclick="toggleSeat(this)">
                </div>
                <span class="seat-label">${id}</span>
            </div>
        `;
    }
    return html;
}

window.toggleSeat = (el) => {
    if (el.classList.contains('occupied')) return;

    const id = el.dataset.id;
    const type = el.dataset.type;
    const price = currentMovie.price[type];

    if (el.classList.contains('selected')) {
        el.classList.remove('selected');
        selectedSeats = selectedSeats.filter(s => s.id !== id);
    } else {
        el.classList.add('selected');
        selectedSeats.push({ id, type, price });
    }

    updateBookingSummary();
};

function updateBookingSummary() {
    const details = document.getElementById('seat-details');
    const price = document.getElementById('total-price-display');

    if (selectedSeats.length === 0) {
        details.innerText = 'No seats selected';
        price.innerText = '$0';
    } else {
        details.innerText = selectedSeats.map(s => s.id).join(', ');
        // Added safety check for s.price to prevent NaN
        const total = selectedSeats.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
        price.innerText = `$${total}`;
    }
}

// Confirmation & Ticket Generation
window.confirmBooking = async () => {
    if (selectedSeats.length === 0) {
        alert('Please select at least one seat');
        return;
    }

    const bookingId = 'KMAX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newBooking = {
        id: bookingId,
        movie_id: currentMovie.id,
        seats: selectedSeats,
        total: selectedSeats.reduce((sum, s) => sum + (Number(s.price) || 0), 0),
        date: new Date().toLocaleDateString(),
        time: '07:30 PM'
    };

    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBooking)
        });

        if (response.ok) {
            newBooking.movie = currentMovie; // For UI preview
            showSuccess(newBooking);
        } else {
            alert('Failed to save booking');
        }
    } catch (error) {
        console.error('Error saving booking:', error);
        alert('Error connecting to server');
    }
};

function showSuccess(booking) {
    bookingModal.classList.add('hidden');
    successModal.classList.remove('hidden');

    const preview = document.getElementById('ticket-preview');
    preview.innerHTML = `
        <div class="ticket-header">
            <div class="ticket-movie">${booking.movie.title}</div>
            <div style="font-size: 0.8rem; color: #666;">Booking ID: ${booking.id}</div>
        </div>
        <div class="ticket-details">
            <div>
                <div class="t-label">Date</div>
                <div class="t-value">${booking.date}</div>
            </div>
            <div>
                <div class="t-label">Time</div>
                <div class="t-value">${booking.time}</div>
            </div>
            <div>
                <div class="t-label">Seats</div>
                <div class="t-value">${booking.seats.map(s => s.id).join(', ')}</div>
            </div>
            <div>
                <div class="t-label">Total</div>
                <div class="t-value">$${booking.total}</div>
            </div>
        </div>
        <div class="barcode-container">
            <canvas id="barcode-canvas"></canvas>
            <div style="font-family: monospace; font-size: 0.7rem; margin-top: 0.5rem;">${booking.id}</div>
        </div>
    `;

    // Generate barcode using bwip-js
    try {
        bwipjs.toCanvas('barcode-canvas', {
            bcid: 'code128',
            text: booking.id,
            scale: 3,
            height: 10,
            includetext: false,
            textxalign: 'center',
            color: '000000'
        });
    } catch (e) {
        console.error(e);
    }

    document.getElementById('download-ticket-btn').onclick = () => downloadPDF(booking);
}

window.closeSuccessModal = () => {
    successModal.classList.add('hidden');
    renderHome();
};

async function downloadPDF(booking) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 150] // Receipt size
    });

    // Styles
    doc.setFillColor(138, 43, 226); // Primary Color
    doc.rect(0, 0, 80, 20, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('KMAX CINEMA', 40, 12, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(booking.movie.title, 40, 30, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('BOOKING TICKET', 40, 35, { align: 'center' });

    doc.line(10, 40, 70, 40);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text('Date:', 15, 50);
    doc.text(booking.date, 65, 50, { align: 'right' });

    doc.text('Time:', 15, 60);
    doc.text(booking.time, 65, 60, { align: 'right' });

    doc.text('Seats:', 15, 70);
    doc.text(booking.seats.map(s => s.id).join(', '), 65, 70, { align: 'right' });

    doc.setFontSize(12);
    doc.text('Total:', 15, 85);
    doc.text(`$${booking.total}`, 65, 85, { align: 'right' });

    doc.line(10, 95, 70, 95);

    // Add barcode
    const canvas = document.getElementById('barcode-canvas');
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 10, 105, 60, 20);

    doc.setFontSize(8);
    doc.text(booking.id, 40, 130, { align: 'center' });

    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Scan this code at the entry', 40, 140, { align: 'center' });

    doc.save(`KMAX-Ticket-${booking.id}.pdf`);
}

async function renderTickets() {
    try {
        const response = await fetch('/api/bookings');
        const tickets = await response.json();

        mainContent.innerHTML = `
            <header style="padding: 1.5rem; text-align: center; border-bottom: 1px solid var(--glass-border);">
                <h2>My Tickets</h2>
            </header>
            <div style="padding: 1.5rem; margin-bottom: 80px;">
                ${tickets.length === 0 ? `
                    <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
                        <i class="fa-solid fa-ticket" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.2;"></i>
                        <p>No tickets found</p>
                    </div>
                ` : tickets.map(b => `
                    <div class="movie-card" style="margin-bottom: 1rem; display: flex; align-items: center; padding: 1rem;">
                        <img src="${b.movie.image}" style="width: 60px; height: 80px; border-radius: 8px; object-fit: cover;">
                        <div style="flex: 1; padding: 0 1rem;">
                            <h4 style="margin-bottom: 0.3rem;">${b.movie.title}</h4>
                            <div style="font-size: 0.8rem; color: var(--text-muted);">${b.date} • ${b.time}</div>
                            <div style="font-size: 0.8rem; color: var(--primary-color); font-weight: 600;">Seats: ${b.seats.map(s => s.id).join(', ')}</div>
                        </div>
                        <button class="icon-btn" onclick="showSuccess(${JSON.stringify(b).replace(/"/g, '&quot;')})">
                            <i class="fa-solid fa-qrcode"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error fetching tickets:', error);
        mainContent.innerHTML = '<p style="padding: 2rem; text-align: center;">Error loading tickets.</p>';
    }
}

// Profile Logic & State
let walletBalance = 124.50;

function renderProfile() {
    mainContent.innerHTML = `
        <header style="padding: 3rem 1.5rem; text-align: center; background: var(--surface-color); margin-bottom: 2rem;">
            <div class="user-avatar-small" style="width: 80px; height: 80px; margin: 0 auto 1rem;"></div>
            <h2>Member User</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem;">memberSince: Jan 2024</p>
        </header>
        <div style="padding: 0 1.5rem;">
            <div onclick="addFunds()" style="background: var(--surface-color); border-radius: 12px; border: 1px solid var(--glass-border); padding: 1rem; margin-bottom: 1rem; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='var(--surface-color-hover)'" onmouseout="this.style.background='var(--surface-color)'">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <i class="fa-solid fa-wallet" style="color: var(--secondary-color);"></i>
                        <span>KMAX Wallet</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span id="wallet-balance" style="font-weight: 700;">$${walletBalance.toFixed(2)}</span>
                        <i class="fa-solid fa-plus-circle" style="color: var(--primary-color);"></i>
                    </div>
                </div>
            </div>
            <div style="background: var(--surface-color); border-radius: 12px; border: 1px solid var(--glass-border); padding: 1rem;">
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div onclick="openSettings()" style="display: flex; align-items: center; gap: 1rem; cursor: pointer;"><i class="fa-solid fa-gear"></i> Settings</div>
                    <div onclick="openFavorites()" style="display: flex; align-items: center; gap: 1rem; cursor: pointer;"><i class="fa-solid fa-heart"></i> Favorites</div>
                    <div onclick="logout()" style="display: flex; align-items: center; gap: 1rem; color: #ff4444; cursor: pointer;"><i class="fa-solid fa-right-from-bracket"></i> Logout</div>
                </div>
            </div>
        </div>
    `;
}

window.addFunds = () => {
    const amount = prompt("Enter amount to add to wallet:", "50");
    if (amount && !isNaN(amount)) {
        walletBalance += parseFloat(amount);
        document.getElementById('wallet-balance').innerText = `$${walletBalance.toFixed(2)}`;
        alert('Funds added successfully!');
    }
};

window.openSettings = () => {
    alert('Settings: \n\n• Notifications: ON\n• Dark Mode: ON\n• Language: English');
};

window.openFavorites = () => {
    alert('No favorites added yet. Browse movies to add some!');
};

window.logout = () => {
    if (confirm('Are you sure you want to logout?')) {
        alert('Logged out successfully.');
        renderHome();
    }
};

// Start App
init();
