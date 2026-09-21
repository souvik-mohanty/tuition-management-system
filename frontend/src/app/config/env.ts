const useMockApi = (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true'

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  // Mock data for feature modules. Auth can be switched independently so Firebase login can be real
  // while other modules are still mocked.
  useMockApi,
  useMockAuth: (import.meta.env.VITE_USE_MOCK_AUTH ?? String(useMockApi)) === 'true',
  // Public Google OAuth web client ID (not the client secret, which must never be in the frontend).
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
  // Public Firebase web config only; never put private credentials here.
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  },
}
