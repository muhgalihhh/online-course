// Placeholder file to prevent "Cannot read properties of null (reading 'addEventListener')" error
// This file is referenced somewhere in the application but doesn't exist

console.log('Share modal script loaded');

// Safe event listener wrapper
function safeAddEventListener(element, event, handler) {
    if (element && typeof element.addEventListener === 'function') {
        element.addEventListener(event, handler);
    } else {
        console.warn('Element not found or addEventListener not available:', element);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Share modal initialized');
    });
} else {
    console.log('Share modal initialized (DOM already ready)');
}