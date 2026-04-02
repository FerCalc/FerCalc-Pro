// mi-app-frontend/src/pages/fercalc/ActionToolbar.jsx
import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Download, Trash2, X, FileText, FilePlus, LogOut, User, ChevronRight, Menu } from 'lucide-react';
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

  // Cargar foto de perfil del localStorage
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
    if (!dietName.trim()) { toast.error('Por favor, introducí un nombre para la dieta.'); return; }
    const newDiet = { id: Date.now(), name: dietName.trim(), data: getCurrentDietState() };
    setSavedDiets(prev => [...prev, newDiet]);
    toast.success(`Dieta "${dietName.trim()}" guardada.`);
    setModal(null); setDietName(''); setIsDrawerOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que querés eliminar esta dieta?')) {
      setSavedDiets(prev => prev.filter(diet => diet.id !== id));
      toast.error('Dieta eliminada.');
    }
  };

  const handleNewDietWithWarning = () => {
    const confirmed = window.confirm(
      '⚠️ Atención: Se perderán todos los datos no guardados.\n\n¿Estás seguro de que querés iniciar una nueva dieta?'
    );
    if (confirmed) {
      handleNewDiet();
      setIsDrawerOpen(false);
    }
  };

  const handleLoadDiet = (diet) => {
    const confirmed = window.confirm(
      '⚠️ Atención: Los datos actuales no guardados se perderán al cargar esta dieta.\n\n¿Querés continuar?'
    );
    if (confirmed) {
      loadDietState({ ...diet.data, name: diet.name });
      setModal(null);
      setIsDrawerOpen(false);
    }
  };

  const handlePdfDownload = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    toast('Generando PDF profesional...', { icon: '📄' });

    try {
      const { patientData, dietGoals, dietaActual } = allData;
      const doc = new jsPDF();
      let lastY = 20;
      let contentAdded = false;

      const GREEN = [39, 174, 96];
      const DARK = [44, 62, 80];
      const LIGHT_GRAY = [236, 240, 241];

      // Función para agregar encabezado de sección
      const addSectionHeader = (title) => {
        if (lastY > 250) { doc.addPage(); lastY = 20; }
        doc.setFillColor(...GREEN);
        doc.rect(0, lastY - 5, 220, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 14, lastY + 3);
        doc.setTextColor(...DARK);
        doc.setFont('helvetica', 'normal');
        lastY += 16;
      };

      const checkPageBreak = (space = 40) => {
        if (lastY + space > 280) { doc.addPage(); lastY = 20; }
      };

      // ── ENCABEZADO DEL DOCUMENTO ──
      doc.setFillColor(...GREEN);
      doc.rect(0, 0, 220, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('FerCalc', 14, 14);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Calculadora Nutricional', 14, 22);
      doc.setFontSize(9);
      doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`, 140, 14);
      doc.text(`Usuario: ${user?.username || 'N/A'}`, 140, 22);
      doc.setTextColor(...DARK);
      lastY = 40;

      // ── SECCIÓN 1: DATOS DEL PACIENTE ──
      if (pdfSections.datos) {
        addSectionHeader('📋 Datos del Paciente');

        const imc = patientData.height > 0 && patientData.weight > 0
          ? (patientData.weight / ((patientData.height / 100) ** 2)).toFixed(2)
          : 'N/A';

        const imcCategoria = (imc) => {
          const val = parseFloat(imc);
          if (isNaN(val)) return 'N/A';
          if (val < 18.5) return 'Bajo peso';
          if (val < 25) return 'Normal';
          if (val < 30) return 'Sobrepeso';
          return 'Obesidad';
        };

        autoTable(doc, {
          startY: lastY,
          head: [['Parámetro', 'Valor', 'Parámetro', 'Valor']],
          body: [
            ['Peso', `${patientData.weight} kg`, 'Altura', `${patientData.height} cm`],
            ['Edad', `${patientData.age} años`, 'Sexo', patientData.sex],
            ['IMC', imc, 'Categoría IMC', imcCategoria(imc)],
          ],
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 4 },
          headStyles: { fillColor: GREEN, textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 250, 245] },
        });
        lastY = doc.lastAutoTable.finalY + 10;

        // Objetivos nutricionales
        addSectionHeader('🎯 Objetivos Nutricionales');
        const goalLabels = {
          calorias: 'Calorías', hc: 'Carbohidratos', proteina: 'Proteínas',
          grasa: 'Grasas', na: 'Sodio (Na)', k: 'Potasio (K)',
          p: 'Fósforo (P)', ca: 'Calcio (Ca)', fe: 'Hierro (Fe)',
          colesterol: 'Colesterol', purinas: 'Purinas', fibra: 'Fibra',
          agua: 'Agua', pavbPercentage: '% PAVB'
        };
        const goalUnits = {
          calorias: 'kcal', hc: 'g', proteina: 'g', grasa: 'g',
          na: 'mg', k: 'mg', p: 'mg', ca: 'mg', fe: 'mg',
          colesterol: 'mg', purinas: 'mg', fibra: 'g', agua: 'ml', pavbPercentage: '%'
        };

        const goalsBody = Object.entries(dietGoals).map(([key, value]) => [
          goalLabels[key] || key, `${value} ${goalUnits[key] || ''}`
        ]);

        // Dividir en 2 columnas
        const half = Math.ceil(goalsBody.length / 2);
        const leftCol = goalsBody.slice(0, half);
        const rightCol = goalsBody.slice(half);
        const paired = leftCol.map((row, i) => [
          row[0], row[1],
          rightCol[i]?.[0] || '', rightCol[i]?.[1] || ''
        ]);

        autoTable(doc, {
          startY: lastY,
          head: [['Nutriente', 'Objetivo', 'Nutriente', 'Objetivo']],
          body: paired,
          theme: 'striped',
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: GREEN, textColor: 255, fontStyle: 'bold' },
        });
        lastY = doc.lastAutoTable.finalY + 10;
        contentAdded = true;
      }

      // ── SECCIÓN 2: PLAN DE ALIMENTOS ──
      if (pdfSections.calculadora && dietaActual?.length > 0) {
        checkPageBreak(40);
        addSectionHeader('🥗 Plan General de Alimentos');

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
          foot: [['TOTALES', '', totales.calorias.toFixed(1), totales.hc.toFixed(1), totales.proteina.toFixed(1), totales.grasa.toFixed(1)]],
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: GREEN, textColor: 255, fontStyle: 'bold' },
          footStyles: { fillColor: LIGHT_GRAY, textColor: DARK, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 250, 245] },
        });
        lastY = doc.lastAutoTable.finalY + 10;
        contentAdded = true;
      }

      // ── PIE DE PÁGINA ──
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        doc.setFillColor(...GREEN);
        doc.rect(0, pageH - 15, pageW, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('FerCalc — Calculadora Nutricional', 14, pageH - 5);
        doc.setFont('helvetica', 'normal');
        doc.text(`Página ${i} de ${pageCount}`, pageW - 30, pageH - 5);
      }

      if (!contentAdded) {
        toast.error('No hay contenido para generar el PDF. Seleccioná al menos una sección con datos.');
      } else {
        doc.save('FerCalc-dieta.pdf');
        toast.success('PDF descargado con éxito.');
      }
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      toast.error('No se pudo generar el PDF.');
    } finally {
      setIsProcessing(false);
      setModal(null);
      setIsDrawerOpen(false);
    }
  };

  // Inicial del usuario para el avatar
  const userInitial = user?.username?.charAt(0).toUpperCase() || '?';

  return (
    <>
      {/* Botón hamburguesa */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        <Menu size={20} />
        <span className="font-medium">Menú</span>
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

        {/* Header del drawer — Perfil de usuario */}
        <div className="bg-gray-800 p-6 flex flex-col items-center border-b border-gray-700">
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>

          {/* Avatar */}
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
            {/* Botón para subir foto */}
            <label className="absolute bottom-0 right-0 bg-gray-600 hover:bg-gray-500 rounded-full p-1 cursor-pointer">
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

        {/* Opciones del menú */}
        <nav className="flex-1 overflow-y-auto py-4">
          <p className="text-gray-500 text-xs uppercase font-semibold px-6 mb-2">Gestión de Dietas</p>

          <MenuItem
            icon={<FilePlus size={18} />}
            label="Nueva Dieta"
            onClick={handleNewDietWithWarning}
            color="text-green-400"
          />
          <MenuItem
            icon={<Save size={18} />}
            label="Guardar Dieta Actual"
            onClick={() => { setModal('save'); setIsDrawerOpen(false); }}
            color="text-blue-400"
          />
          <MenuItem
            icon={<FolderOpen size={18} />}
            label="Cargar Dieta Guardada"
            onClick={() => { setModal('load'); setIsDrawerOpen(false); }}
            color="text-yellow-400"
          />

          <div className="border-t border-gray-700 my-4" />
          <p className="text-gray-500 text-xs uppercase font-semibold px-6 mb-2">Exportar</p>

          <MenuItem
            icon={<Download size={18} />}
            label="Descargar PDF"
            onClick={() => { setModal('pdf'); setIsDrawerOpen(false); }}
            color="text-red-400"
          />
        </nav>

        {/* Cerrar sesión al fondo */}
        <div className="border-t border-gray-700 p-4">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* ── MODALES ── */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {modal === 'save' && '💾 Guardar Dieta'}
                {modal === 'load' && '📂 Cargar Dieta'}
                {modal === 'pdf' && '📄 Descargar PDF'}
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-700"><X /></button>
            </div>

            {/* Modal guardar */}
            {modal === 'save' && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Nombre de la Dieta</label>
                <input
                  type="text"
                  value={dietName}
                  onChange={e => setDietName(e.target.value)}
                  placeholder="Ej: Plan Volumen - Semana 1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setModal(null)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
                  <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Guardar</button>
                </div>
              </div>
            )}

            {/* Modal cargar */}
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
                        onClick={() => handleLoadDiet(diet)}
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

            {/* Modal PDF */}
            {modal === 'pdf' && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">Seleccioná las secciones que querés incluir en el PDF:</p>
                <div className="space-y-2">
                  {[
                    { key: 'datos', label: '📋 Datos del paciente y objetivos nutricionales' },
                    { key: 'calculadora', label: '🥗 Plan general de alimentos' },
                    { key: 'fraccionamiento', label: '📊 Fraccionamiento de la dieta' },
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
                  <button onClick={() => setModal(null)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
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

// Componente auxiliar para los items del menú
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