// src/api/axios.js
import axios from 'axios';

const instance = axios.create({
  // ESTA ES LA LÍNEA QUE DEBE SER CORREGIDA.
  // Reemplaza la URL con la de tu backend en Render.
  baseURL: 'https://fercalc-pro.onrender.com', // <-- ¡PON AQUÍ TU URL DE RENDER!
  
  withCredentials: true
});

export default instance;