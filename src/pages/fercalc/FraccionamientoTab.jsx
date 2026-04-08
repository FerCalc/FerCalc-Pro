// mi-app-frontend/src/pages/fercalc/FraccionamientoTab.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PlusCircle, X, Edit, Trash2, Settings, CalendarDays, Clock, ClipboardList, Repeat, AlertTriangle, Zap, Droplet, GripVertical, Check, ChevronDown, ChevronRight, BookOpen, Tag } from 'lucide-react';

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

const DistribucionNutricional = ({ calorias, hc, proteinas, lipidos, color = 'blue' }) => {
  const c = color === 'green'
    ? { bg: 'bg-green-50', text: 'text-green-900', sub: 'text-green-800', icon: 'text-green-500' }
    : { bg: 'bg-blue-50', text: 'text-blue-900', sub: 'text-blue-800', icon: 'text-blue-500' };
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

// ── MODAL RECETARIO ──
const RecetarioModal = ({ mealKey, mealLabel, dayIndex, ingredientes, recetarios, setRecetarios, onClose }) => {
  const recetarioKey = `${dayIndex}_${mealKey}`;
  const [preparacion, setPreparacion] = useState(recetarios[recetarioKey]?.preparacion || '');

  const handleSave = () => {
    setRecetarios(prev => ({ ...prev, [recetarioKey]: { preparacion } }));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BookOpen className="text-white" size={22} />
              <div>
                <h3 className="text-lg font-bold text-white">Recetario</h3>
                <p className="text-green-100 text-sm">{mealLabel} — Dia {dayIndex + 1}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-green-200"><X size={22} /></button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              Ingredientes
            </h4>
            {ingredientes.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-center text-gray-400 text-sm">
                Aun no hay alimentos asignados. Asigna alimentos primero para ver los ingredientes.
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl border divide-y">
                {ingredientes.map(({ nombre, cantidad, unidad }, i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm font-medium text-gray-800">{nombre}</span>
                    <span className="text-sm font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                      {typeof cantidad === 'number' ? cantidad.toFixed(1) : cantidad} {unidad || 'g'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              Preparacion
            </h4>
            <textarea
              value={preparacion}
              onChange={e => setPreparacion(e.target.value)}
              placeholder="Describe el modo de preparacion: pasos, tecnicas de coccion, tiempos, consejos..."
              rows={7}
              className="w-full p-4 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none placeholder-gray-400 leading-relaxed"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{preparacion.length} caracteres</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium">Cancelar</button>
            <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium flex items-center justify-center gap-2">
              <Check size={16} /> Guardar Recetario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── MODAL NOMBRE DE MENÚ POR DÍA ──
const MealNameModal = ({ mealKey, numberOfDays, onSave, onClose }) => {
  const [nombre, setNombre] = useState('');
  const [applyTo, setApplyTo] = useState('all');
  const [selectedDays, setSelectedDays] = useState([]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Tag className="text-white" size={18} />
            <h3 className="text-base font-bold text-white">Nombre del menu</h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-blue-200"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre para <span className="font-bold text-blue-600">{mealKey}</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Cafe con leche, Omelet..."
              className="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Aplicar a</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={applyTo === 'all'} onChange={() => setApplyTo('all')} className="accent-blue-600" />
                <span className="text-sm">Todos los dias</span>
              </label>
              {numberOfDays > 1 && (
                <>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={applyTo === 'specific'} onChange={() => setApplyTo('specific')} className="accent-blue-600" />
                    <span className="text-sm">Dias especificos</span>
                  </label>
                  {applyTo === 'specific' && (
                    <div className="flex flex-wrap gap-2 pl-6 pt-1">
                      {Array.from({ length: numberOfDays }, (_, i) => (
                        <label key={i} className={`flex items-center gap-1 text-xs cursor-pointer px-2.5 py-1.5 rounded-lg border transition-colors ${selectedDays.includes(i) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-400'}`}>
                          <input type="checkbox" checked={selectedDays.includes(i)}
                            onChange={e => setSelectedDays(prev => e.target.checked ? [...prev, i] : prev.filter(d => d !== i))}
                            className="hidden" />
                          Dia {i + 1}
                        </label>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-sm font-medium">Cancelar</button>
            <button
              onClick={() => {
                if (!nombre.trim()) return;
                const days = applyTo === 'all'
                  ? Array.from({ length: numberOfDays }, (_, i) => i)
                  : selectedDays;
                onSave(mealKey, nombre.trim(), days);
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2"
            >
              <Check size={14} /> Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── FRACCIONAMIENTO POR DESARROLLADA ──
const FraccionamientoDesarrollada = ({
  dietaActual, numberOfDays, mealSlots, getMealTimeForDay,
  distribucion, setDistribucion,
  mealNamesByDay, setMealNamesByDay,
  recetarios, setRecetarios,
  showNotification
}) => {
  const [assigningFood, setAssigningFood] = useState(null);
  const [editingFood, setEditingFood] = useState(null);
  const [quickAssignState, setQuickAssignState] = useState({});
  const [collapsedDays, setCollapsedDays] = useState({});
  const [recetarioModal, setRecetarioModal] = useState(null);
  const [mealNameModal, setMealNameModal] = useState(null);

  const toggleDay = (dayIndex) => setCollapsedDays(prev => ({ ...prev, [dayIndex]: !prev[dayIndex] }));

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

  const getAvailableGramsForDay = (item, dayIndex) => {
    const assignedThisDay = Object.values((distribucion[dayIndex] || {})[item.id] || {})
      .reduce((s, v) => s + (parseFloat(v) || 0), 0);
    return item.cantidadUsada - assignedThisDay;
  };

  const remainingGrams = useMemo(() => {
    const r = {};
    (dietaActual || []).forEach(item => {
      const totalAsignado = Object.values(distribucion).reduce((daySum, dayData) => {
        return daySum + Object.values(dayData[item.id] || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0);
      }, 0);
      r[item.id] = (item.cantidadUsada * numberOfDays) - totalAsignado;
    });
    return r;
  }, [dietaActual, distribucion, numberOfDays]);

  const getMealLabel = (mealKey, dayIndex) => mealNamesByDay[`${dayIndex}_${mealKey}`] || mealKey;

  const handleSaveMealName = (mealKey, nombre, days) => {
    setMealNamesByDay(prev => {
      const updated = { ...prev };
      days.forEach(dayIndex => { updated[`${dayIndex}_${mealKey}`] = nombre; });
      return updated;
    });
    showNotification('success', `Nombre guardado para ${mealKey}`);
  };

  const handleQuickAssignSave = (dayIndex, mealKey) => {
    const errores = [];
    Object.entries(quickAssignState).forEach(([foodId, grams]) => {
      const g = parseFloat(grams) || 0;
      if (g <= 0) return;
      const item = (dietaActual || []).find(i => String(i.id) === String(foodId));
      if (!item) return;
      const available = getAvailableGramsForDay(item, dayIndex);
      if (g > available + 0.01) errores.push(`${item.alimento.nombre}: max ${available.toFixed(1)}g disponibles hoy`);
    });
    if (errores.length > 0) { showNotification('error', errores[0]); return; }

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
    showNotification('success', `Alimentos asignados a ${getMealLabel(mealKey, dayIndex)}`);
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

  const DistributionModal = ({ foodItem, dayIndex, onSave, onCancel }) => {
    const [local, setLocal] = useState((distribucion[dayIndex] || {})[foodItem.id] || {});
    const total = Object.values(local).reduce((s, v) => s + (parseFloat(v) || 0), 0);
    const over = total > foodItem.cantidadUsada + 0.01;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Editar: {foodItem.alimento.nombre}</h3>
            <button onClick={onCancel}><X className="text-gray-400 hover:text-gray-700" /></button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Dia {dayIndex + 1} — Max por dia: <span className="font-bold">{foodItem.cantidadUsada}g</span> — Asignado: <span className={`font-bold ${over ? 'text-red-500' : 'text-green-600'}`}>{total.toFixed(1)}g</span>
          </p>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {mealSlots.map(mealKey => (
              <div key={mealKey} className="flex justify-between items-center">
                <label className="text-gray-700 text-sm">{getMealLabel(mealKey, dayIndex)}</label>
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
      <DistribucionNutricional calorias={totalDieta.calorias} hc={totalDieta.hc} proteinas={totalDieta.proteinas} lipidos={totalDieta.lipidos} color="blue" />

      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <h3 className="text-lg font-semibold mb-1">Banco de Alimentos para Distribuir</h3>
        <p className="text-sm text-gray-500 mb-4">
          Cada alimento puede usarse cada dia hasta su cantidad total. Banco considera los {numberOfDays} dia{numberOfDays > 1 ? 's' : ''} del ciclo.
        </p>
        {(dietaActual || []).length === 0 ? (
          <p className="text-gray-400 italic">No hay alimentos en la dieta desarrollada.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {(dietaActual || []).map(item => {
              const rem = remainingGrams[item.id] ?? (item.cantidadUsada * numberOfDays);
              return (
                <div key={item.id} className={`p-3 border rounded-xl ${rem < -0.01 ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'}`}>
                  <p className="font-medium text-sm text-gray-800">{item.alimento.nombre}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.cantidadUsada}g × {numberOfDays} dia{numberOfDays > 1 ? 's' : ''}</p>
                  <p className={`text-sm font-bold mt-1 ${Math.abs(rem) < 0.01 ? 'text-gray-400' : rem < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {rem.toFixed(1)}g restantes
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Panel asignación rápida */}
      {assigningFood && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
          <div className="bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-gray-800">Asignar: {getMealLabel(assigningFood.mealKey, assigningFood.dayIndex)}</h3>
              <button onClick={() => { setAssigningFood(null); setQuickAssignState({}); }}><X className="text-gray-400 hover:text-gray-700" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Dia {assigningFood.dayIndex + 1} — Disponible solo para este dia</p>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {(dietaActual || []).map(item => {
                const availableThisDay = getAvailableGramsForDay(item, assigningFood.dayIndex);
                return (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.alimento.nombre}</p>
                      <p className={`text-xs ${availableThisDay < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {availableThisDay.toFixed(1)}g disponibles hoy
                      </p>
                    </div>
                    <input type="number" min="0" max={Math.max(0, availableThisDay)}
                      value={quickAssignState[item.id] || ''}
                      onChange={e => setQuickAssignState(p => ({ ...p, [item.id]: e.target.value }))}
                      placeholder="0g"
                      className="w-20 p-1.5 border rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={() => { setAssigningFood(null); setQuickAssignState({}); }} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button onClick={() => handleQuickAssignSave(assigningFood.dayIndex, assigningFood.mealKey)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                <Check size={16} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {editingFood && (
        <DistributionModal foodItem={editingFood.foodItem} dayIndex={editingFood.dayIndex} onSave={handleSaveDistribution} onCancel={() => setEditingFood(null)} />
      )}

      {mealNameModal && (
        <MealNameModal mealKey={mealNameModal} numberOfDays={numberOfDays} onSave={handleSaveMealName} onClose={() => setMealNameModal(null)} />
      )}

      {recetarioModal && (
        <RecetarioModal
          mealKey={recetarioModal.mealKey}
          mealLabel={getMealLabel(recetarioModal.mealKey, recetarioModal.dayIndex)}
          dayIndex={recetarioModal.dayIndex}
          ingredientes={(() => {
            const distribucionDelDia = distribucion[recetarioModal.dayIndex] || {};
            return (dietaActual || []).map(foodItem => {
              const grams = (distribucionDelDia[foodItem.id] || {})[recetarioModal.mealKey] || 0;
              return grams > 0 ? { nombre: foodItem.alimento.nombre, cantidad: grams, unidad: foodItem.alimento.unidad || 'g' } : null;
            }).filter(Boolean);
          })()}
          recetarios={recetarios}
          setRecetarios={setRecetarios}
          onClose={() => setRecetarioModal(null)}
        />
      )}

      {/* Días */}
      {Array.from({ length: numberOfDays }).map((_, dayIndex) => {
        const distribucionDelDia = distribucion[dayIndex] || {};
        const mealTimesForDay = getMealTimeForDay(dayIndex);
        const isCollapsed = collapsedDays[dayIndex] || false;

        const totalKcalDia = mealSlots.reduce((dayTotal, mealKey) => {
          return dayTotal + (dietaActual || []).reduce((mealTotal, foodItem) => {
            const grams = (distribucionDelDia[foodItem.id] || {})[mealKey] || 0;
            const factor = grams > 0 && foodItem.alimento.cantidad > 0 ? grams / foodItem.alimento.cantidad : 0;
            return mealTotal + (foodItem.alimento.calorias || 0) * factor;
          }, 0);
        }, 0);

        return (
          <div key={dayIndex} className="mb-6">
            <button onClick={() => toggleDay(dayIndex)}
              className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-xl mb-3 hover:bg-blue-700 transition-colors">
              <div className="flex items-center gap-3">
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                <span className="text-lg font-bold">Dia {dayIndex + 1}</span>
                {totalKcalDia > 0 && <span className="text-sm font-normal text-blue-200">{totalKcalDia.toFixed(0)} kcal totales</span>}
              </div>
              <span className="text-sm text-blue-200">{isCollapsed ? 'Expandir' : 'Contraer'}</span>
            </button>

            {!isCollapsed && mealSlots.map(mealKey => {
              const mealLabel = getMealLabel(mealKey, dayIndex);
              const hasCustomName = mealNamesByDay[`${dayIndex}_${mealKey}`];
              const tieneRecetario = recetarios[`${dayIndex}_${mealKey}`]?.preparacion;

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

              const pctVCT = totalKcalDia > 0 ? (mealTotals.calorias / totalKcalDia) * 100 : 0;

              return (
                <div key={mealKey} className="bg-white rounded-xl shadow-sm border border-l-4 border-l-blue-500 mb-3 overflow-hidden">
                  <div className="px-5 py-3 flex justify-between items-center flex-wrap gap-2 bg-gray-50 border-b">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-gray-800">{mealLabel}</h3>
                        {hasCustomName && <span className="text-xs text-gray-400 italic">({mealKey})</span>}
                        <button onClick={() => setMealNameModal(mealKey)} className="text-gray-300 hover:text-blue-500 transition-colors" title="Nombrar este menu">
                          <Edit size={13} />
                        </button>
                      </div>
                      {mealTimesForDay[mealKey] && (
                        <span className="text-xs text-gray-500 flex items-center gap-1 bg-white border px-2 py-0.5 rounded-full">
                          <Clock size={12} />{mealTimesForDay[mealKey]}
                        </span>
                      )}
                      {mealTotals.calorias > 0 && (
                        <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          {pctVCT.toFixed(1)}% VCT — {mealTotals.calorias.toFixed(0)} kcal
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setRecetarioModal({ dayIndex, mealKey })}
                        className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors border ${tieneRecetario ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600'}`}>
                        <BookOpen size={14} />{tieneRecetario ? 'Ver Receta' : 'Recetario'}
                      </button>
                      <button onClick={() => { setQuickAssignState({}); setAssigningFood({ dayIndex, mealKey }); }}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-700">
                        <PlusCircle size={15} /> Asignar
                      </button>
                    </div>
                  </div>
                  {mealFoods.length > 0 ? (
                    <div className="overflow-x-auto p-2">
                      <table className="w-full text-sm whitespace-nowrap">
                        <thead className="text-xs text-gray-500 uppercase">
                          <tr>
                            <th className="px-3 py-2 text-left">Alimento</th>
                            <th className="px-3 py-2 text-left">g</th>
                            <th className="px-3 py-2 text-left">Kcal</th>
                            <th className="px-3 py-2 text-left">HC</th>
                            <th className="px-3 py-2 text-left">Prot</th>
                            <th className="px-3 py-2 text-left">Grasa</th>
                            <th className="px-3 py-2 text-left">%HC</th>
                            <th className="px-3 py-2 text-left">%Prot</th>
                            <th className="px-3 py-2 text-left">%Grasa</th>
                            <th className="px-3 py-2 text-left">Edit</th>
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
                                <td className="px-3 py-2 font-medium">{foodItem.alimento.nombre}</td>
                                <td className="px-3 py-2">{assignedGrams.toFixed(1)}</td>
                                <td className="px-3 py-2 font-bold text-blue-600">{kcal.toFixed(1)}</td>
                                <td className="px-3 py-2">{hc.toFixed(1)}</td>
                                <td className="px-3 py-2">{prot.toFixed(1)}</td>
                                <td className="px-3 py-2">{grasa.toFixed(1)}</td>
                                <td className="px-3 py-2 text-gray-500">{kcal > 0 ? ((hc * 4 / kcal) * 100).toFixed(0) : 0}%</td>
                                <td className="px-3 py-2 text-gray-500">{kcal > 0 ? ((prot * 4 / kcal) * 100).toFixed(0) : 0}%</td>
                                <td className="px-3 py-2 text-gray-500">{kcal > 0 ? ((grasa * 9 / kcal) * 100).toFixed(0) : 0}%</td>
                                <td className="px-3 py-2">
                                  <button onClick={() => setEditingFood({ foodItem, dayIndex })} className="text-blue-400 hover:text-blue-700"><Edit size={15} /></button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-blue-50 font-bold text-blue-800">
                            <td className="px-3 py-2">Total</td>
                            <td className="px-3 py-2">{mealTotals.gramos.toFixed(1)}</td>
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
                    <p className="text-gray-400 text-center py-5 italic text-sm">Sin alimentos asignados</p>
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
const FraccionamientoIntercambio = ({
  planIntercambio, numberOfDays, mealSlots, getMealTimeForDay,
  distribucion, setDistribucion,
  mealNamesByDay, setMealNamesByDay,
  recetarios, setRecetarios,
  showNotification, showNoDataWarning
}) => {
  const [editingGroup, setEditingGroup] = useState(null);
  const [assigningGroup, setAssigningGroup] = useState(null);
  const [quickAssignState, setQuickAssignState] = useState({});
  const [collapsedDays, setCollapsedDays] = useState({});
  const [recetarioModal, setRecetarioModal] = useState(null);
  const [mealNameModal, setMealNameModal] = useState(null);

  const toggleDay = (dayIndex) => setCollapsedDays(prev => ({ ...prev, [dayIndex]: !prev[dayIndex] }));

  const piramideData = planIntercambio?.piramideData || {};
  const porcionesDelPlan = useMemo(() => planIntercambio?.porciones || {}, [planIntercambio]);
  const totales = planIntercambio?.totales;

  const remainingPortions = useMemo(() => {
    const r = {};
    Object.keys(porcionesDelPlan).forEach(groupName => {
      const totalAsignado = Object.values(distribucion).reduce((daySum, dayData) => {
        return daySum + Object.values(dayData[groupName] || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0);
      }, 0);
      r[groupName] = (porcionesDelPlan[groupName] || 0) * numberOfDays - totalAsignado;
    });
    return r;
  }, [porcionesDelPlan, distribucion, numberOfDays]);

  const getAvailablePortionsForDay = (groupName, dayIndex) => {
    const assignedThisDay = Object.values((distribucion[dayIndex] || {})[groupName] || {})
      .reduce((s, v) => s + (parseFloat(v) || 0), 0);
    return (porcionesDelPlan[groupName] || 0) - assignedThisDay;
  };

  const getMealLabel = (mealKey, dayIndex) => mealNamesByDay[`${dayIndex}_${mealKey}`] || mealKey;

  const handleSaveMealName = (mealKey, nombre, days) => {
    setMealNamesByDay(prev => {
      const updated = { ...prev };
      days.forEach(dayIndex => { updated[`${dayIndex}_${mealKey}`] = nombre; });
      return updated;
    });
    showNotification('success', `Nombre guardado para ${mealKey}`);
  };

  const handleSaveDistribution = (dayIndex, groupName, newDist) => {
    setDistribucion(prev => {
      const d = JSON.parse(JSON.stringify(prev));
      if (!d[dayIndex]) d[dayIndex] = {};
      d[dayIndex][groupName] = newDist;
      return d;
    });
    setEditingGroup(null);
    showNotification('success', `Distribucion guardada para el Dia ${dayIndex + 1}`);
  };

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
    showNotification('success', `Grupos asignados a ${getMealLabel(mealKey, dayIndex)}`);
    setQuickAssignState({});
    setAssigningGroup(null);
  };

  const DistributionModal = ({ groupName, dayIndex, onSave, onCancel }) => {
    const [local, setLocal] = useState((distribucion[dayIndex] || {})[groupName] || {});
    const total = Object.values(local).reduce((s, v) => s + (parseFloat(v) || 0), 0);
    const totalPortions = porcionesDelPlan[groupName] || 0;
    const over = total > totalPortions + 0.01;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Editar: {groupName}</h3>
            <button onClick={onCancel}><X className="text-gray-400 hover:text-gray-700" /></button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Dia {dayIndex + 1} — Max: <span className="font-bold">{totalPortions} porc.</span> — Asignado: <span className={`font-bold ${over ? 'text-red-500' : 'text-green-600'}`}>{total} porc.</span>
          </p>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {mealSlots.map(mealKey => (
              <div key={mealKey} className="flex justify-between items-center">
                <label className="text-sm text-gray-700">{getMealLabel(mealKey, dayIndex)}</label>
                <input type="number" min="0" step="0.5" value={local[mealKey] || ''}
                  onChange={e => setLocal(p => ({ ...p, [mealKey]: parseFloat(e.target.value) || 0 }))}
                  placeholder="0" className="w-24 p-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:outline-none" />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button onClick={() => { if (over) { showNotification('error', 'Supera el total'); return; } onSave(dayIndex, groupName, local); }}
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
            <p className="text-sm">Define un plan en Calculadora Nutricional - Intercambio.</p>
          </div>
        </div>
      )}

      <DistribucionNutricional calorias={totales?.calorias} hc={totales?.hc} proteinas={totales?.proteinas} lipidos={totales?.lipidos} color="green" />

      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <h3 className="text-lg font-semibold mb-1">Banco de Porciones para Distribuir</h3>
        <p className="text-sm text-gray-500 mb-4">
          Cada grupo puede usarse cada dia. Banco considera los {numberOfDays} dia{numberOfDays > 1 ? 's' : ''} del ciclo.
        </p>
        {Object.keys(porcionesDelPlan).length === 0 ? (
          <p className="text-gray-400 italic">No hay porciones definidas.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.keys(porcionesDelPlan).map(groupName => {
              const remaining = remainingPortions[groupName];
              return (
                <div key={groupName} className={`p-3 border rounded-xl ${remaining < -0.01 ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'}`}>
                  <p className="font-medium text-sm text-gray-800">{groupName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{porcionesDelPlan[groupName]} porc. × {numberOfDays} dia{numberOfDays > 1 ? 's' : ''}</p>
                  <p className={`text-sm font-bold mt-1 ${Math.abs(remaining) < 0.01 ? 'text-gray-400' : remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {remaining.toFixed(1)} porc. restantes
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
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">Asignar: {getMealLabel(assigningGroup.mealKey, assigningGroup.dayIndex)}</h3>
              <button onClick={() => { setAssigningGroup(null); setQuickAssignState({}); }}><X className="text-gray-400 hover:text-gray-700" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Dia {assigningGroup.dayIndex + 1}</p>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {Object.keys(porcionesDelPlan).map(groupName => {
                const availableToday = getAvailablePortionsForDay(groupName, assigningGroup.dayIndex);
                return (
                  <div key={groupName} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-sm font-medium text-gray-800 truncate">{groupName}</p>
                      <p className={`text-xs ${availableToday < 0 ? 'text-red-500' : 'text-gray-400'}`}>{availableToday} porc. hoy</p>
                    </div>
                    <input type="number" min="0" step="0.5" max={Math.max(0, availableToday)}
                      value={quickAssignState[groupName] || ''}
                      onChange={e => setQuickAssignState(p => ({ ...p, [groupName]: e.target.value }))}
                      placeholder="0"
                      className="w-20 p-1.5 border rounded-lg text-sm text-right focus:ring-2 focus:ring-green-400 focus:outline-none" />
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={() => { setAssigningGroup(null); setQuickAssignState({}); }} className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button onClick={() => handleQuickAssignSave(assigningGroup.dayIndex, assigningGroup.mealKey)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                <Check size={16} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {editingGroup && (
        <DistributionModal groupName={editingGroup.groupName} dayIndex={editingGroup.dayIndex} onSave={handleSaveDistribution} onCancel={() => setEditingGroup(null)} />
      )}

      {mealNameModal && (
        <MealNameModal mealKey={mealNameModal} numberOfDays={numberOfDays} onSave={handleSaveMealName} onClose={() => setMealNameModal(null)} />
      )}

      {recetarioModal && (
        <RecetarioModal
          mealKey={recetarioModal.mealKey}
          mealLabel={getMealLabel(recetarioModal.mealKey, recetarioModal.dayIndex)}
          dayIndex={recetarioModal.dayIndex}
          ingredientes={(() => {
            const distribucionDelDia = distribucion[recetarioModal.dayIndex] || {};
            return Object.keys(distribucionDelDia)
              .map(groupName => {
                const portions = (distribucionDelDia[groupName] || {})[recetarioModal.mealKey] || 0;
                return portions > 0 ? { nombre: groupName, cantidad: portions, unidad: 'porciones' } : null;
              }).filter(Boolean);
          })()}
          recetarios={recetarios}
          setRecetarios={setRecetarios}
          onClose={() => setRecetarioModal(null)}
        />
      )}

      {/* Días */}
      {Array.from({ length: numberOfDays }).map((_, dayIndex) => {
        const distribucionDelDia = distribucion[dayIndex] || {};
        const mealTimesForDay = getMealTimeForDay(dayIndex);
        const isCollapsed = collapsedDays[dayIndex] || false;

        const totalKcalDia = mealSlots.reduce((total, mealKey) => {
          return total + Object.keys(distribucionDelDia).reduce((mealTotal, groupName) => {
            const portions = (distribucionDelDia[groupName] || {})[mealKey] || 0;
            const groupData = piramideData[groupName];
            return mealTotal + (groupData ? (groupData.calorias || 0) * portions : 0);
          }, 0);
        }, 0);

        return (
          <div key={dayIndex} className="mb-6">
            <button onClick={() => toggleDay(dayIndex)}
              className="w-full flex items-center justify-between px-4 py-3 bg-green-600 text-white rounded-xl mb-3 hover:bg-green-700 transition-colors">
              <div className="flex items-center gap-3">
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                <span className="text-lg font-bold">Dia {dayIndex + 1}</span>
                {totalKcalDia > 0 && <span className="text-sm font-normal text-green-200">{totalKcalDia.toFixed(0)} kcal totales</span>}
              </div>
              <span className="text-sm text-green-200">{isCollapsed ? 'Expandir' : 'Contraer'}</span>
            </button>

            {!isCollapsed && mealSlots.map(mealKey => {
              const mealLabel = getMealLabel(mealKey, dayIndex);
              const hasCustomName = mealNamesByDay[`${dayIndex}_${mealKey}`];
              const tieneRecetario = recetarios[`${dayIndex}_${mealKey}`]?.preparacion;

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

              const pctVCT = totalKcalDia > 0 ? (mealTotals.calorias / totalKcalDia) * 100 : 0;

              return (
                <div key={mealKey} className="bg-white rounded-xl shadow-sm border border-l-4 border-l-green-500 mb-3 overflow-hidden">
                  <div className="px-5 py-3 flex justify-between items-center flex-wrap gap-2 bg-gray-50 border-b">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-gray-800">{mealLabel}</h3>
                        {hasCustomName && <span className="text-xs text-gray-400 italic">({mealKey})</span>}
                        <button onClick={() => setMealNameModal(mealKey)} className="text-gray-300 hover:text-green-500 transition-colors">
                          <Edit size={13} />
                        </button>
                      </div>
                      {mealTimesForDay[mealKey] && (
                        <span className="text-xs text-gray-500 flex items-center gap-1 bg-white border px-2 py-0.5 rounded-full">
                          <Clock size={12} />{mealTimesForDay[mealKey]}
                        </span>
                      )}
                      {mealTotals.calorias > 0 && (
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          {pctVCT.toFixed(1)}% VCT — {mealTotals.calorias.toFixed(0)} kcal
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setRecetarioModal({ dayIndex, mealKey })}
                        className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors border ${tieneRecetario ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600'}`}>
                        <BookOpen size={14} />{tieneRecetario ? 'Ver Receta' : 'Recetario'}
                      </button>
                      <button onClick={() => { setQuickAssignState({}); setAssigningGroup({ dayIndex, mealKey }); }}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-green-700">
                        <PlusCircle size={15} /> Asignar
                      </button>
                    </div>
                  </div>
                  {mealGroups.length > 0 ? (
                    <div className="overflow-x-auto p-2">
                      <table className="w-full text-sm">
                        <thead className="text-xs text-gray-500 uppercase">
                          <tr>
                            <th className="px-3 py-2 text-left">Grupo</th>
                            <th className="px-3 py-2 text-left">Porciones</th>
                            <th className="px-3 py-2 text-left">Kcal</th>
                            <th className="px-3 py-2 text-left">HC</th>
                            <th className="px-3 py-2 text-left">Prot</th>
                            <th className="px-3 py-2 text-left">Lip</th>
                            <th className="px-3 py-2 text-left">Edit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {mealGroups.map(({ groupName, assignedPortions }) => {
                            const gd = piramideData[groupName];
                            return (
                              <tr key={groupName} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-medium">{groupName}</td>
                                <td className="px-3 py-2">{assignedPortions}</td>
                                <td className="px-3 py-2 font-bold text-green-600">{gd ? (gd.calorias * assignedPortions).toFixed(1) : 'N/A'}</td>
                                <td className="px-3 py-2">{gd ? (gd.hc * assignedPortions).toFixed(1) : 'N/A'}</td>
                                <td className="px-3 py-2">{gd ? (gd.proteinas * assignedPortions).toFixed(1) : 'N/A'}</td>
                                <td className="px-3 py-2">{gd ? (gd.lipidos * assignedPortions).toFixed(1) : 'N/A'}</td>
                                <td className="px-3 py-2">
                                  <button onClick={() => setEditingGroup({ groupName, dayIndex })} className="text-green-400 hover:text-green-700"><Edit size={15} /></button>
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
                    <p className="text-gray-400 text-center py-5 italic text-sm">Sin grupos asignados</p>
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
// ✅ Ahora recibe todos los estados como props desde App.jsx
const FraccionamientoTab = ({
  dietaActual, planIntercambio,
  mealSlots, setMealSlots,
  mealTimes, setMealTimes,
  mealTimesByDay, setMealTimesByDay,
  numberOfDays, setNumberOfDays,
  distribucionDesarrollada, setDistribucionDesarrollada,
  distribucionIntercambio, setDistribucionIntercambio,
  mealNamesByDayDes, setMealNamesByDayDes,
  mealNamesByDayInt, setMealNamesByDayInt,
  recetariosDes, setRecetariosDes,
  recetariosInt, setRecetariosInt,
}) => {
  const [activeSubTab, setActiveSubTab] = useState('desarrollada');
  const [newMealName, setNewMealName] = useState('');
  const [notification, setNotification] = useState(null);
  const dragMeal = useRef(null);
  const dragOverMeal = useRef(null);
  const [timeModal, setTimeModal] = useState(null);
  const [tempTime, setTempTime] = useState('');
  const [tempDays, setTempDays] = useState('all');

  const showNotification = (type, message) => setNotification({ type, message });
  const isPlanIntercambioProvided = planIntercambio?.porciones && Object.keys(planIntercambio.porciones).length > 0;

  const getMealTimeForDay = (dayIndex) => {
    const result = {};
    mealSlots.forEach(mealKey => {
      const byDay = mealTimesByDay[dayIndex]?.[mealKey];
      result[mealKey] = byDay !== undefined ? byDay : (mealTimes[mealKey] || '');
    });
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
        for (const day in d) for (const item in d[day]) { if (d[day][item]) delete d[day][item][mealKey]; }
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

  const openTimeModal = (mealKey) => {
    setTimeModal({ mealKey });
    setTempTime(mealTimes[mealKey] || '');
    setTempDays('all');
  };

  const handleSaveTime = () => {
    if (!timeModal) return;
    const { mealKey } = timeModal;
    if (tempDays === 'all') {
      setMealTimes(prev => ({ ...prev, [mealKey]: tempTime }));
      setMealTimesByDay(prev => {
        const d = JSON.parse(JSON.stringify(prev));
        for (const day in d) { if (d[day]) delete d[day][mealKey]; }
        return d;
      });
    } else if (Array.isArray(tempDays) && tempDays.length > 0) {
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
      <button onClick={() => setActiveSubTab(tabId)}
        className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-sm ${activeSubTab === tabId ? activeColors[color] : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}>
        {icon}{label}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {notification && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification(null)} />}

      {/* Modal de hora */}
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
                          <label key={i} className={`flex items-center gap-1 text-xs cursor-pointer px-2.5 py-1.5 rounded-lg border transition-colors ${tempDays.includes(i) ? 'bg-green-600 text-white border-green-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                            <input type="checkbox" checked={tempDays.includes(i)}
                              onChange={e => setTempDays(prev => e.target.checked ? [...prev, i] : prev.filter(d => d !== i))}
                              className="hidden" />
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

      <div className="flex flex-wrap gap-3 p-3 bg-gray-100 rounded-xl">
        <SubTabButton tabId="desarrollada" label="Por Desarrollada" icon={<ClipboardList size={16} />} color="blue" />
        <SubTabButton tabId="intercambio" label="Por Intercambio" icon={<Repeat size={16} />} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
            <Settings size={20} className="text-gray-500" /> Gestionar Menus y Horarios
          </h3>
          <div className="flex gap-3 mb-4">
            <input type="text" value={newMealName} onChange={e => setNewMealName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddMeal()}
              placeholder="Nombre del nuevo menu"
              className="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" />
            <button onClick={handleAddMeal} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm">
              <PlusCircle size={16} /> Anadir
            </button>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {mealSlots.map((mealKey, index) => (
              <div key={mealKey} draggable
                onDragStart={() => handleMealDragStart(index)}
                onDragEnter={() => handleMealDragEnter(index)}
                onDragEnd={handleMealDragEnd}
                onDragOver={e => e.preventDefault()}
                className="flex items-center justify-between p-2.5 bg-gray-50 border rounded-xl gap-2 cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-colors">
                <GripVertical size={16} className="text-gray-300 flex-shrink-0" />
                <span className="font-medium text-sm flex-grow text-gray-800">{mealKey}</span>
                <button onClick={() => openTimeModal(mealKey)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-700 bg-white border px-2 py-1 rounded-lg hover:border-green-400 transition-colors">
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
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><GripVertical size={12} /> Arrastra para reordenar</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
            <CalendarDays size={20} className="text-gray-500" /> Configuracion del Ciclo
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Numero de Dias</label>
            <select value={numberOfDays} onChange={e => setNumberOfDays(Number(e.target.value))}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none">
              {Array.from({ length: 14 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>{day} {day > 1 ? 'dias' : 'dia'}</option>
              ))}
            </select>
          </div>
          {numberOfDays > 1 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
              <p className="font-medium">Consejos</p>
              <ul className="text-xs mt-1 space-y-1 list-disc pl-4">
                <li>Configura horarios diferentes por dia con el boton de reloj.</li>
                <li>Nombra cada menu por dia con el icono de lapiz en cada menu.</li>
                <li>Contrae los dias para navegar mas rapido.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div>
        {activeSubTab === 'desarrollada' && (
          <FraccionamientoDesarrollada
            dietaActual={dietaActual || []}
            numberOfDays={numberOfDays}
            mealSlots={mealSlots}
            getMealTimeForDay={getMealTimeForDay}
            distribucion={distribucionDesarrollada}
            setDistribucion={setDistribucionDesarrollada}
            mealNamesByDay={mealNamesByDayDes}
            setMealNamesByDay={setMealNamesByDayDes}
            recetarios={recetariosDes}
            setRecetarios={setRecetariosDes}
            showNotification={showNotification}
          />
        )}
        {activeSubTab === 'intercambio' && (
          <FraccionamientoIntercambio
            planIntercambio={planIntercambio || {}}
            numberOfDays={numberOfDays}
            mealSlots={mealSlots}
            getMealTimeForDay={getMealTimeForDay}
            distribucion={distribucionIntercambio}
            setDistribucion={setDistribucionIntercambio}
            mealNamesByDay={mealNamesByDayInt}
            setMealNamesByDay={setMealNamesByDayInt}
            recetarios={recetariosInt}
            setRecetarios={setRecetariosInt}
            showNotification={showNotification}
            showNoDataWarning={!isPlanIntercambioProvided}
          />
        )}
      </div>
    </div>
  );
};

export default FraccionamientoTab;