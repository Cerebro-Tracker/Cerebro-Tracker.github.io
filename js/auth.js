/**
 * Cerebro Tracker - Authentication Module
 * Handles user authentication, registration, and profile management
 */

// User authentication state
let currentUser = null;

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    setupAuthListeners();
});

/**
 * Initialize authentication state
 */
function initAuth() {
    // Check if user is logged in
    const storedUser = localStorage.getItem('cerebroUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateUIForLoggedInUser();
    } else {
        updateUIForLoggedOutUser();
    }
}

/**
 * Set up event listeners for authentication actions
 */
function setupAuthListeners() {
    // Login button
    document.getElementById('login-btn').addEventListener('click', () => {
        const loginModal = new bootstrap.Modal(document.getElementById('login-modal'));
        loginModal.show();
    });

    // Register button
    document.getElementById('register-btn').addEventListener('click', () => {
        const registerModal = new bootstrap.Modal(document.getElementById('register-modal'));
        registerModal.show();
    });

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Switch between login and register modals
    document.getElementById('switch-to-register').addEventListener('click', (e) => {
        e.preventDefault();
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('login-modal'));
        loginModal.hide();
        setTimeout(() => {
            const registerModal = new bootstrap.Modal(document.getElementById('register-modal'));
            registerModal.show();
        }, 500);
    });

    document.getElementById('switch-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        const registerModal = bootstrap.Modal.getInstance(document.getElementById('register-modal'));
        registerModal.hide();
        setTimeout(() => {
            const loginModal = new bootstrap.Modal(document.getElementById('login-modal'));
            loginModal.show();
        }, 500);
    });

    // Login form submission
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        login();
    });

    // Register form submission
    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        register();
    });

    // Profile form submission
    document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        updateProfile();
    });

    // Get started button
    document.getElementById('get-started-btn').addEventListener('click', () => {
        if (currentUser) {
            // Navigate to comics page if logged in
            navigateTo('comics');
        } else {
            // Show register modal if not logged in
            const registerModal = new bootstrap.Modal(document.getElementById('register-modal'));
            registerModal.show();
        }
    });
}

/**
 * Login user
 */
function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');
    
    // Reset error message
    errorElement.textContent = '';
    errorElement.classList.add('d-none');
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('cerebroUsers') || '[]');
    
    // Find user
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Store current user in localStorage (without password)
        const userToStore = { ...user };
        delete userToStore.password;
        localStorage.setItem('cerebroUser', JSON.stringify(userToStore));
        currentUser = userToStore;
        
        // Update UI
        updateUIForLoggedInUser();
        
        // Close modal
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('login-modal'));
        loginModal.hide();
        
        // Reset form
        document.getElementById('login-form').reset();
        
        // Navigate to comics page
        navigateTo('comics');
    } else {
        // Show error
        errorElement.textContent = 'Invalid username or password';
        errorElement.classList.remove('d-none');
    }
}

/**
 * Register new user
 */
function register() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const errorElement = document.getElementById('register-error');
    
    // Reset error message
    errorElement.textContent = '';
    errorElement.classList.add('d-none');
    
    // Validate passwords match
    if (password !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match';
        errorElement.classList.remove('d-none');
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('cerebroUsers') || '[]');
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
        errorElement.textContent = 'Username already exists';
        errorElement.classList.remove('d-none');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password,
        readComics: [],
        dateJoined: new Date().toISOString()
    };
    
    // Add user to users array
    users.push(newUser);
    
    // Save users to localStorage
    localStorage.setItem('cerebroUsers', JSON.stringify(users));
    
    // Store current user in localStorage (without password)
    const userToStore = { ...newUser };
    delete userToStore.password;
    localStorage.setItem('cerebroUser', JSON.stringify(userToStore));
    currentUser = userToStore;
    
    // Update UI
    updateUIForLoggedInUser();
    
    // Close modal
    const registerModal = bootstrap.Modal.getInstance(document.getElementById('register-modal'));
    registerModal.hide();
    
    // Reset form
    document.getElementById('register-form').reset();
    
    // Navigate to comics page
    navigateTo('comics');
}

/**
 * Logout user
 */
function logout() {
    // Remove user from localStorage
    localStorage.removeItem('cerebroUser');
    currentUser = null;
    
    // Update UI
    updateUIForLoggedOutUser();
    
    // Navigate to home page
    navigateTo('home');
}

/**
 * Update user profile
 */
function updateProfile() {
    if (!currentUser) return;
    
    const email = document.getElementById('profile-email').value;
    const password = document.getElementById('profile-password').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('cerebroUsers') || '[]');
    
    // Find user index
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        // Update user
        users[userIndex].email = email;
        
        // Update password if provided
        if (password) {
            users[userIndex].password = password;
        }
        
        // Save users to localStorage
        localStorage.setItem('cerebroUsers', JSON.stringify(users));
        
        // Update current user
        currentUser.email = email;
        localStorage.setItem('cerebroUser', JSON.stringify(currentUser));
        
        // Show success message
        alert('Profile updated successfully');
    }
}

