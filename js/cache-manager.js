// Cache Manager for Force Refresh
class CacheManager {
    constructor() {
        this.version = '1.0.0';
        this.cachePrefix = 'youkoso-cache-';
    }

    // Clear all caches
    async clearAllCaches() {
        try {
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => {
                        console.log('Deleting cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            }
            
            // Clear localStorage cache keys
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.cachePrefix)) {
                    localStorage.removeItem(key);
                }
            });
            
            // Clear sessionStorage
            sessionStorage.clear();
            
            console.log('All caches cleared successfully');
            return true;
        } catch (error) {
            console.error('Error clearing caches:', error);
            return false;
        }
    }

    // Force refresh specific images
    forceRefreshImages(imageUrls) {
        const timestamp = new Date().getTime();
        return imageUrls.map(url => {
            if (!url) return '';
            // Add timestamp to force reload
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}t=${timestamp}`;
        });
    }

    // Clear image cache and reload
    async clearImageCache() {
        try {
            // Get all img elements
            const images = document.querySelectorAll('img');
            const timestamp = new Date().getTime();
            
            images.forEach(img => {
                if (img.src && !img.src.includes('data:')) {
                    const originalSrc = img.src.split('?')[0];
                    img.src = `${originalSrc}?t=${timestamp}`;
                }
            });
            
            console.log('Image cache cleared and images reloaded');
            return true;
        } catch (error) {
            console.error('Error clearing image cache:', error);
            return false;
        }
    }

    // Force hard refresh
    forceHardRefresh() {
        // Clear all caches first
        this.clearAllCaches().then(() => {
            // Force reload without cache
            window.location.reload();
        });
    }
}

// Create global instance
window.cacheManager = new CacheManager();

// Auto-clear cache on page load if needed
document.addEventListener('DOMContentLoaded', function() {
    // Check if cache clear is requested
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('clearCache') === 'true') {
        window.cacheManager.clearAllCaches().then(() => {
            // Remove the parameter and reload
            urlParams.delete('clearCache');
            const newUrl = window.location.pathname + 
                (urlParams.toString() ? '?' + urlParams.toString() : '');
            window.history.replaceState({}, '', newUrl);
        });
    }
});