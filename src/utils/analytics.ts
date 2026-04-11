import ReactGA from "react-ga4";

/**
 * Initialize Google Analytics 4
 * @param measurementId The GA4 Measurement ID (starting with G-)
 */
export const initGA = (measurementId: string) => {
  // Enable debug_mode in development to see events immediately in GA4 DebugView
  const isDev = import.meta.env.DEV;
  
  ReactGA.initialize(measurementId, {
    gtagOptions: {
      debug_mode: isDev
    }
  });
  
  if (isDev) {
    console.log("GA4 Initialized in Debug Mode");
  }
};

/**
 * Track a page view manually if needed.
 */
export const trackPageView = (path?: string) => {
  ReactGA.send({ hitType: "pageview", page: path || window.location.pathname });
};

/**
 * Track custom events (e.g., clicks, downloads, form submissions)
 * GA4 Best Practice: Use snake_case for event names.
 */
export const trackEvent = (category: string, action: string, label?: string, extraParams: Record<string, any> = {}) => {
  // Standardize the action to snake_case for GA4 compatibility
  const eventName = action.toLowerCase().replace(/\s+/g, '_');
  
  ReactGA.event(eventName, {
    event_category: category,
    event_label: label,
    ...extraParams // This allows us to pass specific keys like project_name, skill_name, etc.
  });
};
