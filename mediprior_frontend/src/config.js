// Central place for backend URLs.
// Override in production with REACT_APP_API_URL (e.g. in a .env file).
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');
