/**
 * Comprehensive cache and storage cleanup utilities
 * Use these functions to ensure complete session cleanup across all role interfaces
 */

export interface ClearCacheOptions {
  includeServiceWorkerCache?: boolean;
  includeIndexedDB?: boolean;
  includeBroadcastChannel?: boolean;
  forceReload?: boolean;
}

/**
 * Clear all browser storage and cache for complete logout
 */
export const clearAllUserData = async (options: ClearCacheOptions = {}) => {
  const {
    includeServiceWorkerCache = true,
    includeIndexedDB = true,
    includeBroadcastChannel = true,
    forceReload = true
  } = options;

  console.log('[CacheUtils] Starting comprehensive cleanup...');

  try {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      console.warn('[CacheUtils] Not in browser environment, skipping cleanup');
      return;
    }

    // 1. Clear localStorage
    console.log('[CacheUtils] Clearing localStorage...');
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach(key => {
      if (key.includes('user') || key.includes('auth') || key.includes('token') || 
          key.includes('clinic') || key.includes('session') || key.includes('settings')) {
        localStorage.removeItem(key);
      }
    });

    // 2. Clear sessionStorage
    console.log('[CacheUtils] Clearing sessionStorage...');
    sessionStorage.clear();

    // 3. Clear Cache API
    if (includeServiceWorkerCache && 'caches' in window) {
      console.log('[CacheUtils] Clearing Cache API...');
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log(`[CacheUtils] Deleting cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
      } catch (cacheError) {
        console.warn('[CacheUtils] Failed to clear Cache API:', cacheError);
      }
    }

    // 4. Clear IndexedDB
    if (includeIndexedDB && 'indexedDB' in window) {
      console.log('[CacheUtils] Clearing IndexedDB...');
      try {
        const databases = await indexedDB.databases();
        await Promise.all(
          databases.map(db => {
            if (db.name && (db.name.includes('clinic') || db.name.includes('user') || 
                           db.name.includes('auth') || db.name.includes('session'))) {
              console.log(`[CacheUtils] Deleting database: ${db.name}`);
              return new Promise<void>((resolve, reject) => {
                const deleteReq = indexedDB.deleteDatabase(db.name!);
                deleteReq.onsuccess = () => resolve();
                deleteReq.onerror = () => reject(deleteReq.error);
                deleteReq.onblocked = () => {
                  console.warn(`[CacheUtils] Database deletion blocked: ${db.name}`);
                  resolve(); // Continue even if blocked
                };
              });
            }
            return Promise.resolve();
          })
        );
      } catch (idbError) {
        console.warn('[CacheUtils] Failed to clear IndexedDB:', idbError);
      }
    }

    // 5. Clear BroadcastChannel connections
    if (includeBroadcastChannel && 'BroadcastChannel' in window) {
      console.log('[CacheUtils] Clearing BroadcastChannel connections...');
      try {
        // Send logout message to all tabs/windows
        const logoutChannel = new BroadcastChannel('clinic-logout');
        logoutChannel.postMessage({ type: 'FORCE_LOGOUT', timestamp: Date.now() });
        logoutChannel.close();
      } catch (bcError) {
        console.warn('[CacheUtils] Failed to clear BroadcastChannel:', bcError);
      }
    }

    // 6. Clear any WebSocket connections
    console.log('[CacheUtils] Clearing WebSocket connections...');
    // Close any existing WebSocket connections that might be storing user data
    // This is application-specific and may need customization

    // 7. Clear service worker registrations related to user data
    if ('serviceWorker' in navigator) {
      console.log('[CacheUtils] Checking service workers...');
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        registrations.forEach(registration => {
          // Only unregister if it's related to user-specific functionality
          if (registration.scope.includes('user') || registration.scope.includes('auth')) {
            console.log(`[CacheUtils] Unregistering service worker: ${registration.scope}`);
            registration.unregister();
          }
        });
      } catch (swError) {
        console.warn('[CacheUtils] Failed to check service workers:', swError);
      }
    }

    console.log('[CacheUtils] Comprehensive cleanup completed');

    // 8. Force reload if requested (after a small delay)
    if (forceReload) {
      setTimeout(() => {
        console.log('[CacheUtils] Force reloading page...');
        window.location.reload();
      }, 100);
    }

  } catch (error) {
    console.error('[CacheUtils] Error during cleanup:', error);
    // Fallback: at least clear storage
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
  }
};

/**
 * Clear only specific user session data (lighter cleanup)
 */
export const clearUserSession = () => {
  console.log('[CacheUtils] Clearing user session data...');
  
  if (typeof window === 'undefined') return;

  // Clear specific session items
  const sessionKeys = [
    'accessToken',
    'userData',
    'clinic-user-role',
    'userPreferences',
    'lastLoginTime'
  ];

  sessionKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  console.log('[CacheUtils] User session cleared');
};

/**
 * Set up BroadcastChannel listener for cross-tab logout
 */
export const setupCrossTabLogout = (onLogout: () => void) => {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return null;
  }

  const channel = new BroadcastChannel('clinic-logout');
  
  channel.onmessage = (event) => {
    if (event.data?.type === 'FORCE_LOGOUT') {
      console.log('[CacheUtils] Received cross-tab logout signal');
      onLogout();
    }
  };

  return channel;
};

/**
 * Check if user data exists in any storage
 */
export const hasUserData = (): boolean => {
  if (typeof window === 'undefined') return false;

  const hasLocalStorage = Boolean(
    localStorage.getItem('accessToken') || 
    localStorage.getItem('userData') ||
    localStorage.getItem('clinic-user-role')
  );

  const hasSessionStorage = Boolean(
    sessionStorage.getItem('accessToken') || 
    sessionStorage.getItem('userData')
  );

  return hasLocalStorage || hasSessionStorage;
}; 