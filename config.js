/**
 * Configuración de la aplicación
 * Este archivo maneja las URLs de la API según el entorno
 */

// Configuración de la API
const API_CONFIG = {
    // URLs de desarrollo
    development: {
        baseUrl: 'http://localhost:3000'
    },

    // URLs de producción
    production: {
        baseUrl: window.location.origin // Usa el mismo dominio y puerto
    }
};

// Función para obtener la configuración actual
function getApiConfig() {
    const hostname = window.location.hostname;

    // Detectar entorno
    const isDevelopment = hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.includes('localhost');

    return isDevelopment ? API_CONFIG.development : API_CONFIG.production;
}

// Función para obtener la URL base de la API
function getApiBaseUrl() {
    return getApiConfig().baseUrl;
}

// Función para obtener la URL completa de un endpoint
function getApiUrl(endpoint) {
    const baseUrl = getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
}

// Exportar funciones para uso global
window.getApiBaseUrl = getApiBaseUrl;
window.getApiUrl = getApiUrl;
window.API_CONFIG = API_CONFIG;
