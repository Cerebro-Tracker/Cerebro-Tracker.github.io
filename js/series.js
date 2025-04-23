/**
 * Cerebro Tracker - Series Module
 * Handles series and writers grouping functionality
 */

// Initialize series functionality on page load
document.addEventListener('DOMContentLoaded', () => {
    setupSeriesListeners();
});

/**
 * Set up event listeners for series functionality
 */
function setupSeriesListeners() {
    // Series search
    document.getElementById('search-series-btn').addEventListener('click', () => {
        searchSeries();
    });

    // Series search input (search on Enter key)
    document.getElementById('search-series').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchSeries();
        }
    });

    // Writers search
    document.getElementById('search-writers-btn').addEventListener('click', () => {
        searchWriters();
    });

    // Writers search input (search on Enter key)
    document.getElementById('search-writers').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchWriters();
        }
    });
}

/**
 * Update series page with cards for each series
 */
function updateSeriesPage() {
    const seriesCards = document.getElementById('series-cards');
    seriesCards.innerHTML = '';

    // Get all series
    const allSeries = getAllSeries();

    // Get current user's read comics
    const currentUser = window.auth && typeof window.auth.getCurrentUser === 'function' ? window.auth.getCurrentUser() : null;
    const readComics = currentUser ? currentUser.readComics || [] : [];

    // Add series cards
    allSeries.forEach(series => {
        const readCount = series.comics.filter(comic => readComics.includes(comic.id)).length;
        const progress = series.comics.length > 0 ? (readCount / series.comics.length) * 100 : 0;

        const card = document.createElement('div');
        card.className = 'col-md-4 col-lg-3 mb-4';
        card.innerHTML = `
            <div class="card series-card" data-series="${series.name}">
                <div class="card-img-top d-flex align-items-center justify-content-center">
                    <h5 class="text-white">${series.name}</h5>
                </div>
                <div class="card-body">
                    <h6 class="card-title">${series.name}</h6>
                    <p class="card-text">
                        <small class="text-muted">${series.comics.length} comics</small>
                    </p>
                    <div class="progress series-progress mb-2">
                        <div class="progress-bar" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <p class="card-text">
                        <small class="text-muted">${readCount} of ${series.comics.length} read</small>
                    </p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-sm btn-primary view-series-btn">View Comics</button>
                    ${progress < 100 ? 
                        `<button class="btn btn-sm btn-success mark-series-read-btn">Mark All Read</button>` : 
                        `<button class="btn btn-sm btn-danger mark-series-unread-btn">Mark All Unread</button>`
                    }
                </div>
            </div>
        `;
        seriesCards.appendChild(card);
    });

    // Add event listeners to series cards
    document.querySelectorAll('.view-series-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const seriesName = btn.closest('.series-card').getAttribute('data-series');
            filterComicsBySeries(seriesName);
        });
    });

    document.querySelectorAll('.mark-series-read-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const seriesName = btn.closest('.series-card').getAttribute('data-series');
            markSeriesAsRead(seriesName);
        });
    });

    document.querySelectorAll('.mark-series-unread-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const seriesName = btn.closest('.series-card').getAttribute('data-series');
            markSeriesAsUnread(seriesName);
        });
    });
}

/**
 * Update writers page with cards for each writer
 */
