// mi-app-frontend/src/pages/PatientsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPatientsAPI, createPatientAPI, updatePatientAPI, deletePatientAPI,
  getRecordsAPI, createRecordAPI, deleteRecordAPI,
} from '../api/patients.js';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  Users, Plus, X, Edit, Trash2, ArrowLeft, ChevronRight,
  TrendingUp, Scale, Zap, Activity, BookOpen, Calendar,
  Eye, Save, AlertTriangle, BarChart2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// ── Colores de gráficos ──
const CHART_COLORS = {
  peso: '#3b82f6',
  imc: '#8b5cf6',
  calorias: '#f59e0b',
  proteinas: '#ef4444',
  hc: '#10b981',
  grasas: '#f97316',
  pavb: '#06b6d4',
};

const IMC_ZONES = [
  { min: 0, max: 18.5, label: 'Bajo peso', color: '#93c5fd' },
  { min: 18.5, max: 25, label: 'Normal', color: '#86efac' },
  { min: 25, max: 30, label: 'Sobrepeso', color: '#fde68a' },
  { min: 30, max: 50, label: 'Obesidad', color: '#fca5a5' },
];

// ── Componente Modal ──
const Modal = ({ title, onClose, children, maxWidth = 'max-w-lg' }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
    <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[92vh] overflow-y-auto`}>
      <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white rounded-t-2xl z-10">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors"><X size={22} /></button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// ── Formulario de Paciente ──
const PatientForm = ({ initial, onSave, onCancel, loading }) => {
  const [form, setForm] = useState(() => {
    // ✅ Usando función inicializadora — sin duplicar claves
    const base = {
      nombre: '', apellido: '', email: '', telefono: '',
      fechaNacimiento: '', sexo: 'Masculino', notas: '',
    };
    if (!initial) return base;
    return {
      ...base,
      ...initial,
      fechaNacimiento: initial.fechaNacimiento
        ? new Date(initial.fechaNacimiento).toISOString().split('T')[0]
        : '',
    };
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-xl p-3">
        Los datos clínicos (peso, altura, dieta) se guardan automáticamente desde FerCalc al usar <span className="font-semibold text-blue-700">"Guardar Datos del Paciente"</span> en el menú.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
            className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
          <input value={form.apellido} onChange={e => setForm(p => ({ ...p, apellido: e.target.value }))}
            className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
            className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
          <input type="date" value={form.fechaNacimiento} onChange={e => setForm(p => ({ ...p, fechaNacimiento: e.target.value }))}
            className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
          <select value={form.sexo} onChange={e => setForm(p => ({ ...p, sexo: e.target.value }))}
            className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm">
            <option>Masculino</option>
            <option>Femenino</option>
            <option>Otro</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
          rows={3} placeholder="Diagnósticos, alergias, observaciones..."
          className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm resize-none" />
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium text-sm">Cancelar</button>
        <button onClick={() => onSave(form)} disabled={loading || !form.nombre.trim()}
          className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium text-sm disabled:opacity-50">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
};

// ── Tarjeta de paciente ──
const PatientCard = ({ patient, onClick, onEdit, onDelete }) => {
  const initials = `${patient.nombre?.[0] || ''}${patient.apellido?.[0] || ''}`.toUpperCase() || '?';
  const lastConsulta = patient.ultimaConsulta;
  const imcVal = lastConsulta?.metricas?.imc;
  const imcColor = !imcVal ? 'text-gray-400'
    : imcVal < 18.5 ? 'text-blue-500'
    : imcVal < 25 ? 'text-green-600'
    : imcVal < 30 ? 'text-yellow-600' : 'text-red-500';

  return (
    <div className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition-all cursor-pointer group"
      onClick={() => onClick(patient)}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {initials}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                {patient.nombre} {patient.apellido}
              </h3>
              <p className="text-sm text-gray-500">{patient.sexo} · {patient.email || 'Sin email'}</p>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <button onClick={() => onEdit(patient)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={15} /></button>
            <button onClick={() => onDelete(patient)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded-xl p-2">
            <p className="text-xs text-gray-500">Consultas</p>
            <p className="text-lg font-bold text-gray-800">{patient.consultaCount || 0}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2">
            <p className="text-xs text-gray-500">IMC</p>
            <p className={`text-lg font-bold ${imcColor}`}>{imcVal?.toFixed(1) || '—'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2">
            <p className="text-xs text-gray-500">Peso</p>
            <p className="text-lg font-bold text-gray-800">{lastConsulta?.metricas?.peso ? `${lastConsulta.metricas.peso}kg` : '—'}</p>
          </div>
        </div>

        {lastConsulta && (
          <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
            <Calendar size={11} />
            Última consulta: {new Date(lastConsulta.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
            {lastConsulta.nombre && ` — ${lastConsulta.nombre}`}
          </p>
        )}
      </div>
      <div className="px-5 py-3 bg-gray-50 rounded-b-2xl border-t flex items-center justify-between text-sm text-gray-500 group-hover:text-green-600 transition-colors">
        <span>Ver historial y progreso</span>
        <ChevronRight size={16} />
      </div>
    </div>
  );
};

// ── Vista detalle de paciente con gráficos ──
const PatientDetail = ({ patient, onBack, getAllData }) => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('peso');
  const [savingRecord, setSavingRecord] = useState(false);
  const [recordName, setRecordName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRecordsAPI(patient._id);
      setRecords(res.data);
    } catch {
      toast.error('Error al cargar el historial.');
    } finally {
      setLoading(false);
    }
  }, [patient._id]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleSaveRecord = async () => {
    if (!recordName.trim()) { toast.error('Ingresa un nombre para la consulta.'); return; }
    setSavingRecord(true);
    try {
      const data = getAllData();
      await createRecordAPI(patient._id, { nombre: recordName.trim(), ...data });
      toast.success('Consulta guardada.');
      setShowSaveModal(false);
      setRecordName('');
      fetchRecords();
    } catch {
      toast.error('Error al guardar la consulta.');
    } finally {
      setSavingRecord(false);
    }
  };

  const handleDeleteRecord = async (record) => {
    try {
      await deleteRecordAPI(patient._id, record._id);
      toast.success('Consulta eliminada.');
      setDeleteConfirm(null);
      fetchRecords();
    } catch {
      toast.error('Error al eliminar.');
    }
  };

  // Datos para gráficos — ordenados por fecha ASC
  const chartData = [...records]
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .map(r => ({
      name: new Date(r.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      consulta: r.nombre,
      peso: r.metricas?.peso,
      imc: r.metricas?.imc,
      calorias: r.metricas?.calorias,
      proteinas: r.metricas?.proteinas,
      hc: r.metricas?.hc,
      grasas: r.metricas?.grasas,
      pavb: r.metricas?.pavb,
    }));

  const metrics = [
    { key: 'peso', label: 'Peso (kg)', icon: <Scale size={16} />, color: CHART_COLORS.peso, unit: 'kg' },
    { key: 'imc', label: 'IMC', icon: <Activity size={16} />, color: CHART_COLORS.imc, unit: '' },
    { key: 'calorias', label: 'Calorías', icon: <Zap size={16} />, color: CHART_COLORS.calorias, unit: 'kcal' },
    { key: 'proteinas', label: 'Proteínas (g)', icon: <TrendingUp size={16} />, color: CHART_COLORS.proteinas, unit: 'g' },
    { key: 'hc', label: 'HC (g)', icon: <BarChart2 size={16} />, color: CHART_COLORS.hc, unit: 'g' },
    { key: 'grasas', label: 'Grasas (g)', icon: <Activity size={16} />, color: CHART_COLORS.grasas, unit: 'g' },
    { key: 'pavb', label: '% PAVB', icon: <BookOpen size={16} />, color: CHART_COLORS.pavb, unit: '%' },
  ];

  const currentMetric = metrics.find(m => m.key === activeMetric);

  // Calcular tendencia
  const validData = chartData.filter(d => d[activeMetric] != null);
  const tendencia = validData.length >= 2
    ? ((validData[validData.length - 1][activeMetric] - validData[0][activeMetric]) /
       Math.abs(validData[0][activeMetric] || 1) * 100).toFixed(1)
    : null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border rounded-xl shadow-lg p-3 text-sm">
        <p className="font-bold text-gray-700 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value?.toFixed(1)} {currentMetric?.unit}</span>
          </p>
        ))}
        {payload[0]?.payload?.consulta && (
          <p className="text-gray-400 text-xs mt-1 italic">{payload[0].payload.consulta}</p>
        )}
      </div>
    );
  };

  const lastRecord = records[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl">
              {`${patient.nombre?.[0] || ''}${patient.apellido?.[0] || ''}`.toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{patient.nombre} {patient.apellido}</h2>
              <p className="text-gray-500 text-sm">{patient.sexo} · {patient.email || 'Sin email'} · {patient.telefono || 'Sin teléfono'}</p>
              {patient.notas && <p className="text-gray-400 text-xs mt-0.5 italic">{patient.notas}</p>}
            </div>
          </div>
          <button onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-colors">
            <Save size={18} /> Guardar consulta actual
          </button>
        </div>
      </div>

      {/* Cards resumen */}
      {lastRecord && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Peso actual', value: lastRecord.metricas?.peso, unit: 'kg', color: 'blue' },
            { label: 'IMC', value: lastRecord.metricas?.imc, unit: '', color: 'purple' },
            { label: 'Calorías', value: lastRecord.metricas?.calorias, unit: 'kcal', color: 'amber' },
            { label: '% PAVB', value: lastRecord.metricas?.pavb, unit: '%', color: 'cyan' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-2xl p-4 text-center`}>
              <p className={`text-sm text-${color}-700 font-medium`}>{label}</p>
              <p className={`text-2xl font-bold text-${color}-800 mt-1`}>
                {value != null ? `${parseFloat(value).toFixed(1)} ${unit}` : '—'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Gráfico de progreso */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Progreso del Paciente</h3>
            {tendencia !== null && (
              <p className={`text-sm mt-0.5 ${parseFloat(tendencia) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                {parseFloat(tendencia) > 0 ? '↑' : '↓'} {Math.abs(parseFloat(tendencia))}% desde la primera consulta
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {metrics.map(m => (
              <button key={m.key} onClick={() => setActiveMetric(m.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeMetric === m.key ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                style={activeMetric === m.key ? { backgroundColor: m.color } : {}}>
                {m.icon}{m.label}
              </button>
            ))}
          </div>
        </div>

        {chartData.length < 2 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-xl">
            <div className="text-center">
              <BarChart2 size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Necesitas al menos 2 consultas para ver el gráfico de progreso.</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              {activeMetric === 'imc' && IMC_ZONES.map(zone => (
                <ReferenceLine key={zone.label} y={zone.max} stroke={zone.color} strokeDasharray="4 4" label={{ value: zone.label, fontSize: 10, fill: '#9ca3af' }} />
              ))}
              <Line
                type="monotone"
                dataKey={activeMetric}
                stroke={currentMetric?.color}
                strokeWidth={2.5}
                dot={{ r: 5, fill: currentMetric?.color, strokeWidth: 2, stroke: 'white' }}
                activeDot={{ r: 7 }}
                name={currentMetric?.label}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Comparación de macros entre consultas */}
      {chartData.length >= 2 && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-5">Comparación de Macronutrientes</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="proteinas" fill={CHART_COLORS.proteinas} name="Proteínas (g)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="hc" fill={CHART_COLORS.hc} name="HC (g)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="grasas" fill={CHART_COLORS.grasas} name="Grasas (g)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Historial de consultas */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-green-600" />
          Historial de Consultas ({records.length})
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Calendar size={36} className="mx-auto mb-2 opacity-30" />
            <p>No hay consultas guardadas aún.</p>
            <p className="text-sm mt-1">Guardá la consulta actual usando el botón de arriba.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(record => (
              <div key={record._id}
                className="flex items-center justify-between p-4 bg-gray-50 border rounded-xl hover:border-green-300 transition-colors group">
                <div className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                  onClick={() => setSelectedRecord(selectedRecord?._id === record._id ? null : record)}>
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-green-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{record.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(record.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="hidden md:flex gap-4 text-sm ml-4">
                    {record.metricas?.peso && <span className="text-blue-600 font-medium">{record.metricas.peso} kg</span>}
                    {record.metricas?.imc && <span className="text-purple-600 font-medium">IMC {record.metricas.imc}</span>}
                    {record.metricas?.calorias && <span className="text-amber-600 font-medium">{record.metricas.calorias} kcal</span>}
                  </div>
                </div>
                <div className="flex gap-2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setSelectedRecord(selectedRecord?._id === record._id ? null : record)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => setDeleteConfirm(record)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel de detalles de consulta expandido */}
      {selectedRecord && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Detalles: {selectedRecord.nombre}</h3>
            <button onClick={() => setSelectedRecord(null)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Peso', value: selectedRecord.metricas?.peso, unit: 'kg' },
              { label: 'Altura', value: selectedRecord.metricas?.altura, unit: 'cm' },
              { label: 'IMC', value: selectedRecord.metricas?.imc, unit: '' },
              { label: 'Calorías', value: selectedRecord.metricas?.calorias, unit: 'kcal' },
              { label: 'Proteínas', value: selectedRecord.metricas?.proteinas, unit: 'g' },
              { label: 'HC', value: selectedRecord.metricas?.hc, unit: 'g' },
              { label: 'Grasas', value: selectedRecord.metricas?.grasas, unit: 'g' },
              { label: '% PAVB', value: selectedRecord.metricas?.pavb, unit: '%' },
            ].map(({ label, value, unit }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-lg font-bold text-gray-800 mt-0.5">
                  {value != null ? `${parseFloat(value).toFixed(1)} ${unit}` : '—'}
                </p>
              </div>
            ))}
          </div>
          {selectedRecord.annotations && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm font-medium text-yellow-800 mb-1">Anotaciones</p>
              <p className="text-sm text-yellow-700 whitespace-pre-wrap">{selectedRecord.annotations}</p>
            </div>
          )}
          {selectedRecord.dietaActual?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Plan de alimentos ({selectedRecord.dietaActual.length} items)</p>
              <div className="max-h-48 overflow-y-auto border rounded-xl divide-y">
                {selectedRecord.dietaActual.map((item, i) => (
                  <div key={i} className="flex justify-between items-center px-3 py-2 text-sm">
                    <span className="text-gray-700">{item.alimento?.nombre}</span>
                    <span className="text-gray-500 font-medium">{item.cantidadUsada} {item.alimento?.unidad || 'g'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal guardar consulta */}
      {showSaveModal && (
        <Modal title="Guardar Consulta Actual" onClose={() => setShowSaveModal(false)} maxWidth="max-w-md">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Se guardará un snapshot completo del estado actual de FerCalc (datos del paciente, dieta, fraccionamiento, etc.) como una nueva consulta de <span className="font-semibold text-green-700">{patient.nombre} {patient.apellido}</span>.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la consulta *</label>
              <input value={recordName} onChange={e => setRecordName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveRecord()}
                placeholder="Ej: Primera consulta, Control mes 3..."
                className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                autoFocus />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSaveModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium text-sm">Cancelar</button>
              <button onClick={handleSaveRecord} disabled={savingRecord || !recordName.trim()}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium text-sm disabled:opacity-50">
                {savingRecord ? 'Guardando...' : 'Guardar Consulta'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal confirmar eliminación */}
      {deleteConfirm && (
        <Modal title="Eliminar Consulta" onClose={() => setDeleteConfirm(null)} maxWidth="max-w-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
              <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
              <p className="text-sm text-red-700">
                ¿Eliminar la consulta <span className="font-bold">"{deleteConfirm.nombre}"</span>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium text-sm">Cancelar</button>
              <button onClick={() => handleDeleteRecord(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium text-sm">Eliminar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── PÁGINA PRINCIPAL ──
const PatientsPage = ({ getAllData }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modal, setModal] = useState(null); // 'create' | 'edit' | 'delete'
  const [editingPatient, setEditingPatient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPatientsAPI();
      setPatients(res.data);
    } catch {
      toast.error('Error al cargar pacientes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await createPatientAPI(form);
      toast.success('Paciente creado.');
      setModal(null);
      fetchPatients();
    } catch {
      toast.error('Error al crear paciente.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await updatePatientAPI(editingPatient._id, form);
      toast.success('Paciente actualizado.');
      setModal(null);
      setEditingPatient(null);
      fetchPatients();
    } catch {
      toast.error('Error al actualizar paciente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePatientAPI(deleteConfirm._id);
      toast.success('Paciente eliminado.');
      setDeleteConfirm(null);
      fetchPatients();
    } catch {
      toast.error('Error al eliminar.');
    }
  };

  const filteredPatients = patients.filter(p =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedPatient) {
    return (
      <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
        <Toaster position="top-center" />
        <PatientDetail
          patient={selectedPatient}
          onBack={() => { setSelectedPatient(null); fetchPatients(); }}
          getAllData={getAllData}
        />
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Users className="text-green-600" size={28} />
            Historial de Pacientes
          </h1>
          <p className="text-gray-500 text-sm mt-1">{patients.length} paciente{patients.length !== 1 ? 's' : ''} registrado{patients.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setModal('create')}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-colors">
          <Plus size={20} /> Nuevo Paciente
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="w-full max-w-md p-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" />
      </div>

      {/* Grid de pacientes */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Users size={48} className="mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium">
            {search ? 'No se encontraron pacientes.' : 'Aún no tenés pacientes registrados.'}
          </p>
          {!search && (
            <button onClick={() => setModal('create')} className="mt-4 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium">
              Crear primer paciente
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map(p => (
            <PatientCard
              key={p._id}
              patient={p}
              onClick={setSelectedPatient}
              onEdit={(pat) => { setEditingPatient(pat); setModal('edit'); }}
              onDelete={setDeleteConfirm}
            />
          ))}
        </div>
      )}

      {/* Modal crear */}
      {modal === 'create' && (
        <Modal title="Nuevo Paciente" onClose={() => setModal(null)}>
          <PatientForm onSave={handleCreate} onCancel={() => setModal(null)} loading={saving} />
        </Modal>
      )}

      {/* Modal editar */}
      {modal === 'edit' && editingPatient && (
        <Modal title="Editar Paciente" onClose={() => { setModal(null); setEditingPatient(null); }}>
          <PatientForm initial={editingPatient} onSave={handleEdit} onCancel={() => { setModal(null); setEditingPatient(null); }} loading={saving} />
        </Modal>
      )}

      {/* Modal eliminar */}
      {deleteConfirm && (
        <Modal title="Eliminar Paciente" onClose={() => setDeleteConfirm(null)} maxWidth="max-w-sm">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-700">
                ¿Eliminar a <span className="font-bold">{deleteConfirm.nombre} {deleteConfirm.apellido}</span> y todo su historial de consultas? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium text-sm">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium text-sm">Eliminar todo</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PatientsPage;