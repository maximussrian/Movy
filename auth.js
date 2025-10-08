// Authentication Handler for MOVY


// API Configuration - use your backend server
const API_URL = 'http://localhost:3000/api';

// Auth state
let currentUser = null;
let authToken = null;


// Custom Alert Function (SweetAlert Style)
function showAlert(message, type = 'info', title = '') {
    const overlay = document.getElementById('customAlert');
    const icon = document.getElementById('alertIcon');
    const titleEl = document.getElementById('alertTitle');
    const messageEl = document.getElementById('alertMessage');
    const btn = document.getElementById('alertBtn');
    
    // Set icon based on type
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    const titles = {
        success: title || 'Success!',
        error: title || 'Error!',
        warning: title || 'Warning!',
        info: title || 'Info'
    };
    
    icon.textContent = icons[type] || icons.info;
    icon.className = `alert-icon ${type}`;
    titleEl.textContent = titles[type];
    messageEl.textContent = message;
    
    overlay.classList.add('active');
    
    // Close on button click
    btn.onclick = () => {
        overlay.classList.remove('active');
    };
    
    // Close on overlay click
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
        }
    };
}

// Load saved auth on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadSavedAuth();
    setupAuthListeners();
});

async function loadSavedAuth() {
    try {
        console.log('Loading saved auth...');
        
        // Check localStorage for saved auth
        authToken = localStorage.getItem('movy_token');
        const savedUser = localStorage.getItem('movy_user');
        
        if (authToken && savedUser) {
            console.log('Found localStorage user:', savedUser);
            currentUser = JSON.parse(savedUser);
            updateUIForLoggedInUser();
        } else {
            console.log('No saved auth found');
        }
    } catch (error) {
        console.error('Error loading saved auth:', error);
    }
}

function setupAuthListeners() {
    const authModal = document.getElementById('authModal');
    const closeAuth = document.getElementById('closeAuth');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const loginFormSubmit = document.getElementById('loginFormSubmit');
    const signupFormSubmit = document.getElementById('signupFormSubmit');

    loginBtn?.addEventListener('click', () => {
        authModal.classList.add('active');

        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('signupForm').classList.add('hidden');
    });

    closeAuth?.addEventListener('click', () => {
        authModal.classList.remove('active');
    });

    authModal?.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.remove('active');
        }
    });

    showSignup?.addEventListener('click', (e) => {
        e.preventDefault();

        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('signupForm').classList.remove('hidden');
    });

    showLogin?.addEventListener('click', (e) => {
        e.preventDefault();

        document.getElementById('signupForm').classList.add('hidden');
        document.getElementById('loginForm').classList.remove('hidden');
    });

    loginFormSubmit?.addEventListener('submit', handleLogin);
    signupFormSubmit?.addEventListener('submit', handleSignup);
    logoutBtn?.addEventListener('click', handleLogout);

    
    // Hero logout button
    const heroLogoutBtn = document.getElementById('heroLogoutBtn');
    heroLogoutBtn?.addEventListener('click', handleLogout);
    
    // Hero login button
    const heroLoginBtn = document.getElementById('heroLoginBtn');
    heroLoginBtn?.addEventListener('click', () => {
        authModal.classList.add('active');
        // Show login form by default
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('signupForm').classList.add('hidden');
    });
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert(data.error || 'Invalid email or password', 'error', 'Login Failed');
            return;
        }

        authToken = data.token;
        currentUser = data.user;

        console.log('Login successful:', currentUser);
        
        localStorage.setItem('movy_token', authToken);
        localStorage.setItem('movy_user', JSON.stringify(currentUser));

        updateUIForLoggedInUser();
        document.getElementById('authModal').classList.remove('active');

        showAlert('Welcome back, ' + currentUser.name + '!', 'success', 'Login Successful');

    } catch (error) {
        console.error('Login error:', error);
        showAlert('Unable to connect to server. Please check your connection and try again.', 'error', 'Connection Error');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert(data.error || 'Unable to create account', 'error', 'Signup Failed');
            return;
        }

        authToken = data.token;
        currentUser = data.user;

        localStorage.setItem('movy_token', authToken);
        localStorage.setItem('movy_user', JSON.stringify(currentUser));

        updateUIForLoggedInUser();
        document.getElementById('authModal').classList.remove('active');
        showAlert('Your account has been created successfully!', 'success', 'Welcome to MOVY');

    } catch (error) {
        console.error('Signup error:', error);
        showAlert('Unable to create account. Please check your connection and try again.', 'error', 'Signup Failed');
    }
}