function updateWritersPage() {
    const writersCards = document.getElementById('writers-cards');
    writersCards.innerHTML = '';

    // Get all writers
    const allWriters = getAllWriters();

    // Get current user's read comics
    const currentUser = window.auth && typeof window.auth.getCurrentUser === 'function' ? window.auth.getCurrentUser() : null;
    const readComics = currentUser ? currentUser.readComics || [] : [];

    // Add writer cards
    allWriters.forEach(writer => {
        const readCount = writer.comics.filter(comic => readComics.includes(comic.id)).length;
        const progress = writer.comics.length > 0 ? (readCount / writer.comics.length) * 100 : 0;

        const card = document.createElement('div');
        card.className = 'col-md-4 col-lg-3 mb-4';
        card.innerHTML = `
            <div class="card writer-card" data-writer="${writer.name}">
                <div class="card-img-top d-flex align-items-center justify-content-center">
                    <h5 class="text-white">${writer.name}</h5>
                </div>
                <div class="card-body">
                    <h6 class="card-title">${writer.name}</h6>
                    <p class="card-text">
                        <small class="text-muted">${writer.comics.length} comics</small>
                    </p>
                    <div class="progress series-progress mb-2">
                        <div class="progress-bar" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <p class="card-text">
                        <small class="text-muted">${readCount} of ${writer.comics.length} read</small>
                    </p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-sm btn-primary view-writer-btn">View Comics</button>
                    ${progress < 100 ? 
                        `<button class="btn btn-sm btn-success mark-writer-read-btn">Mark All Read</button>` : 
                        `<button class="btn btn-sm btn-danger mark-writer-unread-btn">Mark All Unread</button>`
                    }
                </div>
            </div>
        `;
        writersCards.appendChild(card);
    });

    // Add event listeners to writer cards
    document.querySelectorAll('.view-writer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const writerName = btn.closest('.writer-card').getAttribute('data-writer');
            filterComicsByWriter(writerName);
        });
    });

    document.querySelectorAll('.mark-writer-read-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const writerName = btn.closest('.writer-card').getAttribute('data-writer');
            markWriterComicsAsRead(writerName);
        });
    });

    document.querySelectorAll('.mark-writer-unread-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const writerName = btn.closest('.writer-card').getAttribute('data-writer');
            markWriterComicsAsUnread(writerName);
        });
    });
}

/**
 * Get all series from comics data
 */
