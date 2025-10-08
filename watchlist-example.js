// Watchlist Feature Example
// Add this to your app.js or create a separate file

// Add watchlist button to movie cards
function addWatchlistButton(card, item, type) {
    const watchlistBtn = document.createElement('button');
    watchlistBtn.className = 'watchlist-btn';
    watchlistBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
        Add to Watchlist
    `;
    
    // Check if user is logged in
    if (!window.FlixAuth.isLoggedIn()) {
        watchlistBtn.addEventListener('click', () => {
            window.FlixAuth.addToWatchlist(item.id, type, item.title || item.name, item.poster_path);
        });
    } else {
        // Check if already in watchlist
        window.FlixAuth.isInWatchlist(item.id, type).then(inWatchlist => {
            if (inWatchlist) {
                watchlistBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 12l2 2 4-4"/>
                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
                    </svg>
                    In Watchlist
                `;
                watchlistBtn.classList.add('in-watchlist');
            }
        });
        
        watchlistBtn.addEventListener('click', async () => {
            const inWatchlist = await window.FlixAuth.isInWatchlist(item.id, type);
            if (inWatchlist) {
                await window.FlixAuth.removeFromWatchlist(item.id, type);
                watchlistBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                    </svg>
                    Add to Watchlist
                `;
                watchlistBtn.classList.remove('in-watchlist');
            } else {
                await window.FlixAuth.addToWatchlist(item.id, type, item.title || item.name, item.poster_path);
                watchlistBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 12l2 2 4-4"/>
                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
                    </svg>
                    In Watchlist
                `;
                watchlistBtn.classList.add('in-watchlist');
            }
        });
    }
    
    // Add button to card overlay
    const overlay = card.querySelector('.card-overlay');
    if (overlay) {
        overlay.appendChild(watchlistBtn);
    }
    
    return card;
}

// Example: Modified createSearchCard function with watchlist
function createSearchCardWithWatchlist(item, type) {
    const title = item.title || item.name;
    const posterPath = item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
        : 'https://via.placeholder.com/200x300?text=No+Image';
    
    const card = document.createElement('div');
    card.className = 'content-card';
    card.innerHTML = `
        <img src="${posterPath}" alt="${title}" loading="lazy">
        <div class="card-overlay">
            <h3>${title}</h3>
        </div>
    `;
    
    // Add watchlist button
    addWatchlistButton(card, item, type);
    
    card.addEventListener('click', () => {
        showDetails(item.id, type);
        searchOverlay.classList.remove('active');
        searchInput.value = '';
    });
    
    return card;
}

// Load and display user's watchlist
async function loadWatchlist() {
    if (!window.FlixAuth.isLoggedIn()) {
        console.log('User not logged in');
        return;
    }
    
    try {
        const watchlist = await window.FlixAuth.getWatchlist();
        console.log('User watchlist:', watchlist);
        
        // Display watchlist items
        const watchlistContainer = document.getElementById('watchlistContainer');
        if (watchlistContainer) {
            watchlistContainer.innerHTML = '';
            
            watchlist.forEach(item => {
                const card = document.createElement('div');
                card.className = 'content-card';
                card.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${item.title}" loading="lazy">
                    <div class="card-overlay">
                        <h3>${item.title}</h3>
                        <button class="remove-watchlist-btn" data-tmdb-id="${item.tmdb_id}" data-media-type="${item.media_type}">
                            Remove from Watchlist
                        </button>
                    </div>
                `;
                
                // Add remove functionality
                const removeBtn = card.querySelector('.remove-watchlist-btn');
                removeBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    await window.FlixAuth.removeFromWatchlist(item.tmdb_id, item.media_type);
                    card.remove();
                });
                
                watchlistContainer.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error loading watchlist:', error);
    }
}

// CSS for watchlist buttons (add to your styles.css)
const watchlistCSS = `
.watchlist-btn {
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid #fff;
    color: #fff;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    transition: all 0.3s ease;
    margin-top: 8px;
}

.watchlist-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #ff6b6b;
}

.watchlist-btn.in-watchlist {
    background: #ff6b6b;
    border-color: #ff6b6b;
}

.watchlist-btn svg {
    width: 14px;
    height: 14px;
}

.remove-watchlist-btn {
    background: #ff4757;
    border: none;
    color: #fff;
    padding: 6px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    margin-top: 8px;
}

.remove-watchlist-btn:hover {
    background: #ff3742;
}
`;

// Add CSS to page
const style = document.createElement('style');
style.textContent = watchlistCSS;
document.head.appendChild(style);
