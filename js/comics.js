/**
 * Cerebro Tracker - Comics Module
 * Handles comic book data loading, display, and tracking functionality
 */

// Comics data
let comicsData = [];
let filteredComics = [];
let currentSort = { column: 'order', direction: 'asc' };
let currentPage = 1;
const pageSize = 50;

// Initialize comics functionality on page load
document.addEventListener('DOMContentLoaded', () => {
    loadComicsData();
    setupComicsListeners();
});

/**
 * Load comics data from CSV file
 */
function loadComicsData() {
    // Show loading indicator
    const comicsTableBody = document.getElementById('comics-table-body');
    comicsTableBody.innerHTML = '<tr><td colspan="8" class="text-center py-5"><i class="fas fa-spinner fa-spin fa-2x"></i><p class="mt-2">Loading comics data...</p></td></tr>';

    // Use PapaParse to load and parse the CSV file
    Papa.parse('import.csv', {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            // Process the data
            comicsData = results.data.map((comic, index) => {
                return {
                    id: `comic-${index}`,
                    order: comic.Order,
                    book: comic.Book,
                    characters: comic['Events/Characters/Universes'],
                    published: comic.Published,
                    era: comic.Era,
                    writer: comic['Writer(s)'],
                    penciller: comic['Penciller(s)'],
                    main: comic.Main === 'Yes'
                };
            });

            // Store in window for access by other modules
            window.comicsData = comicsData;

            // Update the comics table
            filteredComics = [...comicsData];
            updateComicsTable();

            // Update series page
            updateSeriesPage();

            // Update writers page
            updateWritersPage();

            // Update reading statistics if user is logged in
            if (window.auth && typeof window.auth.updateReadingStatistics === 'function') {
                window.auth.updateReadingStatistics();
            }
        },
        error: function(error) {
            console.error('Error loading comics data:', error);
            comicsTableBody.innerHTML = '<tr><td colspan="8" class="text-center py-5 text-danger"><i class="fas fa-exclamation-circle fa-2x"></i><p class="mt-2">Error loading comics data. Please try again later.</p></td></tr>';
        }
    });
}

/**
 * Set up event listeners for comics functionality
 */
function setupComicsListeners() {
    // Sort headers
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.getAttribute('data-sort');
            sortComics(column);
        });
    });

    // Search button
    document.getElementById('search-btn').addEventListener('click', () => {
        searchComics();
    });

    // Search input (search on Enter key)
    document.getElementById('search-comics').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchComics();
        }
    });

    // Filter button
    document.getElementById('filter-btn').addEventListener('click', () => {
        // Reset filters
        filteredComics = [...comicsData];
        currentPage = 1;
        updateComicsTable();
    });

    // Filter options
    document.querySelectorAll('#filter-options a').forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const filter = option.getAttribute('data-filter');
            filterComics(filter);
        });
    });

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

    // Comic details modal events
    document.getElementById('mark-read-btn').addEventListener('click', () => {
        const comicId = document.getElementById('mark-read-btn').getAttribute('data-id');
        markComicAsRead(comicId);
    });

    document.getElementById('mark-unread-btn').addEventListener('click', () => {
        const comicId = document.getElementById('mark-unread-btn').getAttribute('data-id');
        markComicAsUnread(comicId);
    });

    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            navigateTo(page);
        });
    });
}

/**
 * Update the comics table with current data
 */
