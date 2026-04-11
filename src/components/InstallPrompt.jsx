// src/components/InstallPrompt.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Download, X, Zap, WifiOff, Monitor, Smartphone, ArrowDownToLine } from 'lucide-react';
import logo from '../pages/fercalc/logo.png';

export default function InstallPrompt() {
  const [showBanner, setShowBanner]       = useState(false);
  const [showModal, setShowModal]         = useState(false); // modal del botón fijo
  const [modalMode, setModalMode]         = useState('install'); // 'install' | 'installed'
  const [installing, setInstalling]       = useState(false);
  const [progress, setProgress]           = useState(0);
  const [canInstall, setCanInstall]       = useState(false); // Chrome confirmó instalación
  const deferredPromptRef                 = useRef(null);

  useEffect(() => {
    // Si ya corre como app standalone → no mostrar nada
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    const handler = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setCanInstall(true);
      // Mostrar banner automático solo cuando Chrome confirma
      const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      localStorage.setItem('pwa_installed', 'true');
      setCanInstall(false);
      setShowBanner(false);
      deferredPromptRef.current = null;
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // ── Lanzar instalación (banner o modal) ──
  const doInstall = async (onDone) => {
    if (!deferredPromptRef.current) return;
    setInstalling(true);
    setProgress(0);

    // Barra de progreso animada mientras el sistema instala
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 20;
      if (p >= 80) { clearInterval(interval); p = 80; }
      setProgress(Math.min(p, 80));
    }, 120);

    deferredPromptRef.current.prompt();
    const { outcome } = await deferredPromptRef.current.userChoice;
    clearInterval(interval);

    if (outcome === 'accepted') {
      setProgress(100);
      localStorage.setItem('pwa_installed', 'true');
      setTimeout(() => {
        setInstalling(false);
        onDone?.();
      }, 1200);
    } else {
      setProgress(0);
      setInstalling(false);
    }
    deferredPromptRef.current = null;
    setCanInstall(false);
  };

  const handleBannerInstall = () => doInstall(() => setShowBanner(false));

  const handleFixedButtonClick = () => {
    const isInstalled = localStorage.getItem('pwa_installed') === 'true';
    setModalMode(isInstalled ? 'installed' : 'install');
    setShowModal(true);
  };

  const handleModalInstall = () => doInstall(() => setTimeout(() => setShowModal(false), 600));

  const dismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  const isInstalled = localStorage.getItem('pwa_installed') === 'true';
  const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);

  const beneficios = [
    { icon: Zap,     texto: 'Acceso directo desde tu pantalla de inicio' },
    { icon: WifiOff, texto: 'Sin necesidad de abrir el navegador' },
    { icon: Monitor, texto: 'Funciona como app nativa en tu dispositivo' },
  ];

  return (
    <>
      {/* ══════════════════════════════════════
          BANNER AUTOMÁTICO (solo cuando Chrome
          confirma que se puede instalar)
      ══════════════════════════════════════ */}
      {showBanner && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center"
          onClick={dismissBanner}
        >
          <div
            className="bg-white w-full sm:max-w-sm sm:mx-4 sm:rounded-3xl overflow-hidden shadow-2xl"
            style={{ borderRadius: '20px 20px 0 0', animation: 'slideUpPWA 0.4s cubic-bezier(0.34, 1.4, 0.64, 1)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-green-600 px-6 pt-7 pb-5 text-center relative">
              <button onClick={dismissBanner}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-400 text-white transition">
                <X className="h-4 w-4" />
              </button>
              <div className="flex justify-center mb-3">
                <img src={logo} alt="FerCalc" className="h-16 w-16 rounded-2xl shadow-lg border-2 border-green-400 object-cover" />
              </div>
              <h2 className="text-xl font-bold text-white">Instalá FerCalc</h2>
              <p className="text-green-200 text-xs mt-0.5">Calculadora Nutricional · Socios APEN</p>
            </div>

            {/* Beneficios */}
            <div className="px-5 py-4 space-y-3">
              {beneficios.map(({ icon: Icon, texto }) => (
                <div key={texto} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600">{texto}</p>
                </div>
              ))}
            </div>

            {/* Barra progreso */}
            {installing && (
              <div className="px-5 pb-2">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-semibold text-green-700">{progress < 100 ? 'Instalando...' : '¡Listo!'}</span>
                  <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="px-5 pb-7 pt-3 space-y-2.5">
              <button onClick={handleBannerInstall} disabled={installing}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-500 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 shadow-md">
                {installing ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Instalando...</>
                ) : (
                  <><Download className="h-4 w-4" />Instalar ahora — es gratis</>
                )}
              </button>
              <button onClick={dismissBanner} className="w-full text-gray-400 hover:text-gray-600 text-sm py-1.5 transition font-medium">
                Ahora no
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          BOTÓN FIJO DISCRETO (siempre visible,
          no aparece si está en modo standalone)
      ══════════════════════════════════════ */}
      {!showBanner && !showModal && (
        <button
          onClick={handleFixedButtonClick}
          title={isInstalled ? 'FerCalc instalado' : 'Instalar FerCalc'}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg transition-all hover:shadow-xl active:scale-95 border border-green-500"
          style={{ animation: 'fadeInBtn 0.5s ease 1s both' }}
        >
          {isInstalled
            ? <><Smartphone className="h-4 w-4" /><span className="hidden sm:inline">App instalada</span></>
            : <><ArrowDownToLine className="h-4 w-4" /><span className="hidden sm:inline">Instalar app</span></>
          }
        </button>
      )}

      {/* ══════════════════════════════════════
          MODAL DEL BOTÓN FIJO
      ══════════════════════════════════════ */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white w-full sm:max-w-sm sm:mx-4 sm:rounded-3xl overflow-hidden shadow-2xl"
            style={{ borderRadius: '20px 20px 0 0', animation: 'slideUpPWA 0.35s cubic-bezier(0.34, 1.4, 0.64, 1)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-green-600 px-6 pt-7 pb-5 text-center relative">
              <button onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-400 text-white transition">
                <X className="h-4 w-4" />
              </button>
              <div className="flex justify-center mb-3">
                <img src={logo} alt="FerCalc" className="h-16 w-16 rounded-2xl shadow-lg border-2 border-green-400 object-cover" />
              </div>
              {modalMode === 'installed' ? (
                <>
                  <h2 className="text-xl font-bold text-white">Ya tenés FerCalc instalado</h2>
                  <p className="text-green-200 text-xs mt-0.5">Podés abrirlo desde tu {isMobile ? 'pantalla de inicio' : 'escritorio'}</p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white">Instalá FerCalc</h2>
                  <p className="text-green-200 text-xs mt-0.5">Calculadora Nutricional · Socios APEN</p>
                </>
              )}
            </div>

            {/* Contenido según modo */}
            {modalMode === 'installed' ? (
              <div className="px-5 py-5">
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Smartphone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-800">FerCalc está en tu dispositivo</p>
                    <p className="text-xs text-green-600 mt-1 leading-relaxed">
                      Buscá el ícono de FerCalc en tu {isMobile ? 'pantalla de inicio' : 'escritorio o barra de tareas'} para abrirlo como app y tener la mejor experiencia.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="px-5 py-4 space-y-3">
                  {beneficios.map(({ icon: Icon, texto }) => (
                    <div key={texto} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600">{texto}</p>
                    </div>
                  ))}
                </div>
                {installing && (
                  <div className="px-5 pb-2">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-semibold text-green-700">{progress < 100 ? 'Instalando...' : '¡Listo!'}</span>
                      <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Botones modal */}
            <div className="px-5 pb-7 pt-3 space-y-2.5">
              {modalMode === 'install' && canInstall && (
                <button onClick={handleModalInstall} disabled={installing}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-500 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 shadow-md">
                  {installing ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Instalando...</>
                  ) : (
                    <><Download className="h-4 w-4" />Instalar ahora — es gratis</>
                  )}
                </button>
              )}
              <button onClick={() => setShowModal(false)}
                className={`w-full font-bold py-3.5 rounded-2xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 ${modalMode === 'installed' || !canInstall ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-gray-400 hover:text-gray-600 text-sm'}`}>
                {modalMode === 'installed' ? 'Entendido' : canInstall ? 'Ahora no' : 'Cerrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUpPWA {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInBtn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
