// OAuth configuration based on environment
export const OAUTH_CONFIG = {
  google: {
    authUrl: import.meta.env.PROD 
      ? 'https://api.veeq.ai/api/auth/google'
      : 'http://localhost:5000/api/auth/google',
    origin: import.meta.env.PROD
      ? 'https://api.veeq.ai'
      : 'http://localhost:5000'
  }
}