// src/ActionToolbar.jsx
// VERSIÓN CORREGIDA FINAL: Se cambia el método de importación y llamada de autoTable.

import React, { useState } from 'react';
import { Settings, Save, FolderOpen, Download, Trash2, X, FileText, FilePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
// CAMBIO IMPORTANTE: Importamos la función directamente.
import autoTable from 'jspdf-autotable';

const ActionToolbar = ({ getCurrentDietState, savedDiets, setSavedDiets, loadDietState, handleNewDiet, allData }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [dietName, setDietName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfSections, setPdfSections] = useState({ datos: true, calculadora: true, fraccionamiento: true });

  const handleSave = () => {
    if (!dietName.trim()) { toast.error('Por favor, introduce un nombre para la dieta.'); return; }
    const newDiet = { id: Date.now(), name: dietName.trim(), data: getCurrentDietState() };
    setSavedDiets(prev => [...prev, newDiet]);
    toast.success(`Dieta "${dietName.trim()}" guardada.`);
    setModal(null); setDietName(''); setIsMenuOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta dieta?')) {
      setSavedDiets(prev => prev.filter(diet => diet.id !== id));
      toast.error('Dieta eliminada.');
    }
  };

  const handlePdfDownload = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    toast('Generando PDF profesional...', { icon: '📄' });

    try {
      const { patientData, dietGoals, dietaActual, mealSlots, distribucion, mealNames } = allData;
      const doc = new jsPDF();
      let contentAdded = false;

      // CAMBIO IMPORTANTE: La posición 'y' ahora se gestiona a través del retorno de la función autoTable.
      let lastY = 20; 

      const addTitle = (title) => { doc.setFontSize(18); doc.text(title, 14, lastY); lastY += 10; };
      const addSubtitle = (subtitle) => { doc.setFontSize(14); doc.text(subtitle, 14, lastY); lastY += 8; };
      const checkPageBreak = (spaceNeeded) => { if (lastY + spaceNeeded > 280) { doc.addPage(); lastY = 20; } };
      
      if (pdfSections.datos) {
        addTitle("Resumen de Datos y Objetivos");
        const imc = (patientData.height > 0 && patientData.weight > 0) ? (patientData.weight / ((patientData.height / 100) ** 2)).toFixed(2) : "N/A";
        // CAMBIO IMPORTANTE: Se llama a autoTable como una función.
        autoTable(doc, { startY: lastY, head: [['Parámetro', 'Valor']], body: [['Peso', `${patientData.weight} kg`], ['Altura', `${patientData.height} cm`], ['Edad', `${patientData.age} años`], ['Sexo', patientData.sex], ['IMC', imc]], theme: 'grid', styles: { fontSize: 10 }, headStyles: { fillColor: [41, 128, 185] } });
        lastY = doc.lastAutoTable.finalY + 10;

        addSubtitle("Objetivos Nutricionales");
        const goalLabels = { calorias: 'Calorías', hc: 'Carbohidratos', proteina: 'Proteínas', grasa: 'Grasas', na: 'Sodio (Na)', k: 'Potasio (K)', p: 'Fósforo (P)', ca: 'Calcio (Ca)', fe: 'Hierro (Fe)', colesterol: 'Colesterol', purinas: 'Purinas', fibra: 'Fibra', agua: 'Agua', pavbPercentage: '% PAVB' };
        const goalUnits = { calorias: 'kcal', hc: 'g', proteina: 'g', grasa: 'g', na: 'mg', k: 'mg', p: 'mg', ca: 'mg', fe: 'mg', colesterol: 'mg', purinas: 'mg', fibra: 'g', agua: 'ml', pavbPercentage: '%' };
        const goalsBody = Object.entries(dietGoals).map(([key, value]) => [goalLabels[key] || key, value, goalUnits[key] || '']);
        autoTable(doc, { startY: lastY, head: [['Nutriente', 'Objetivo', 'Unidad']], body: goalsBody, theme: 'striped', styles: { fontSize: 10 }, headStyles: { fillColor: [41, 128, 185] } });
        lastY = doc.lastAutoTable.finalY + 15;
        contentAdded = true;
      }

      if (pdfSections.calculadora && dietaActual && dietaActual.length > 0) {
        checkPageBreak(40);
        addTitle("Plan General de la Dieta");
        const planHead = [['Alimento', 'Gramos', 'Kcal', 'HC (g)', 'Prot. (g)', 'Grasa (g)']];
        const planBody = dietaActual.map(item => { const factor = (item.cantidadUsada || 0) / (item.alimento.cantidad || 1); return [item.alimento.nombre, item.cantidadUsada.toFixed(1), (item.alimento.calorias * factor).toFixed(1), (item.alimento.hc * factor).toFixed(1), (item.alimento.proteina * factor).toFixed(1), (item.alimento.grasa * factor).toFixed(1)]; });
        const totales = dietaActual.reduce((acc, item) => { const factor = (item.cantidadUsada || 0) / (item.alimento.cantidad || 1); acc.calorias += item.alimento.calorias * factor; acc.hc += item.alimento.hc * factor; acc.proteina += item.alimento.proteina * factor; acc.grasa += item.alimento.grasa * factor; return acc; }, { calorias: 0, hc: 0, proteina: 0, grasa: 0 });
        const planFoot = [['TOTALES', '', totales.calorias.toFixed(1), totales.hc.toFixed(1), totales.proteina.toFixed(1), totales.grasa.toFixed(1)]];
        autoTable(doc, { startY: lastY, head: planHead, body: planBody, foot: planFoot, theme: 'grid', headStyles: { fillColor: [39, 174, 96] }, footStyles: { fillColor: [236, 240, 241], textColor: [44, 62, 80], fontStyle: 'bold' } });
        lastY = doc.lastAutoTable.finalY + 15;
        contentAdded = true;
      }
      
      if (pdfSections.fraccionamiento && dietaActual && dietaActual.length > 0) {
        const foodsByMeal = mealSlots.reduce((acc, slot) => ({ ...acc, [slot]: [] }), {});
        let hasAnyFractionation = false;
        dietaActual.forEach(foodItem => { const foodDist = distribucion[foodItem.id] || {}; Object.keys(foodDist).forEach(mealKey => { if (foodsByMeal[mealKey] && foodDist[mealKey] > 0) { foodsByMeal[mealKey].push({ foodItem, assignedGrams: foodDist[mealKey] }); hasAnyFractionation = true; } }); });
        
        if (hasAnyFractionation) {
          checkPageBreak(40);
          addTitle("Fraccionamiento de la Dieta");
          mealSlots.forEach(mealKey => { const mealFoods = foodsByMeal[mealKey]; if (mealFoods && mealFoods.length > 0) { checkPageBreak(30 + mealFoods.length * 10); const mealTitle = mealNames[mealKey] ? `${mealKey} (${mealNames[mealKey]})` : mealKey; addSubtitle(mealTitle); const mealBody = mealFoods.map(({ foodItem, assignedGrams }) => { const factor = assignedGrams / (foodItem.alimento.cantidad || 1); return [foodItem.alimento.nombre, assignedGrams.toFixed(1), (foodItem.alimento.calorias * factor).toFixed(1)]; }); autoTable(doc, { startY: lastY, head: [['Alimento', 'Gramos', 'Kcal']], body: mealBody, theme: 'striped' }); lastY = doc.lastAutoTable.finalY + 10; } });
          contentAdded = true;
        }
      }

      if (!contentAdded) {
        toast.error("No hay contenido para generar el PDF. Selecciona al menos una sección con datos.");
      } else {
        const pageCount = doc.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) { doc.setPage(i); doc.setFontSize(10); doc.setTextColor(150); doc.text('FerCalc', doc.internal.pageSize.getWidth() - 25, doc.internal.pageSize.getHeight() - 10); }
        doc.save('dieta-fercalc.pdf');
        toast.success('PDF descargado con éxito.');
      }

    } catch (error) {
      console.error("Error catastrófico al generar el PDF:", error);
      toast.error("No se pudo generar el PDF. Revisa la consola para más detalles.");
    } finally {
      setIsProcessing(false);
      setModal(null);
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
        <Settings size={18} /> Opciones
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 border">
          <div className="py-1">
            <button onClick={() => { handleNewDiet(); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FilePlus size={16} /> Nueva Dieta / Restablecer</button>
            <div className="border-t my-1"></div>
            <button onClick={() => { setModal('save'); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><Save size={16} /> Guardar Dieta Actual</button>
            <button onClick={() => { setModal('load'); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FolderOpen size={16} /> Cargar Dieta Guardada</button>
            <div className="border-t my-1"></div>
            <button onClick={() => { setModal('pdf'); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><Download size={16} /> Descargar PDF</button>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold">{modal === 'save' && 'Guardar Dieta Actual'}{modal === 'load' && 'Cargar una Dieta Guardada'}{modal === 'pdf' && 'Descargar Dieta en PDF'}</h3><button onClick={() => setModal(null)} className="text-gray-500 hover:text-gray-800"><X /></button></div>
            {modal === 'save' && (<div className="space-y-4"><label htmlFor="dietName" className="block text-sm font-medium">Nombre de la Dieta:</label><input id="dietName" type="text" value={dietName} onChange={e => setDietName(e.target.value)} placeholder="Ej: Plan Volumen - Semana 1" className="w-full p-2 border rounded-md"/><div className="flex justify-end gap-4"><button onClick={() => setModal(null)} className="bg-gray-200 px-4 py-2 rounded-lg">Cancelar</button><button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Guardar</button></div></div>)}
            {modal === 'load' && (<div className="space-y-3">{savedDiets.length > 0 ? savedDiets.map(diet => (<div key={diet.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="font-medium flex items-center gap-2"><FileText size={16} />{diet.name}</span><div className="flex gap-2"><button onClick={() => { loadDietState({ ...diet.data, name: diet.name }); setModal(null); setIsMenuOpen(false); }} className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600">Cargar</button><button onClick={() => handleDelete(diet.id)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"><Trash2 size={16}/></button></div></div>)) : <p className="text-gray-500 text-center">No hay dietas guardadas.</p>}</div>)}
            {modal === 'pdf' && (<div className="space-y-4"><p>Selecciona las secciones que quieres incluir en el PDF:</p><div className="space-y-2"><label className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"><input type="checkbox" checked={pdfSections.datos} onChange={e => setPdfSections(p => ({...p, datos: e.target.checked}))} className="h-4 w-4"/> Datos y Objetivos</label><label className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"><input type="checkbox" checked={pdfSections.calculadora} onChange={e => setPdfSections(p => ({...p, calculadora: e.target.checked}))} className="h-4 w-4"/> Plan General de la Dieta</label><label className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"><input type="checkbox" checked={pdfSections.fraccionamiento} onChange={e => setPdfSections(p => ({...p, fraccionamiento: e.target.checked}))} className="h-4 w-4"/> Fraccionamiento</label></div><div className="flex justify-end gap-4"><button onClick={() => setModal(null)} className="bg-gray-200 px-4 py-2 rounded-lg">Cancelar</button><button onClick={handlePdfDownload} disabled={isProcessing} className="bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">{isProcessing ? 'Procesando...' : 'Generar PDF'}</button></div></div>)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionToolbar;