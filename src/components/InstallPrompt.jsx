// src/components/InstallPrompt.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Download, X, Zap, WifiOff, Monitor, Smartphone, ArrowDownToLine } from 'lucide-react';
import logo from '../pages/fercalc/logo.png';

export default function InstallPrompt() {
  const [showBanner, setShowBanner]         = useState(false);
  const [showModal, setShowModal]           = useState(false);
  const [modalMode, setModalMode]           = useState('install');
  const [installing, setInstalling]         = useState(false);
  const [progress, setProgress]             = useState(0);
  const [progressStatus, setProgressStatus] = useState('installing');
  const [isStandalone, setIsStandalone]     = useState(false);
  const [isInstalled, setIsInstalled]       = useState(false);
  const deferredPromptRef                   = useRef(null);
  const canInstallRef                       = useRef(false);

  useEffect(() => {
    // ── Detectar si ya está corriendo como app instalada ──
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    setIsStandalone(standalone);

    // Si está en modo standalone → no mostrar NADA (ya está instalada y usándose como app)
    if (standalone) return;

    // Detectar flag de instalación previa
    const installed = localStorage.getItem('pwa_installed') === 'true';
    setIsInstalled(installed);

    // Escuchar cambios de modo (por si instalan mientras usan el sitio)
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const handleStandaloneChange = (e) => {
      if (e.matches) setIsStandalone(true);
    };
    standaloneQuery.addEventListener('change', handleStandaloneChange);

    // Capturar evento de instalación de Chrome
    const handler = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      canInstallRef.current = true;

      // Mostrar banner automático si no fue descartado
      if (!sessionStorage.getItem('pwa_banner_dismissed') && !installed) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      localStorage.setItem('pwa_installed', 'true');
      setIsInstalled(true);
      canInstallRef.current = false;
      deferredPromptRef.current = null;
      setShowBanner(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      standaloneQuery.removeEventListener('change', handleStandaloneChange);
    };
  }, []);

  // ── Si está corriendo como app standalone → no renderizar absolutamente nada ──
  if (isStandalone) return null;

  // ── Proceso de instalación con barra de progreso ──
  const doInstall = async (onSuccess) => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;

    setInstalling(true);
    setProgress(0);
    setProgressStatus('installing');

    let p = 0;
    // Fase 1: rápido a 30%
    const phase1 = setInterval(() => {
      p += Math.random() * 8 + 3;
      if (p >= 30) { clearInterval(phase1); p = 30; startPhase2(); }
      setProgress(Math.round(p));
    }, 100);

    // Fase 2: lento a 75% mientras espera al usuario
    const startPhase2 = () => {
      const phase2 = setInterval(() => {
        p += Math.random() * 3 + 1;
        if (p >= 75) { clearInterval(phase2); p = 75; }
        setProgress(Math.round(p));
      }, 200);
    };

    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    deferredPromptRef.current = null;
    canInstallRef.current = false;

    if (outcome === 'accepted') {
      // Fase 3: completar al 100%
      const phase3 = setInterval(() => {
        p += Math.random() * 10 + 5;
        if (p >= 100) {
          clearInterval(phase3);
          setProgress(100);
          setProgressStatus('success');
          localStorage.setItem('pwa_installed', 'true');
          setIsInstalled(true);
          setTimeout(() => {
            setInstalling(false);
            onSuccess?.();
          }, 1500);
        } else {
          setProgress(Math.round(p));
        }
      }, 80);
    } else {
      setProgressStatus('error');
      setTimeout(() => {
        setInstalling(false);
        setProgress(0);
        setProgressStatus('installing');
      }, 1500);
    }
  };

  const handleBannerInstall = () => doInstall(() => setShowBanner(false));
  const handleModalInstall  = () => doInstall(() => setTimeout(() => setShowModal(false), 600));

  const handleFixedButtonClick = () => {
    const installed = localStorage.getItem('pwa_installed') === 'true';
    setModalMode(installed ? 'installed' : 'install');
    setInstalling(false);
    setProgress(0);
    setProgressStatus('installing');
    setShowModal(true);
  };

  const dismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);

  const beneficios = [
    { icon: Zap,     texto: 'Acceso directo desde tu pantalla de inicio' },
    { icon: WifiOff, texto: 'Sin necesidad de abrir el navegador' },
    { icon: Monitor, texto: 'Funciona como app nativa en tu dispositivo' },
  ];

  const ProgressBar = () => {
    const color = progressStatus === 'success' ? 'bg-green-500' : progressStatus === 'error' ? 'bg-red-500' : 'bg-blue-500';
    const text  = progressStatus === 'success' ? '¡Instalación exitosa!' : progressStatus === 'error' ? 'Instalación cancelada' : 'Instalando...';
    const tColor= progressStatus === 'success' ? 'text-green-600' : progressStatus === 'error' ? 'text-red-500' : 'text-blue-600';
    return (
      <div className="px-5 pb-3 pt-1">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold ${tColor}`}>{text}</span>
          <span className="text-xs font-semibold text-gray-500">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
          <div className={`${color} h-3 rounded-full transition-all duration-200 relative overflow-hidden`} style={{ width: `${progress}%` }}>
            {progressStatus === 'installing' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{ animation: 'shimmer 1.5s infinite' }} />
            )}
          </div>
        </div>
        {progressStatus === 'success' && <p className="text-xs text-green-600 mt-1.5 text-center font-medium">✓ La instalación se realizó satisfactoriamente</p>}
        {progressStatus === 'error'   && <p className="text-xs text-red-500 mt-1.5 text-center">La instalación fue cancelada</p>}
      </div>
    );
  };

  const InstallContent = ({ onInstall }) => (
    <>
      {!installing && (
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
      )}
      {installing && <ProgressBar />}
      <div className="px-5 pb-7 pt-2 space-y-2.5">
        {!installing && canInstallRef.current && (
          <button onClick={onInstall}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 shadow-md">
            <Download className="h-4 w-4" /> Instalar ahora — es gratis
          </button>
        )}
        {!installing && !canInstallRef.current && (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-sm font-semibold text-amber-800 mb-1">Instalación manual</p>
              <p className="text-xs text-amber-700">
                {isMobile
                  ? 'Tocá el menú ⋮ del navegador → "Agregar a pantalla de inicio"'
                  : 'Buscá el ícono ⊕ en la barra de direcciones del navegador'}
              </p>
            </div>
          </>
        )}
        {!installing && (
          <button onClick={() => { setShowBanner(false); setShowModal(false); sessionStorage.setItem('pwa_banner_dismissed', 'true'); }}
            className="w-full text-gray-400 hover:text-gray-600 text-sm py-1.5 transition font-medium">
            Ahora no
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* ── BANNER AUTOMÁTICO (solo cuando Chrome dispara el evento) ── */}
      {showBanner && (
        <Overlay onClose={dismissBanner}>
          <Header onClose={dismissBanner} title="Instalá FerCalc" subtitle="Calculadora Nutricional · Socios APEN" />
          <InstallContent onInstall={handleBannerInstall} />
        </Overlay>
      )}

      {/* ── BOTÓN FIJO ── */}
      {/* Se oculta si:
          - Está en modo standalone (ya instalada y usándose como app)
          - El banner está visible
          - El modal está visible
      */}
      {!showBanner && !showModal && (
        <button onClick={handleFixedButtonClick}
          title={isInstalled ? 'FerCalc instalado' : 'Instalar FerCalc'}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg transition-all hover:shadow-xl active:scale-95 border border-green-500"
          style={{ animation: 'fadeInBtn 0.5s ease 1s both' }}>
          {isInstalled
            ? <><Smartphone className="h-4 w-4" /><span className="hidden sm:inline">App instalada</span></>
            : <><ArrowDownToLine className="h-4 w-4" /><span className="hidden sm:inline">Instalar app</span></>}
        </button>
      )}

      {/* ── MODAL DEL BOTÓN FIJO ── */}
      {showModal && (
        <Overlay onClose={() => setShowModal(false)}>
          {modalMode === 'installed' ? (
            <>
              <Header onClose={() => setShowModal(false)}
                title="Ya tenés FerCalc instalado"
                subtitle={`Podés abrirlo desde tu ${isMobile ? 'pantalla de inicio' : 'escritorio'}`} />
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
              <div className="px-5 pb-7 pt-1">
                <button onClick={() => setShowModal(false)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 shadow-md">
                  Entendido
                </button>
              </div>
            </>
          ) : (
            <>
              <Header onClose={() => setShowModal(false)} title="Instalá FerCalc" subtitle="Calculadora Nutricional · Socios APEN" />
              <InstallContent onInstall={handleModalInstall} />
            </>
          )}
        </Overlay>
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
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-sm sm:mx-4 sm:rounded-3xl overflow-hidden shadow-2xl"
        style={{ borderRadius: '20px 20px 0 0', animation: 'slideUpPWA 0.4s cubic-bezier(0.34, 1.4, 0.64, 1)' }}
        onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function Header({ onClose, title, subtitle }) {
  return (
    <div className="bg-green-600 px-6 pt-7 pb-5 text-center relative">
      <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-400 text-white transition">
        <X className="h-4 w-4" />
      </button>
      <div className="flex justify-center mb-3">
        <img src={logo} alt="FerCalc" className="h-16 w-16 rounded-2xl shadow-lg border-2 border-green-400 object-cover" />
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="text-green-200 text-xs mt-0.5">{subtitle}</p>
    </div>
  );
}
