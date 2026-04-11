// mi-app-frontend/src/pages/fercalc/ActionToolbar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Download, Trash2, X, FileText, FilePlus, LogOut, User,
  ChevronRight, Menu, AlertTriangle, ShieldCheck, UserPlus,
  FolderOpen, Save, Users, ArrowLeft, Search, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import ProfileModal from '../../components/ProfileModal.jsx';
import {
  getPatientsAPI, createPatientAPI, getRecordsAPI, createRecordAPI
} from '../../api/patients.js';

// ─── Modal genérico ───
const Modal = ({ title, subtitle, onClose, children, maxWidth = 'max-w-lg' }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4">
    <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[92vh] overflow-y-auto`}>
      <div className="flex justify-between items-start p-6 border-b sticky top-0 bg-white rounded-t-2xl z-10">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors ml-4 flex-shrink-0">
          <X size={22} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const ActionToolbar = ({ getCurrentDietState, savedDiets, setSavedDiets, loadDietState, handleNewDiet, allData }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [showNewDietWarning, setShowNewDietWarning] = useState(false);

  // ── Estados para guardar paciente ──
  const [saveStep, setSaveStep] = useState(1); // 1: elegir nuevo/existente, 2: nuevo paciente form, 3: elegir paciente existente
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [consultaName, setConsultaName] = useState('');
  const [newPatientForm, setNewPatientForm] = useState({ nombre: '', apellido: '', email: '', telefono: '', sexo: 'Masculino', notas: '' });
  const [selectedExistingPatient, setSelectedExistingPatient] = useState(null);
  const [savingPatient, setSavingPatient] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');

  // ── Estados para cargar paciente ──
  const [loadPatients, setLoadPatients] = useState([]);
  const [loadingLoadPatients, setLoadingLoadPatients] = useState(false);
  const [selectedLoadPatient, setSelectedLoadPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadPatientSearch, setLoadPatientSearch] = useState('');

  const [pdfSections, setPdfSections] = useState({
    datos: true, calculadora: true, intercambio: true,
    fraccionamientoDesarrollada: true, fraccionamientoIntercambio: true, recetarios: true,
  });

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

  // ── Abrir modal guardar ──
  const openSaveModal = async () => {
    setModal('savePatient');
    setSaveStep(1);
    setConsultaName('');
    setNewPatientForm({ nombre: '', apellido: '', email: '', telefono: '', sexo: 'Masculino', notas: '' });
    setSelectedExistingPatient(null);
    setPatientSearch('');
    setIsDrawerOpen(false);
  };

  // ── Cargar lista de pacientes para "paciente existente" ──
  const fetchPatientsForSave = useCallback(async () => {
    setLoadingPatients(true);
    try {
      const res = await getPatientsAPI();
      setPatients(res.data);
    } catch {
      toast.error('Error al cargar pacientes.');
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  const goToExistingPatient = () => {
    setSaveStep(3);
    fetchPatientsForSave();
  };

  // ── Guardar como NUEVO paciente ──
  const handleSaveAsNewPatient = async () => {
    if (!newPatientForm.nombre.trim()) { toast.error('El nombre es obligatorio.'); return; }
    if (!consultaName.trim()) { toast.error('Ingresa un nombre para la consulta.'); return; }
    setSavingPatient(true);
    try {
      // 1. Crear paciente
      const patRes = await createPatientAPI(newPatientForm);
      const newPatient = patRes.data;
      // 2. Guardar consulta con datos de FerCalc
      await createRecordAPI(newPatient._id, {
        nombre: consultaName.trim(),
        ...allData,
      });
      toast.success(`Paciente "${newPatientForm.nombre}" y consulta guardados.`);
      setModal(null);
    } catch {
      toast.error('Error al guardar.');
    } finally {
      setSavingPatient(false);
    }
  };

  // ── Guardar como seguimiento de paciente EXISTENTE ──
  const handleSaveAsFollowUp = async () => {
    if (!selectedExistingPatient) { toast.error('Seleccioná un paciente.'); return; }
    if (!consultaName.trim()) { toast.error('Ingresa un nombre para la consulta.'); return; }
    setSavingPatient(true);
    try {
      await createRecordAPI(selectedExistingPatient._id, {
        nombre: consultaName.trim(),
        ...allData,
      });
      toast.success(`Consulta guardada para ${selectedExistingPatient.nombre}.`);
      setModal(null);
    } catch {
      toast.error('Error al guardar.');
    } finally {
      setSavingPatient(false);
    }
  };

  // ── Abrir modal cargar ──
  const openLoadModal = async () => {
    setModal('loadPatient');
    setSelectedLoadPatient(null);
    setPatientRecords([]);
    setLoadPatientSearch('');
    setIsDrawerOpen(false);
    setLoadingLoadPatients(true);
    try {
      const res = await getPatientsAPI();
      setLoadPatients(res.data);
    } catch {
      toast.error('Error al cargar pacientes.');
    } finally {
      setLoadingLoadPatients(false);
    }
  };

  // ── Seleccionar paciente para cargar ──
  const handleSelectLoadPatient = async (patient) => {
    setSelectedLoadPatient(patient);
    setLoadingRecords(true);
    try {
      const res = await getRecordsAPI(patient._id);
      setPatientRecords(res.data);
    } catch {
      toast.error('Error al cargar consultas.');
    } finally {
      setLoadingRecords(false);
    }
  };

  // ── Cargar un snapshot de consulta en FerCalc ──
  const handleLoadRecord = (record) => {
    loadDietState({
      patientData: record.patientData,
      dietGoals: record.dietGoals,
      dietaActual: record.dietaActual,
      planIntercambio: record.planIntercambio,
      annotations: record.annotations,
      name: record.nombre,
    });
    setModal(null);
    toast.success(`Datos de "${record.nombre}" cargados en FerCalc.`);
  };

  const filteredPatientsForSave = patients.filter(p =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(patientSearch.toLowerCase())
  );
  const filteredPatientsForLoad = loadPatients.filter(p =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(loadPatientSearch.toLowerCase())
  );

  // ─── PDF ───
  const handlePdfDownload = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    toast('Generando PDF...', { icon: '📄' });
    try {
      const { patientData, dietGoals, dietaActual, fraccionamientoData, planIntercambio } = allData;
      const doc = new jsPDF();
      let lastY = 20;
      let contentAdded = false;
      const GREEN = [39, 174, 96]; const DARK = [44, 62, 80];
      const LIGHT_GRAY = [236, 240, 241]; const WHITE = [255, 255, 255];
      const BLUE = [41, 128, 185];

      const addSectionHeader = (title, color = GREEN) => {
        if (lastY > 255) { doc.addPage(); lastY = 20; }
        doc.setFillColor(...color); doc.rect(0, lastY - 5, 220, 12, 'F');
        doc.setTextColor(...WHITE); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
        doc.text(title, 14, lastY + 3); doc.setTextColor(...DARK);
        doc.setFont('helvetica', 'normal'); lastY += 16;
      };
      const addSubHeader = (title) => {
        if (lastY > 260) { doc.addPage(); lastY = 20; }
        doc.setFillColor(...LIGHT_GRAY); doc.rect(10, lastY - 3, 190, 9, 'F');
        doc.setTextColor(...DARK); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
        doc.text(title, 14, lastY + 3); doc.setFont('helvetica', 'normal'); lastY += 13;
      };
      const checkPage = (space = 40) => { if (lastY + space > 272) { doc.addPage(); lastY = 20; } };

      // Encabezado
      doc.setFillColor(...GREEN); doc.rect(0, 0, 220, 28, 'F');
      doc.setTextColor(...WHITE); doc.setFontSize(22); doc.setFont('helvetica', 'bold'); doc.text('FerCalc', 14, 13);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.text('Calculadora Nutricional', 14, 21);
      doc.setFontSize(9);
      doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`, 130, 13);
      doc.text(`Usuario: ${user?.username || 'N/A'}`, 130, 21);
      doc.setTextColor(...DARK); lastY = 38;

      if (pdfSections.datos) {
        addSectionHeader('1. DATOS DEL PACIENTE Y OBJETIVOS');
        const imc = patientData?.height > 0 && patientData?.weight > 0
          ? (patientData.weight / ((patientData.height / 100) ** 2)).toFixed(2) : 'N/A';
        const imcCat = (v) => { const n = parseFloat(v); if (isNaN(n)) return 'N/A'; if (n < 18.5) return 'Bajo peso'; if (n < 25) return 'Normal'; if (n < 30) return 'Sobrepeso'; return 'Obesidad'; };
        autoTable(doc, {
          startY: lastY,
          head: [['Parametro', 'Valor', 'Parametro', 'Valor']],
          body: [
            ['Peso', `${patientData?.weight} kg`, 'Altura', `${patientData?.height} cm`],
            ['Edad (anos)', `${parseFloat(patientData?.age || 0).toFixed(1)}`, 'Sexo', patientData?.sex || '-'],
            ['IMC', imc, 'Categoria IMC', imcCat(imc)],
          ],
          theme: 'grid', styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: GREEN, textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 250, 245] },
        });
        lastY = doc.lastAutoTable.finalY + 8;

        checkPage(35); addSubHeader('Objetivos Nutricionales');
        const goalLabels = { calorias: 'Calorias', hc: 'Carbohidratos', proteina: 'Proteinas', grasa: 'Grasas', na: 'Sodio', k: 'Potasio', p: 'Fosforo', ca: 'Calcio', fe: 'Hierro', colesterol: 'Colesterol', purinas: 'Purinas', fibra: 'Fibra', agua: 'Agua', pavbPercentage: '% PAVB' };
        const goalUnits = { calorias: 'kcal', hc: 'g', proteina: 'g', grasa: 'g', na: 'mg', k: 'mg', p: 'mg', ca: 'mg', fe: 'mg', colesterol: 'mg', purinas: 'mg', fibra: 'g', agua: 'ml', pavbPercentage: '%' };
        const pavbGramos = dietGoals?.pavbPercentage > 0 && dietGoals?.proteina > 0
          ? `${((dietGoals.pavbPercentage / 100) * dietGoals.proteina).toFixed(1)} g` : '-';
        const goalsArr = Object.entries(dietGoals || {}).map(([key, value]) => {
          let displayVal = `${value} ${goalUnits[key] || ''}`;
          if (key === 'pavbPercentage') displayVal = `${value}% (= ${pavbGramos})`;
          return [goalLabels[key] || key, displayVal];
        });
        const half = Math.ceil(goalsArr.length / 2);
        const paired = goalsArr.slice(0, half).map((row, i) => [row[0], row[1], goalsArr[half + i]?.[0] || '', goalsArr[half + i]?.[1] || '']);
        autoTable(doc, { startY: lastY, head: [['Nutriente', 'Objetivo', 'Nutriente', 'Objetivo']], body: paired, theme: 'striped', styles: { fontSize: 9, cellPadding: 3 }, headStyles: { fillColor: GREEN, textColor: 255, fontStyle: 'bold' }, alternateRowStyles: { fillColor: [245, 250, 245] } });
        lastY = doc.lastAutoTable.finalY + 10; contentAdded = true;
      }

      if (pdfSections.calculadora && dietaActual?.length > 0) {
        checkPage(40); addSectionHeader('2. PLAN GENERAL DE ALIMENTOS');
        const planBody = dietaActual.map(item => { const factor = (item.cantidadUsada || 0) / (item.alimento?.cantidad || 1); return [item.alimento?.nombre, `${parseFloat(item.cantidadUsada || 0).toFixed(1)} g`, ((item.alimento?.calorias || 0) * factor).toFixed(1), ((item.alimento?.hc || 0) * factor).toFixed(1), ((item.alimento?.proteina || 0) * factor).toFixed(1), ((item.alimento?.grasa || 0) * factor).toFixed(1)]; });
        const totales = dietaActual.reduce((acc, item) => { const factor = (item.cantidadUsada || 0) / (item.alimento?.cantidad || 1); acc.calorias += (item.alimento?.calorias || 0) * factor; acc.hc += (item.alimento?.hc || 0) * factor; acc.proteina += (item.alimento?.proteina || 0) * factor; acc.grasa += (item.alimento?.grasa || 0) * factor; return acc; }, { calorias: 0, hc: 0, proteina: 0, grasa: 0 });
        autoTable(doc, { startY: lastY, head: [['Alimento', 'Gramos', 'Kcal', 'HC (g)', 'Prot. (g)', 'Grasa (g)']], body: planBody, foot: [['TOTALES', '', totales.calorias.toFixed(1), totales.hc.toFixed(1), totales.proteina.toFixed(1), totales.grasa.toFixed(1)]], theme: 'grid', styles: { fontSize: 8, cellPadding: 2.5 }, headStyles: { fillColor: GREEN, textColor: 255, fontStyle: 'bold' }, footStyles: { fillColor: LIGHT_GRAY, textColor: DARK, fontStyle: 'bold' }, alternateRowStyles: { fillColor: [245, 250, 245] } });
        lastY = doc.lastAutoTable.finalY + 10; contentAdded = true;
      }

      if (pdfSections.intercambio && planIntercambio?.porciones && Object.keys(planIntercambio.porciones).length > 0) {
        checkPage(40); addSectionHeader('3. CALCULADORA POR INTERCAMBIO', BLUE);
        const { porciones, totales: totInt, piramideData } = planIntercambio;
        const intercambioBody = Object.entries(porciones).map(([grupo, porc]) => { const gd = piramideData?.[grupo] || {}; const p = parseFloat(porc) || 0; return [grupo, p.toString(), ((gd.calorias || 0) * p).toFixed(1), ((gd.hc || 0) * p).toFixed(1), ((gd.proteinas || 0) * p).toFixed(1), ((gd.lipidos || 0) * p).toFixed(1)]; });
        autoTable(doc, { startY: lastY, head: [['Grupo', 'Porciones', 'Kcal', 'HC (g)', 'Prot. (g)', 'Lip. (g)']], body: intercambioBody, foot: [['TOTALES', '', (totInt?.calorias || 0).toFixed(1), (totInt?.hc || 0).toFixed(1), (totInt?.proteinas || 0).toFixed(1), (totInt?.lipidos || 0).toFixed(1)]], theme: 'grid', styles: { fontSize: 8, cellPadding: 2.5 }, headStyles: { fillColor: BLUE, textColor: 255, fontStyle: 'bold' }, footStyles: { fillColor: LIGHT_GRAY, textColor: DARK, fontStyle: 'bold' }, alternateRowStyles: { fillColor: [240, 248, 255] } });
        lastY = doc.lastAutoTable.finalY + 10; contentAdded = true;
      }

      if (pdfSections.fraccionamientoDesarrollada && fraccionamientoData && dietaActual?.length > 0) {
        const { mealSlots, numberOfDays, distribucionDesarrollada, mealNamesByDayDes, recetariosDes } = fraccionamientoData;
        if (distribucionDesarrollada && Object.keys(distribucionDesarrollada).length > 0) {
          checkPage(40); addSectionHeader('4. FRACCIONAMIENTO POR DESARROLLADA');
          for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex++) {
            const distribucionDelDia = distribucionDesarrollada[dayIndex] || {};
            const hasData = mealSlots?.some(mealKey => (dietaActual || []).some(fi => ((distribucionDelDia[fi.id] || {})[mealKey] || 0) > 0));
            if (!hasData) continue;
            checkPage(20); addSubHeader(`Dia ${dayIndex + 1}`);
            let totalKcalDia = 0;
            mealSlots?.forEach(mealKey => { (dietaActual || []).forEach(foodItem => { const grams = (distribucionDelDia[foodItem.id] || {})[mealKey] || 0; const factor = grams > 0 && foodItem.alimento?.cantidad > 0 ? grams / foodItem.alimento.cantidad : 0; totalKcalDia += (foodItem.alimento?.calorias || 0) * factor; }); });
            for (const mealKey of (mealSlots || [])) {
              const mealLabel = (mealNamesByDayDes || {})[`${dayIndex}_${mealKey}`] || mealKey;
              const mealFoods = (dietaActual || []).map(foodItem => { const grams = (distribucionDelDia[foodItem.id] || {})[mealKey] || 0; return grams > 0 ? { foodItem, assignedGrams: grams } : null; }).filter(Boolean);
              if (mealFoods.length === 0) continue;
              let mealKcal = 0;
              const mealBody = mealFoods.map(({ foodItem, assignedGrams }) => { const factor = assignedGrams > 0 && foodItem.alimento?.cantidad > 0 ? assignedGrams / foodItem.alimento.cantidad : 0; const kcal = (foodItem.alimento?.calorias || 0) * factor; mealKcal += kcal; return [foodItem.alimento?.nombre, `${assignedGrams.toFixed(1)} g`, kcal.toFixed(1), ((foodItem.alimento?.hc || 0) * factor).toFixed(1), ((foodItem.alimento?.proteina || 0) * factor).toFixed(1), ((foodItem.alimento?.grasa || 0) * factor).toFixed(1)]; });
              const pctVCT = totalKcalDia > 0 ? ((mealKcal / totalKcalDia) * 100).toFixed(1) : '0.0';
              checkPage(mealBody.length * 7 + 20);
              doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK);
              doc.text(`  ${mealLabel}`, 14, lastY);
              doc.setFont('helvetica', 'normal'); doc.setTextColor(39, 174, 96);
              doc.text(`${pctVCT}% VCT — ${mealKcal.toFixed(0)} kcal`, 100, lastY);
              doc.setTextColor(...DARK); lastY += 5;
              autoTable(doc, { startY: lastY, head: [['Alimento', 'g', 'Kcal', 'HC', 'Prot', 'Grasa']], body: mealBody, theme: 'grid', styles: { fontSize: 7.5, cellPadding: 2 }, headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold', fontSize: 7.5 }, alternateRowStyles: { fillColor: [245, 250, 245] }, margin: { left: 14, right: 14 } });
              lastY = doc.lastAutoTable.finalY + 5;
              if (pdfSections.recetarios) { const recetario = (recetariosDes || {})[`${dayIndex}_${mealKey}`]; if (recetario?.preparacion) { checkPage(20); doc.setFontSize(8); doc.setFont('helvetica', 'bolditalic'); doc.setTextColor(80, 80, 80); doc.text('Preparacion:', 14, lastY); doc.setFont('helvetica', 'normal'); lastY += 5; const lines = doc.splitTextToSize(recetario.preparacion, 182); lines.forEach(line => { checkPage(6); doc.text(line, 14, lastY); lastY += 5; }); lastY += 3; } }
            }
            lastY += 4;
          }
          contentAdded = true;
        }
      }

      if (pdfSections.fraccionamientoIntercambio && fraccionamientoData && planIntercambio?.porciones && Object.keys(planIntercambio.porciones).length > 0) {
        const { mealSlots, numberOfDays, distribucionIntercambio, mealNamesByDayInt, recetariosInt } = fraccionamientoData;
        const piramideData = planIntercambio?.piramideData || {};
        if (distribucionIntercambio && Object.keys(distribucionIntercambio).length > 0) {
          checkPage(40); addSectionHeader('5. FRACCIONAMIENTO POR INTERCAMBIO', [46, 125, 50]);
          for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex++) {
            const distribucionDelDia = distribucionIntercambio[dayIndex] || {};
            const hasData = mealSlots?.some(mealKey => Object.keys(distribucionDelDia).some(gn => ((distribucionDelDia[gn] || {})[mealKey] || 0) > 0));
            if (!hasData) continue;
            checkPage(20); addSubHeader(`Dia ${dayIndex + 1}`);
            let totalKcalDia = 0;
            mealSlots?.forEach(mealKey => { Object.keys(distribucionDelDia).forEach(groupName => { const portions = (distribucionDelDia[groupName] || {})[mealKey] || 0; const gd = piramideData[groupName]; if (gd) totalKcalDia += (gd.calorias || 0) * portions; }); });
            for (const mealKey of (mealSlots || [])) {
              const mealLabel = (mealNamesByDayInt || {})[`${dayIndex}_${mealKey}`] || mealKey;
              const mealGroups = Object.keys(distribucionDelDia).filter(gn => ((distribucionDelDia[gn] || {})[mealKey] || 0) > 0).map(gn => ({ groupName: gn, assignedPortions: distribucionDelDia[gn][mealKey] }));
              if (mealGroups.length === 0) continue;
              let mealKcal = 0;
              const mealBody = mealGroups.map(({ groupName, assignedPortions }) => { const gd = piramideData[groupName] || {}; const kcal = (gd.calorias || 0) * assignedPortions; mealKcal += kcal; return [groupName, assignedPortions.toString(), kcal.toFixed(1), ((gd.hc || 0) * assignedPortions).toFixed(1), ((gd.proteinas || 0) * assignedPortions).toFixed(1), ((gd.lipidos || 0) * assignedPortions).toFixed(1)]; });
              const pctVCT = totalKcalDia > 0 ? ((mealKcal / totalKcalDia) * 100).toFixed(1) : '0.0';
              checkPage(mealBody.length * 7 + 20);
              doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK);
              doc.text(`  ${mealLabel}`, 14, lastY);
              doc.setFont('helvetica', 'normal'); doc.setTextColor(46, 125, 50);
              doc.text(`${pctVCT}% VCT — ${mealKcal.toFixed(0)} kcal`, 100, lastY);
              doc.setTextColor(...DARK); lastY += 5;
              autoTable(doc, { startY: lastY, head: [['Grupo', 'Porciones', 'Kcal', 'HC', 'Prot', 'Lip']], body: mealBody, theme: 'grid', styles: { fontSize: 7.5, cellPadding: 2 }, headStyles: { fillColor: [46, 125, 50], textColor: 255, fontStyle: 'bold', fontSize: 7.5 }, alternateRowStyles: { fillColor: [240, 255, 240] }, margin: { left: 14, right: 14 } });
              lastY = doc.lastAutoTable.finalY + 5;
              if (pdfSections.recetarios) { const recetario = (recetariosInt || {})[`${dayIndex}_${mealKey}`]; if (recetario?.preparacion) { checkPage(20); doc.setFontSize(8); doc.setFont('helvetica', 'bolditalic'); doc.setTextColor(80, 80, 80); doc.text('Preparacion:', 14, lastY); doc.setFont('helvetica', 'normal'); lastY += 5; const lines = doc.splitTextToSize(recetario.preparacion, 182); lines.forEach(line => { checkPage(6); doc.text(line, 14, lastY); lastY += 5; }); lastY += 3; } }
            }
            lastY += 4;
          }
          contentAdded = true;
        }
      }

      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        doc.setFillColor(...GREEN); doc.rect(0, pageH - 14, pageW, 14, 'F');
        doc.setTextColor(...WHITE); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
        doc.text('FerCalc - Calculadora Nutricional', 14, pageH - 5);
        doc.setFont('helvetica', 'normal');
        doc.text(`Pagina ${i} de ${pageCount}`, pageW - 35, pageH - 5);
      }

      if (!contentAdded) { toast.error('No hay contenido para generar el PDF.'); }
      else { doc.save('FerCalc-dieta.pdf'); toast.success('PDF descargado.'); }
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      toast.error('No se pudo generar el PDF.');
    } finally {
      setIsProcessing(false);
      setModal(null);
    }
  };

  const userInitial = user?.username?.charAt(0).toUpperCase() || '?';
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <button onClick={() => setIsDrawerOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
        <Menu size={20} /><span className="font-medium">Menu</span>
      </button>

      {isDrawerOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsDrawerOpen(false)} />}

      <div className={`fixed top-0 left-0 h-full w-72 bg-gray-900 text-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Perfil */}
        <div className="bg-gray-800 p-6 flex flex-col items-center border-b border-gray-700 relative">
          <button onClick={() => setIsDrawerOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
          <button onClick={() => { setIsDrawerOpen(false); setIsProfileOpen(true); }} className="relative mb-3 group">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Foto" className="w-20 h-20 rounded-full object-cover border-4 border-green-500 group-hover:border-green-300 transition" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center text-3xl font-bold border-4 border-green-400 group-hover:border-green-200 transition">
                {userInitial}
              </div>
            )}
          </button>
          <p className="font-bold text-lg">{user?.username}</p>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          {isAdmin && (
            <span className="mt-2 inline-flex items-center gap-1 bg-green-700 text-green-200 text-xs font-semibold px-3 py-1 rounded-full">
              <ShieldCheck size={12} /> Administrador
            </span>
          )}
          <button onClick={() => { setIsDrawerOpen(false); setIsProfileOpen(true); }}
            className="mt-3 flex items-center gap-2 bg-gray-700 hover:bg-green-700 text-gray-200 hover:text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all border border-gray-600 hover:border-green-500">
            <User size={13} /> Editar perfil
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {isAdmin && (
            <>
              <p className="text-gray-500 text-xs uppercase font-semibold px-6 mb-2 tracking-wider">Administración</p>
              <MenuItem icon={<ShieldCheck size={18} />} label="Panel APEN" onClick={() => { setIsDrawerOpen(false); navigate('/admin'); }} color="text-green-400" />
              <div className="border-t border-gray-700 my-4" />
            </>
          )}

          {/* ✅ Sección Pacientes — renombrada y con flujo integrado */}
          <p className="text-gray-500 text-xs uppercase font-semibold px-6 mb-2 tracking-wider">Pacientes</p>
          <MenuItem icon={<FilePlus size={18} />} label="Nuevo Paciente" onClick={() => { setShowNewDietWarning(true); setIsDrawerOpen(false); }} color="text-green-400" />
          <MenuItem icon={<Save size={18} />} label="Guardar Datos del Paciente" onClick={openSaveModal} color="text-blue-400" />
          <MenuItem icon={<FolderOpen size={18} />} label="Cargar Datos del Paciente" onClick={openLoadModal} color="text-yellow-400" />
          <MenuItem icon={<Users size={18} />} label="Ver Mis Pacientes" onClick={() => { setIsDrawerOpen(false); navigate('/pacientes'); }} color="text-purple-400" />

          <div className="border-t border-gray-700 my-4" />
          <p className="text-gray-500 text-xs uppercase font-semibold px-6 mb-2 tracking-wider">Exportar</p>
          <MenuItem icon={<Download size={18} />} label="Descargar PDF" onClick={() => { setModal('pdf'); setIsDrawerOpen(false); }} color="text-red-400" />
        </nav>

        <div className="border-t border-gray-700 p-4">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 transition-colors">
            <LogOut size={18} /><span className="font-medium">Cerrar Sesion</span>
          </button>
        </div>
      </div>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} profilePhoto={profilePhoto} onPhotoChange={handlePhotoUpload} />

      {/* ── ADVERTENCIA NUEVO PACIENTE (reset) ── */}
      {showNewDietWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 p-3 rounded-full"><AlertTriangle className="w-6 h-6 text-yellow-600" /></div>
              <h3 className="text-lg font-bold text-gray-800">Nuevo Paciente</h3>
            </div>
            <p className="text-gray-600 mb-6">Se limpiarán todos los datos actuales para comenzar con un paciente nuevo. Los datos no guardados se perderán.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowNewDietWarning(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Cancelar</button>
              <button onClick={() => { handleNewDiet(); setShowNewDietWarning(false); }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Continuar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL GUARDAR DATOS DEL PACIENTE ── */}
      {modal === 'savePatient' && (
        <Modal
          title={saveStep === 1 ? 'Guardar Datos del Paciente' : saveStep === 2 ? 'Nuevo Paciente' : 'Seleccionar Paciente'}
          subtitle={saveStep === 1 ? 'Elegí cómo querés guardar los datos actuales de FerCalc' : saveStep === 2 ? 'Se creará una ficha nueva y se guardará esta consulta' : 'Guardá como seguimiento de un paciente existente'}
          onClose={() => setModal(null)}
          maxWidth="max-w-lg"
        >
          {/* Paso 1: elegir nuevo o existente */}
          {saveStep === 1 && (
            <div className="space-y-3">
              {/* Nombre de consulta siempre visible */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la consulta *</label>
                <input
                  value={consultaName}
                  onChange={e => setConsultaName(e.target.value)}
                  placeholder="Ej: Primera consulta, Control mes 3..."
                  className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                />
              </div>
              <p className="text-sm text-gray-500 font-medium pt-2">¿Para quién es esta consulta?</p>
              <button onClick={() => setSaveStep(2)}
                className="w-full flex items-center gap-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl hover:border-green-500 hover:bg-green-100 transition-all text-left">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <UserPlus size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Paciente nuevo</p>
                  <p className="text-xs text-gray-500">Crear una ficha nueva con los datos actuales</p>
                </div>
                <ChevronRight size={18} className="ml-auto text-gray-400" />
              </button>
              <button onClick={goToExistingPatient}
                className="w-full flex items-center gap-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-100 transition-all text-left">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Paciente existente</p>
                  <p className="text-xs text-gray-500">Agregar como seguimiento a un paciente ya registrado</p>
                </div>
                <ChevronRight size={18} className="ml-auto text-gray-400" />
              </button>
            </div>
          )}

          {/* Paso 2: formulario nuevo paciente */}
          {saveStep === 2 && (
            <div className="space-y-4">
              <button onClick={() => setSaveStep(1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2">
                <ArrowLeft size={16} /> Volver
              </button>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
                  <input value={newPatientForm.nombre} onChange={e => setNewPatientForm(p => ({ ...p, nombre: e.target.value }))}
                    placeholder="Juan" className="w-full p-2 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Apellido</label>
                  <input value={newPatientForm.apellido} onChange={e => setNewPatientForm(p => ({ ...p, apellido: e.target.value }))}
                    placeholder="Pérez" className="w-full p-2 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={newPatientForm.email} onChange={e => setNewPatientForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="correo@ejemplo.com" className="w-full p-2 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                  <input value={newPatientForm.telefono} onChange={e => setNewPatientForm(p => ({ ...p, telefono: e.target.value }))}
                    placeholder="+595 999 000 000" className="w-full p-2 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sexo</label>
                  <select value={newPatientForm.sexo} onChange={e => setNewPatientForm(p => ({ ...p, sexo: e.target.value }))}
                    className="w-full p-2 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none">
                    <option>Masculino</option><option>Femenino</option><option>Otro</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
                <textarea value={newPatientForm.notas} onChange={e => setNewPatientForm(p => ({ ...p, notas: e.target.value }))}
                  rows={2} placeholder="Diagnósticos, alergias..." className="w-full p-2 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none resize-none" />
              </div>
              {/* Resumen de lo que se va a guardar */}
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600">
                <p className="font-semibold mb-1">Se guardará con el nombre: <span className="text-green-700">"{consultaName || '(sin nombre)'}"</span></p>
                <p>Peso: {allData?.patientData?.weight} kg · Altura: {allData?.patientData?.height} cm · {allData?.dietaActual?.length || 0} alimentos en la dieta</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSaveStep(1)} className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium text-sm">Cancelar</button>
                <button onClick={handleSaveAsNewPatient} disabled={savingPatient || !newPatientForm.nombre.trim() || !consultaName.trim()}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {savingPatient ? 'Guardando...' : <><Check size={16} /> Guardar</>}
                </button>
              </div>
            </div>
          )}

          {/* Paso 3: seleccionar paciente existente */}
          {saveStep === 3 && (
            <div className="space-y-3">
              <button onClick={() => setSaveStep(1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft size={16} /> Volver
              </button>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <input value={patientSearch} onChange={e => setPatientSearch(e.target.value)}
                  placeholder="Buscar paciente..." className="w-full pl-9 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                {loadingPatients ? (
                  <div className="text-center py-6 text-gray-400 text-sm">Cargando...</div>
                ) : filteredPatientsForSave.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm">No hay pacientes.</div>
                ) : filteredPatientsForSave.map(p => (
                  <button key={p._id} onClick={() => setSelectedExistingPatient(p)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedExistingPatient?._id === p._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {`${p.nombre?.[0] || ''}${p.apellido?.[0] || ''}`.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{p.nombre} {p.apellido}</p>
                      <p className="text-xs text-gray-500">{p.consultaCount || 0} consulta{p.consultaCount !== 1 ? 's' : ''}</p>
                    </div>
                    {selectedExistingPatient?._id === p._id && <Check size={18} className="text-blue-600 flex-shrink-0" />}
                  </button>
                ))}
              </div>
              {selectedExistingPatient && (
                <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
                  <p className="font-semibold">Guardando como seguimiento de: <span className="text-blue-800">{selectedExistingPatient.nombre} {selectedExistingPatient.apellido}</span></p>
                  <p className="mt-0.5">Consulta: "{consultaName || '(sin nombre)'}" · {allData?.dietaActual?.length || 0} alimentos</p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setSaveStep(1)} className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium text-sm">Cancelar</button>
                <button onClick={handleSaveAsFollowUp} disabled={savingPatient || !selectedExistingPatient || !consultaName.trim()}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {savingPatient ? 'Guardando...' : <><Check size={16} /> Guardar Seguimiento</>}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ── MODAL CARGAR DATOS DEL PACIENTE ── */}
      {modal === 'loadPatient' && (
        <Modal
          title={selectedLoadPatient ? `Consultas de ${selectedLoadPatient.nombre}` : 'Cargar Datos del Paciente'}
          subtitle={selectedLoadPatient ? 'Elegí una consulta para cargarla en FerCalc' : 'Seleccioná un paciente para ver sus consultas guardadas'}
          onClose={() => setModal(null)}
          maxWidth="max-w-lg"
        >
          {!selectedLoadPatient ? (
            <div className="space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <input value={loadPatientSearch} onChange={e => setLoadPatientSearch(e.target.value)}
                  placeholder="Buscar paciente..." className="w-full pl-9 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none" />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {loadingLoadPatients ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Cargando pacientes...</div>
                ) : filteredPatientsForLoad.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">No hay pacientes guardados.</div>
                ) : filteredPatientsForLoad.map(p => (
                  <button key={p._id} onClick={() => handleSelectLoadPatient(p)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 text-left transition-all">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {`${p.nombre?.[0] || ''}${p.apellido?.[0] || ''}`.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm">{p.nombre} {p.apellido}</p>
                      <p className="text-xs text-gray-500">{p.consultaCount || 0} consulta{p.consultaCount !== 1 ? 's' : ''} guardada{p.consultaCount !== 1 ? 's' : ''}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button onClick={() => { setSelectedLoadPatient(null); setPatientRecords([]); }}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft size={16} /> Ver otros pacientes
              </button>
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {loadingRecords ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Cargando consultas...</div>
                ) : patientRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Este paciente no tiene consultas guardadas.</div>
                ) : patientRecords.map(record => (
                  <button key={record._id} onClick={() => handleLoadRecord(record)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-green-400 hover:bg-green-50 text-left transition-all group">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-green-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{record.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(record.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                      <div className="flex gap-3 mt-1">
                        {record.metricas?.peso && <span className="text-xs text-blue-600 font-medium">{record.metricas.peso} kg</span>}
                        {record.metricas?.imc && <span className="text-xs text-purple-600 font-medium">IMC {record.metricas.imc}</span>}
                        {record.metricas?.calorias && <span className="text-xs text-amber-600 font-medium">{record.metricas.calorias} kcal</span>}
                      </div>
                    </div>
                    <span className="text-xs text-green-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      Cargar →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ── MODAL PDF ── */}
      {modal === 'pdf' && (
        <Modal title="Descargar PDF" onClose={() => setModal(null)} maxWidth="max-w-md">
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">Selecciona las secciones a incluir:</p>
            <div className="space-y-2">
              {[
                { key: 'datos', label: 'Datos del paciente y objetivos' },
                { key: 'calculadora', label: 'Plan general de alimentos' },
                { key: 'intercambio', label: 'Calculadora por Intercambio' },
                { key: 'fraccionamientoDesarrollada', label: 'Fraccionamiento por Desarrollada' },
                { key: 'fraccionamientoIntercambio', label: 'Fraccionamiento por Intercambio' },
                { key: 'recetarios', label: 'Incluir recetarios' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border">
                  <input type="checkbox" checked={pdfSections[key]}
                    onChange={e => setPdfSections(p => ({ ...p, [key]: e.target.checked }))}
                    className="w-4 h-4 accent-green-600" />
                  <span className="text-gray-700 text-sm">{label}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button onClick={handlePdfDownload} disabled={isProcessing} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {isProcessing ? 'Generando...' : 'Generar PDF'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

const MenuItem = ({ icon, label, onClick, color = 'text-white' }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-800 transition-colors group">
    <div className="flex items-center gap-3">
      <span className={color}>{icon}</span>
      <span className="text-gray-200 group-hover:text-white text-sm font-medium">{label}</span>
    </div>
    <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400" />
  </button>
);

export default ActionToolbar;