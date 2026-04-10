// src/components/ProfileModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, User, Lock, Trash2, Camera, CheckCircle, AlertCircle, Clock, Eye, EyeOff, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const API = import.meta.env.VITE_API_URL || 'https://fercalc-pro.onrender.com/api';

const SECCIONES = [
  { key: 'info',     label: 'Mi Perfil',         icon: User  },
  { key: 'username', label: 'Cambiar Nombre',     icon: User  },
  { key: 'password', label: 'Cambiar Contraseña', icon: Lock  },
  { key: 'danger',   label: 'Eliminar Cuenta',    icon: Trash2 },
];

export default function ProfileModal({ isOpen, onClose, profilePhoto, onPhotoChange }) {
  const { user, logout } = useAuth();
  const [seccion, setSeccion] = useState('info');
  const [profileInfo, setProfileInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const fileInputRef = useRef(null);

  // Formularios
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [confirmacion, setConfirmacion] = useState('');

  // En móvil: mostrar lista o detalle
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProfileInfo();
      setSeccion('info');
      setMensaje(null);
      setShowDetail(false);
    }
  }, [isOpen]);

  const fetchProfileInfo = async () => {
    try {
      const res = await fetch(`${API}/profile`, { credentials: 'include' });
      setProfileInfo(await res.json());
    } catch (err) { console.error(err); }
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 5000);
  };

  const seleccionarSeccion = (key) => {
    setSeccion(key);
    setMensaje(null);
    setShowDetail(true); // en móvil navega al detalle
  };

  const handleChangeUsername = async (e) => {
    e.preventDefault(); setIsLoading(true);
    try {
      const res = await fetch(`${API}/profile/username`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newUsername }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      mostrarMensaje('ok', data.message); setNewUsername(''); fetchProfileInfo();
    } catch (err) { mostrarMensaje('error', err.message); }
    finally { setIsLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return mostrarMensaje('error', 'Las contraseñas no coinciden.');
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/profile/password`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      mostrarMensaje('ok', data.message);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => logout(), 2500);
    } catch (err) { mostrarMensaje('error', err.message); }
    finally { setIsLoading(false); }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault(); setIsLoading(true);
    try {
      const res = await fetch(`${API}/profile/delete-account`, { method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirmacion }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      mostrarMensaje('ok', data.message);
      setTimeout(() => logout(), 2000);
    } catch (err) { mostrarMensaje('error', err.message); }
    finally { setIsLoading(false); }
  };

  if (!isOpen) return null;

  const userInitial = user?.username?.charAt(0).toUpperCase() || '?';
  const isAdmin = user?.role === 'admin';

  // ── Contenido de cada sección ──
  const SeccionContenido = () => (
    <div className="flex-1 overflow-y-auto p-5 sm:p-6">

      {/* Botón volver en móvil */}
      <button onClick={() => setShowDetail(false)}
        className="flex items-center gap-1.5 text-sm text-green-600 font-medium mb-4 sm:hidden">
        <ChevronLeft className="h-4 w-4" />
        Volver
      </button>

      {/* Mensaje */}
      {mensaje && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border mb-5 text-sm ${mensaje.tipo === 'ok' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {mensaje.tipo === 'ok' ? <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-green-500" /> : <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />}
          <p>{mensaje.texto}</p>
        </div>
      )}

      {/* ── MI PERFIL ── */}
      {seccion === 'info' && (
        <div className="space-y-5">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Foto" className="w-20 h-20 rounded-full object-cover border-4 border-green-400" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-green-400">{userInitial}</div>
              )}
              <button onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-white border-2 border-gray-200 rounded-full p-1.5 hover:bg-gray-50 shadow-sm transition">
                <Camera className="h-3.5 w-3.5 text-gray-500" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
            </div>
            <p className="text-xs text-gray-400">Tocá el ícono para cambiar tu foto</p>
          </div>

          {profileInfo ? (
            <div className="bg-gray-50 rounded-xl divide-y divide-gray-200 overflow-hidden">
              {[
                { label: 'Nombre de usuario', value: profileInfo.username },
                { label: 'Correo electrónico', value: profileInfo.email },
                { label: 'Miembro desde', value: new Date(profileInfo.createdAt).toLocaleDateString('es-PY', { day: '2-digit', month: 'long', year: 'numeric' }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 py-3 gap-0.5">
                  <span className="text-xs text-gray-500 font-medium">{label}</span>
                  <span className="text-sm font-semibold text-gray-800 break-all">{value}</span>
                </div>
              ))}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 py-3 gap-0.5">
                <span className="text-xs text-gray-500 font-medium">Rol</span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${isAdmin ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {isAdmin && <ShieldCheck className="h-3 w-3" />}
                  {isAdmin ? 'Administrador' : 'Socio APEN'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">Cargando...</div>
          )}

          {profileInfo?.diasParaCambiarNombre > 0 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
              <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <span>Podés cambiar tu nombre en <strong>{profileInfo.diasParaCambiarNombre} días</strong>.</span>
            </div>
          )}
        </div>
      )}

      {/* ── CAMBIAR NOMBRE ── */}
      {seccion === 'username' && (
        <div>
          <h3 className="text-base font-bold text-gray-800 mb-1">Cambiar nombre de usuario</h3>
          <p className="text-sm text-gray-500 mb-5">Solo podés cambiarlo una vez cada 30 días.</p>
          {profileInfo && profileInfo.diasParaCambiarNombre > 0 ? (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
              <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">No podés cambiar el nombre todavía</p>
                <p className="mt-0.5">Podrás hacerlo en <strong>{profileInfo.diasParaCambiarNombre} {profileInfo.diasParaCambiarNombre === 1 ? 'día' : 'días'}</strong>.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleChangeUsername} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre actual</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600">{user?.username}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo nombre</label>
                <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} minLength={3} required
                  placeholder="Mínimo 3 caracteres"
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <button type="submit" disabled={isLoading || !newUsername.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-xl transition text-sm">
                {isLoading ? 'Guardando...' : 'Guardar nuevo nombre'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ── CAMBIAR CONTRASEÑA ── */}
      {seccion === 'password' && (
        <div>
          <h3 className="text-base font-bold text-gray-800 mb-1">Cambiar contraseña</h3>
          <p className="text-sm text-gray-500 mb-5">Al guardar, se cerrará tu sesión por seguridad.</p>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
              <div className="relative">
                <input type={showPasswords ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required
                  className="w-full border border-gray-300 px-4 py-3 pr-11 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <button type="button" onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <input type={showPasswords ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6} required
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-gray-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Repetir nueva contraseña</label>
              <input type={showPasswords ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                className="w-full border border-gray-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-xl transition text-sm">
              {isLoading ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </form>
        </div>
      )}

      {/* ── ELIMINAR CUENTA ── */}
      {seccion === 'danger' && (
        <div>
          <h3 className="text-base font-bold text-red-700 mb-1">Eliminar cuenta</h3>
          <p className="text-sm text-gray-500 mb-4">Esta acción es <strong>permanente e irreversible</strong>.</p>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
            <p className="text-sm text-red-800 font-medium mb-2">⚠️ Al eliminar tu cuenta:</p>
            <ul className="space-y-1 text-sm text-red-700 list-disc list-inside">
              <li>Perderás acceso permanente a FerCalc</li>
              <li>Tus dietas guardadas se eliminarán</li>
              <li>Necesitarás que la APEN te habilite de nuevo</li>
            </ul>
          </div>
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Escribí <strong className="text-red-600">ELIMINAR</strong> para confirmar:
              </label>
              <input type="text" value={confirmacion} onChange={e => setConfirmacion(e.target.value)} required
                placeholder="ELIMINAR"
                className="w-full border border-red-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 font-mono tracking-widest" />
            </div>
            <button type="submit" disabled={isLoading || confirmacion !== 'ELIMINAR'}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-3 rounded-xl transition text-sm">
              {isLoading ? 'Eliminando...' : 'Eliminar mi cuenta permanentemente'}
            </button>
          </form>
        </div>
      )}
    </div>
  );

  // ── Lista de opciones (móvil: pantalla completa de lista) ──
  const ListaSecciones = () => (
    <div className="flex-1 overflow-y-auto">

      {/* Mini resumen de perfil */}
      <div className="flex items-center gap-4 px-5 py-4 bg-gray-50 border-b border-gray-100">
        {profilePhoto ? (
          <img src={profilePhoto} alt="Foto" className="w-12 h-12 rounded-full object-cover border-2 border-green-400" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-xl font-bold text-white border-2 border-green-400">{userInitial}</div>
        )}
        <div className="min-w-0">
          <p className="font-bold text-gray-800 truncate">{user?.username}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
      </div>

      {/* Opciones */}
      <div className="divide-y divide-gray-100">
        {SECCIONES.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => seleccionarSeccion(key)}
            className={`w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 active:bg-gray-100 transition ${key === 'danger' ? 'text-red-500' : 'text-gray-700'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${key === 'danger' ? 'bg-red-50' : 'bg-green-50'}`}>
                <Icon className={`h-4 w-4 ${key === 'danger' ? 'text-red-500' : 'text-green-600'}`} />
              </div>
              <span className="font-medium text-sm">{label}</span>
            </div>
            <ChevronLeft className="h-4 w-4 rotate-180 text-gray-300" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          maxHeight: '92vh',
          borderRadius: '20px 20px 0 0',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-800">Configuración de Perfil</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── MÓVIL: navegación en dos pantallas ── */}
        <div className="flex flex-col flex-1 overflow-hidden sm:hidden">
          {!showDetail ? <ListaSecciones /> : <SeccionContenido />}
        </div>

        {/* ── DESKTOP: layout de dos columnas ── */}
        <div className="hidden sm:flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 bg-gray-50 border-r border-gray-100 flex flex-col py-4 flex-shrink-0">
            {SECCIONES.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => seleccionarSeccion(key)}
                className={`flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-all text-left ${
                  seccion === key
                    ? key === 'danger' ? 'bg-red-50 text-red-600 border-r-2 border-red-500' : 'bg-green-50 text-green-700 border-r-2 border-green-500'
                    : key === 'danger' ? 'text-red-400 hover:bg-red-50 hover:text-red-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }`}>
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
          {/* Contenido desktop */}
          <SeccionContenido />
        </div>
      </div>
    </div>
  );
}
