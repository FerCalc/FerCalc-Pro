// frontend/src/api/axios.js (ACTUALIZADO)
import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://fercalc-pro.onrender.com', // <-- Pega la URL de tu backend de Render aquí
    withCredentials: true,
});

export default instance;