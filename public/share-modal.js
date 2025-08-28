// Share modal functionality
(function() {
    'use strict';
    
    // Safe event listener wrapper to prevent null errors
    function safeAddEventListener(selector, event, handler) {
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (element && typeof element.addEventListener === 'function') {
            element.addEventListener(event, handler);
            return true;
        }
        return false;
    }
    
    // Safe query selector wrapper
    function safeQuerySelector(selector) {
        try {
            return document.querySelector(selector);
        } catch (e) {
            console.warn('Invalid selector:', selector);
            return null;
        }
    }
    
    // Initialize share modal functionality
    function initShareModal() {
        // Add event listeners for share buttons if they exist
        const shareButtons = document.querySelectorAll('[data-share-button]');
        shareButtons.forEach(button => {
            safeAddEventListener(button, 'click', handleShareClick);
        });
        
        // Add event listener for modal close buttons
        safeAddEventListener('[data-share-modal-close]', 'click', closeShareModal);
        safeAddEventListener('[data-share-modal-overlay]', 'click', closeShareModal);
    }
    
    function handleShareClick(event) {
        event.preventDefault();
        const modal = safeQuerySelector('[data-share-modal]');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }
    
    function closeShareModal(event) {
        event.preventDefault();
        const modal = safeQuerySelector('[data-share-modal]');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initShareModal);
    } else {
        // DOM is already ready
        initShareModal();
    }
})();