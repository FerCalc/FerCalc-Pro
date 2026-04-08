// mi-app-frontend/src/pages/fercalc/DatosPacienteTab.jsx

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Target, Droplets, UtensilsCrossed, BookOpen, Calculator,
  Baby, CalendarDays, Scale, AlertCircle, Heart
} from 'lucide-react';

const getGestationalAgeCategory = (weeks) => {
  if (!weeks || weeks < 24) return null;
  if (weeks <= 36) return { text: 'Prematuro', color: 'text-orange-500' };
  if (weeks <= 41) return { text: 'A término', color: 'text-green-600' };
  if (weeks >= 42) return { text: 'Post-término', color: 'text-blue-500' };
  return { text: 'Semana inválida', color: 'text-red-500' };
};

const getBirthWeightCategory = (grams) => {
  if (!grams) return null;
  if (grams < 1000) return { text: 'Extremo bajo peso (EPBN)', color: 'text-red-600' };
  if (grams < 1500) return { text: 'Muy bajo peso (MBPN)', color: 'text-red-500' };
  if (grams < 2500) return { text: 'Bajo peso (BPN)', color: 'text-orange-500' };
  if (grams < 3000) return { text: 'Peso insuficiente', color: 'text-yellow-500' };
  if (grams < 4000) return { text: 'Peso ideal', color: 'text-green-600' };
  return { text: 'Macrosómico', color: 'text-purple-500' };
};

const formatCorrectedAge = (totalMonths) => {
  if (totalMonths === null || totalMonths === undefined || totalMonths < 0) return null;
  if (totalMonths < 1 / 30.44) return "Recién nacido (corregido)";
  const years = Math.floor(totalMonths / 12);
  const remainingMonthsDecimal = totalMonths % 12;
  const months = Math.floor(remainingMonthsDecimal);
  const weeks = Math.round((remainingMonthsDecimal - months) * 4);
  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
  if (weeks > 0) parts.push(`${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`);
  return parts.length > 0 ? parts.join(', ') : "Recién nacido (corregido)";
};

