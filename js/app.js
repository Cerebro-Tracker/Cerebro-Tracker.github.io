/**
 * Cerebro Tracker - Main Application Module
 * Handles application initialization and global functionality
 */

// Initialize application on page load
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

/**
 * Initialize the application
 */
function initApp() {
    // Set up navigation
    setupNavigation();
    
    // Set up modal functionality
    setupModals();
    
    // Set up filter modal if it doesn't exist yet
    setupFilterModal();
    
    // Add X-Men theme styling
    applyXMenTheme();
    
    console.log('Cerebro Tracker initialized');
}

/**
 * Set up navigation between pages
 */
function setupNavigation() {
    // Navigation links
    document.querySelectorAll('.nav-link, [data-page]').forEach(link => {
        if (!link.hasAttribute('data-page-initialized')) {
            link.setAttribute('data-page-initialized', 'true');
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                navigateTo(page);
            });
        }
    });
    
    // Get started button
    const getStartedBtn = document.getElementById('get-started-btn');
    if (getStartedBtn && !getStartedBtn.hasAttribute('data-initialized')) {
        getStartedBtn.setAttribute('data-initialized', 'true');
        getStartedBtn.addEventListener('click', () => {
            if (window.auth && typeof window.auth.isLoggedIn === 'function' && window.auth.isLoggedIn()) {
                // Navigate to comics page if logged in
                navigateTo('comics');
            } else {
                // Show register modal if not logged in
                const registerModal = new bootstrap.Modal(document.getElementById('register-modal'));
                registerModal.show();
            }
        });
    }
}

/**
 * Set up modal functionality
 */
function setupModals() {
    // Switch between login and register modals
    const switchToRegister = document.getElementById('switch-to-register');
    if (switchToRegister && !switchToRegister.hasAttribute('data-initialized')) {
        switchToRegister.setAttribute('data-initialized', 'true');
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('login-modal'));
            loginModal.hide();
            setTimeout(() => {
                const registerModal = new bootstrap.Modal(document.getElementById('register-modal'));
                registerModal.show();
            }, 500);
        });
    }
    
    const switchToLogin = document.getElementById('switch-to-login');
    if (switchToLogin && !switchToLogin.hasAttribute('data-initialized')) {
        switchToLogin.setAttribute('data-initialized', 'true');
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            const registerModal = bootstrap.Modal.getInstance(document.getElementById('register-modal'));
            registerModal.hide();
            setTimeout(() => {
                const loginModal = new bootstrap.Modal(document.getElementById('login-modal'));
                loginModal.show();
            }, 500);
        });
    }
}

/**
 * Set up filter modal
 */
function setupFilterModal() {
    // Create modal if it doesn't exist
    if (!document.getElementById('filter-modal')) {
        const modalHTML = `
            <div class="modal fade" id="filter-modal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="filter-modal-title">Filter by</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="input-group mb-3">
                                <input type="text" class="form-control" id="filter-search" placeholder="Search options...">
                                <button class="btn btn-primary" type="button" id="filter-search-btn">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                            <div id="filter-options-container" class="d-flex flex-wrap gap-2">
                                <!-- Options will be added here -->
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="apply-filter-btn">Apply Filter</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Add event listener for search
        document.getElementById('filter-search-btn').addEventListener('click', () => {
            const searchTerm = document.getElementById('filter-search').value.toLowerCase();
            const optionButtons = document.querySelectorAll('#filter-options-container .btn');
            
            optionButtons.forEach(btn => {
                const optionText = btn.textContent.toLowerCase();
                if (optionText.includes(searchTerm) || searchTerm === '') {
                    btn.style.display = 'inline-block';
                } else {
                    btn.style.display = 'none';
                }
            });
        });
        
        // Add event listener for search input (search on Enter key)
        document.getElementById('filter-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('filter-search-btn').click();
            }
        });
        
        // Add event listener for apply button
        document.getElementById('apply-filter-btn').addEventListener('click', () => {
            const selectedOptions = document.querySelectorAll('#filter-options-container .btn-primary');
            const filterType = document.getElementById('filter-modal').getAttribute('data-filter-type');
            
            if (selectedOptions.length > 0) {
                const selectedValues = Array.from(selectedOptions).map(btn => btn.getAttribute('data-value'));
                
                // Apply filter based on selected values
                if (window.comics && typeof window.comics.filterComics === 'function') {
                    window.comics.filterComics(filterType, selectedValues);
                }
                
                // Close modal
                const filterModal = bootstrap.Modal.getInstance(document.getElementById('filter-modal'));
                filterModal.hide();
            }
        });
    }
}

/**
 * Apply X-Men theme styling
 */
function applyXMenTheme() {
    // Add X-Men logo to navbar
    const navbarBrand = document.querySelector('.navbar-brand');
    if (navbarBrand) {
        navbarBrand.innerHTML = `
            <img src="logo.png" alt="Cerebro Tracker Logo" height="40">
            <span class="ms-2">Cerebro Tracker</span>
        `;
    }
    
    // Add X-Men themed background to jumbotron
    const jumbotron = document.querySelector('.jumbotron');
    if (jumbotron) {
        jumbotron.classList.add('cerebro-bg');
    }
    
    // Add X-Men themed badges to series cards
    document.querySelectorAll('.series-card .card-title').forEach(title => {
        const text = title.textContent;
        if (text.includes('X-Men')) {
            title.innerHTML = `<span class="x-badge">X</span> ${text}`;
        }
    });
}

/**
 * Navigate to a specific page
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
    
    document.querySelector(`.nav-link[data-page="${page}"]`)?.classList.add('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Update URL hash
    window.location.hash = page;
}

/**
 * Show a notification message
 */
function showNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    if (!document.getElementById('notification')) {
        const notificationHTML = `
            <div id="notification" class="position-fixed top-0 end-0 p-3" style="z-index: 1100">
                <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header">
                        <strong class="me-auto">Cerebro Tracker</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div class="toast-body"></div>
                </div>
            </div>
        `;
        
        const notificationContainer = document.createElement('div');
        notificationContainer.innerHTML = notificationHTML;
        document.body.appendChild(notificationContainer);
    }
    
    // Update notification content
    const toastBody = document.querySelector('#notification .toast-body');
    toastBody.textContent = message;
    
    // Update notification class based on type
    const toast = document.querySelector('#notification .toast');
    toast.className = 'toast';
    toast.classList.add(`bg-${type === 'error' ? 'danger' : type}`);
    if (type === 'error' || type === 'danger') {
        toast.classList.add('text-white');
    }
    
    // Show notification
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

/**
 * Handle URL hash changes
 */
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(`${hash}-page`)) {
        navigateTo(hash);
    }
});

/**
 * Check URL hash on page load
 */
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(`${hash}-page`)) {
        navigateTo(hash);
    }
});

// Export functions for use in other modules
window.app = {
    navigateTo,
    showNotification
};