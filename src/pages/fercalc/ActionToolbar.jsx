// mi-app-frontend/src/pages/fercalc/ActionToolbar.jsx
import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Download, Trash2, X, FileText, FilePlus, LogOut, User, ChevronRight, Menu, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../context/AuthContext.jsx';

const ActionToolbar = ({ getCurrentDietState, savedDiets, setSavedDiets, loadDietState, handleNewDiet, allData }) => {
  const { user, logout } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [dietName, setDietName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfSections, setPdfSections] = useState({
    datos: true,
    calculadora: true,
    fraccionamiento: true
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [showNewDietWarning, setShowNewDietWarning] = useState(false);
  const [showLoadWarning, setShowLoadWarning] = useState(null);

  useEffect(() => {
    const savedPhoto = localStorage.getItem(`profilePhoto_${user?.id}`);
    if (savedPhoto) setProfilePhoto(savedPhoto);
  }, [user]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result);
      localStorage.setItem(`profilePhoto_${user?.id}`, reader.result);
      toast.success('Foto de perfil actualizada.');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!dietName.trim()) {
      toast.error('Por favor, ingresa un nombre para la dieta.');
      return;
    }
    const newDiet = { id: Date.now(), name: dietName.trim(), data: getCurrentDietState() };
    setSavedDiets(prev => [...prev, newDiet]);
    toast.success(`Dieta "${dietName.trim()}" guardada.`);
    setModal(null);
    setDietName('');
    setIsDrawerOpen(false);
  };

  const handleDelete = (id) => {
    setSavedDiets(prev => prev.filter(diet => diet.id !== id));
    toast.error('Dieta eliminada.');
  };

  // ✅ Modal personalizado para nueva dieta
  const handleNewDietWithWarning = () => {
    setShowNewDietWarning(true);
    setIsDrawerOpen(false);
  };

  // ✅ Modal personalizado para cargar dieta
  const handleLoadDietWithWarning = (diet) => {
    setShowLoadWarning(diet);
  };

  const confirmLoadDiet = () => {
    if (!showLoadWarning) return;
    loadDietState({ ...showLoadWarning.data, name: showLoadWarning.name });
    setShowLoadWarning(null);
    setModal(null);
    setIsDrawerOpen(false);
  };

  const handlePdfDownload = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    toast('Generando PDF...', { icon: '📄' });

    try {
      const { patientData, dietGoals, dietaActual } = allData;
      const doc = new jsPDF();
      let lastY = 20;
      let contentAdded = false;

      const GREEN = [39, 174, 96];
      const DARK = [44, 62, 80];
      const LIGHT_GRAY = [236, 240, 241];
      const WHITE = [255, 255, 255];

      // ✅ Sin emojis — jsPDF no los soporta
      const addSectionHeader = (title) => {
        if (lastY > 250) { doc.addPage(); lastY = 20; }
        doc.setFillColor(...GREEN);
        doc.rect(0, lastY - 5, 220, 12, 'F');
        doc.setTextColor(...WHITE);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 14, lastY + 3);
        doc.setTextColor(...DARK);
        doc.setFont('helvetica', 'normal');
        lastY += 16;
      };

      const checkPageBreak = (space = 40) => {
        if (lastY + space > 275) { doc.addPage(); lastY = 20; }
      };

      // ── ENCABEZADO ──
      doc.setFillColor(...GREEN);
      doc.rect(0, 0, 220, 28, 'F');
      doc.setTextColor(...WHITE);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('FerCalc', 14, 13);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Calculadora Nutricional', 14, 21);
      doc.setFontSize(9);
      doc.text(
        `Generado: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`,
        130, 13
      );
      doc.text(`Usuario: ${user?.username || 'N/A'}`, 130, 21);
      doc.setTextColor(...DARK);
      lastY = 38;

      // ── SECCIÓN 1: DATOS DEL PACIENTE ──
      if (pdfSections.datos) {
        addSectionHeader('DATOS DEL PACIENTE');

        const imc = patientData.height > 0 && patientData.weight > 0
          ? (patientData.weight / ((patientData.height / 100) ** 2)).toFixed(2)
          : 'N/A';

        const imcCategoria = (val) => {
          const v = parseFloat(val);
          if (isNaN(v)) return 'N/A';
          if (v < 18.5) return 'Bajo peso';
          if (v < 25) return 'Normal';
          if (v < 30) return 'Sobrepeso';
          return 'Obesidad';
        };

        autoTable(doc, {
          startY: lastY,
          head: [['Parametro', 'Valor', 'Parametro', 'Valor']],
          body: [
            ['Peso', `${patientData.weight} kg`, 'Altura', `${patientData.height} cm`],
            ['Edad', `${patientData.age} anos`, 'Sexo', patientData.sex],
            ['IMC', imc, 'Categoria IMC', imcCategoria(imc)],
          ],
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 4 },
          headStyles: { fillColor: GREEN, textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 250, 245] },
        });
        lastY = doc.lastAutoTable.finalY + 10;

        // Objetivos nutricionales
        checkPageBreak(40);
        addSectionHeader('OBJETIVOS NUTRICIONALES');

        const goalLabels = {
          calorias: 'Calorias', hc: 'Carbohidratos', proteina: 'Proteinas',
          grasa: 'Grasas', na: 'Sodio (Na)', k: 'Potasio (K)',
          p: 'Fosforo (P)', ca: 'Calcio (Ca)', fe: 'Hierro (Fe)',
          colesterol: 'Colesterol', purinas: 'Purinas', fibra: 'Fibra',
          agua: 'Agua', pavbPercentage: '% PAVB'
        };
        const goalUnits = {
          calorias: 'kcal', hc: 'g', proteina: 'g', grasa: 'g',
          na: 'mg', k: 'mg', p: 'mg', ca: 'mg', fe: 'mg',
          colesterol: 'mg', purinas: 'mg', fibra: 'g', agua: 'ml', pavbPercentage: '%'
        };

        const goalsArray = Object.entries(dietGoals).map(([key, value]) => [
          goalLabels[key] || key,
          `${value} ${goalUnits[key] || ''}`
        ]);

        const half = Math.ceil(goalsArray.length / 2);
        const paired = goalsArray.slice(0, half).map((row, i) => [
          row[0], row[1],
          goalsArray[half + i]?.[0] || '',
          goalsArray[half + i]?.[1] || ''
        ]);

        autoTable(doc, {
          startY: lastY,
          head: [['Nutriente', 'Objetivo', 'Nutriente', 'Objetivo']],
          body: paired,
          theme: 'striped',
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: GREEN, textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 250, 245] },
        });
        lastY = doc.lastAutoTable.finalY + 10;
        contentAdded = true;
      }

      // ── SECCIÓN 2: PLAN DE ALIMENTOS ──
      if (pdfSections.calculadora && dietaActual?.length > 0) {
        checkPageBreak(40);
        addSectionHeader('PLAN GENERAL DE ALIMENTOS');

        const planBody = dietaActual.map(item => {
          const factor = item.cantidadUsada / (item.alimento.cantidad || 1);
          return [
            item.alimento.nombre,
            `${item.cantidadUsada.toFixed(1)} g`,
            (item.alimento.calorias * factor).toFixed(1),
            (item.alimento.hc * factor).toFixed(1),
            (item.alimento.proteina * factor).toFixed(1),
            (item.alimento.grasa * factor).toFixed(1),
          ];
        });

        const totales = dietaActual.reduce((acc, item) => {
          const factor = item.cantidadUsada / (item.alimento.cantidad || 1);
          acc.calorias += item.alimento.calorias * factor;
          acc.hc += item.alimento.hc * factor;
          acc.proteina += item.alimento.proteina * factor;
          acc.grasa += item.alimento.grasa * factor;
          return acc;
        }, { calorias: 0, hc: 0, proteina: 0, grasa: 0 });

        autoTable(doc, {
          startY: lastY,
          head: [['Alimento', 'Gramos', 'Kcal', 'HC (g)', 'Prot. (g)', 'Grasa (g)']],
          body: planBody,
          foot: [[
            'TOTALES', '',
            totales.calorias.toFixed(1),
            totales.hc.toFixed(1),
            totales.proteina.toFixed(1),
            totales.grasa.toFixed(1)
          ]],
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: GREEN, textColor: 255, fontStyle: 'bold' },
          footStyles: { fillColor: LIGHT_GRAY, textColor: DARK, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 250, 245] },
        });
        lastY = doc.lastAutoTable.finalY + 10;
        contentAdded = true;
      }

      // ── PIE DE PAGINA ──
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        doc.setFillColor(...GREEN);
        doc.rect(0, pageH - 14, pageW, 14, 'F');
        doc.setTextColor(...WHITE);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('FerCalc - Calculadora Nutricional', 14, pageH - 5);
        doc.setFont('helvetica', 'normal');
        doc.text(`Pagina ${i} de ${pageCount}`, pageW - 35, pageH - 5);
      }

      if (!contentAdded) {
        toast.error('No hay contenido para generar el PDF.');
      } else {
        doc.save('FerCalc-dieta.pdf');
        toast.success('PDF descargado con exito.');
      }
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      toast.error('No se pudo generar el PDF.');
    } finally {
      setIsProcessing(false);
      setModal(null);
    }
  };

  const userInitial = user?.username?.charAt(0).toUpperCase() || '?';

  return (
    <>
      {/* Botón menú hamburguesa */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        <Menu size={20} />
        <span className="font-medium">Menu</span>
      </button>

      {/* Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Drawer lateral izquierdo */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-gray-900 text-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Header — perfil */}
        <div className="bg-gray-800 p-6 flex flex-col items-center border-b border-gray-700 relative">
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>

          <div className="relative mb-3">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Foto de perfil"
                className="w-20 h-20 rounded-full object-cover border-4 border-green-500"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center text-3xl font-bold border-4 border-green-400">
                {userInitial}
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-gray-600 hover:bg-gray-500 rounded-full p-1 cursor-pointer" title="Cambiar foto">
              <User size={12} />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          <p className="font-bold text-lg">{user?.username}</p>
          <p className="text-gray-400 text-sm">{user?.email}</p>
        </div>

        {/* Opciones */}
        <nav className="flex-1 overflow-y-auto py-4">
          <p className="text-gray-500 text-xs uppercase font-semibold px-6 mb-2 tracking-wider">
            Gestion de Dietas
          </p>
          <MenuItem icon={<FilePlus size={18} />} label="Nueva Dieta" onClick={handleNewDietWithWarning} color="text-green-400" />
          <MenuItem icon={<Save size={18} />} label="Guardar Dieta Actual" onClick={() => { setModal('save'); setIsDrawerOpen(false); }} color="text-blue-400" />
          <MenuItem icon={<FolderOpen size={18} />} label="Cargar Dieta Guardada" onClick={() => { setModal('load'); setIsDrawerOpen(false); }} color="text-yellow-400" />

          <div className="border-t border-gray-700 my-4" />
          <p className="text-gray-500 text-xs uppercase font-semibold px-6 mb-2 tracking-wider">
            Exportar
          </p>
          <MenuItem icon={<Download size={18} />} label="Descargar PDF" onClick={() => { setModal('pdf'); setIsDrawerOpen(false); }} color="text-red-400" />
        </nav>

        {/* Cerrar sesión */}
        <div className="border-t border-gray-700 p-4">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium">Cerrar Sesion</span>
          </button>
        </div>
      </div>

      {/* ── MODAL ADVERTENCIA NUEVA DIETA ── */}
      {showNewDietWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Nueva Dieta</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Los datos actuales que no hayas guardado se perderan permanentemente. Esta accion no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewDietWarning(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => { handleNewDiet(); setShowNewDietWarning(false); }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ADVERTENCIA CARGAR DIETA ── */}
      {showLoadWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Cargar Dieta</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Vas a cargar: <span className="font-semibold text-green-700">"{showLoadWarning.name}"</span>
            </p>
            <p className="text-gray-600 mb-6">
              Los datos actuales no guardados se perderan. Esta accion no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLoadWarning(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLoadDiet}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Cargar de todas formas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALES PRINCIPALES ── */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {modal === 'save' && 'Guardar Dieta'}
                {modal === 'load' && 'Cargar Dieta'}
                {modal === 'pdf' && 'Descargar PDF'}
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-700">
                <X />
              </button>
            </div>

            {/* Guardar */}
            {modal === 'save' && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Nombre de la Dieta
                </label>
                <input
                  type="text"
                  value={dietName}
                  onChange={e => setDietName(e.target.value)}
                  placeholder="Ej: Plan Volumen - Semana 1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setModal(null)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    Cancelar
                  </button>
                  <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Guardar
                  </button>
                </div>
              </div>
            )}

            {/* Cargar */}
            {modal === 'load' && (
              <div className="space-y-3">
                {savedDiets.length > 0 ? savedDiets.map(diet => (
                  <div key={diet.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                    <span className="font-medium flex items-center gap-2 text-gray-800">
                      <FileText size={16} className="text-green-600" />
                      {diet.name}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoadDietWithWarning(diet)}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 text-sm"
                      >
                        Cargar
                      </button>
                      <button
                        onClick={() => handleDelete(diet.id)}
                        className="bg-red-500 text-white p-1 rounded-lg hover:bg-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-8">No hay dietas guardadas.</p>
                )}
              </div>
            )}

            {/* PDF */}
            {modal === 'pdf' && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Selecciona las secciones que queres incluir en el PDF:
                </p>
                <div className="space-y-2">
                  {[
                    { key: 'datos', label: 'Datos del paciente y objetivos nutricionales' },
                    { key: 'calculadora', label: 'Plan general de alimentos' },
                    { key: 'fraccionamiento', label: 'Fraccionamiento de la dieta' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border">
                      <input
                        type="checkbox"
                        checked={pdfSections[key]}
                        onChange={e => setPdfSections(p => ({ ...p, [key]: e.target.checked }))}
                        className="w-4 h-4 accent-green-600"
                      />
                      <span className="text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => setModal(null)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    Cancelar
                  </button>
                  <button
                    onClick={handlePdfDownload}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Generando...' : 'Generar PDF'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const MenuItem = ({ icon, label, onClick, color = 'text-white' }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-800 transition-colors group"
  >
    <div className="flex items-center gap-3">
      <span className={color}>{icon}</span>
      <span className="text-gray-200 group-hover:text-white text-sm font-medium">{label}</span>
    </div>
    <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400" />
  </button>
);

export default ActionToolbar;