// src/api/auth.js

// ¡Importante! Asegúrate de que importa desde './axios', no desde 'axios' directamente.
import axios from './axios'; 

// Estas funciones simplemente definen el método (POST/GET) y la ruta específica.
export const registerRequest = (user) => axios.post(`/register`, user);

export const loginRequest = (user) => axios.post(`/login`, user);

export const verifyTokenRequest = () => axios.get('/verify');

// Es posible que tengas esta también, para el logout
export const logoutRequest = () => axios.post('/logout');