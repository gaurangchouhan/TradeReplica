/**
 * Google Analytics 4 Utility
 * Centralizes all analytics tracking logic.
 */

const GA_MEASUREMENT_ID = 'G-TMJQ1525FG';

// Initialize dataLayer
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

/**
 * Tracks a page view (Virtual Page View for SPA)
 * @param {string} page_path - The path of the page (e.g., '/dashboard')
 */
export function trackPageView(page_path) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
            page_path: page_path,
            page_title: document.title
        });
        console.log(`[Analytics] Page View: ${page_path}`);
    } else {
        console.warn('[Analytics] gtag not found for page view');
    }
}

/**
 * Generic Event Tracker
 * @param {string} eventName - The name of the event (e.g., 'login', 'click')
 * @param {object} params - Additional parameters
 */
export function trackEvent(eventName, params = {}) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
        console.log(`[Analytics] Event: ${eventName}`, params);
    }
}

// Helpers for specific events

export function trackLogin(method = 'standard') {
    trackEvent('login', { method: method });
}

export function trackSignup(method = 'standard') {
    trackEvent('sign_up', { method: method });
}

/**
 * Track button clicks
 * @param {string} buttonName - Name of the button clicked
 * @param {string} screenName - Screen where the click happened
 */
export function trackButton(buttonName, screenName) {
    trackEvent('button_click', {
        button_name: buttonName,
        screen_name: screenName
    });
}

/**
 * Track feature usage
 * @param {string} featureName - Name of the feature opened
 */
export function trackFeature(featureName) {
    trackEvent('feature_opened', {
        feature_name: featureName
    });
}

/**
 * Track form submissions
 * @param {string} formName - Name of the form submitted
 * @param {string} status - 'success' or 'failure'
 */
export function trackFormSubmit(formName, status) {
    trackEvent('form_submitted', {
        form_name: formName,
        status: status
    });
}

/**
 * Track errors
 * @param {string} errorType - Type of error
 * @param {string} screenName - Screen where the error occurred
 */
export function trackError(errorType, screenName) {
    trackEvent('error_occurred', {
        error_type: errorType,
        screen_name: screenName
    });
}
