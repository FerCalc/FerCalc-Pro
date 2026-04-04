// mi-app-frontend/src/pages/fercalc/FraccionamientoTab.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PlusCircle, X, Edit, Trash2, Settings, CalendarDays, Clock, ClipboardList, Repeat, AlertTriangle, Zap, Droplet, GripVertical, Check, ChevronDown } from 'lucide-react';

// ── NOTIFICACIÓN ──
const Notification = ({ message, type, onDismiss }) => {
  useEffect(() => { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t); }, [onDismiss]);
  const colors = { success: 'bg-green-100 text-green-800 border-green-300', error: 'bg-red-100 text-red-800 border-red-300' };
  return (
    <div className={`fixed top-5 right-5 z-[100] max-w-sm p-4 rounded-xl shadow-lg flex items-center gap-3 border ${colors[type] || 'bg-gray-100'}`}>
      <p className="flex-1">{message}</p>
      <button onClick={onDismiss} className="ml-auto p-1 rounded-lg hover:bg-black hover:bg-opacity-10"><X size={18} /></button>
    </div>
  );
};

// ── DISTRIBUCIÓN NUTRICIONAL (compartido entre Desarrollada e Intercambio) ──
const DistribucionNutricional = ({ calorias, hc, proteinas, lipidos, color = 'blue' }) => {
  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-900', sub: 'text-blue-800', icon: 'text-blue-500' },
    green: { bg: 'bg-green-50', text: 'text-green-900', sub: 'text-green-800', icon: 'text-green-500' },
  };
  const c = colors[color];
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Distribucion Nutricional del Plan</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className={`${c.bg} p-4 rounded-xl`}>
          <Zap className={`mx-auto h-6 w-6 ${c.icon} mb-1`} />
          <p className={`text-sm ${c.sub}`}>Calorias</p>
          <p className={`text-2xl font-bold ${c.text}`}>{parseFloat(calorias || 0).toFixed(0)}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl">
          <p className="mt-1.5 text-sm text-emerald-800">HC (g)</p>
          <p className="text-2xl font-bold text-emerald-900">{parseFloat(hc || 0).toFixed(1)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl">
          <p className="mt-1.5 text-sm text-red-800">Proteinas (g)</p>
          <p className="text-2xl font-bold text-red-900">{parseFloat(proteinas || 0).toFixed(1)}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl">
          <Droplet className="mx-auto h-6 w-6 text-amber-500 mb-1" />
          <p className="text-sm text-amber-800">Lipidos (g)</p>
          <p className="text-2xl font-bold text-amber-900">{parseFloat(lipidos || 0).toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
};

// ── FRACCIONAMIENTO POR DESARROLLADA ──
const FraccionamientoDesarrollada = ({ dietaActual, numberOfDays, mealSlots, mealTimes, distribucion, setDistribucion, showNotification }) => {
  const [assigningFood, setAssigningFood] = useState(null); // { dayIndex }
  const [editingFood, setEditingFood] = useState(null);
  // Panel lateral de asignación rápida
  const [quickAssignState, setQuickAssignState] = useState({}); // { foodId: grams }

  // Totales para Distribucion Nutricional
  const totalDieta = useMemo(() => {
    return (dietaActual || []).reduce((acc, item) => {
      const factor = (item.cantidadUsada || 0) > 0 && item.alimento.cantidad > 0 ? item.cantidadUsada / item.alimento.cantidad : 0;
      acc.calorias += (item.alimento.calorias || 0) * factor;
      acc.hc += (item.alimento.hc || 0) * factor;
      acc.proteinas += (item.alimento.proteina || 0) * factor;
      acc.lipidos += (item.alimento.grasa || 0) * factor;
      return acc;
    }, { calorias: 0, hc: 0, proteinas: 0, lipidos: 0 });
  }, [dietaActual]);

  const remainingGrams = useMemo(() => {
    const r = {};
    (dietaActual || []).forEach(item => {
      const total = Object.values(distribucion).reduce((daySum, dayData) => {
        const foodData = dayData[item.id] || {};
        return daySum + Object.values(foodData).reduce((s, v) => s + (v || 0), 0);
      }, 0);
      r[item.id] = item.cantidadUsada - total;
    });
    return r;
  }, [dietaActual, distribucion]);

  // ✅ Asignación rápida — panel lateral que no se cierra
  const handleQuickAssignSave = (dayIndex, mealKey) => {
    setDistribucion(prev => {
      const d = JSON.parse(JSON.stringify(prev));
      if (!d[dayIndex]) d[dayIndex] = {};
      Object.entries(quickAssignState).forEach(([foodId, grams]) => {
        const g = parseFloat(grams) || 0;
        if (g > 0) {
          if (!d[dayIndex][foodId]) d[dayIndex][foodId] = {};
          d[dayIndex][foodId][mealKey] = g;
        }
      });
      return d;
    });
    showNotification('success', `Alimentos asignados a ${mealKey}`);
    setQuickAssignState({});
    setAssigningFood(null);
  };

  const handleSaveDistribution = (dayIndex, foodId, newFoodDistribution) => {
    setDistribucion(prev => {
      const d = JSON.parse(JSON.stringify(prev));
      if (!d[dayIndex]) d[dayIndex] = {};
      d[dayIndex][foodId] = newFoodDistribution;
      return d;
    });
    setEditingFood(null);
    showNotification('success', `Distribucion guardada para el Dia ${dayIndex + 1}`);
  };

  // Modal editar distribución de un alimento en todos los menús de un día
  const DistributionModal = ({ foodItem, dayIndex, onSave, onCancel }) => {
    const distribucionDia = distribucion[dayIndex] || {};
    const [local, setLocal] = useState(distribucionDia[foodItem.id] || {});
    const total = Object.values(local).reduce((s, v) => s + (parseFloat(v) || 0), 0);
    const over = total > foodItem.cantidadUsada;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Editar: {foodItem.alimento.nombre}</h3>
            <button onClick={onCancel}><X className="text-gray-400 hover:text-gray-700" /></button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Dia {dayIndex + 1} — Total disponible: <span className="font-bold">{foodItem.cantidadUsada}g</span> — Asignado: <span className={`font-bold ${over ? 'text-red-500' : 'text-green-600'}`}>{total.toFixed(1)}g</span>
          </p>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {mealSlots.map(mealKey => (
              <div key={mealKey} className="flex justify-between items-center">
                <label className="text-gray-700 text-sm">{mealKey}</label>
                <input type="number" min="0" value={local[mealKey] || ''}
                  onChange={e => setLocal(p => ({ ...p, [mealKey]: parseFloat(e.target.value) || 0 }))}
                  placeholder="0 g" className="w-24 p-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button onClick={() => { if (over) { showNotification('error', 'Supera el total disponible'); return; } onSave(dayIndex, foodItem.id, local); }}
              disabled={over} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Guardar</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Distribución nutricional del plan */}
      <DistribucionNutricional
        calorias={totalDieta.calorias}
        hc={totalDieta.hc}
        proteinas={totalDieta.proteinas}
        lipidos={totalDieta.lipidos}
        color="blue"
      />

      {/* Banco de alimentos */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <h3 className="text-lg font-semibold mb-1">Banco de Alimentos para Distribuir</h3>
        <p className="text-sm text-gray-500 mb-4">Gramos restantes en base a todas las asignaciones del ciclo.</p>
        {(dietaActual || []).length === 0 ? (
          <p className="text-gray-400 italic">No hay alimentos en la dieta desarrollada.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {(dietaActual || []).map(item => (
              <div key={item.id} className={`p-3 border rounded-xl text-left ${remainingGrams[item.id] < -0.01 ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'}`}>
                <p className="font-medium text-sm text-gray-800">{item.alimento.nombre}</p>
                <p className={`text-sm font-bold mt-1 ${Math.abs(remainingGrams[item.id]) < 0.01 ? 'text-gray-400' : remainingGrams[item.id] < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {(remainingGrams[item.id] ?? item.cantidadUsada).toFixed(1)}g restantes
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel de asignación rápida */}
      {assigningFood && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
          <div className="bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Asignar al {assigningFood.mealKey}</h3>
              <button onClick={() => { setAssigningFood(null); setQuickAssignState({}); }}><X className="text-gray-400 hover:text-gray-700" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Dia {assigningFood.dayIndex + 1} — Ingresa los gramos para cada alimento</p>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {(dietaActual || []).map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.alimento.nombre}</p>
                    <p className="text-xs text-gray-400">{(remainingGrams[item.id] ?? 0).toFixed(1)}g disponibles</p>
                  </div>
                  <input
                    type="number" min="0"
                    value={quickAssignState[item.id] || ''}
                    onChange={e => setQuickAssignState(p => ({ ...p, [item.id]: e.target.value }))}
                    placeholder="0g"
                    className="w-20 p-1.5 border rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={() => { setAssigningFood(null); setQuickAssignState({}); }}
                className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button onClick={() => handleQuickAssignSave(assigningFood.dayIndex, assigningFood.mealKey)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                <Check size={16} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {editingFood && (
        <DistributionModal
          foodItem={editingFood.foodItem}
          dayIndex={editingFood.dayIndex}
          onSave={handleSaveDistribution}
          onCancel={() => setEditingFood(null)}
        />
      )}

      {/* Días */}
      {Array.from({ length: numberOfDays }).map((_, dayIndex) => {
        const distribucionDelDia = distribucion[dayIndex] || {};
        // Total kcal del día para calcular % VCT
        const totalKcalDia = mealSlots.reduce((dayTotal, mealKey) => {
          return dayTotal + (dietaActual || []).reduce((mealTotal, foodItem) => {
            const grams = (distribucionDelDia[foodItem.id] || {})[mealKey] || 0;
            const factor = grams > 0 && foodItem.alimento.cantidad > 0 ? grams / foodItem.alimento.cantidad : 0;
            return mealTotal + (foodItem.alimento.calorias || 0) * factor;
          }, 0);
        }, 0);

        return (
          <div key={dayIndex} className="mb-10">
            <h2 className="text-xl font-bold text-blue-700 mb-4 pb-2 border-b-2 border-blue-200">
              Dia {dayIndex + 1}
              {totalKcalDia > 0 && <span className="ml-3 text-sm font-normal text-gray-500">Total: {totalKcalDia.toFixed(0)} kcal</span>}
            </h2>
            {mealSlots.map(mealKey => {
              const mealFoods = (dietaActual || []).map(foodItem => {
                const grams = (distribucionDelDia[foodItem.id] || {})[mealKey] || 0;
                return grams > 0 ? { foodItem, assignedGrams: grams } : null;
              }).filter(Boolean);

              const mealTotals = mealFoods.reduce((acc, { foodItem, assignedGrams }) => {
                const factor = assignedGrams > 0 && foodItem.alimento.cantidad > 0 ? assignedGrams / foodItem.alimento.cantidad : 0;
                acc.calorias += (foodItem.alimento.calorias || 0) * factor;
                acc.hc += (foodItem.alimento.hc || 0) * factor;
                acc.proteina += (foodItem.alimento.proteina || 0) * factor;
                acc.grasa += (foodItem.alimento.grasa || 0) * factor;
                acc.gramos += assignedGrams;
                return acc;
              }, { calorias: 0, hc: 0, proteina: 0, grasa: 0, gramos: 0 });

              // ✅ % VCT del menú
              const pctVCT = totalKcalDia > 0 ? (mealTotals.calorias / totalKcalDia) * 100 : 0;

              return (
                <div key={mealKey} className="bg-white rounded-xl shadow-sm border border-l-4 border-l-blue-500 mb-4 overflow-hidden">
                  <div className="px-5 py-4 flex justify-between items-center flex-wrap gap-2 bg-gray-50 border-b">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-base font-bold text-gray-800">{mealKey}</h3>
                      {mealTimes[mealKey] && (
                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1 bg-white border px-2 py-0.5 rounded-full">
                          <Clock size={12} />{mealTimes[mealKey]}
                        </span>
                      )}
                      {/* ✅ % VCT */}
                      {mealTotals.calorias > 0 && (
                        <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          {pctVCT.toFixed(1)}% VCT — {mealTotals.calorias.toFixed(0)} kcal
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => { setQuickAssignState({}); setAssigningFood({ dayIndex, mealKey }); }}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-700 transition-colors"
                    >
                      <PlusCircle size={15} /> Asignar Alimentos
                    </button>
                  </div>
                  {mealFoods.length > 0 ? (
                    <div className="overflow-x-auto p-2">
                      <table className="w-full text-sm whitespace-nowrap">
                        <thead className="text-xs text-gray-500 uppercase">
                          <tr>
                            <th className="px-3 py-2 text-left">Alimento</th>
                            <th className="px-3 py-2 text-left">Gramos</th>
                            <th className="px-3 py-2 text-left">Kcal</th>
                            <th className="px-3 py-2 text-left">HC (g)</th>
                            <th className="px-3 py-2 text-left">Prot (g)</th>
                            <th className="px-3 py-2 text-left">Grasa (g)</th>
                            <th className="px-3 py-2 text-left">% HC</th>
                            <th className="px-3 py-2 text-left">% Prot</th>
                            <th className="px-3 py-2 text-left">% Grasa</th>
                            <th className="px-3 py-2 text-left">Accion</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {mealFoods.map(({ foodItem, assignedGrams }) => {
                            const factor = assignedGrams > 0 && foodItem.alimento.cantidad > 0 ? assignedGrams / foodItem.alimento.cantidad : 0;
                            const kcal = (foodItem.alimento.calorias || 0) * factor;
                            const hc = (foodItem.alimento.hc || 0) * factor;
                            const prot = (foodItem.alimento.proteina || 0) * factor;
                            const grasa = (foodItem.alimento.grasa || 0) * factor;
                            return (
                              <tr key={foodItem.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-medium text-gray-800">{foodItem.alimento.nombre}</td>
                                <td className="px-3 py-2">{assignedGrams.toFixed(1)}g</td>
                                <td className="px-3 py-2 font-bold text-blue-600">{kcal.toFixed(1)}</td>
                                <td className="px-3 py-2">{hc.toFixed(1)}</td>
                                <td className="px-3 py-2">{prot.toFixed(1)}</td>
                                <td className="px-3 py-2">{grasa.toFixed(1)}</td>
                                <td className="px-3 py-2 text-gray-500">{kcal > 0 ? ((hc * 4 / kcal) * 100).toFixed(0) : 0}%</td>
                                <td className="px-3 py-2 text-gray-500">{kcal > 0 ? ((prot * 4 / kcal) * 100).toFixed(0) : 0}%</td>
                                <td className="px-3 py-2 text-gray-500">{kcal > 0 ? ((grasa * 9 / kcal) * 100).toFixed(0) : 0}%</td>
                                <td className="px-3 py-2">
                                  <button onClick={() => setEditingFood({ foodItem, dayIndex })} className="text-blue-400 hover:text-blue-700">
                                    <Edit size={15} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-blue-50 font-bold text-blue-800">
                            <td className="px-3 py-2">Total</td>
                            <td className="px-3 py-2">{mealTotals.gramos.toFixed(1)}g</td>
                            <td className="px-3 py-2">{mealTotals.calorias.toFixed(1)}</td>
                            <td className="px-3 py-2">{mealTotals.hc.toFixed(1)}</td>
                            <td className="px-3 py-2">{mealTotals.proteina.toFixed(1)}</td>
                            <td className="px-3 py-2">{mealTotals.grasa.toFixed(1)}</td>
                            <td colSpan="4"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-6 italic text-sm">Sin alimentos asignados</p>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// ── FRACCIONAMIENTO POR INTERCAMBIO ──
const FraccionamientoIntercambio = ({ planIntercambio, numberOfDays, mealSlots, mealTimes, distribucion, setDistribucion, showNotification, showNoDataWarning }) => {
  const [editingGroup, setEditingGroup] = useState(null);
  const [assigningGroup, setAssigningGroup] = useState(null); // { dayIndex, mealKey }
  const [quickAssignState, setQuickAssignState] = useState({});

  const piramideData = planIntercambio?.piramideData || {};
  const porcionesDelPlan = useMemo(() => planIntercambio?.porciones || {}, [planIntercambio]);
  const totales = planIntercambio?.totales;

  const remainingPortions = useMemo(() => {
    const r = {};
    Object.keys(porcionesDelPlan).forEach(groupName => {
      const total = Object.values(distribucion).reduce((daySum, dayData) => {
        const groupData = dayData[groupName] || {};
        return daySum + Object.values(groupData).reduce((s, v) => s + (v || 0), 0);
      }, 0);
      r[groupName] = (porcionesDelPlan[groupName] || 0) - total;
    });
    return r;
  }, [porcionesDelPlan, distribucion]);

  const handleSaveDistribution = (dayIndex, groupName, newGroupDistribution) => {
    setDistribucion(prev => {
      const d = JSON.parse(JSON.stringify(prev));
      if (!d[dayIndex]) d[dayIndex] = {};
      d[dayIndex][groupName] = newGroupDistribution;
      return d;
    });
    setEditingGroup(null);
    showNotification('success', `Distribucion guardada para el Dia ${dayIndex + 1}`);
  };

  // ✅ Asignación rápida grupos
  const handleQuickAssignSave = (dayIndex, mealKey) => {
    setDistribucion(prev => {
      const d = JSON.parse(JSON.stringify(prev));
      if (!d[dayIndex]) d[dayIndex] = {};
      Object.entries(quickAssignState).forEach(([groupName, portions]) => {
        const p = parseFloat(portions) || 0;
        if (p > 0) {
          if (!d[dayIndex][groupName]) d[dayIndex][groupName] = {};
          d[dayIndex][groupName][mealKey] = p;
        }
      });
      return d;
    });
    showNotification('success', `Grupos asignados a ${mealKey}`);
    setQuickAssignState({});
    setAssigningGroup(null);
  };

  const DistributionModal = ({ groupName, dayIndex, onSave, onCancel }) => {
    const distribucionDia = distribucion[dayIndex] || {};
    const [local, setLocal] = useState(distribucionDia[groupName] || {});
    const total = Object.values(local).reduce((s, v) => s + (parseFloat(v) || 0), 0);
    const totalPortions = (porcionesDelPlan || {})[groupName] || 0;
    const over = total > totalPortions;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Editar: {groupName}</h3>
            <button onClick={onCancel}><X className="text-gray-400 hover:text-gray-700" /></button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Dia {dayIndex + 1} — Total: <span className="font-bold">{totalPortions} porc.</span> — Asignado: <span className={`font-bold ${over ? 'text-red-500' : 'text-green-600'}`}>{total} porc.</span>
          </p>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {mealSlots.map(mealKey => (
              <div key={mealKey} className="flex justify-between items-center">
                <label className="text-sm text-gray-700">{mealKey}</label>
                <input type="number" min="0" step="0.5"
                  value={local[mealKey] || ''}
                  onChange={e => setLocal(p => ({ ...p, [mealKey]: parseFloat(e.target.value) || 0 }))}
                  placeholder="0" className="w-24 p-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:outline-none" />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button onClick={() => { if (over) { showNotification('error', 'Supera el total de porciones'); return; } onSave(dayIndex, groupName, local); }}
              disabled={over} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Guardar</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {showNoDataWarning && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 mb-6 rounded-r-xl flex gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Plan por Intercambio no definido</p>
            <p className="text-sm">Define un plan en la pestana de Calculadora Nutricional - Intercambio.</p>
          </div>
        </div>
      )}

      {/* ✅ Distribución nutricional en verde */}
      <DistribucionNutricional
        calorias={totales?.calorias}
        hc={totales?.hc}
        proteinas={totales?.proteinas}
        lipidos={totales?.lipidos}
        color="green"
      />

      {/* Banco de porciones */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <h3 className="text-lg font-semibold mb-1">Banco de Porciones para Distribuir</h3>
        <p className="text-sm text-gray-500 mb-4">Porciones restantes en base a todas las asignaciones del ciclo.</p>
        {Object.keys(porcionesDelPlan).length === 0 ? (
          <p className="text-gray-400 italic">No hay porciones definidas.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.keys(porcionesDelPlan).map(groupName => {
              const remaining = remainingPortions[groupName];
              return (
                <div key={groupName} className={`p-3 border rounded-xl ${remaining < 0 ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'}`}>
                  <p className="font-medium text-sm text-gray-800">{groupName}</p>
                  <p className={`text-sm font-bold mt-1 ${remaining === 0 ? 'text-gray-400' : remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {remaining} porc. restante{Math.abs(remaining) === 1 ? '' : 's'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Panel asignación rápida */}
      {assigningGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
          <div className="bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Asignar al {assigningGroup.mealKey}</h3>
              <button onClick={() => { setAssigningGroup(null); setQuickAssignState({}); }}><X className="text-gray-400 hover:text-gray-700" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Dia {assigningGroup.dayIndex + 1} — Ingresa las porciones para cada grupo</p>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {Object.keys(porcionesDelPlan).map(groupName => (
                <div key={groupName} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm font-medium text-gray-800 truncate">{groupName}</p>
                    <p className="text-xs text-gray-400">{(remainingPortions[groupName] ?? 0)} porc. disponibles</p>
                  </div>
                  <input
                    type="number" min="0" step="0.5"
                    value={quickAssignState[groupName] || ''}
                    onChange={e => setQuickAssignState(p => ({ ...p, [groupName]: e.target.value }))}
                    placeholder="0"
                    className="w-20 p-1.5 border rounded-lg text-sm text-right focus:ring-2 focus:ring-green-400 focus:outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={() => { setAssigningGroup(null); setQuickAssignState({}); }}
                className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button onClick={() => handleQuickAssignSave(assigningGroup.dayIndex, assigningGroup.mealKey)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                <Check size={16} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {editingGroup && (
        <DistributionModal
          groupName={editingGroup.groupName}
          dayIndex={editingGroup.dayIndex}
          onSave={handleSaveDistribution}
          onCancel={() => setEditingGroup(null)}
        />
      )}

      {/* ✅ Días con % VCT — color verde */}
      {Array.from({ length: numberOfDays }).map((_, dayIndex) => {
        const distribucionDelDia = distribucion[dayIndex] || {};

        const totalKcalDia = mealSlots.reduce((total, mealKey) => {
          return total + Object.keys(distribucionDelDia).reduce((mealTotal, groupName) => {
            const portions = (distribucionDelDia[groupName] || {})[mealKey] || 0;
            const groupData = piramideData[groupName];
            return mealTotal + (groupData ? (groupData.calorias || 0) * portions : 0);
          }, 0);
        }, 0);

        return (
          <div key={dayIndex} className="mb-10">
            <h2 className="text-xl font-bold text-green-700 mb-4 pb-2 border-b-2 border-green-200">
              Dia {dayIndex + 1}
              {totalKcalDia > 0 && <span className="ml-3 text-sm font-normal text-gray-500">Total: {totalKcalDia.toFixed(0)} kcal</span>}
            </h2>
            {mealSlots.map(mealKey => {
              const mealGroups = Object.keys(distribucionDelDia)
                .filter(groupName => (distribucionDelDia[groupName][mealKey] || 0) > 0)
                .map(groupName => ({ groupName, assignedPortions: distribucionDelDia[groupName][mealKey] }));

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

              // ✅ % VCT
              const pctVCT = totalKcalDia > 0 ? (mealTotals.calorias / totalKcalDia) * 100 : 0;

              return (
                <div key={mealKey} className="bg-white rounded-xl shadow-sm border border-l-4 border-l-green-500 mb-4 overflow-hidden">
                  <div className="px-5 py-4 flex justify-between items-center flex-wrap gap-2 bg-gray-50 border-b">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-base font-bold text-gray-800">{mealKey}</h3>
                      {mealTimes[mealKey] && (
                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1 bg-white border px-2 py-0.5 rounded-full">
                          <Clock size={12} />{mealTimes[mealKey]}
                        </span>
                      )}
                      {/* ✅ % VCT */}
                      {mealTotals.calorias > 0 && (
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          {pctVCT.toFixed(1)}% VCT — {mealTotals.calorias.toFixed(0)} kcal
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => { setQuickAssignState({}); setAssigningGroup({ dayIndex, mealKey }); }}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-green-700 transition-colors"
                    >
                      <PlusCircle size={15} /> Asignar Grupos
                    </button>
                  </div>
                  {mealGroups.length > 0 ? (
                    <div className="overflow-x-auto p-2">
                      <table className="w-full text-sm">
                        <thead className="text-xs text-gray-500 uppercase">
                          <tr>
                            <th className="px-3 py-2 text-left">Grupo</th>
                            <th className="px-3 py-2 text-left">Porciones</th>
                            <th className="px-3 py-2 text-left">Kcal</th>
                            <th className="px-3 py-2 text-left">HC (g)</th>
                            <th className="px-3 py-2 text-left">Prot. (g)</th>
                            <th className="px-3 py-2 text-left">Lip. (g)</th>
                            <th className="px-3 py-2 text-left">Accion</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {mealGroups.map(({ groupName, assignedPortions }) => {
                            const groupData = piramideData[groupName];
                            const kcal = groupData ? (groupData.calorias * assignedPortions).toFixed(1) : 'N/A';
                            const hc = groupData ? (groupData.hc * assignedPortions).toFixed(1) : 'N/A';
                            const prot = groupData ? (groupData.proteinas * assignedPortions).toFixed(1) : 'N/A';
                            const lip = groupData ? (groupData.lipidos * assignedPortions).toFixed(1) : 'N/A';
                            return (
                              <tr key={groupName} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-medium text-gray-800">{groupName}</td>
                                <td className="px-3 py-2">{assignedPortions} {assignedPortions === 1 ? 'porcion' : 'porciones'}</td>
                                <td className="px-3 py-2 font-bold text-green-600">{kcal}</td>
                                <td className="px-3 py-2">{hc}</td>
                                <td className="px-3 py-2">{prot}</td>
                                <td className="px-3 py-2">{lip}</td>
                                <td className="px-3 py-2">
                                  <button onClick={() => setEditingGroup({ groupName, dayIndex })} className="text-green-400 hover:text-green-700">
                                    <Edit size={15} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-green-50 font-bold text-green-800">
                            <td className="px-3 py-2">Total</td>
                            <td className="px-3 py-2">—</td>
                            <td className="px-3 py-2">{mealTotals.calorias.toFixed(1)}</td>
                            <td className="px-3 py-2">{mealTotals.hc.toFixed(1)}</td>
                            <td className="px-3 py-2">{mealTotals.proteinas.toFixed(1)}</td>
                            <td className="px-3 py-2">{mealTotals.lipidos.toFixed(1)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-6 italic text-sm">Sin grupos asignados</p>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// ── COMPONENTE PRINCIPAL ──
const FraccionamientoTab = ({ dietaActual, planIntercambio }) => {
  const [activeSubTab, setActiveSubTab] = useState('desarrollada');
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [mealSlots, setMealSlots] = useState(['Desayuno', 'Media manana', 'Almuerzo', 'Media tarde', 'Merienda', 'Cena']);
  // ✅ mealTimes por día: { [dayIndex]: { [mealKey]: time } } — 'all' para todos los días
  const [mealTimes, setMealTimes] = useState({}); // { mealKey: time } para modo global
  const [mealTimesByDay, setMealTimesByDay] = useState({}); // { dayIndex: { mealKey: time } }
  const [newMealName, setNewMealName] = useState('');
  const [distribucionDesarrollada, setDistribucionDesarrollada] = useState({});
  const [distribucionIntercambio, setDistribucionIntercambio] = useState({});
  const [notification, setNotification] = useState(null);
  // ✅ Drag para ordenar menús
  const dragMeal = useRef(null);
  const dragOverMeal = useRef(null);
  // ✅ Modal para configurar hora con opciones de días
  const [timeModal, setTimeModal] = useState(null); // { mealKey }
  const [tempTime, setTempTime] = useState('');
  const [tempDays, setTempDays] = useState('all'); // 'all' o array de dayIndex

  const showNotification = (type, message) => setNotification({ type, message });
  const isPlanIntercambioProvided = planIntercambio?.porciones && Object.keys(planIntercambio.porciones).length > 0;

  // Obtener hora de un menú para un día específico
  const getMealTime = (mealKey, dayIndex) => {
    if (mealTimesByDay[dayIndex]?.[mealKey]) return mealTimesByDay[dayIndex][mealKey];
    return mealTimes[mealKey] || '';
  };

  // Construir mealTimes para pasar a subcomponentes (usa hora global si no hay por día)
  const getMealTimesForDay = (dayIndex) => {
    const result = {};
    mealSlots.forEach(mealKey => { result[mealKey] = getMealTime(mealKey, dayIndex); });
    return result;
  };

  const handleAddMeal = () => {
    if (!newMealName) { showNotification('error', 'El nombre no puede estar vacio.'); return; }
    if (mealSlots.includes(newMealName)) { showNotification('error', 'Ese menu ya existe.'); return; }
    setMealSlots(prev => [...prev, newMealName]);
    setNewMealName('');
    showNotification('success', `Menu "${newMealName}" agregado.`);
  };

  const handleDeleteMeal = (mealKey) => {
    if (window.confirm(`Eliminar el menu "${mealKey}"?`)) {
      setMealSlots(prev => prev.filter(m => m !== mealKey));
      setMealTimes(prev => { const t = { ...prev }; delete t[mealKey]; return t; });
      const clean = (dist) => {
        const d = JSON.parse(JSON.stringify(dist));
        for (const day in d) for (const item in d[day]) delete d[day][item][mealKey];
        return d;
      };
      setDistribucionDesarrollada(clean);
      setDistribucionIntercambio(clean);
      showNotification('error', `Menu "${mealKey}" eliminado.`);
    }
  };

  const handleEditMeal = (oldKey) => {
    const newKey = prompt(`Nuevo nombre para "${oldKey}":`, oldKey);
    if (newKey && newKey !== oldKey) {
      if (mealSlots.includes(newKey)) { showNotification('error', 'Ese menu ya existe.'); return; }
      setMealSlots(prev => prev.map(m => m === oldKey ? newKey : m));
      setMealTimes(prev => { const t = { ...prev }; if (t[oldKey]) { t[newKey] = t[oldKey]; delete t[oldKey]; } return t; });
      showNotification('success', `Renombrado a "${newKey}".`);
    }
  };

  // ✅ Drag & drop menús
  const handleMealDragStart = (index) => { dragMeal.current = index; };
  const handleMealDragEnter = (index) => { dragOverMeal.current = index; };
  const handleMealDragEnd = () => {
    if (dragMeal.current === null || dragOverMeal.current === null) return;
    const newSlots = [...mealSlots];
    const dragged = newSlots.splice(dragMeal.current, 1)[0];
    newSlots.splice(dragOverMeal.current, 0, dragged);
    setMealSlots(newSlots);
    dragMeal.current = null;
    dragOverMeal.current = null;
  };

  // ✅ Abrir modal de hora
  const openTimeModal = (mealKey) => {
    setTimeModal({ mealKey });
    setTempTime(mealTimes[mealKey] || '');
    setTempDays('all');
  };

  // ✅ Guardar hora con opción de todos los días o días específicos
  const handleSaveTime = () => {
    if (!timeModal) return;
    const { mealKey } = timeModal;
    if (tempDays === 'all') {
      setMealTimes(prev => ({ ...prev, [mealKey]: tempTime }));
      // Limpiar configuraciones por día para este menú
      setMealTimesByDay(prev => {
        const d = JSON.parse(JSON.stringify(prev));
        for (const day in d) delete d[day][mealKey];
        return d;
      });
    } else {
      // Solo para días seleccionados
      setMealTimesByDay(prev => {
        const d = JSON.parse(JSON.stringify(prev));
        tempDays.forEach(dayIndex => {
          if (!d[dayIndex]) d[dayIndex] = {};
          d[dayIndex][mealKey] = tempTime;
        });
        return d;
      });
    }
    setTimeModal(null);
    showNotification('success', `Horario guardado para ${mealKey}.`);
  };

  const SubTabButton = ({ tabId, label, icon, color }) => {
    const activeColors = { blue: 'bg-blue-600 text-white', green: 'bg-green-600 text-white' };
    return (
      <button
        onClick={() => setActiveSubTab(tabId)}
        className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-sm ${activeSubTab === tabId ? activeColors[color] : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}
      >
        {icon}{label}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {notification && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification(null)} />}

      {/* ✅ Modal de hora con opción de días */}
      {timeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Horario: {timeModal.mealKey}</h3>
              <button onClick={() => setTimeModal(null)}><X className="text-gray-400 hover:text-gray-700" /></button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <input type="time" value={tempTime} onChange={e => setTempTime(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Aplicar a</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={tempDays === 'all'} onChange={() => setTempDays('all')} className="accent-green-600" />
                  <span className="text-sm">Todos los dias</span>
                </label>
                {numberOfDays > 1 && (
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input type="radio" checked={Array.isArray(tempDays)} onChange={() => setTempDays([])} className="accent-green-600" />
                      <span className="text-sm">Dias especificos</span>
                    </label>
                    {Array.isArray(tempDays) && (
                      <div className="flex flex-wrap gap-2 pl-6">
                        {Array.from({ length: numberOfDays }, (_, i) => (
                          <label key={i} className="flex items-center gap-1 text-sm cursor-pointer">
                            <input type="checkbox"
                              checked={tempDays.includes(i)}
                              onChange={e => setTempDays(prev => e.target.checked ? [...prev, i] : prev.filter(d => d !== i))}
                              className="accent-green-600"
                            />
                            Dia {i + 1}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setTimeModal(null)} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button onClick={handleSaveTime} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                <Check size={16} /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 p-3 bg-gray-100 rounded-xl">
        <SubTabButton tabId="desarrollada" label="Por Desarrollada" icon={<ClipboardList size={16} />} color="blue" />
        <SubTabButton tabId="intercambio" label="Por Intercambio" icon={<Repeat size={16} />} color="green" />
      </div>

      {/* Configuración */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gestionar menús */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
            <Settings size={20} className="text-gray-500" /> Gestionar Menus y Horarios
          </h3>
          <div className="flex gap-3 mb-4">
            <input
              type="text" value={newMealName}
              onChange={e => setNewMealName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddMeal()}
              placeholder="Nombre del nuevo menu"
              className="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
            />
            <button onClick={handleAddMeal} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm">
              <PlusCircle size={16} /> Anadir
            </button>
          </div>
          {/* ✅ Lista con drag & drop */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {mealSlots.map((mealKey, index) => (
              <div
                key={mealKey}
                draggable
                onDragStart={() => handleMealDragStart(index)}
                onDragEnter={() => handleMealDragEnter(index)}
                onDragEnd={handleMealDragEnd}
                onDragOver={e => e.preventDefault()}
                className="flex items-center justify-between p-2.5 bg-gray-50 border rounded-xl gap-2 cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-colors"
              >
                <GripVertical size={16} className="text-gray-300 flex-shrink-0" />
                <span className="font-medium text-sm flex-grow text-gray-800">{mealKey}</span>
                {/* ✅ Botón reloj que abre modal */}
                <button
                  onClick={() => openTimeModal(mealKey)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-700 bg-white border px-2 py-1 rounded-lg hover:border-green-400 transition-colors"
                  title="Configurar horario"
                >
                  <Clock size={13} />
                  {mealTimes[mealKey] ? mealTimes[mealKey] : 'Hora'}
                </button>
                <div className="flex gap-1">
                  <button onClick={() => handleEditMeal(mealKey)} className="text-gray-400 hover:text-blue-600 p-1"><Edit size={15} /></button>
                  <button onClick={() => handleDeleteMeal(mealKey)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <GripVertical size={12} /> Arrastra para reordenar los menus
          </p>
        </div>

        {/* Configuración del ciclo */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
            <CalendarDays size={20} className="text-gray-500" /> Configuracion del Ciclo
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Numero de Dias</label>
            <select
              value={numberOfDays}
              onChange={e => setNumberOfDays(Number(e.target.value))}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
              {Array.from({ length: 14 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>{day} {day > 1 ? 'dias' : 'dia'}</option>
              ))}
            </select>
          </div>
          {numberOfDays > 1 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
              <p className="font-medium">Consejo</p>
              <p className="text-xs mt-1">Podes configurar horarios diferentes para cada dia haciendo clic en el boton de hora de cada menu.</p>
            </div>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div>
        {activeSubTab === 'desarrollada' && (
          <FraccionamientoDesarrollada
            dietaActual={dietaActual || []}
            numberOfDays={numberOfDays}
            mealSlots={mealSlots}
            mealTimes={mealTimes}
            distribucion={distribucionDesarrollada}
            setDistribucion={setDistribucionDesarrollada}
            showNotification={showNotification}
          />
        )}
        {activeSubTab === 'intercambio' && (
          <FraccionamientoIntercambio
            planIntercambio={planIntercambio || {}}
            numberOfDays={numberOfDays}
            mealSlots={mealSlots}
            mealTimes={mealTimes}
            distribucion={distribucionIntercambio}
            setDistribucion={setDistribucionIntercambio}
            showNotification={showNotification}
            showNoDataWarning={!isPlanIntercambioProvided}
          />
        )}
      </div>
    </div>
  );
};

export default FraccionamientoTab;