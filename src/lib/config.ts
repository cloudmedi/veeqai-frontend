// Global API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  AUTH: `${API_BASE_URL}/api/auth`,
  VOICES: `${API_BASE_URL}/api/voices`,
  MUSIC: `${API_BASE_URL}/api/music`,
  PREFERENCES: `${API_BASE_URL}/api/preferences`
} as const;