function getAllSeries() {
    const seriesMap = {};

    // Make sure comicsData is available
    const comicsData = window.comicsData || [];

    comicsData.forEach(comic => {
        const seriesMatch = comic.book.match(/^(.*?)(?:\s+vol\.\s+\d+)?\s+#\d+/);
        if (seriesMatch) {
            const seriesName = seriesMatch[1].trim();
            if (!seriesMap[seriesName]) {
                seriesMap[seriesName] = [];
            }
            seriesMap[seriesName].push(comic);
        }
    });

    return Object.keys(seriesMap).map(name => ({
        name,
        comics: seriesMap[name]
    }));
}

/**
 * Get all writers from comics data
 */
function getAllWriters() {
    const writerMap = {};

    // Make sure comicsData is available
    const comicsData = window.comicsData || [];

    comicsData.forEach(comic => {
        const writers = comic.writer.split(',').map(w => w.trim());
        writers.forEach(writer => {
            if (writer) {
                if (!writerMap[writer]) {
                    writerMap[writer] = [];
                }
                writerMap[writer].push(comic);
            }
        });
    });

    return Object.keys(writerMap).map(name => ({
        name,
        comics: writerMap[name]
    }));
}

/**
 * Filter comics by series
 */
function filterComicsBySeries(seriesName) {
    // Make sure comicsData is available
    const comicsData = window.comicsData || [];

    // Filter comics by series
    window.filteredComics = comicsData.filter(comic => {
        const seriesMatch = comic.book.match(/^(.*?)(?:\s+vol\.\s+\d+)?\s+#\d+/);
        return seriesMatch && seriesMatch[1].trim() === seriesName;
    });

    // Reset to first page
    window.currentPage = 1;

    // Update table
    if (typeof window.updateComicsTable === 'function') {
        window.updateComicsTable();
    }

    // Navigate to comics page
    navigateTo('comics');
}

/**
 * Filter comics by writer
 */
function filterComicsByWriter(writerName) {
    // Make sure comicsData is available
    const comicsData = window.comicsData || [];

    // Filter comics by writer
    window.filteredComics = comicsData.filter(comic => {
        const writers = comic.writer.split(',').map(w => w.trim());
        return writers.includes(writerName);
    });

    // Reset to first page
    window.currentPage = 1;

    // Update table
    if (typeof window.updateComicsTable === 'function') {
        window.updateComicsTable();
    }

    // Navigate to comics page
    navigateTo('comics');
}

/**
 * Mark all comics in a series as read
 */
function markSeriesAsRead(seriesName) {
    if (!window.auth || typeof window.auth.isLoggedIn !== 'function' || !window.auth.isLoggedIn()) {
        // Show login modal if not logged in
        const loginModal = new bootstrap.Modal(document.getElementById('login-modal'));
        loginModal.show();
        return;
    }

    // Get all comics in the series
    const allSeries = getAllSeries();
    const series = allSeries.find(s => s.name === seriesName);

    if (!series) return;

    // Mark each comic as read
    series.comics.forEach(comic => {
        if (typeof window.comics.markComicAsRead === 'function') {
            window.comics.markComicAsRead(comic.id);
        }
    });

    // Update series page
    updateSeriesPage();

    // Update writers page
    updateWritersPage();
}

/**
 * Mark all comics in a series as unread
 */
function markSeriesAsUnread(seriesName) {
    if (!window.auth || typeof window.auth.isLoggedIn !== 'function' || !window.auth.isLoggedIn()) {
        return;
    }

    // Get all comics in the series
    const allSeries = getAllSeries();
    const series = allSeries.find(s => s.name === seriesName);

    if (!series) return;

    // Mark each comic as unread
    series.comics.forEach(comic => {
        if (typeof window.comics.markComicAsUnread === 'function') {
            window.comics.markComicAsUnread(comic.id);
        }
    });

    // Update series page
    updateSeriesPage();

    // Update writers page
    updateWritersPage();
}

/**
 * Mark all comics by a writer as read
 */
function markWriterComicsAsRead(writerName) {
    if (!window.auth || typeof window.auth.isLoggedIn !== 'function' || !window.auth.isLoggedIn()) {
        // Show login modal if not logged in
        const loginModal = new bootstrap.Modal(document.getElementById('login-modal'));
        loginModal.show();
        return;
    }

    // Get all comics by the writer
    const allWriters = getAllWriters();
    const writer = allWriters.find(w => w.name === writerName);

    if (!writer) return;

    // Mark each comic as read
    writer.comics.forEach(comic => {
        if (typeof window.comics.markComicAsRead === 'function') {
            window.comics.markComicAsRead(comic.id);
        }
    });

    // Update series page
    updateSeriesPage();

    // Update writers page
    updateWritersPage();
}

/**
 * Mark all comics by a writer as unread
 */
function markWriterComicsAsUnread(writerName) {
    if (!window.auth || typeof window.auth.isLoggedIn !== 'function' || !window.auth.isLoggedIn()) {
        return;
    }

    // Get all comics by the writer
    const allWriters = getAllWriters();
    const writer = allWriters.find(w => w.name === writerName);

    if (!writer) return;

    // Mark each comic as unread
    writer.comics.forEach(comic => {
        if (typeof window.comics.markComicAsUnread === 'function') {
            window.comics.markComicAsUnread(comic.id);
        }
    });

    // Update series page
    updateSeriesPage();

    // Update writers page
    updateWritersPage();
}

/**
 * Search series based on search input
 */
function searchSeries() {
    const searchTerm = document.getElementById('search-series').value.toLowerCase();

    // Get all series
    const allSeries = getAllSeries();

    // Filter series cards based on search term
    document.querySelectorAll('.series-card').forEach(card => {
        const seriesName = card.getAttribute('data-series').toLowerCase();

        if (seriesName.includes(searchTerm) || searchTerm === '') {
            card.closest('.col-md-4').style.display = 'block';
        } else {
            card.closest('.col-md-4').style.display = 'none';
        }
    });
}

/**
 * Search writers based on search input
 */
function searchWriters() {
    const searchTerm = document.getElementById('search-writers').value.toLowerCase();

    // Get all writers
    const allWriters = getAllWriters();

    // Filter writer cards based on search term
    document.querySelectorAll('.writer-card').forEach(card => {
        const writerName = card.getAttribute('data-writer').toLowerCase();

        if (writerName.includes(searchTerm) || searchTerm === '') {
            card.closest('.col-md-4').style.display = 'block';
        } else {
            card.closest('.col-md-4').style.display = 'none';
        }
    });
}

// Override the placeholder functions in comics.js
window.updateSeriesPage = updateSeriesPage;
window.updateWritersPage = updateWritersPage;
window.searchSeries = searchSeries;
window.searchWriters = searchWriters;

// Export functions for use in other modules
window.series = {
    getAllSeries,
    getAllWriters,
    filterComicsBySeries,
    filterComicsByWriter,
    markSeriesAsRead,
    markSeriesAsUnread,
    markWriterComicsAsRead,
    markWriterComicsAsUnread
};
