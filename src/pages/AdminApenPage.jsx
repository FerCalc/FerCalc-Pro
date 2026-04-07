// src/pages/AdminApenPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Trash2, Upload, CheckCircle,
  XCircle, AlertCircle, Search, RefreshCw, LogOut
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://tu-backend.onrender.com/api';

function AdminApenPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [correos, setCorreos] = useState([]);
  const [stats, setStats] = useState({ total: 0, registrados: 0, pendientes: 0 });
  const [busqueda, setBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null); // { tipo: 'ok'|'error', texto: '' }

  // ── Estados formulario individual
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [loadingAdd, setLoadingAdd] = useState(false);

  // ── Estados carga masiva
  const [textoCarga, setTextoCarga] = useState('');
  const [loadingMasivo, setLoadingMasivo] = useState(false);
  const [resultadoCarga, setResultadoCarga] = useState(null);

  // Redirigir si no es admin
  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/app');
  }, [user, navigate]);

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 5000);
  };

  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resCorreos, resStats] = await Promise.all([
        fetch(`${API}/admin/correos`, { credentials: 'include' }),
        fetch(`${API}/admin/estadisticas`, { credentials: 'include' }),
      ]);
      const dataCorreos = await resCorreos.json();
      const dataStats = await resStats.json();
      setCorreos(dataCorreos);
      setStats(dataStats);
    } catch {
      mostrarMensaje('error', 'Error al cargar los datos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  // ── Agregar correo individual
  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!nuevoEmail) return;
    setLoadingAdd(true);
    try {
      const res = await fetch(`${API}/admin/correos`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: nuevoEmail, nombre: nuevoNombre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      mostrarMensaje('ok', `Correo agregado correctamente.`);
      setNuevoEmail('');
      setNuevoNombre('');
      cargarDatos();
    } catch (err) {
      mostrarMensaje('error', err.message || 'Error al agregar el correo.');
    } finally {
      setLoadingAdd(false);
    }
  };

  // ── Eliminar correo
  const handleEliminar = async (id, email) => {
    if (!window.confirm(`¿Seguro que querés eliminar ${email}?`)) return;
    try {
      const res = await fetch(`${API}/admin/correos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      mostrarMensaje('ok', 'Correo eliminado.');
      cargarDatos();
    } catch {
      mostrarMensaje('error', 'Error al eliminar el correo.');
    }
  };

  // ── Carga masiva
  const handleCargaMasiva = async () => {
    if (!textoCarga.trim()) return;
    setLoadingMasivo(true);
    setResultadoCarga(null);
    try {
      const res = await fetch(`${API}/admin/correos/masivo`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correos: textoCarga }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResultadoCarga(data);
      setTextoCarga('');
      cargarDatos();
    } catch (err) {
      mostrarMensaje('error', err.message || 'Error en la carga masiva.');
    } finally {
      setLoadingMasivo(false);
    }
  };

  const correosFiltrados = correos.filter(c =>
    c.email.includes(busqueda.toLowerCase()) ||
    (c.nombre && c.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-green-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6" />
          <div>
            <h1 className="text-xl font-bold leading-tight">Panel de Administración APEN</h1>
            <p className="text-green-200 text-xs">Gestión de socios habilitados para FerCalc</p>
          </div>
        </div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-green-100 hover:text-white text-sm transition">
          <LogOut className="h-4 w-4" /> Volver a la app
        </button>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Mensaje de feedback */}
        {mensaje && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${
            mensaje.tipo === 'ok'
              ? 'bg-green-50 border-green-300 text-green-800'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}>
            {mensaje.tipo === 'ok' ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-red-500" />}
            {mensaje.texto}
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total socios', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
            { label: 'Ya registrados', value: stats.registrados, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
            { label: 'Pendientes', value: stats.pendientes, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} border rounded-2xl p-5 text-center`}>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Agregar correo individual */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" /> Agregar socio individual
            </h2>
            <form onSubmit={handleAgregar} className="space-y-3">
              <input
                type="text"
                placeholder="Nombre del socio (opcional)"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="email"
                placeholder="Correo electrónico *"
                value={nuevoEmail}
                onChange={(e) => setNuevoEmail(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <button
                type="submit"
                disabled={loadingAdd}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-xl transition text-sm"
              >
                {loadingAdd ? 'Agregando...' : 'Agregar Correo'}
              </button>
            </form>
          </div>

          {/* Carga masiva */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" /> Carga masiva
            </h2>
            <p className="text-xs text-gray-400 mb-3">
              Pegá la lista de correos separados por salto de línea, coma o punto y coma.
            </p>
            <textarea
              value={textoCarga}
              onChange={(e) => setTextoCarga(e.target.value)}
              placeholder={`socio1@correo.com\nsocio2@correo.com\nsocio3@correo.com`}
              rows={5}
              className="w-full border border-gray-300 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none"
            />
            {resultadoCarga && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 space-y-0.5">
                <p>✅ <strong>{resultadoCarga.agregados}</strong> correos agregados</p>
                <p>⚠️ <strong>{resultadoCarga.duplicados}</strong> ya existían (omitidos)</p>
                <p>📋 <strong>{resultadoCarga.total}</strong> correos procesados en total</p>
              </div>
            )}
            <button
              onClick={handleCargaMasiva}
              disabled={loadingMasivo || !textoCarga.trim()}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-xl transition text-sm"
            >
              {loadingMasivo ? 'Cargando...' : 'Importar Lista'}
            </button>
          </div>
        </div>

        {/* Tabla de correos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4 gap-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" /> Lista de socios habilitados
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-48"
                />
              </div>
              <button onClick={cargarDatos} className="p-2 text-gray-400 hover:text-green-600 transition" title="Actualizar">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Cargando...</div>
          ) : correosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No se encontraron correos.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Correo</th>
                    <th className="pb-3 pr-4">Nombre</th>
                    <th className="pb-3 pr-4">Estado</th>
                    <th className="pb-3 pr-4">Agregado</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {correosFiltrados.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 pr-4 font-medium text-gray-800">{c.email}</td>
                      <td className="py-3 pr-4 text-gray-500">{c.nombre || '—'}</td>
                      <td className="py-3 pr-4">
                        {c.registrado ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            <CheckCircle className="h-3 w-3" /> Registrado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            <XCircle className="h-3 w-3" /> Pendiente
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-400 text-xs">
                        {new Date(c.createdAt).toLocaleDateString('es-PY')}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleEliminar(c._id, c.email)}
                          className="text-red-400 hover:text-red-600 transition p-1 rounded-lg hover:bg-red-50"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminApenPage;
