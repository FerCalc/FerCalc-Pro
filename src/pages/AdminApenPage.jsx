// src/pages/AdminApenPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Trash2, Upload, CheckCircle, XCircle, AlertCircle, Search, RefreshCw, ArrowLeft, BarChart2, Activity, Monitor, Clock, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const API = import.meta.env.VITE_API_URL || 'https://fercalc-pro.onrender.com/api';
const COLORS = ['#16a34a', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6'];
const TABS = [{ key: 'socios', label: 'Socios APEN', icon: Users }, { key: 'analytics', label: 'Analytics', icon: BarChart2 }];

function AdminApenPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('socios');
  useEffect(() => { if (user && user.role !== 'admin') navigate('/app'); }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6" />
          <div><h1 className="text-xl font-bold">Panel de Administración APEN</h1><p className="text-green-200 text-xs">FerCalc — Gestión y Analytics</p></div>
        </div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-green-100 hover:text-white text-sm transition"><ArrowLeft className="h-4 w-4" /> Volver a la app</button>
      </header>
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex gap-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex items-center gap-2 py-4 px-5 border-b-2 font-semibold text-sm transition-all ${activeTab === key ? 'border-green-500 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </nav>
      </div>
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'socios' && <TabSocios />}
        {activeTab === 'analytics' && <TabAnalytics />}
      </div>
    </div>
  );
}

