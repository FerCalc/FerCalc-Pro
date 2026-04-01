// src/api/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://fercalc-pro.onrender.com/api',
  withCredentials: true
});

export default instance;