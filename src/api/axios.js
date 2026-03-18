// src/api/axios.js
import axios from 'axios';

const instance = axios.create({
  // ¡ESTA ES LA LÍNEA MÁS IMPORTANTE!
  baseURL: 'https://TU_API_DE_RENDER.onrender.com/api', 
  withCredentials: true
});

export default instance;