function handleLogout() {
    authToken = null;
    currentUser = null;

    localStorage.removeItem('movy_token');
    localStorage.removeItem('movy_user');
    
    updateUIForLoggedOutUser();

    showAlert('You have been logged out successfully.', 'info', 'Goodbye!');
}


function updateUIForLoggedInUser() {
    console.log('Updating UI for logged in user:', currentUser);

    // Update header user dropdown
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'flex';

    
    // Update hero user dropdown
    const heroUserName = document.getElementById('heroUserName');
    const heroUserEmail = document.getElementById('heroUserEmail');
    const heroLoginBtn = document.getElementById('heroLoginBtn');
    const heroLogoutBtn = document.getElementById('heroLogoutBtn');
    
    if (heroUserName) heroUserName.textContent = currentUser.name;
    if (heroUserEmail) heroUserEmail.textContent = currentUser.email;
    if (heroLoginBtn) heroLoginBtn.style.display = 'none';
    if (heroLogoutBtn) heroLogoutBtn.style.display = 'flex';
    
    // Update mobile user menu
    const mobileUserName = document.getElementById('mobileUserName');
    const mobileUserEmail = document.getElementById('mobileUserEmail');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    
    if (mobileUserName) mobileUserName.textContent = currentUser.name;
    if (mobileUserEmail) mobileUserEmail.textContent = currentUser.email;
    if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
    if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'block';
}

function updateUIForLoggedOutUser() {

    // Update header user dropdown
    document.getElementById('userName').textContent = 'Guest';
    document.getElementById('userEmail').textContent = 'Not logged in';
    document.getElementById('loginBtn').style.display = 'flex';
    document.getElementById('logoutBtn').style.display = 'none';

    
    // Update hero user dropdown
    const heroUserName = document.getElementById('heroUserName');
    const heroUserEmail = document.getElementById('heroUserEmail');
    const heroLoginBtn = document.getElementById('heroLoginBtn');
    const heroLogoutBtn = document.getElementById('heroLogoutBtn');
    
    if (heroUserName) heroUserName.textContent = 'Guest';
    if (heroUserEmail) heroUserEmail.textContent = 'Not logged in';
    if (heroLoginBtn) heroLoginBtn.style.display = 'flex';
    if (heroLogoutBtn) heroLogoutBtn.style.display = 'none';
    
    // Update mobile user menu
    const mobileUserName = document.getElementById('mobileUserName');
    const mobileUserEmail = document.getElementById('mobileUserEmail');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    
    if (mobileUserName) mobileUserName.textContent = 'Guest';
    if (mobileUserEmail) mobileUserEmail.textContent = 'Not logged in';
    if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
    if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';
}

// Save watch progress to Supabase
async function saveWatchProgressToServer(progressData) {
    if (!authToken || !currentUser) return;

    try {
        const { error } = await supabase
            .from('watch_history')
            .upsert({
                user_id: currentUser.id,
                content_id: progressData.content_id,
                media_type: progressData.media_type,
                tmdb_id: progressData.tmdb_id,
                title: progressData.title,
                poster_path: progressData.poster_path,
                season: progressData.season,
                episode: progressData.episode,
                timestamp: progressData.timestamp,
                duration: progressData.duration,
                progress: progressData.progress,
                last_watched: new Date().toISOString()
            });
            
        if (error) {
            console.error('Failed to save watch history:', error);
        }
    } catch (error) {
        console.error('Failed to save watch history:', error);
    }
}

