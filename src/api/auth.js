// src/api/auth.js

import axios from './axios.js'; // Importamos la instancia de Axios configurada

// Función para la petición de registro
// Recibe un objeto 'user' y hace una petición POST a '/register'
export const registerRequest = (user) => axios.post(`/register`, user);

// Función para la petición de login
// Recibe un objeto 'user' y hace una petición POST a '/login'
export const loginRequest = (user) => axios.post(`/login`, user);

// Función para la petición de cierre de sesión
// No necesita enviar datos, solo hace un POST a '/logout' para que el backend invalide la cookie
export const logoutRequest = () => axios.post(`/logout`);

// Función para verificar el token
// Hace una petición GET a '/verify'. La cookie se envía automáticamente gracias a 'withCredentials'
export const verifyTokenRequest = () => axios.get(`/verify`);