const MacroCalculator = ({ patientWeight, setDietGoals }) => {
  const [calcState, setCalcState] = useState({ calories: 2000, hc: 50, protein: 20, fat: 30 });
  const handleCalcChange = (e) => { setCalcState(prev => ({ ...prev, [e.target.name]: parseFloat(e.target.value) || 0 })); };
  const results = useMemo(() => {
    const { calories, hc, protein, fat } = calcState;
    const hcCalories = calories * (hc / 100);
    const proteinCalories = calories * (protein / 100);
    const fatCalories = calories * (fat / 100);
    const hcGrams = hcCalories / 4;
    const proteinGrams = proteinCalories / 4;
    const fatGrams = fatCalories / 9;
    const proteinPerKg = patientWeight > 0 ? proteinGrams / patientWeight : 0;
    return { hcGrams, proteinGrams, fatGrams, hcCalories, proteinCalories, fatCalories, proteinPerKg };
  }, [calcState, patientWeight]);
  const totalPercent = calcState.hc + calcState.protein + calcState.fat;
  const applyToGoals = () => {
    setDietGoals(prev => ({
      ...prev,
      calorias: calcState.calories,
      hc: results.hcGrams,
      proteina: results.proteinGrams,
      grasa: results.fatGrams,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold p-3 bg-gray-100 rounded-t-lg -m-6 mb-4 flex items-center gap-2">
        <Calculator size={20} />Cálculo de Macros
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div><label className="block text-sm font-medium">Calorías Totales</label><input type="number" name="calories" value={calcState.calories} onChange={handleCalcChange} className="mt-1 w-full p-2 border rounded"/></div>
          <div><label className="block text-sm font-medium">% Carbohidratos</label><input type="number" name="hc" value={calcState.hc} onChange={handleCalcChange} className="mt-1 w-full p-2 border rounded"/></div>
          <div><label className="block text-sm font-medium">% Proteínas</label><input type="number" name="protein" value={calcState.protein} onChange={handleCalcChange} className="mt-1 w-full p-2 border rounded"/></div>
          <div><label className="block text-sm font-medium">% Grasas</label><input type="number" name="fat" value={calcState.fat} onChange={handleCalcChange} className="mt-1 w-full p-2 border rounded"/></div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-sm font-medium text-gray-600">Macronutrientes</th>
                <th className="pb-2 text-sm font-medium text-gray-600 text-right">Gramos</th>
                <th className="pb-2 text-sm font-medium text-gray-600 text-right">Kcal</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="py-1">Carbohidratos</td><td className="text-lg font-bold text-right">{results.hcGrams.toFixed(1)}</td><td className="text-lg font-bold text-right">{results.hcCalories.toFixed(0)}</td></tr>
              <tr><td className="py-1">Proteínas</td><td className="text-lg font-bold text-right">{results.proteinGrams.toFixed(1)}</td><td className="text-lg font-bold text-right">{results.proteinCalories.toFixed(0)}</td></tr>
              <tr><td className="py-1">Grasas</td><td className="text-lg font-bold text-right">{results.fatGrams.toFixed(1)}</td><td className="text-lg font-bold text-right">{results.fatCalories.toFixed(0)}</td></tr>
            </tbody>
          </table>
          <div className="border-t pt-3">
            <p className="text-sm font-medium text-gray-600">Proteína / Kg Peso</p>
            <p className="text-lg font-bold">{results.proteinPerKg.toFixed(2)} g/kg</p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <p className={`text-sm font-bold ${totalPercent !== 100 ? 'text-red-500' : 'text-green-600'}`}>
          Total: {totalPercent.toFixed(0)}%
        </p>
        <button
          onClick={applyToGoals}
          disabled={totalPercent !== 100}
          className="mt-2 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          Aplicar a Objetivos
        </button>
      </div>
    </div>
  );
};

const DatosPacienteTab = ({ patientData, setPatientData, dietGoals, setDietGoals, dietaActual, annotations, setAnnotations, chronologicalAge, setChronologicalAge }) => {
  const handlePatientChange = (e) => setPatientData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleGoalChange = (e) => setDietGoals(prev => ({ ...prev, [e.target.name]: parseFloat(e.target.value) || 0 }));

  const [ageYears, setAgeYears] = useState('');
  const [ageMonths, setAgeMonths] = useState('');
  const [ageDays, setAgeDays] = useState('');
  const [gestationalAgeWeeks, setGestationalAgeWeeks] = useState('');
  const [birthWeightGrams, setBirthWeightGrams] = useState('');

  useEffect(() => {
    const years = parseInt(ageYears, 10) || 0;
    const months = parseInt(ageMonths, 10) || 0;
    const days = parseInt(ageDays, 10) || 0;
    let text = 'No ingresada';
    if (years > 0 || months > 0 || days > 0) {
      const parts = [];
      if (years > 0) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`);
      if (months > 0) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
      if (days > 0) parts.push(`${days} ${days === 1 ? 'día' : 'días'}`);
      text = parts.join(', ') || '0 días';
    }
    const totalMonthsValue = (years * 12) + months + (days / 30.44);
    const totalYearsValue = totalMonthsValue / 12;
    setChronologicalAge({ totalMonths: totalMonthsValue, totalYears: totalYearsValue, text });
  }, [ageYears, ageMonths, ageDays, setChronologicalAge]);

  useEffect(() => {
    if (chronologicalAge.totalYears !== patientData.age) {
      setPatientData(prev => ({ ...prev, age: chronologicalAge.totalYears }));
    }
  }, [chronologicalAge.totalYears, patientData.age, setPatientData]);

  const showGestationalAgeInput = chronologicalAge.totalYears > 0 && chronologicalAge.totalYears < 3;
  const isPremature = gestationalAgeWeeks >= 24 && gestationalAgeWeeks <= 36;
  const showBirthWeightInput = showGestationalAgeInput && isPremature;
  const gestationalAgeCategory = getGestationalAgeCategory(gestationalAgeWeeks);
  const birthWeightCategory = getBirthWeightCategory(birthWeightGrams);

  const correctedAgeResult = useMemo(() => {
    if (!showBirthWeightInput || !birthWeightGrams) return null;
    const weight = parseInt(birthWeightGrams, 10);
    const chronoYears = chronologicalAge.totalYears;
    let shouldUseCorrectedAge = false;
    if (chronoYears < 1 && weight < 2500) shouldUseCorrectedAge = true;
    else if (chronoYears >= 1 && chronoYears < 2 && weight < 1500) shouldUseCorrectedAge = true;
    else if (chronoYears >= 2 && chronoYears < 3 && weight < 1000) shouldUseCorrectedAge = true;
    if (!shouldUseCorrectedAge) return { applicable: false, message: "La edad corregida no aplica." };
    const correctionWeeks = 40 - parseInt(gestationalAgeWeeks, 10);
    const correctionMonths = correctionWeeks / 4;
    let correctedAgeInMonths = chronologicalAge.totalMonths - correctionMonths;
    if (correctedAgeInMonths < 0) correctedAgeInMonths = 0;
    return { applicable: true, formatted: formatCorrectedAge(correctedAgeInMonths) };
  }, [chronologicalAge, gestationalAgeWeeks, birthWeightGrams, showBirthWeightInput]);

  const imc = useMemo(() => {
    const h = patientData.height / 100;
    return h > 0 && patientData.weight > 0 ? (patientData.weight / (h * h)).toFixed(2) : 0;
  }, [patientData.weight, patientData.height]);

  const imcCategory = useMemo(() => {
    if (imc < 18.5) return "Bajo peso";
    if (imc < 24.9) return "Peso normal";
    if (imc < 29.9) return "Sobrepeso";
    return "Obesidad";
  }, [imc]);

  const analisisDieta = useMemo(() => {
    const safeDefaults = {
      totales: { calorias: 0, hc: 0, proteina: 0, grasa: 0, na: 0, k: 0, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 0 },
      macroPercentages: { hc: 0, proteina: 0, grasa: 0 },
      pavbPercentage: 0,
      agsPercentage: 0,
      agsGramos: 0,           // ✅ NUEVO
      hcSimplesPercentage: 0,
      hcSimplesGramos: 0,     // ✅ NUEVO
    };
    try {
      if (!dietaActual || dietaActual.length === 0) return safeDefaults;
      const totales = { calorias: 0, hc: 0, proteina: 0, grasa: 0, na: 0, k: 0, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 0 };
      let proteinasAnimales = 0, grasasAnimales = 0, hcSimples = 0;
      const categoriasHcSimples = ["LÁCTEOS", "FRUTAS A", "FRUTAS B", "FRUTAS C", "DULCES"];
      dietaActual.forEach(item => {
        if (!item || !item.alimento) return;
        const factor = (item.cantidadUsada || 0) > 0 && (item.alimento.cantidad || 0) > 0
          ? item.cantidadUsada / item.alimento.cantidad : 0;
        Object.keys(totales).forEach(key => { totales[key] += (item.alimento[key] || 0) * factor; });
        if (item.alimento.origen === 'animal') {
          proteinasAnimales += (item.alimento.proteina || 0) * factor;
          grasasAnimales += (item.alimento.grasa || 0) * factor;
        }
        if (categoriasHcSimples.includes(item.alimento.categoria)) {
          hcSimples += (item.alimento.hc || 0) * factor;
        }
      });
      const macroPercentages = {
        hc: totales.calorias > 0 ? ((totales.hc * 4) / totales.calorias) * 100 : 0,
        proteina: totales.calorias > 0 ? ((totales.proteina * 4) / totales.calorias) * 100 : 0,
        grasa: totales.calorias > 0 ? ((totales.grasa * 9) / totales.calorias) * 100 : 0,
      };
      const pavbPercentage = totales.proteina > 0 ? (proteinasAnimales / totales.proteina) * 100 : 0;
      const agsPercentage = totales.calorias > 0 ? (grasasAnimales * 9 * 100) / totales.calorias : 0;
      const hcSimplesPercentage = totales.calorias > 0 ? (hcSimples * 4 * 100) / totales.calorias : 0;
      return {
        totales,
        macroPercentages,
        pavbPercentage,
        agsPercentage,
        agsGramos: grasasAnimales,           // ✅ NUEVO
        hcSimplesPercentage,
        hcSimplesGramos: hcSimples,          // ✅ NUEVO
      };
    } catch (error) {
      console.error("Error en análisis de dieta:", error);
      return safeDefaults;
    }
  }, [dietaActual, dietGoals.pavbPercentage]);

  const {
    totales, macroPercentages, pavbPercentage,
    agsPercentage, agsGramos,
    hcSimplesPercentage, hcSimplesGramos
  } = analisisDieta;

  const goalUnits = {
    calorias: 'kcal', hc: 'g', proteina: 'g', grasa: 'g',
    na: 'mg', k: 'mg', p: 'mg', ca: 'mg', fe: 'mg',
    colesterol: 'mg', purinas: 'mg', fibra: 'g', agua: 'ml', pavbPercentage: '%'
  };
  const goalLabels = {
    calorias: 'Calorías', hc: 'Carbohidratos', proteina: 'Proteínas', grasa: 'Grasas',
    na: 'Sodio (Na)', k: 'Potasio (K)', p: 'Fósforo (P)', ca: 'Calcio (Ca)',
    fe: 'Hierro (Fe)', colesterol: 'Colesterol', purinas: 'Purinas',
    fibra: 'Fibra', agua: 'Agua', pavbPercentage: '% PAVB'
  };

  const ProgressBar = ({ label, currentValue, goalValue, unit }) => {
    const current = currentValue || 0;
    const goal = goalValue || 0;
    const percentage = goal > 0 ? (current / goal) * 100 : 0;
    const color = percentage > 100 ? 'bg-red-500' : 'bg-green-500';
    return (
      <div>
        <div className="flex justify-between mb-1 text-sm">
          <span className="font-medium text-gray-700">{label}</span>
          <span className="text-gray-500">{current.toFixed(1)} / {goal} {unit}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className={`${color} h-2.5 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
        </div>
      </div>
    );
  };

  // ✅ Determinar color del colesterol según objetivo
  const colesterolColor = () => {
    if (!dietGoals.colesterol || dietGoals.colesterol === 0) return 'text-gray-600';
    const pct = (totales.colesterol / dietGoals.colesterol) * 100;
    if (pct > 100) return 'text-red-600';
    if (pct > 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div id="datos-tab-content" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── COLUMNA IZQUIERDA ── */}
      <div className="lg:col-span-1 space-y-6">

        {/* Datos del paciente */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold p-3 bg-gray-100 rounded-t-lg -m-6 mb-4">Datos del Paciente</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Peso Actual (kg)</label>
              <input type="number" name="weight" value={patientData.weight} onChange={handlePatientChange} className="mt-1 block w-full px-3 py-2 border rounded-md"/>
            </div>
            <div>
              <label className="block text-sm font-medium">Altura (cm)</label>
              <input type="number" name="height" value={patientData.height} onChange={handlePatientChange} className="mt-1 block w-full px-3 py-2 border rounded-md"/>
            </div>

            <div>
              <label className="block text-sm font-medium">Edad</label>
              <div className="mt-2 grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="ageYears" className="block text-xs text-gray-500">Años</label>
                  <input type="number" id="ageYears" value={ageYears} onChange={e => setAgeYears(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" placeholder="p. ej., 1"/>
                </div>
                <div>
                  <label htmlFor="ageMonths" className="block text-xs text-gray-500">Meses</label>
                  <input type="number" id="ageMonths" value={ageMonths} onChange={e => setAgeMonths(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" placeholder="p. ej., 6"/>
                </div>
                <div>
                  <label htmlFor="ageDays" className="block text-xs text-gray-500">Días</label>
                  <input type="number" id="ageDays" value={ageDays} onChange={e => setAgeDays(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" placeholder="p. ej., 15"/>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Sexo</label>
              <select name="sex" value={patientData.sex} onChange={handlePatientChange} className="mt-1 block w-full px-3 py-2 border rounded-md">
                <option>Masculino</option>
                <option>Femenino</option>
              </select>
            </div>

            {patientData.sex === 'Femenino' && chronologicalAge.totalYears >= 12 && (
              <div className="border-t-2 border-green-200 pt-4 mt-4 space-y-4">
                <h4 className="font-semibold text-md text-green-800">Datos del Embarazo</h4>
                <div>
                  <label className="block text-sm font-medium">¿Está embarazada?</label>
                  <select name="estaEmbarazada" value={patientData.estaEmbarazada} onChange={handlePatientChange} className="mt-1 block w-full px-3 py-2 border rounded-md">
                    <option value="No">No</option>
                    <option value="Sí">Sí</option>
                  </select>
                </div>
                {patientData.estaEmbarazada === 'Sí' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium">Peso Pre-Gestacional (kg)</label>
                      <input type="number" name="pesoPreGestacional" value={patientData.pesoPreGestacional} onChange={handlePatientChange} className="mt-1 block w-full px-3 py-2 border rounded-md"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Semanas de Gestación</label>
                      <input type="number" name="semanasGestacion" value={patientData.semanasGestacion} onChange={handlePatientChange} className="mt-1 block w-full px-3 py-2 border rounded-md"/>
                    </div>
                  </>
                )}
              </div>
            )}

            {showGestationalAgeInput && (
              <div className="mt-4">
                <label htmlFor="gestationalAge" className="block text-sm font-medium">Edad Gestacional al Nacer (semanas)</label>
                <input type="number" id="gestationalAge" value={gestationalAgeWeeks} onChange={e => setGestationalAgeWeeks(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" placeholder="Ej: 32"/>
                {gestationalAgeCategory && <p className={`mt-1 text-sm font-semibold ${gestationalAgeCategory.color}`}>{gestationalAgeCategory.text}</p>}
              </div>
            )}

            {showBirthWeightInput && (
              <div className="mt-4">
                <label htmlFor="birthWeight" className="block text-sm font-medium">Peso de Nacimiento (gramos)</label>
                <input type="number" id="birthWeight" value={birthWeightGrams} onChange={e => setBirthWeightGrams(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" placeholder="Ej: 1800"/>
                {birthWeightCategory && <p className={`mt-1 text-sm font-semibold ${birthWeightCategory.color}`}>{birthWeightCategory.text}</p>}
              </div>
            )}

            <div className="mt-6 border-t border-gray-200 pt-4 space-y-3">
              <div className="flex items-start">
                <CalendarDays className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0"/>
                <div>
                  <p className="font-medium text-gray-800">Edad Cronológica</p>
                  <p className="text-gray-600">{chronologicalAge.text}</p>
                </div>
              </div>
              {correctedAgeResult && (
                <div>
                  {correctedAgeResult.applicable ? (
                    <div className="flex items-start p-3 bg-indigo-50 rounded-lg mt-2">
                      <Baby className="h-5 w-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0"/>
                      <div>
                        <p className="font-semibold text-indigo-800">Edad Corregida (para curvas)</p>
                        <p className="text-indigo-700 text-base font-bold">{correctedAgeResult.formatted}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start p-3 bg-yellow-50 rounded-lg mt-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0"/>
                      <div>
                        <p className="font-semibold text-yellow-800">Edad Corregida</p>
                        <p className="text-yellow-700 text-sm">{correctedAgeResult.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* IMC + PAVB + AGS + HC Simples + Colesterol */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">

          {/* IMC */}
          <div>
            <h3 className="text-lg font-semibold mb-1">Índice de Masa Corporal (IMC)</h3>
            <p className="text-3xl font-bold text-green-600">{imc}</p>
            <p className="text-md text-gray-600">{imcCategory}</p>
          </div>

          {/* PAVB */}
<div className="border-t pt-4">
  <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
    <Target size={20} className="text-blue-500" />PAVB
  </h3>
  <p className="text-sm text-gray-500">Proteinas de Alto Valor Biologico.</p>
  <div className="grid grid-cols-2 gap-3 mt-2 mb-3">
    <div className="bg-blue-50 p-3 rounded-xl">
      <p className="text-xs text-blue-600 font-medium">Consumido</p>
      <p className="text-xl font-bold text-blue-700">
        {(totales.proteina > 0 ? (pavbPercentage / 100) * totales.proteina : 0).toFixed(1)} g
      </p>
      <p className="text-xs text-blue-400">{pavbPercentage.toFixed(1)}% del total</p>
    </div>
    <div className="bg-indigo-50 p-3 rounded-xl">
      <p className="text-xs text-indigo-600 font-medium">Objetivo</p>
      <p className="text-xl font-bold text-indigo-700">{dietGoals.pavbPercentage}%</p>
      {/* ✅ NUEVO: muestra a cuántos gramos equivale el % objetivo */}
      <p className="text-xs text-indigo-400">
        = {totales.proteina > 0
          ? ((dietGoals.pavbPercentage / 100) * totales.proteina).toFixed(1)
          : (dietGoals.pavbPercentage > 0 && dietGoals.proteina > 0
              ? ((dietGoals.pavbPercentage / 100) * dietGoals.proteina).toFixed(1)
              : '0.0')
        } g de proteina
      </p>
    </div>
  </div>
  <ProgressBar label="PAVB" currentValue={pavbPercentage} goalValue={dietGoals.pavbPercentage} unit="%" />
</div>
          {/* ✅ AGS — con % y gramos */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <Droplets size={20} className="text-orange-500"/>AGS
            </h3>
            <p className="text-sm text-gray-500">Ácidos Grasos Saturados de la dieta actual.</p>
            <div className="flex items-end gap-4 mt-1">
              <div>
                <p className="text-xs text-gray-500">Porcentaje calórico</p>
                <p className="text-2xl font-bold text-orange-600">{agsPercentage.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gramos</p>
                <p className="text-2xl font-bold text-orange-400">{agsGramos.toFixed(1)} g</p>
              </div>
            </div>
          </div>

          {/* ✅ HC Simples — con % y gramos */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <UtensilsCrossed size={20} className="text-purple-500"/>HC Simples
            </h3>
            <p className="text-sm text-gray-500">Carbohidratos Simples de la dieta actual.</p>
            <div className="flex items-end gap-4 mt-1">
              <div>
                <p className="text-xs text-gray-500">Porcentaje calórico</p>
                <p className="text-2xl font-bold text-purple-600">{hcSimplesPercentage.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gramos</p>
                <p className="text-2xl font-bold text-purple-400">{hcSimplesGramos.toFixed(1)} g</p>
              </div>
            </div>
          </div>

          {/* ✅ COLESTEROL — nuevo */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <Heart size={20} className="text-red-500"/>Colesterol
            </h3>
            <p className="text-sm text-gray-500">Colesterol calculado de la dieta actual.</p>
            <div className="flex items-end gap-4 mt-1">
              <div>
                <p className="text-xs text-gray-500">Consumido</p>
                <p className={`text-2xl font-bold ${colesterolColor()}`}>
                  {totales.colesterol.toFixed(1)} mg
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Objetivo</p>
                <p className="text-2xl font-bold text-gray-500">
                  {dietGoals.colesterol} mg
                </p>
              </div>
            </div>
            {/* Barra de progreso colesterol */}
            <div className="mt-2">
              <ProgressBar
                label="Colesterol"
                currentValue={totales.colesterol}
                goalValue={dietGoals.colesterol}
                unit="mg"
              />
            </div>
          </div>

        </div>
      </div>

      {/* ── COLUMNA DERECHA ── */}
      <div className="lg:col-span-2 space-y-6">
        <MacroCalculator patientWeight={patientData.weight} setDietGoals={setDietGoals} />

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold p-3 bg-gray-100 rounded-t-lg -m-6 mb-4">Objetivos Nutricionales</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.keys(goalLabels).map(key => (
              <div key={key}>
                <label className="block text-sm font-medium capitalize">{goalLabels[key]} ({goalUnits[key]})</label>
                <input type="number" name={key} value={dietGoals[key]} onChange={handleGoalChange} className="mt-1 block w-full px-3 py-2 border rounded-md"/>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold p-3 bg-gray-100 rounded-t-lg -m-6 mb-4">Resumen de Progreso de la Dieta</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(goalLabels).filter(key => key !== 'pavbPercentage').map(key => (
              <ProgressBar
                key={key}
                label={goalLabels[key]}
                currentValue={totales[key] || 0}
                goalValue={dietGoals[key]}
                unit={goalUnits[key]}
              />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm font-medium text-gray-500">% HC</div>
              <div className="text-xl font-bold">{macroPercentages.hc.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">% Proteínas</div>
              <div className="text-xl font-bold">{macroPercentages.proteina.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">% Grasas</div>
              <div className="text-xl font-bold">{macroPercentages.grasa.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold p-3 bg-gray-100 rounded-t-lg -m-6 mb-4 flex items-center gap-2">
            <BookOpen size={20}/>Anotaciones
          </h3>
          <textarea
            value={annotations}
            onChange={e => setAnnotations(e.target.value)}
            placeholder="Escribe tus notas aquí..."
            className="w-full h-32 p-2 border rounded-md mt-2"
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default DatosPacienteTab;