/**
 * Update UI for logged in user
 */
function updateUIForLoggedInUser() {
    // Hide auth buttons
    document.getElementById('auth-buttons').classList.add('d-none');
    
    // Show user profile
    document.getElementById('user-profile').classList.remove('d-none');
    
    // Update username display
    document.getElementById('username-display').textContent = currentUser.username;
    
    // Update profile form
    document.getElementById('profile-username').value = currentUser.username;
    document.getElementById('profile-email').value = currentUser.email || '';
    
    // Update reading statistics
    updateReadingStatistics();
}

/**
 * Update UI for logged out user
 */
function updateUIForLoggedOutUser() {
    // Show auth buttons
    document.getElementById('auth-buttons').classList.remove('d-none');
    
    // Hide user profile
    document.getElementById('user-profile').classList.add('d-none');
}

/**
 * Update reading statistics in the profile page
 */
function updateReadingStatistics() {
    if (!currentUser) return;
    
    // Get all comics
    const allComics = window.comicsData || [];
    
    // Get read comics
    const readComics = currentUser.readComics || [];
    
    // Update comics read count
    document.getElementById('comics-read-count').textContent = readComics.length;
    document.getElementById('comics-total-count').textContent = allComics.length;
    
    // Update comics read progress
    const comicsReadPercentage = allComics.length > 0 ? (readComics.length / allComics.length) * 100 : 0;
    document.getElementById('comics-read-progress').style.width = `${comicsReadPercentage}%`;
    
    // Get all series
    const allSeries = getAllSeries(allComics);
    
    // Get completed series
    const completedSeries = getCompletedSeries(allSeries, readComics);
    
    // Update series completed count
    document.getElementById('series-completed-count').textContent = completedSeries.length;
    document.getElementById('series-total-count').textContent = allSeries.length;
    
    // Update series completed progress
    const seriesCompletedPercentage = allSeries.length > 0 ? (completedSeries.length / allSeries.length) * 100 : 0;
    document.getElementById('series-completed-progress').style.width = `${seriesCompletedPercentage}%`;
    
    // Update reading history
    updateReadingHistory(readComics);
}

/**
 * Get all series from comics data
 */
function getAllSeries(comics) {
    const seriesMap = {};
    
    comics.forEach(comic => {
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
 * Get completed series
 */
function getCompletedSeries(allSeries, readComics) {
    return allSeries.filter(series => {
        return series.comics.every(comic => readComics.includes(comic.id));
    });
}

/**
 * Update reading history in the progress page
 */
function updateReadingHistory(readComics) {
    const historyBody = document.getElementById('reading-history-body');
    historyBody.innerHTML = '';
    
    // Get all comics
    const allComics = window.comicsData || [];
    
    // Get read comics with details
    const readComicsWithDetails = readComics.map(id => {
        const comic = allComics.find(c => c.id === id);
        return {
            id,
            book: comic ? comic.book : 'Unknown',
            dateRead: new Date().toLocaleDateString() // In a real app, we would store the date when marked as read
        };
    });
    
    // Sort by date read (newest first)
    readComicsWithDetails.sort((a, b) => new Date(b.dateRead) - new Date(a.dateRead));
    
    // Add to table
    readComicsWithDetails.forEach(comic => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${comic.book}</td>
            <td>${comic.dateRead}</td>
            <td>
                <button class="btn btn-sm btn-danger mark-unread-btn" data-id="${comic.id}">
                    <i class="fas fa-times"></i> Mark as Unread
                </button>
            </td>
        `;
        historyBody.appendChild(row);
    });
    
    // Add event listeners to unread buttons
    document.querySelectorAll('.mark-unread-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const comicId = btn.getAttribute('data-id');
            markComicAsUnread(comicId);
        });
    });
}

/**
 * Mark comic as unread
 */
function markComicAsUnread(comicId) {
    if (!currentUser) return;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('cerebroUsers') || '[]');
    
    // Find user index
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        // Remove comic from read comics
        users[userIndex].readComics = users[userIndex].readComics.filter(id => id !== comicId);
        
        // Save users to localStorage
        localStorage.setItem('cerebroUsers', JSON.stringify(users));
        
        // Update current user
        currentUser.readComics = users[userIndex].readComics;
        localStorage.setItem('cerebroUser', JSON.stringify(currentUser));
        
        // Update reading statistics
        updateReadingStatistics();
        
        // Update comics table if on comics page
        if (typeof updateComicsTable === 'function') {
            updateComicsTable();
        }
    }
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return currentUser !== null;
}

/**
 * Get current user
 */
function getCurrentUser() {
    return currentUser;
}

/**
 * Navigate to page
 */
function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(`${page}-page`).classList.add('active');
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    document.querySelector(`.nav-link[data-page="${page}"]`).classList.add('active');
}

// Export functions for use in other modules
window.auth = {
    isLoggedIn,
    getCurrentUser,
    markComicAsUnread,
    updateReadingStatistics
};