function TabSocios() {
  const [correos, setCorreos] = useState([]);
  const [stats, setStats] = useState({ total: 0, registrados: 0, pendientes: 0 });
  const [busqueda, setBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [textoCarga, setTextoCarga] = useState('');
  const [loadingMasivo, setLoadingMasivo] = useState(false);
  const [resultadoCarga, setResultadoCarga] = useState(null);

  const mostrarMensaje = (tipo, texto) => { setMensaje({ tipo, texto }); setTimeout(() => setMensaje(null), 5000); };

  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    try {
      const [r1, r2] = await Promise.all([fetch(`${API}/admin/correos`, { credentials: 'include' }), fetch(`${API}/admin/estadisticas`, { credentials: 'include' })]);
      setCorreos(await r1.json()); setStats(await r2.json());
    } catch { mostrarMensaje('error', 'Error al cargar.'); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const handleAgregar = async (e) => {
    e.preventDefault(); setLoadingAdd(true);
    try {
      const res = await fetch(`${API}/admin/correos`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: nuevoEmail, nombre: nuevoNombre }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      mostrarMensaje('ok', 'Correo agregado.'); setNuevoEmail(''); setNuevoNombre(''); cargarDatos();
    } catch (err) { mostrarMensaje('error', err.message); } finally { setLoadingAdd(false); }
  };

  const handleEliminar = async (id, email) => {
    if (!window.confirm(`¿Eliminar ${email}?`)) return;
    try { await fetch(`${API}/admin/correos/${id}`, { method: 'DELETE', credentials: 'include' }); mostrarMensaje('ok', 'Eliminado.'); cargarDatos(); }
    catch { mostrarMensaje('error', 'Error.'); }
  };

  const handleCargaMasiva = async () => {
    if (!textoCarga.trim()) return; setLoadingMasivo(true); setResultadoCarga(null);
    try {
      const res = await fetch(`${API}/admin/correos/masivo`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ correos: textoCarga }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.message);
      setResultadoCarga(data); setTextoCarga(''); cargarDatos();
    } catch (err) { mostrarMensaje('error', err.message); } finally { setLoadingMasivo(false); }
  };

  const filtrados = correos.filter(c => c.email.includes(busqueda.toLowerCase()) || (c.nombre && c.nombre.toLowerCase().includes(busqueda.toLowerCase())));

  return (
    <div className="space-y-6">
      {mensaje && <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${mensaje.tipo === 'ok' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'}`}>{mensaje.tipo === 'ok' ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-red-500" />}{mensaje.texto}</div>}
      <div className="grid grid-cols-3 gap-4">
        {[{ label: 'Total socios', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' }, { label: 'Ya registrados', value: stats.registrados, color: 'text-green-600', bg: 'bg-green-50 border-green-200' }, { label: 'Pendientes', value: stats.pendientes, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' }].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} border rounded-2xl p-5 text-center`}><p className={`text-3xl font-bold ${color}`}>{value}</p><p className="text-sm text-gray-500 mt-1">{label}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus className="h-5 w-5 text-green-600" /> Agregar socio individual</h2>
          <form onSubmit={handleAgregar} className="space-y-3">
            <input type="text" placeholder="Nombre (opcional)" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} className="w-full border border-gray-300 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <input type="email" placeholder="Correo electrónico *" value={nuevoEmail} onChange={e => setNuevoEmail(e.target.value)} required className="w-full border border-gray-300 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <button type="submit" disabled={loadingAdd} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-xl transition text-sm">{loadingAdd ? 'Agregando...' : 'Agregar Correo'}</button>
          </form>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2"><Upload className="h-5 w-5 text-blue-600" /> Carga masiva</h2>
          <p className="text-xs text-gray-400 mb-3">Pegá correos separados por salto de línea, coma o punto y coma.</p>
          <textarea value={textoCarga} onChange={e => setTextoCarga(e.target.value)} placeholder={`socio1@correo.com\nsocio2@correo.com`} rows={4} className="w-full border border-gray-300 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none" />
          {resultadoCarga && <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 space-y-0.5"><p>✅ <strong>{resultadoCarga.agregados}</strong> agregados</p><p>⚠️ <strong>{resultadoCarga.duplicados}</strong> ya existían</p><p>📋 <strong>{resultadoCarga.total}</strong> procesados</p></div>}
          <button onClick={handleCargaMasiva} disabled={loadingMasivo || !textoCarga.trim()} className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-xl transition text-sm">{loadingMasivo ? 'Cargando...' : 'Importar Lista'}</button>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4 gap-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Users className="h-5 w-5 text-gray-500" /> Lista de socios</h2>
          <div className="flex items-center gap-2">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-48" /></div>
            <button onClick={cargarDatos} className="p-2 text-gray-400 hover:text-green-600"><RefreshCw className="h-4 w-4" /></button>
          </div>
        </div>
        {isLoading ? <div className="text-center py-12 text-gray-400 text-sm">Cargando...</div> : filtrados.length === 0 ? <div className="text-center py-12 text-gray-400 text-sm">No se encontraron correos.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead><tr className="border-b border-gray-200 text-xs text-gray-400 uppercase tracking-wider"><th className="pb-3 pr-4">Correo</th><th className="pb-3 pr-4">Nombre</th><th className="pb-3 pr-4">Estado</th><th className="pb-3 pr-4">Agregado</th><th className="pb-3"></th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-800">{c.email}</td>
                    <td className="py-3 pr-4 text-gray-500">{c.nombre || '—'}</td>
                    <td className="py-3 pr-4">{c.registrado ? <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full"><CheckCircle className="h-3 w-3" /> Registrado</span> : <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full"><XCircle className="h-3 w-3" /> Pendiente</span>}</td>
                    <td className="py-3 pr-4 text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString('es-PY')}</td>
                    <td className="py-3"><button onClick={() => handleEliminar(c._id, c.email)} className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function TabAnalytics() {
  const hoy = new Date().toISOString().split('T')[0];
  const hace30 = new Date(Date.now() - 30*86400000).toISOString().split('T')[0];
  const [desde, setDesde] = useState(hace30);
  const [hasta, setHasta] = useState(hoy);
  const [resumen, setResumen] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [totalEventos, setTotalEventos] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const p = new URLSearchParams({ desde, hasta, page: pagina, limit: 50 });
      const [r1, r2] = await Promise.all([fetch(`${API}/admin/analytics/resumen?${p}`, { credentials: 'include' }), fetch(`${API}/admin/analytics/eventos?${p}`, { credentials: 'include' })]);
      setResumen(await r1.json());
      const ev = await r2.json(); setEventos(ev.eventos || []); setTotalEventos(ev.total || 0);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, [desde, hasta, pagina]);

  useEffect(() => { cargar(); }, [cargar]);

  const horasData = Array.from({ length: 24 }, (_, h) => ({ hora: `${String(h).padStart(2,'0')}:00`, cantidad: resumen?.loginsPorHora?.find(x => x._id === h)?.cantidad || 0 }));
  const eventosFiltrados = eventos.filter(e => e.email.includes(busqueda.toLowerCase()) || e.username.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Calendar className="h-4 w-4" /> Filtro de período</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div><label className="block text-xs text-gray-500 mb-1">Desde</label><input type="date" value={desde} onChange={e => { setDesde(e.target.value); setPagina(1); }} className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Hasta</label><input type="date" value={hasta} onChange={e => { setHasta(e.target.value); setPagina(1); }} className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          {[{ label: 'Hoy', d: hoy, h: hoy }, { label: '7 días', d: new Date(Date.now()-7*86400000).toISOString().split('T')[0], h: hoy }, { label: '30 días', d: hace30, h: hoy }, { label: 'Todo', d: '2024-01-01', h: hoy }].map(({ label, d, h }) => (
            <button key={label} onClick={() => { setDesde(d); setHasta(h); setPagina(1); }} className="px-4 py-2 bg-gray-100 hover:bg-green-100 hover:text-green-700 text-gray-600 text-sm font-medium rounded-xl transition">{label}</button>
          ))}
          <button onClick={cargar} className="p-2 text-gray-400 hover:text-green-600 ml-auto"><RefreshCw className="h-4 w-4" /></button>
        </div>
      </div>

      {isLoading ? <div className="text-center py-16 text-gray-400">Cargando analytics...</div> : resumen ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total ingresos', value: resumen.totalLogins, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
              { label: 'Usuarios activos', value: resumen.usuariosUnicos, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
              { label: 'Total usuarios', value: resumen.totalUsuarios, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
              { label: 'Promedio diario', value: resumen.loginsPorDia.length > 0 ? (resumen.totalLogins/resumen.loginsPorDia.length).toFixed(1) : 0, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`${bg} border rounded-2xl p-5`}><div className="flex items-center gap-2 mb-2"><Icon className={`h-4 w-4 ${color}`} /><p className="text-xs text-gray-500 font-medium">{label}</p></div><p className={`text-3xl font-bold ${color}`}>{value}</p></div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" /> Ingresos por día</h3>
              {resumen.loginsPorDia.length === 0 ? <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Sin datos</div> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={resumen.loginsPorDia} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip labelFormatter={l => `Fecha: ${l}`} formatter={v => [v, 'Ingresos']} />
                    <Bar dataKey="cantidad" fill="#16a34a" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><Monitor className="h-4 w-4 text-blue-500" /> Por dispositivo</h3>
              {resumen.loginsPorDispositivo.length === 0 ? <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Sin datos</div> : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart><Pie data={resumen.loginsPorDispositivo} dataKey="cantidad" nameKey="_id" cx="50%" cy="50%" outerRadius={65} labelLine={false} fontSize={10}>{resumen.loginsPorDispositivo.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={v => [v, 'Ingresos']} /></PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">{resumen.loginsPorDispositivo.map((d, i) => (<div key={d._id} className="flex items-center justify-between text-xs"><div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i%COLORS.length] }} /><span className="text-gray-600">{d._id}</span></div><span className="font-semibold text-gray-800">{d.cantidad}</span></div>))}</div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><Clock className="h-4 w-4 text-orange-500" /> Horas pico</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={horasData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hora" tick={{ fontSize: 10 }} interval={3} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip formatter={v => [v, 'Ingresos']} />
                  <Line type="monotone" dataKey="cantidad" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-purple-500" /> Usuarios más activos</h3>
              {resumen.topUsuarios.length === 0 ? <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Sin datos</div> : (
                <div className="space-y-2">{resumen.topUsuarios.slice(0, 8).map((u, i) => (
                  <div key={u._id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-5">{i+1}</span>
                    <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">{u.username}</p><p className="text-xs text-gray-400 truncate">{u._id}</p></div>
                    <div className="flex items-center gap-2"><div className="w-16 bg-gray-100 rounded-full h-1.5"><div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${(u.logins/resumen.topUsuarios[0].logins)*100}%` }} /></div><span className="text-sm font-bold text-gray-700 w-6 text-right">{u.logins}</span></div>
                  </div>
                ))}</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Activity className="h-4 w-4 text-gray-500" /> Registro detallado <span className="text-xs text-gray-400 font-normal">({totalEventos} en total)</span></h3>
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Buscar usuario..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-52" /></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead><tr className="border-b border-gray-200 text-xs text-gray-400 uppercase tracking-wider"><th className="pb-3 pr-4">Usuario</th><th className="pb-3 pr-4">Correo</th><th className="pb-3 pr-4">Dispositivo</th><th className="pb-3 pr-4">Fecha</th><th className="pb-3">Hora</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {eventosFiltrados.length === 0 ? <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">Sin registros.</td></tr> : eventosFiltrados.map(ev => {
                    const f = new Date(ev.createdAt);
                    return <tr key={ev._id} className="hover:bg-gray-50"><td className="py-2.5 pr-4 font-medium text-gray-800">{ev.username}</td><td className="py-2.5 pr-4 text-gray-500 text-xs">{ev.email}</td><td className="py-2.5 pr-4 text-gray-500 text-xs max-w-[180px] truncate">{ev.dispositivo}</td><td className="py-2.5 pr-4 text-gray-500 text-xs">{f.toLocaleDateString('es-PY')}</td><td className="py-2.5 text-gray-500 text-xs">{f.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}</td></tr>;
                  })}
                </tbody>
              </table>
            </div>
            {totalEventos > 50 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">Mostrando {Math.min((pagina-1)*50+1, totalEventos)}–{Math.min(pagina*50, totalEventos)} de {totalEventos}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPagina(p => Math.max(1, p-1))} disabled={pagina===1} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Anterior</button>
                  <button onClick={() => setPagina(p => p+1)} disabled={pagina*50>=totalEventos} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Siguiente →</button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : <div className="text-center py-16 text-gray-400">No hay datos.</div>}
    </div>
  );
}

export default AdminApenPage;
