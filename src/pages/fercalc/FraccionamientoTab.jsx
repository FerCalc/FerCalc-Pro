// src/FraccionamientoTab.jsx
// VERSIÓN CORREGIDA: Muestra desglose de macros en la tabla de intercambio y corrige plurales.

import React, { useState, useMemo, useEffect } from 'react';
import { PlusCircle, X, Edit, Trash2, Settings, CalendarDays, Clock, ClipboardList, Repeat, AlertTriangle, Zap, Droplet } from 'lucide-react';

const Notification = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);
  const baseClasses = "fixed top-5 right-5 z-[100] max-w-sm p-4 rounded-lg shadow-lg flex items-center gap-3";
  const typeClasses = { success: "bg-green-100 text-green-800", error: "bg-red-100 text-red-800" };
  return (
    <div className={`${baseClasses} ${typeClasses[type] || 'bg-gray-100 text-gray-800'}`}>
      <p>{message}</p>
      <button onClick={onDismiss} className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg hover:bg-opacity-20 hover:bg-current"><X size={20} /></button>
    </div>
  );
};

const FraccionamientoDesarrollada = ({ dietaActual, numberOfDays, mealSlots, mealTimes, distribucion, setDistribucion, showNotification }) => {
  const [editingFood, setEditingFood] = useState(null);
  const [selectingFoodFor, setSelectingFoodFor] = useState(null);

  const handleSaveDistribution = (dayIndex, foodId, newFoodDistribution) => {
    setDistribucion(prev => {
      const d = { ...prev };
      if (!d[dayIndex]) d[dayIndex] = {};
      d[dayIndex][foodId] = newFoodDistribution;
      return d;
    });
    setEditingFood(null);
    showNotification("success", "Distribución guardada para el Día " + (dayIndex + 1));
  };

  const remainingGrams = useMemo(() => {
    const r = {};
    (dietaActual || []).forEach(item => {
      const total = Object.values(distribucion).reduce((daySum, dayData) => {
        const foodData = dayData[item.id] || {};
        return daySum + Object.values(foodData).reduce((sum, val) => sum + (val || 0), 0);
      }, 0);
      r[item.id] = item.cantidadUsada - total;
    });
    return r;
  }, [dietaActual, distribucion]);

  const SelectFoodModal = ({ onSelect, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold">Seleccionar Alimento para Asignar</h3><button onClick={onCancel} className="text-gray-500 hover:text-gray-800"><X /></button></div>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">{(dietaActual || []).length > 0 ? (dietaActual || []).map(item => (<button key={item.id} onClick={() => onSelect(item)} className="w-full text-left p-3 border rounded-lg bg-gray-50 hover:bg-blue-100">{item.alimento.nombre}</button>)) : <p>No hay alimentos en el plan general.</p>}</div>
      </div>
    </div>
  );

  const DistributionModal = ({ foodItem, dayIndex, onSave, onCancel }) => {
    const distribucionDia = distribucion[dayIndex] || {};
    const [localDistribution, setLocalDistribution] = useState(distribucionDia[foodItem.id] || {});
    const handleAmountChange = (mealKey, amountStr) => { const amount = Math.max(0, parseFloat(amountStr) || 0); setLocalDistribution(prev => ({ ...prev, [mealKey]: amount })); };
    const totalCurrentlyAssigned = Object.values(localDistribution).reduce((sum, val) => sum + (val || 0), 0);
    const isOverLimit = totalCurrentlyAssigned > foodItem.cantidadUsada;
    const handleSave = () => { if (isOverLimit) { showNotification("error", `El total asignado (${totalCurrentlyAssigned.toFixed(1)}g) supera el total del alimento (${foodItem.cantidadUsada}g).`); return; } onSave(dayIndex, foodItem.id, localDistribution); };
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold">Distribuir: {foodItem.alimento.nombre}</h3><button onClick={onCancel} className="text-gray-500 hover:text-gray-800"><X /></button></div>
          <p className="mb-2 text-sm">Distribuyendo para el <span className="font-bold">Día {dayIndex + 1}</span></p>
          <p className="mb-4">Total disponible: <span className="font-bold">{foodItem.cantidadUsada}g</span>. Asignado en este menú: <span className={`font-bold ${isOverLimit ? 'text-red-500' : 'text-green-600'}`}>{totalCurrentlyAssigned.toFixed(1)}g</span></p>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">{mealSlots.map(mealKey => (<div key={mealKey} className="flex justify-between items-center"><label className="text-gray-700">{mealKey}</label><input type="number" min="0" value={localDistribution[mealKey] || ''} onChange={e => handleAmountChange(mealKey, e.target.value)} placeholder="0 g" className="w-24 p-1 border rounded-md" /></div>))}</div>
          <div className="mt-6 flex justify-end gap-4"><button onClick={onCancel} className="bg-gray-200 px-4 py-2 rounded-lg">Cancelar</button><button onClick={handleSave} disabled={isOverLimit} className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">Guardar</button></div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {selectingFoodFor && (<SelectFoodModal onCancel={() => setSelectingFoodFor(null)} onSelect={(foodItem) => { setEditingFood({ foodItem, dayIndex: selectingFoodFor.dayIndex }); setSelectingFoodFor(null); }} />)}
      {editingFood && (<DistributionModal foodItem={editingFood.foodItem} dayIndex={editingFood.dayIndex} onSave={handleSaveDistribution} onCancel={() => setEditingFood(null)} />)}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold p-3 bg-gray-100 rounded-t-lg -m-6 mb-4">Banco de Alimentos para Distribuir</h3>
        <p className="text-sm text-gray-600 mb-4">Estos son los alimentos totales para todo el ciclo. Los gramos restantes se calculan en base a las asignaciones de todos los días.</p>
        {(dietaActual || []).length === 0 ? <p className="text-gray-500">No hay alimentos definidos en la dieta desarrollada. Agregue alimentos en la pestaña correspondiente para poder fraccionarlos.</p> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{(dietaActual || []).map(item => (<div key={item.id} className={`p-3 border rounded-lg text-left ${remainingGrams[item.id] < -0.01 ? 'bg-red-100 border-red-300' : 'bg-gray-50'}`}><p className="font-semibold">{item.alimento.nombre}</p><p className={`text-sm font-bold ${Math.abs(remainingGrams[item.id]) < 0.01 ? 'text-gray-400' : 'text-green-600'}`}>{remainingGrams[item.id] ? remainingGrams[item.id].toFixed(1) : item.cantidadUsada.toFixed(1)}g restantes</p></div>))}</div>}
      </div>
      {Array.from({ length: numberOfDays }).map((_, dayIndex) => {
        const distribucionDelDia = distribucion[dayIndex] || {};
        const foodsByMeal = mealSlots.reduce((acc, slot) => ({ ...acc, [slot]: [] }), {});
        (dietaActual || []).forEach(foodItem => { const foodDistribution = distribucionDelDia[foodItem.id] || {}; for (const mealKey in foodDistribution) { if (foodsByMeal[mealKey] && foodDistribution[mealKey] > 0) { foodsByMeal[mealKey].push({ foodItem, assignedGrams: foodDistribution[mealKey] }); } } });
        return (
          <div key={dayIndex} className="mb-12">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 pb-2 border-b-2 border-blue-200">Día {dayIndex + 1}</h2>
            {mealSlots.map(mealKey => {
              const mealFoods = foodsByMeal[mealKey] || [];
              const mealTotals = mealFoods.reduce((acc, { foodItem, assignedGrams }) => {
                const factor = assignedGrams > 0 && foodItem.alimento.cantidad > 0 ? assignedGrams / foodItem.alimento.cantidad : 0;
                acc.calorias += (foodItem.alimento.calorias || 0) * factor;
                acc.hc += (foodItem.alimento.hc || 0) * factor;
                acc.proteina += (foodItem.alimento.proteina || 0) * factor;
                acc.grasa += (foodItem.alimento.grasa || 0) * factor;
                acc.gramos += assignedGrams;
                return acc;
              }, { calorias: 0, hc: 0, proteina: 0, grasa: 0, gramos: 0 });
              return (
                <div key={mealKey} className="bg-white p-4 sm:p-6 rounded-lg shadow mb-8 border-t-4 border-blue-500">
                  <div className="flex justify-between items-center mb-4 border-b pb-2 flex-wrap gap-2">
                    <div className="flex items-center"><h3 className="text-xl font-semibold text-gray-800 mr-2">{mealKey}</h3>{mealTimes[mealKey] && <span className="text-sm font-medium text-gray-500 flex items-center gap-1"><Clock size={14}/>{mealTimes[mealKey]}</span>}</div>
                    <button onClick={() => setSelectingFoodFor({ dayIndex })} className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 hover:bg-blue-600"><PlusCircle size={16} /> Asignar Alimento</button>
                  </div>
                  {mealFoods.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm whitespace-nowrap">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th className="px-2 py-2 text-left">Alimento</th><th className="px-2 py-2 text-left">Gramos</th><th className="px-2 py-2 text-left">Kcal</th><th className="px-2 py-2 text-left">HC (g)</th><th className="px-2 py-2 text-left">Prot (g)</th><th className="px-2 py-2 text-left">Grasa (g)</th>
                            <th className="px-2 py-2 text-left">Dens. Cal.</th><th className="px-2 py-2 text-left">Volumen</th>
                            <th className="px-2 py-2 text-left">% HC</th><th className="px-2 py-2 text-left">% Prot</th><th className="px-2 py-2 text-left">% Grasa</th>
                            <th className="px-2 py-2 text-left">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mealFoods.map(({ foodItem, assignedGrams }) => {
                            const factor = assignedGrams > 0 && foodItem.alimento.cantidad > 0 ? assignedGrams / foodItem.alimento.cantidad : 0;
                            const kcalPorcion = foodItem.alimento.calorias * factor;
                            const hcPorcion = foodItem.alimento.hc * factor;
                            const protPorcion = foodItem.alimento.proteina * factor;
                            const grasaPorcion = foodItem.alimento.grasa * factor;
                            const densCal = foodItem.alimento.cantidad > 0 ? (foodItem.alimento.calorias / foodItem.alimento.cantidad) : 0;
                            const volumen = kcalPorcion > 0 ? assignedGrams / kcalPorcion : 0;
                            const pctHc = kcalPorcion > 0 ? (hcPorcion * 4 / kcalPorcion) * 100 : 0;
                            const pctProt = kcalPorcion > 0 ? (protPorcion * 4 / kcalPorcion) * 100 : 0;
                            const pctGrasa = kcalPorcion > 0 ? (grasaPorcion * 9 / kcalPorcion) * 100 : 0;
                            return (
                              <tr key={foodItem.id} className="border-b">
                                <td className="px-2 py-2">{foodItem.alimento.nombre}</td><td className="px-2 py-2">{assignedGrams.toFixed(1)}g</td><td className="px-2 py-2 font-bold text-blue-600">{kcalPorcion.toFixed(1)}</td><td className="px-2 py-2">{hcPorcion.toFixed(1)}</td><td className="px-2 py-2">{protPorcion.toFixed(1)}</td><td className="px-2 py-2">{grasaPorcion.toFixed(1)}</td>
                                <td className="px-2 py-2">{densCal.toFixed(2)}</td><td className="px-2 py-2">{volumen.toFixed(2)}</td>
                                <td className="px-2 py-2 text-gray-600">{pctHc.toFixed(0)}%</td><td className="px-2 py-2 text-gray-600">{pctProt.toFixed(0)}%</td><td className="px-2 py-2 text-gray-600">{pctGrasa.toFixed(0)}%</td>
                                <td className="px-2 py-2"><button onClick={() => setEditingFood({ foodItem, dayIndex })} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button></td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="font-bold bg-gray-50">
                          <tr>
                            <td className="px-2 py-2">Total</td><td className="px-2 py-2">{mealTotals.gramos.toFixed(1)}g</td><td className="px-2 py-2 text-blue-700">{mealTotals.calorias.toFixed(1)}</td><td className="px-2 py-2">{mealTotals.hc.toFixed(1)}</td><td className="px-2 py-2">{mealTotals.proteina.toFixed(1)}</td><td className="px-2 py-2">{mealTotals.grasa.toFixed(1)}</td>
                            <td colSpan="5"></td>
                            <td className="px-2 py-2">-</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : <p className="text-gray-500 text-center py-4">No hay alimentos asignados a este menú.</p>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// ===================================================================================
// --- SUB-COMPONENTE PARA FRACCIONAMIENTO POR INTERCAMBIO (CON CAMBIOS) ---
// ===================================================================================
const FraccionamientoIntercambio = ({ planIntercambio, numberOfDays, mealSlots, mealTimes, distribucion, setDistribucion, showNotification, showNoDataWarning }) => {
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectingGroupFor, setSelectingGroupFor] = useState(null);

  // --- CAMBIO 1: Recibir piramideData y porciones del plan. Usar valores por defecto seguros.
  const piramideData = planIntercambio?.piramideData || {};
  const porcionesDelPlan = useMemo(() => planIntercambio?.porciones || {}, [planIntercambio]);

  const handleSaveDistribution = (dayIndex, groupName, newGroupDistribution) => {
    setDistribucion(prev => { const d = { ...prev }; if (!d[dayIndex]) d[dayIndex] = {}; d[dayIndex][groupName] = newGroupDistribution; return d; });
    setEditingGroup(null);
    showNotification("success", "Distribución guardada para el Día " + (dayIndex + 1));
  };

  const remainingPortions = useMemo(() => {
    const r = {};
    Object.keys(porcionesDelPlan).forEach(groupName => {
      const total = Object.values(distribucion).reduce((daySum, dayData) => { const groupData = dayData[groupName] || {}; return daySum + Object.values(groupData).reduce((sum, val) => sum + (val || 0), 0); }, 0);
      r[groupName] = (porcionesDelPlan[groupName] || 0) - total;
    });
    return r;
  }, [porcionesDelPlan, distribucion]);

  const SelectGroupModal = ({ onSelect, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold">Seleccionar Grupo para Asignar</h3><button onClick={onCancel} className="text-gray-500 hover:text-gray-800"><X /></button></div>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">{Object.keys(porcionesDelPlan).length > 0 ? Object.keys(porcionesDelPlan).map(groupName => (<button key={groupName} onClick={() => onSelect(groupName)} className="w-full text-left p-3 border rounded-lg bg-gray-50 hover:bg-purple-100">{groupName}</button>)) : <p>No hay porciones en el plan general.</p>}</div>
      </div>
    </div>
  );

  const DistributionModal = ({ groupName, dayIndex, onSave, onCancel }) => {
    const distribucionDia = distribucion[dayIndex] || {};
    const [localDistribution, setLocalDistribution] = useState(distribucionDia[groupName] || {});
    const handleAmountChange = (mealKey, amountStr) => { const amount = Math.max(0, parseFloat(amountStr) || 0); setLocalDistribution(prev => ({ ...prev, [mealKey]: amount })); };
    const totalCurrentlyAssigned = Object.values(localDistribution).reduce((sum, val) => sum + (val || 0), 0);
    const totalPortions = (porcionesDelPlan || {})[groupName] || 0;
    const isOverLimit = totalCurrentlyAssigned > totalPortions;
    
    // --- CAMBIO 2: Corrección de plurales ---
    const handleSave = () => { if (isOverLimit) { showNotification("error", `El total asignado (${totalCurrentlyAssigned} porc.) supera el total del grupo (${totalPortions} porc.).`); return; } onSave(dayIndex, groupName, localDistribution); };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold">Distribuir: {groupName}</h3><button onClick={onCancel} className="text-gray-500 hover:text-gray-800"><X /></button></div>
          <p className="mb-2 text-sm">Distribuyendo para el <span className="font-bold">Día {dayIndex + 1}</span></p>
          <p className="mb-4">Total disponible: <span className="font-bold">{totalPortions} {totalPortions === 1 ? 'porción' : 'porciones'}</span>. Asignado en este menú: <span className={`font-bold ${isOverLimit ? 'text-red-500' : 'text-green-600'}`}>{totalCurrentlyAssigned} porc.</span></p>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">{mealSlots.map(mealKey => (<div key={mealKey} className="flex justify-between items-center"><label className="text-gray-700">{mealKey}</label><input type="number" min="0" step="0.5" value={localDistribution[mealKey] || ''} onChange={e => handleAmountChange(mealKey, e.target.value)} placeholder="0 porc." className="w-24 p-1 border rounded-md" /></div>))}</div>
          <div className="mt-6 flex justify-end gap-4"><button onClick={onCancel} className="bg-gray-200 px-4 py-2 rounded-lg">Cancelar</button><button onClick={handleSave} disabled={isOverLimit} className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">Guardar</button></div>
        </div>
      </div>
    );
  };

  const totales = planIntercambio?.totales;
  const totalKcal = totales?.calorias?.toFixed(0) ?? '0';
  const totalHC = totales?.hc?.toFixed(0) ?? '0';
  const totalProteinas = totales?.proteinas?.toFixed(0) ?? '0';
  const totalLipidos = totales?.lipidos?.toFixed(0) ?? '0';

  return (
    <div>
      {showNoDataWarning && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-r-lg" role="alert">
          <div className="flex"><div className="py-1"><AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" /></div><div><p className="font-bold">Plan por Intercambio no definido</p><p className="text-sm">Aún no se ha configurado un plan de porciones por intercambio. Defina uno en la pestaña correspondiente.</p></div></div>
        </div>
      )}
      {selectingGroupFor && (<SelectGroupModal onCancel={() => setSelectingGroupFor(null)} onSelect={(groupName) => { setEditingGroup({ groupName, dayIndex: selectingGroupFor.dayIndex }); setSelectingGroupFor(null); }} />)}
      {editingGroup && (<DistributionModal groupName={editingGroup.groupName} dayIndex={editingGroup.dayIndex} onSave={handleSaveDistribution} onCancel={() => setEditingGroup(null)} />)}
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Distribución Nutricional del Plan</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded-lg"><Zap className="mx-auto h-6 w-6 text-blue-500 mb-1" /><p className="text-sm text-blue-800">Calorías</p><p className="text-2xl font-bold text-blue-900">{totalKcal}</p></div>
            <div className="bg-green-50 p-4 rounded-lg"><p className="mt-1.5 text-sm text-green-800">HC (g)</p><p className="text-2xl font-bold text-green-900">{totalHC}</p></div>
            <div className="bg-red-50 p-4 rounded-lg"><p className="mt-1.5 text-sm text-red-800">Proteínas (g)</p><p className="text-2xl font-bold text-red-900">{totalProteinas}</p></div>
            <div className="bg-yellow-50 p-4 rounded-lg"><Droplet className="mx-auto h-6 w-6 text-yellow-500 mb-1" /><p className="text-sm text-yellow-800">Lípidos (g)</p><p className="text-2xl font-bold text-yellow-900">{totalLipidos}</p></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold p-3 bg-gray-100 rounded-t-lg -m-6 mb-4">Banco de Porciones para Distribuir</h3>
        <p className="text-sm text-gray-600 mb-4">Estas son las porciones totales para todo el ciclo. Las restantes se calculan en base a las asignaciones de todos los días.</p>
        {Object.keys(porcionesDelPlan).length === 0 ? <p className="text-gray-500">No hay porciones definidas en el plan.</p> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{Object.keys(porcionesDelPlan).map(groupName => {
          const remaining = remainingPortions[groupName];
          return (
            // --- CAMBIO 3: Corrección de plurales ---
            <div key={groupName} className={`p-3 border rounded-lg text-left ${remaining < 0 ? 'bg-red-100 border-red-300' : 'bg-gray-50'}`}>
              <p className="font-semibold">{groupName}</p>
              <p className={`text-sm font-bold ${remaining === 0 ? 'text-gray-400' : 'text-purple-600'}`}>
                {remaining} porc. restante{remaining === 1 || remaining === -1 ? '' : 's'}
              </p>
            </div>
          );
        })}</div>}
      </div>
      {Array.from({ length: numberOfDays }).map((_, dayIndex) => (
        <div key={dayIndex} className="mb-12">
          <h2 className="text-2xl font-bold text-purple-700 mb-4 pb-2 border-b-2 border-purple-200">Día {dayIndex + 1}</h2>
          {mealSlots.map(mealKey => {
            const distribucionDelDia = distribucion[dayIndex] || {};
            const mealGroups = Object.keys(distribucionDelDia).filter(groupName => distribucionDelDia[groupName][mealKey] > 0).map(groupName => ({ groupName, assignedPortions: distribucionDelDia[groupName][mealKey] }));
            
            // --- CAMBIO 4: Cálculo detallado de macros para el total del menú ---
            const mealTotals = mealGroups.reduce((acc, { groupName, assignedPortions }) => { 
                const groupData = piramideData[groupName]; 
                if (groupData) { 
                    acc.calorias += (groupData.calorias || 0) * assignedPortions; 
                    acc.hc += (groupData.hc || 0) * assignedPortions; 
                    acc.proteinas += (groupData.proteinas || 0) * assignedPortions; 
                    acc.lipidos += (groupData.lipidos || 0) * assignedPortions; 
                } 
                return acc; 
            }, { calorias: 0, hc: 0, proteinas: 0, lipidos: 0 });

            return (
              <div key={mealKey} className="bg-white p-4 sm:p-6 rounded-lg shadow mb-8 border-t-4 border-purple-500">
                <div className="flex justify-between items-center mb-4 border-b pb-2 flex-wrap gap-2">
                  <div className="flex items-center"><h3 className="text-xl font-semibold text-gray-800 mr-2">{mealKey}</h3>{mealTimes[mealKey] && <span className="text-sm font-medium text-gray-500 flex items-center gap-1"><Clock size={14}/>{mealTimes[mealKey]}</span>}</div>
                  <button onClick={() => setSelectingGroupFor({ dayIndex })} className="bg-purple-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 hover:bg-purple-600"><PlusCircle size={16} /> Asignar Grupo</button>
                </div>
                {mealGroups.length > 0 ? (
                  <div className="overflow-x-auto">
                    {/* --- CAMBIO 5: Actualización de la tabla (cabecera, cuerpo y pie) --- */}
                    <table className="w-full text-sm">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-2 py-2 text-left">Grupo</th>
                          <th className="px-2 py-2 text-left">Porciones</th>
                          <th className="px-2 py-2 text-left">Kcal</th>
                          <th className="px-2 py-2 text-left">HC (g)</th>
                          <th className="px-2 py-2 text-left">Prot. (g)</th>
                          <th className="px-2 py-2 text-left">Líp. (g)</th>
                          <th className="px-2 py-2 text-left">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mealGroups.map(({ groupName, assignedPortions }) => { 
                          const groupData = piramideData[groupName]; 
                          const kcal = groupData ? (groupData.calorias * assignedPortions).toFixed(1) : 'N/A'; 
                          const hc = groupData ? (groupData.hc * assignedPortions).toFixed(1) : 'N/A'; 
                          const proteinas = groupData ? (groupData.proteinas * assignedPortions).toFixed(1) : 'N/A'; 
                          const lipidos = groupData ? (groupData.lipidos * assignedPortions).toFixed(1) : 'N/A'; 
                          return (
                            <tr key={groupName} className="border-b">
                              <td className="px-2 py-2">{groupName}</td>
                              <td className="px-2 py-2">{assignedPortions} {assignedPortions === 1 ? 'porción' : 'porciones'}</td>
                              <td className="px-2 py-2 font-bold text-purple-600">{kcal}</td>
                              <td className="px-2 py-2">{hc}</td>
                              <td className="px-2 py-2">{proteinas}</td>
                              <td className="px-2 py-2">{lipidos}</td>
                              <td className="px-2 py-2"><button onClick={() => setEditingGroup({ groupName, dayIndex })} className="text-purple-600 hover:text-purple-800"><Edit size={16} /></button></td>
                            </tr>
                          ); 
                        })}
                      </tbody>
                      <tfoot className="font-bold bg-gray-50">
                        <tr>
                          <td className="px-2 py-2">Total</td>
                          <td className="px-2 py-2">-</td>
                          <td className="px-2 py-2 text-purple-700">{mealTotals.calorias.toFixed(1)}</td>
                          <td className="px-2 py-2">{mealTotals.hc.toFixed(1)}</td>
                          <td className="px-2 py-2">{mealTotals.proteinas.toFixed(1)}</td>
                          <td className="px-2 py-2">{mealTotals.lipidos.toFixed(1)}</td>
                          <td className="px-2 py-2">-</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : <p className="text-gray-500 text-center py-4">No hay grupos asignados a este menú.</p>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const FraccionamientoTab = ({ dietaActual, planIntercambio, alimentosDB }) => {
  const [activeSubTab, setActiveSubTab] = useState('desarrollada');
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [mealSlots, setMealSlots] = useState(['Desayuno', 'Media mañana', 'Almuerzo', 'Media tarde', 'Merienda', 'Cena']);
  const [mealTimes, setMealTimes] = useState({});
  const [newMealName, setNewMealName] = useState('');
  const [distribucionDesarrollada, setDistribucionDesarrollada] = useState({});
  const [distribucionIntercambio, setDistribucionIntercambio] = useState({});
  const [notification, setNotification] = useState(null);
  const showNotification = (type, message) => setNotification({ type, message });

  const isPlanIntercambioProvided = planIntercambio && planIntercambio.porciones && Object.keys(planIntercambio.porciones).length > 0;

  const handleAddMeal = () => { if (newMealName && !mealSlots.includes(newMealName)) { setMealSlots(prev => [...prev, newMealName]); setNewMealName(''); showNotification("success", `Menú "${newMealName}" agregado.`); } else if (!newMealName) { showNotification("error", "El nombre del menú no puede estar vacío."); } else { showNotification("error", "Ese menú ya existe."); } };
  const handleDeleteMeal = (mealKeyToDelete) => { if (window.confirm(`¿Seguro que quieres eliminar el menú "${mealKeyToDelete}"?`)) { setMealSlots(prev => prev.filter(m => m !== mealKeyToDelete)); setMealTimes(prev => { const t = { ...prev }; delete t[mealKeyToDelete]; return t; }); const cleanDistribucion = (dist) => { const d = { ...dist }; for (const day in d) { for (const item in d[day]) { if (d[day][item][mealKeyToDelete] !== undefined) { delete d[day][item][mealKeyToDelete]; } } } return d; }; setDistribucionDesarrollada(cleanDistribucion); setDistribucionIntercambio(cleanDistribucion); showNotification("error", `Menú "${mealKeyToDelete}" eliminado.`); } };
  const handleEditMeal = (oldMealKey) => { const newMealKey = prompt(`Nuevo nombre para "${oldMealKey}":`, oldMealKey); if (newMealKey && newMealKey !== oldMealKey) { if (mealSlots.includes(newMealKey)) { showNotification("error", `El menú "${newMealKey}" ya existe.`); return; } setMealSlots(prev => prev.map(m => m === oldMealKey ? newMealKey : m)); setMealTimes(prev => { const t = { ...prev }; if (t[oldMealKey]) { t[newMealKey] = t[oldMealKey]; delete t[oldMealKey]; } return t; }); const renameInDistribucion = (dist) => { const d = { ...dist }; for (const day in d) { for (const item in d[day]) { if (d[day][item][oldMealKey] !== undefined) { d[day][item][newMealKey] = d[day][item][oldMealKey]; delete d[day][item][oldMealKey]; } } } return d; }; setDistribucionDesarrollada(renameInDistribucion); setDistribucionIntercambio(renameInDistribucion); showNotification("success", `Menú renombrado a "${newMealKey}".`); } };
  const SubTabButton = ({ tabId, label, icon, color }) => { const activeClasses = { blue: 'bg-blue-600 text-white shadow-md', purple: 'bg-purple-600 text-white shadow-md' }; const inactiveClasses = 'bg-white text-gray-700 hover:bg-gray-100'; const currentClasses = activeSubTab === tabId ? activeClasses[color] : inactiveClasses; return (<button onClick={() => setActiveSubTab(tabId)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${currentClasses}`}>{icon}{label}</button>); };

  return (
    <div className="space-y-6">
      {notification && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification(null)} />}
      <div className="flex flex-wrap gap-3 p-2 bg-gray-100 rounded-lg"><SubTabButton tabId="desarrollada" label="Por Desarrollada" icon={<ClipboardList size={16} />} color="blue" /><SubTabButton tabId="intercambio" label="Por Intercambio" icon={<Repeat size={16} />} color="purple" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Settings size={20}/>Gestionar Menús y Horarios</h3><div className="flex gap-4 items-center mb-4"><input type="text" value={newMealName} onChange={e => setNewMealName(e.target.value)} placeholder="Nombre del nuevo menú" className="flex-grow p-2 border rounded-md"/><button onClick={handleAddMeal} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center gap-2"><PlusCircle size={18}/>Añadir</button></div><div className="space-y-2 max-h-48 overflow-y-auto pr-2">{mealSlots.map(mealKey => (<div key={mealKey} className="flex items-center justify-between p-2 bg-gray-50 rounded-md gap-2"><input type="time" value={mealTimes[mealKey] || ''} onChange={e => setMealTimes(prev => ({...prev, [mealKey]: e.target.value}))} className="p-1 border rounded-md bg-white text-sm" /><span className="font-medium flex-grow text-left ml-2">{mealKey}</span><div className="flex gap-2"><button onClick={() => handleEditMeal(mealKey)} className="text-gray-600 hover:text-blue-800"><Edit size={16}/></button><button onClick={() => handleDeleteMeal(mealKey)} className="text-gray-600 hover:text-red-800"><Trash2 size={16}/></button></div></div>))}</div></div>
        <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><CalendarDays size={20}/>Configuración del Ciclo</h3><div className='space-y-4'><div><label className="block text-sm font-medium text-gray-700 mb-1">Número de Días</label><select value={numberOfDays} onChange={e => setNumberOfDays(Number(e.target.value))} className="w-full p-2 border rounded-md">{Array.from({ length: 14 }, (_, i) => i + 1).map(day => (<option key={day} value={day}>{day} {day > 1 ? 'días' : 'día'}</option>))}</select></div></div></div>
      </div>
      <div>
        {activeSubTab === 'desarrollada' && (<FraccionamientoDesarrollada dietaActual={dietaActual || []} numberOfDays={numberOfDays} mealSlots={mealSlots} mealTimes={mealTimes} distribucion={distribucionDesarrollada} setDistribucion={setDistribucionDesarrollada} showNotification={showNotification}/>)}
        {/* --- CAMBIO 6: Pasar el plan de intercambio completo --- */}
        {activeSubTab === 'intercambio' && (<FraccionamientoIntercambio planIntercambio={planIntercambio || {}} numberOfDays={numberOfDays} mealSlots={mealSlots} mealTimes={mealTimes} distribucion={distribucionIntercambio} setDistribucion={setDistribucionIntercambio} showNotification={showNotification} showNoDataWarning={!isPlanIntercambioProvided} />)}
      </div>
    </div>
  );
};

export default FraccionamientoTab;