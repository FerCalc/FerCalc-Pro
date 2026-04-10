// mi-app-frontend/src/api/patients.js
import axios from './axios.js';

// ── Pacientes ──
export const getPatientsAPI = () => axios.get('/patients');
export const getPatientByIdAPI = (id) => axios.get(`/patients/${id}`);
export const createPatientAPI = (data) => axios.post('/patients', data);
export const updatePatientAPI = (id, data) => axios.put(`/patients/${id}`, data);
export const deletePatientAPI = (id) => axios.delete(`/patients/${id}`);

// ── Consultas ──
export const getRecordsAPI = (patientId) => axios.get(`/patients/${patientId}/records`);
export const createRecordAPI = (patientId, data) => axios.post(`/patients/${patientId}/records`, data);
export const updateRecordAPI = (patientId, recordId, data) => axios.put(`/patients/${patientId}/records/${recordId}`, data);
export const deleteRecordAPI = (patientId, recordId) => axios.delete(`/patients/${patientId}/records/${recordId}`);