function updateComicsTable() {
    const comicsTableBody = document.getElementById('comics-table-body');
    comicsTableBody.innerHTML = '';

    // Sort the comics
    sortComicsData();

    // Paginate the comics
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedComics = filteredComics.slice(startIndex, endIndex);

    // Get current user's read comics
    const currentUser = window.auth && typeof window.auth.getCurrentUser === 'function' ? window.auth.getCurrentUser() : null;
    const readComics = currentUser ? currentUser.readComics || [] : [];

    // Add comics to table
    if (paginatedComics.length === 0) {
        comicsTableBody.innerHTML = '<tr><td colspan="8" class="text-center py-5">No comics found matching your criteria.</td></tr>';
    } else {
        paginatedComics.forEach(comic => {
            const isRead = readComics.includes(comic.id);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${comic.order}</td>
                <td>${comic.book}</td>
                <td>${comic.published}</td>
                <td>${comic.era}</td>
                <td>${comic.writer}</td>
                <td>${comic.penciller}</td>
                <td class="${isRead ? 'status-read' : 'status-unread'}">
                    ${isRead ? '<i class="fas fa-check-circle"></i> Read' : '<i class="far fa-circle"></i> Unread'}
                </td>
                <td>
                    <button class="btn btn-sm btn-primary view-comic-btn" data-id="${comic.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${isRead ? 
                        `<button class="btn btn-sm btn-danger mark-unread-btn" data-id="${comic.id}">
                            <i class="fas fa-times"></i>
                        </button>` : 
                        `<button class="btn btn-sm btn-success mark-read-btn" data-id="${comic.id}">
                            <i class="fas fa-check"></i>
                        </button>`
                    }
                </td>
            `;
            comicsTableBody.appendChild(row);
        });

        // Add event listeners to buttons
        document.querySelectorAll('.view-comic-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const comicId = btn.getAttribute('data-id');
                showComicDetails(comicId);
            });
        });

        document.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const comicId = btn.getAttribute('data-id');
                markComicAsRead(comicId);
            });
        });

        document.querySelectorAll('.mark-unread-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const comicId = btn.getAttribute('data-id');
                markComicAsUnread(comicId);
            });
        });
    }

    // Update pagination
    updatePagination();
}

/**
 * Update pagination controls
 */
function updatePagination() {
    const pagination = document.getElementById('comics-pagination');
    pagination.innerHTML = '';

    const totalPages = Math.ceil(filteredComics.length / pageSize);

    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
    pagination.appendChild(prevLi);

    // Page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4 && startPage > 1) {
        startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pagination.appendChild(pageLi);
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
    pagination.appendChild(nextLi);

    // Add event listeners to pagination links
    document.querySelectorAll('#comics-pagination .page-link').forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            if (index === 0) {
                // Previous button
                if (currentPage > 1) {
                    currentPage--;
                    updateComicsTable();
                }
            } else if (index === document.querySelectorAll('#comics-pagination .page-link').length - 1) {
                // Next button
                if (currentPage < totalPages) {
                    currentPage++;
                    updateComicsTable();
                }
            } else {
                // Page number
                currentPage = parseInt(link.textContent);
                updateComicsTable();
            }
        });
    });
}

/**
 * Sort comics by column
 */
function sortComics(column) {
    // Update sort direction
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }

    // Update sort indicators in UI
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });

    const currentHeader = document.querySelector(`th[data-sort="${column}"]`);
    currentHeader.classList.add(`sort-${currentSort.direction}`);

    // Reset to first page
    currentPage = 1;

    // Update table
    updateComicsTable();
}

/**
 * Sort comics data based on current sort settings
 */
function sortComicsData() {
    filteredComics.sort((a, b) => {
        let valueA = a[currentSort.column];
        let valueB = b[currentSort.column];

        // Handle numeric values
        if (currentSort.column === 'order') {
            // Split by dot and convert to numbers for proper ordering
            const partsA = valueA.split('.');
            const partsB = valueB.split('.');

            for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
                const numA = i < partsA.length ? parseInt(partsA[i]) : 0;
                const numB = i < partsB.length ? parseInt(partsB[i]) : 0;

                if (numA !== numB) {
                    return currentSort.direction === 'asc' ? numA - numB : numB - numA;
                }
            }

            return 0;
        }

        // Handle date values
        if (currentSort.column === 'published') {
            const dateA = new Date(valueA);
            const dateB = new Date(valueB);

            if (!isNaN(dateA) && !isNaN(dateB)) {
                return currentSort.direction === 'asc' ? dateA - dateB : dateB - dateA;
            }
        }

        // Handle string values
        if (typeof valueA === 'string' && typeof valueB === 'string') {
            return currentSort.direction === 'asc' ? 
                valueA.localeCompare(valueB) : 
                valueB.localeCompare(valueA);
        }

        // Fallback for other types
        return currentSort.direction === 'asc' ? 
            (valueA > valueB ? 1 : -1) : 
            (valueA < valueB ? 1 : -1);
    });
}

/**
 * Search comics based on search input
 */
function searchComics() {
    const searchTerm = document.getElementById('search-comics').value.toLowerCase();

    if (searchTerm.trim() === '') {
        filteredComics = [...comicsData];
    } else {
        filteredComics = comicsData.filter(comic => {
            return (
                comic.book.toLowerCase().includes(searchTerm) ||
                comic.characters.toLowerCase().includes(searchTerm) ||
                comic.writer.toLowerCase().includes(searchTerm) ||
                comic.penciller.toLowerCase().includes(searchTerm) ||
                comic.era.toLowerCase().includes(searchTerm)
            );
        });
    }

    // Reset to first page
    currentPage = 1;

    // Update table
    updateComicsTable();
}

/**
 * Show comic details in modal
 */
function showComicDetails(comicId) {
    const comic = comicsData.find(c => c.id === comicId);

    if (!comic) return;

    // Update modal content
    document.getElementById('comic-details-title').textContent = comic.book;
    document.getElementById('comic-details-characters').textContent = comic.characters;
    document.getElementById('comic-details-published').textContent = comic.published;
    document.getElementById('comic-details-era').textContent = comic.era;
    document.getElementById('comic-details-writers').textContent = comic.writer;
    document.getElementById('comic-details-pencillers').textContent = comic.penciller;

    // Get current user's read comics
    const currentUser = window.auth && typeof window.auth.getCurrentUser === 'function' ? window.auth.getCurrentUser() : null;
    const readComics = currentUser ? currentUser.readComics || [] : [];
    const isRead = readComics.includes(comicId);

    // Update read/unread buttons
    const markReadBtn = document.getElementById('mark-read-btn');
    const markUnreadBtn = document.getElementById('mark-unread-btn');

    markReadBtn.setAttribute('data-id', comicId);
    markUnreadBtn.setAttribute('data-id', comicId);

    if (isRead) {
        markReadBtn.classList.add('d-none');
        markUnreadBtn.classList.remove('d-none');
    } else {
        markReadBtn.classList.remove('d-none');
        markUnreadBtn.classList.add('d-none');
    }

    // Show modal
    const comicDetailsModal = new bootstrap.Modal(document.getElementById('comic-details-modal'));
    comicDetailsModal.show();
}

/**
 * Mark comic as read
 */
function markComicAsRead(comicId) {
    if (!window.auth || typeof window.auth.isLoggedIn !== 'function' || !window.auth.isLoggedIn()) {
        // Show login modal if not logged in
        const loginModal = new bootstrap.Modal(document.getElementById('login-modal'));
        loginModal.show();
        return;
    }

    const currentUser = window.auth.getCurrentUser();

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('cerebroUsers') || '[]');

    // Find user index
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex !== -1) {
        // Add comic to read comics if not already there
        if (!users[userIndex].readComics.includes(comicId)) {
            users[userIndex].readComics.push(comicId);

            // Save users to localStorage
            localStorage.setItem('cerebroUsers', JSON.stringify(users));

            // Update current user
            currentUser.readComics = users[userIndex].readComics;
            localStorage.setItem('cerebroUser', JSON.stringify(currentUser));

            // Update UI
            updateComicsTable();

            // Update reading statistics
            if (typeof window.auth.updateReadingStatistics === 'function') {
                window.auth.updateReadingStatistics();
            }

            // Update comic details modal if open
            const comicDetailsModal = document.getElementById('comic-details-modal');
            if (comicDetailsModal.classList.contains('show')) {
                document.getElementById('mark-read-btn').classList.add('d-none');
                document.getElementById('mark-unread-btn').classList.remove('d-none');
            }
        }
    }
}

/**
 * Mark comic as unread
 */
function markComicAsUnread(comicId) {
    if (!window.auth || typeof window.auth.isLoggedIn !== 'function' || !window.auth.isLoggedIn()) {
        return;
    }

    const currentUser = window.auth.getCurrentUser();

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('cerebroUsers') || '[]');

    // Find user index
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex !== -1) {
        // Remove comic from read comics if it's there
        const readComicsIndex = users[userIndex].readComics.indexOf(comicId);
        if (readComicsIndex !== -1) {
            users[userIndex].readComics.splice(readComicsIndex, 1);

            // Save users to localStorage
            localStorage.setItem('cerebroUsers', JSON.stringify(users));

            // Update current user
            currentUser.readComics = users[userIndex].readComics;
            localStorage.setItem('cerebroUser', JSON.stringify(currentUser));

            // Update UI
            updateComicsTable();

            // Update reading statistics
            if (typeof window.auth.updateReadingStatistics === 'function') {
                window.auth.updateReadingStatistics();
            }

            // Update comic details modal if open
            const comicDetailsModal = document.getElementById('comic-details-modal');
            if (comicDetailsModal.classList.contains('show')) {
                document.getElementById('mark-read-btn').classList.remove('d-none');
                document.getElementById('mark-unread-btn').classList.add('d-none');
            }
        }
    }
}

/**
 * Show filter modal with options
 */
function showFilterModal(title, options) {
    // Get the filter modal
    const filterModal = document.getElementById('filter-modal');

    // Set the filter type
    filterModal.setAttribute('data-filter-type', title.toLowerCase());

    // Set the modal title
    document.getElementById('filter-modal-title').textContent = `Filter by ${title}`;

    // Clear previous options
    const optionsContainer = document.getElementById('filter-options-container');
    optionsContainer.innerHTML = '';

    // Add options as buttons
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary mb-2';
        button.setAttribute('data-value', option);
        button.textContent = option;

        // Add click event to toggle selection
        button.addEventListener('click', () => {
            button.classList.toggle('btn-outline-primary');
            button.classList.toggle('btn-primary');
        });

        optionsContainer.appendChild(button);
    });

    // Show the modal
    const bsModal = new bootstrap.Modal(filterModal);
    bsModal.show();
}

/**
 * Filter comics based on selected filter
 */
function filterComics(filter, selectedValues) {
    // Get current user's read comics
    const currentUser = window.auth && typeof window.auth.getCurrentUser === 'function' ? window.auth.getCurrentUser() : null;
    const readComics = currentUser ? currentUser.readComics || [] : [];

    if (selectedValues) {
        // Filter by selected values
        switch (filter) {
            case 'era':
                filteredComics = comicsData.filter(comic => 
                    selectedValues.includes(comic.era));
                break;
            case 'writer':
                filteredComics = comicsData.filter(comic => {
                    const writers = comic.writer.split(',').map(w => w.trim());
                    return writers.some(writer => selectedValues.includes(writer));
                });
                break;
            case 'artist':
                filteredComics = comicsData.filter(comic => {
                    const artists = comic.penciller.split(',').map(a => a.trim());
                    return artists.some(artist => selectedValues.includes(artist));
                });
                break;
            case 'character':
                filteredComics = comicsData.filter(comic => {
                    const characters = comic.characters.split(',').map(c => c.trim().replace(/\s*\([^)]*\)/g, '').trim());
                    return characters.some(character => selectedValues.includes(character));
                });
                break;
            default:
                filteredComics = [...comicsData];
        }
    } else {
        // Handle simple filters or show modal for complex filters
        switch (filter) {
            case 'read':
                filteredComics = comicsData.filter(comic => readComics.includes(comic.id));
                break;
            case 'unread':
                filteredComics = comicsData.filter(comic => !readComics.includes(comic.id));
                break;
            case 'era':
                // Show modal with era options
                showFilterModal('Era', getUniqueValues('era'));
                return; // Don't update table yet
            case 'writer':
                // Show modal with writer options
                showFilterModal('Writer', getUniqueValues('writer'));
                return; // Don't update table yet
            case 'artist':
                // Show modal with artist options
                showFilterModal('Artist', getUniqueValues('penciller'));
                return; // Don't update table yet
            case 'character':
                // Show modal with character options
                showFilterModal('Character', getUniqueCharacters());
                return; // Don't update table yet
            default:
                filteredComics = [...comicsData];
        }
    }

    // Reset to first page
    currentPage = 1;

    // Update table
    updateComicsTable();
}

/**
 * Get unique values for a column
 */
function getUniqueValues(column) {
    const values = new Set();

    comicsData.forEach(comic => {
        // Handle multiple values separated by commas
        const items = comic[column].split(',').map(item => item.trim());
        items.forEach(item => {
            if (item) values.add(item);
        });
    });

    return Array.from(values).sort();
}

/**
 * Get unique characters from all comics
 */
function getUniqueCharacters() {
    const characters = new Set();

    comicsData.forEach(comic => {
        const charList = comic.characters.split(',').map(char => char.trim());
        charList.forEach(char => {
            // Remove annotations like (1st) from character names
            const cleanChar = char.replace(/\s*\([^)]*\)/g, '').trim();
            if (cleanChar) characters.add(cleanChar);
        });
    });

    return Array.from(characters).sort();
}

// Placeholder functions for series and writers pages that will be implemented in series.js
function updateSeriesPage() {
    console.log('Series page update will be implemented in series.js');
}

function updateWritersPage() {
    console.log('Writers page update will be implemented in series.js');
}

function searchSeries() {
    console.log('Series search will be implemented in series.js');
}

function searchWriters() {
    console.log('Writers search will be implemented in series.js');
}

// Export functions for use in other modules
window.comics = {
    markComicAsRead,
    markComicAsUnread,
    updateComicsTable,
    filterComics
};
