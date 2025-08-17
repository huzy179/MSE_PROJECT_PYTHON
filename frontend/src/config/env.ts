// Environment configuration
export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',

  // App Configuration
  appTitle: import.meta.env.VITE_APP_TITLE || 'MSE Frontend',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // Feature flags
  enableDebugLogs: import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true',

  // Development mode check
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// Validate required environment variables
const requiredEnvVars = ['VITE_API_BASE_URL'] as const;

export const validateEnv = () => {
  const missing = requiredEnvVars.filter((envVar) => !import.meta.env[envVar]);

  if (missing.length > 0) {
    console.warn(
      `Missing environment variables: ${missing.join(', ')}. Using default values.`
    );
  }
};

// Call validation on import
validateEnv();