// Sync watch history from Supabase
async function syncWatchHistoryFromServer() {
    if (!authToken || !currentUser) return;

    try {
        const { data, error } = await supabase
            .from('watch_history')
            .select('*')
            .eq('user_id', currentUser.id)
            .lt('progress', 95)
            .order('last_watched', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Failed to sync watch history:', error);
            return;
        }

        // Merge with local storage
        data.forEach(item => {
            const key = `vidking_progress_${item.content_id}`;
            localStorage.setItem(key, JSON.stringify({
                timestamp: item.timestamp,
                duration: item.duration,
                progress: item.progress,
                mediaType: item.media_type,
                id: item.tmdb_id,
                season: item.season,
                episode: item.episode,
                lastWatched: new Date(item.last_watched).getTime()
            }));
        });
        
        // Reload continue watching if on home page
        if (typeof loadContinueWatching === 'function') {
            loadContinueWatching();
        }
    } catch (error) {
        console.error('Failed to sync watch history:', error);
    }
}

// Add to Watchlist/Favorites
async function addToWatchlist(tmdbId, mediaType, title, posterPath) {
    if (!authToken || !currentUser) {
        showAlert('Please login to add items to your watchlist', 'warning', 'Login Required');
        return false;
    }

    try {
        const response = await fetch(`${API_URL}/favorites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                tmdb_id: tmdbId,
                media_type: mediaType,
                title: title,
                poster_path: posterPath
            })
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.error && data.error.includes('Already in favorites')) {
                showAlert('This item is already in your watchlist', 'info', 'Already Added');
                return false;
            }
            showAlert(data.error || 'Failed to add to watchlist', 'error', 'Error');
            return false;
        }

        showAlert('Added to your watchlist!', 'success', 'Watchlist Updated');
        return true;
    } catch (error) {
        console.error('Add to watchlist error:', error);
        showAlert('Failed to add to watchlist', 'error', 'Error');
        return false;
    }
}

// Remove from Watchlist/Favorites
async function removeFromWatchlist(tmdbId, mediaType) {
    if (!authToken || !currentUser) {
        showAlert('Please login to manage your watchlist', 'warning', 'Login Required');
        return false;
    }

    try {
        const response = await fetch(`${API_URL}/favorites/${tmdbId}/${mediaType}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            showAlert(data.error || 'Failed to remove from watchlist', 'error', 'Error');
            return false;
        }

        showAlert('Removed from your watchlist', 'success', 'Watchlist Updated');
        return true;
    } catch (error) {
        console.error('Remove from watchlist error:', error);
        showAlert('Failed to remove from watchlist', 'error', 'Error');
        return false;
    }
}

// Get User's Watchlist
async function getWatchlist() {
    if (!authToken || !currentUser) {
        return [];
    }

    try {
        const response = await fetch(`${API_URL}/favorites`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch watchlist');
            return [];
        }

        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error('Get watchlist error:', error);
        return [];
    }
}

// Check if item is in watchlist
async function isInWatchlist(tmdbId, mediaType) {
    const watchlist = await getWatchlist();
    return watchlist.some(item => item.tmdb_id === tmdbId && item.media_type === mediaType);
}

// Export for use in app.js
window.FlixAuth = {
    getCurrentUser: () => currentUser,
    getAuthToken: () => authToken,
    isLoggedIn: () => !!authToken,
    logout: handleLogout,
    saveWatchProgress: saveWatchProgressToServer,
    syncWatchHistory: syncWatchHistoryFromServer,
    addToWatchlist: addToWatchlist,
    removeFromWatchlist: removeFromWatchlist,
    getWatchlist: getWatchlist,
    isInWatchlist: isInWatchlist
};


