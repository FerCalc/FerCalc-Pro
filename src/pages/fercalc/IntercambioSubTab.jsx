// src/IntercambioSubTab.jsx
// VERSIÓN CORREGIDA: Ahora envía el objeto piramideData para cálculos detallados en el fraccionamiento.

import React, { useState, useMemo, useEffect } from 'react';
import { Award, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const piramideData = {
  'Cereales': { calorias: 140.0, hc: 30.0, lipidos: 1.0, proteinas: 3.0 },
  'Verduras en gral': { calorias: 30.0, hc: 5.0, lipidos: 0.0, proteinas: 2.0 },
  'Verduras LC': { calorias: 10.0, hc: 2.5, lipidos: 0.0, proteinas: 0.0 },
  'Frutas': { calorias: 65.0, hc: 15.0, lipidos: 0.0, proteinas: 1.0 },
  'Carnes Altas en grasas': { calorias: 120.0, hc: 1.0, lipidos: 8.0, proteinas: 11.0 },
  'Carnes Bajas en grasas': { calorias: 65.0, hc: 1.0, lipidos: 2.0, proteinas: 11.0 },
  'Leguminosas': { calorias: 170.0, hc: 30.0, lipidos: 1.0, proteinas: 11.0 },
  'Lacteos Altos en grasa': { calorias: 110.0, hc: 9.0, lipidos: 6.0, proteinas: 5.0 },
  'Lacteos Medios en grasa': { calorias: 85.0, hc: 9.0, lipidos: 3.0, proteinas: 5.0 },
  'Lacteos Bajos en grasa': { calorias: 70.0, hc: 10.0, lipidos: 0.0, proteinas: 7.0 },
  'Aceite y grasas': { calorias: 180.0, hc: 0.0, lipidos: 20.0, proteinas: 0.0 },
  'Alimentos ricos en lípidos': { calorias: 175.0, hc: 5.0, lipidos: 15.0, proteinas: 5.0 },
  'Azúcar': { calorias: 20.0, hc: 5.0, lipidos: 0.0, proteinas: 0.0 },
};

const grupos = [
  { key: 'Cereales', label: 'Cereales' },
  { key: 'Verduras en gral', label: 'Verduras en gral' },
  { key: 'Verduras LC', label: 'Verduras LC' },
  { key: 'Frutas', label: 'Frutas' },
  { type: 'header', label: 'Carnes' },
  { key: 'Carnes Altas en grasas', label: 'Altas en grasas', indent: true },
  { key: 'Carnes Bajas en grasas', label: 'Bajas en grasas', indent: true },
  { key: 'Leguminosas', label: 'Leguminosas' },
  { type: 'header', label: 'Lácteos' },
  { key: 'Lacteos Altos en grasa', label: 'Altos en grasa', indent: true },
  { key: 'Lacteos Medios en grasa', label: 'Medios en grasa', indent: true },
  { key: 'Lacteos Bajos en grasa', label: 'Bajos en grasa', indent: true },
  { key: 'Aceite y grasas', label: 'Aceite y grasas' },
  { key: 'Alimentos ricos en lípidos', label: 'Alimentos ricos en lípidos' },
  { key: 'Azúcar', label: 'Azúcar' },
];

const IntercambioSubTab = ({ patientData, dietGoals, onPlanUpdate }) => {
  const [porciones, setPorciones] = useState(
    grupos.reduce((acc, grupo) => {
      if (grupo.key) acc[grupo.key] = '';
      return acc;
    }, {})
  );

  const calculosPorGrupo = useMemo(() => {
    const resultados = {};
    for (const grupo of grupos) {
      if (grupo.key) {
        const porcion = parseFloat(porciones[grupo.key]) || 0;
        const base = piramideData[grupo.key];
        resultados[grupo.key] = {
          calorias: base.calorias * porcion,
          hc: base.hc * porcion,
          lipidos: base.lipidos * porcion,
          proteinas: base.proteinas * porcion,
        };
      }
    }
    return resultados;
  }, [porciones]);

  const totalesCalculados = useMemo(() => {
    return Object.values(calculosPorGrupo).reduce(
      (acc, curr) => {
        acc.calorias += curr.calorias;
        acc.hc += curr.hc;
        acc.lipidos += curr.lipidos;
        acc.proteinas += curr.proteinas;
        return acc;
      },
      { calorias: 0, hc: 0, lipidos: 0, proteinas: 0 }
    );
  }, [calculosPorGrupo]);

  useEffect(() => {
    if (onPlanUpdate) {
      const porcionesConValor = Object.entries(porciones).reduce((acc, [key, value]) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue > 0) {
          acc[key] = numValue;
        }
        return acc;
      }, {});

      // --- CAMBIO CLAVE ---
      // Ahora el objeto enviado incluye 'piramideData' para que otros componentes puedan usarlo.
      const planCompleto = {
        porciones: porcionesConValor,
        totales: totalesCalculados,
        piramideData: piramideData // <-- AÑADIDO
      };
      
      onPlanUpdate(planCompleto);
    }
  }, [porciones, totalesCalculados, onPlanUpdate]);


  const handlePorcionChange = (key, value) => {
    const numValue = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
    setPorciones(prev => ({ ...prev, [key]: numValue }));
  };

  const objetivosCaloricos = useMemo(() => {
    const peso = patientData.weight || 0;
    return {
      disminuir: peso * 25,
      mantener: peso * 30,
      aumentar: peso * 35,
    };
  }, [patientData.weight]);

  const pavbCalculos = useMemo(() => {
    let pavbGrams = 0;
    const porcionesNum = Object.fromEntries(Object.entries(porciones).map(([k, v]) => [k, parseFloat(v) || 0]));

    const pavbAnimalKeys = [
      'Carnes Altas en grasas', 'Carnes Bajas en grasas',
      'Lacteos Altos en grasa', 'Lacteos Medios en grasa', 'Lacteos Bajos en grasa'
    ];
    pavbAnimalKeys.forEach(key => {
      pavbGrams += calculosPorGrupo[key]?.proteinas || 0;
    });

    const porcionesCereales = porcionesNum['Cereales'] || 0;
    const porcionesLeguminosas = porcionesNum['Leguminosas'] || 0;
    const numeroDePares = Math.min(porcionesCereales, porcionesLeguminosas);

    if (numeroDePares > 0) {
      const proteinaPorPorcionCereal = piramideData['Cereales'].proteinas;
      const proteinaPorPorcionLeguminosa = piramideData['Leguminosas'].proteinas;
      const pavbFromCereales = numeroDePares * proteinaPorPorcionCereal;
      const pavbFromLeguminosas = numeroDePares * proteinaPorPorcionLeguminosa;
      pavbGrams += pavbFromCereales + pavbFromLeguminosas;
    }

    const totalProteinas = totalesCalculados.proteinas;
    const pavbPercentage = totalProteinas > 0 ? (pavbGrams / totalProteinas) * 100 : 0;

    return {
      grams: pavbGrams,
      percentage: pavbPercentage
    };
  }, [calculosPorGrupo, porciones, totalesCalculados.proteinas]);
  
  const adecuacion = useMemo(() => {
    const objetivoGramos = {
        calorias: dietGoals.calorias,
        hc: dietGoals.hc,
        proteinas: dietGoals.proteina,
        lipidos: dietGoals.grasa,
    };

    return {
      calorias: objetivoGramos.calorias > 0 ? (totalesCalculados.calorias / objetivoGramos.calorias) * 100 : 0,
      hc: objetivoGramos.hc > 0 ? (totalesCalculados.hc / objetivoGramos.hc) * 100 : 0,
      proteinas: objetivoGramos.proteinas > 0 ? (totalesCalculados.proteinas / objetivoGramos.proteinas) * 100 : 0,
      lipidos: objetivoGramos.lipidos > 0 ? (totalesCalculados.lipidos / objetivoGramos.lipidos) * 100 : 0,
    };
  }, [totalesCalculados, dietGoals]);

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="overflow-x-auto border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Objetivos Calóricos por Peso</h3>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border font-semibold">Objetivo</th>
                <th className="p-2 border font-semibold">Calorías Sugeridas</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-blue-50">
                <td className="p-2 border flex items-center gap-2"><TrendingDown className="text-red-500" size={16}/> Disminuir</td>
                <td className="p-2 border font-bold text-red-600">{objetivosCaloricos.disminuir.toFixed(0)} kcal</td>
              </tr>
              <tr className="hover:bg-blue-50">
                <td className="p-2 border flex items-center gap-2"><Minus className="text-yellow-500" size={16}/> Mantener</td>
                <td className="p-2 border font-bold text-yellow-600">{objetivosCaloricos.mantener.toFixed(0)} kcal</td>
              </tr>
              <tr className="hover:bg-blue-50">
                <td className="p-2 border flex items-center gap-2"><TrendingUp className="text-green-500" size={16}/> Aumentar</td>
                <td className="p-2 border font-bold text-green-600">{objetivosCaloricos.aumentar.toFixed(0)} kcal</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-1">Basado en el peso actual de: {patientData.weight} kg</p>
        </div>
        
        <div className="border rounded-lg p-4 bg-indigo-50">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-indigo-800">
            <Award size={20} /> Proteína de Alto Valor Biológico (PAVB)
          </h3>
          <div className="space-y-3 mt-4">
            <div>
              <p className="text-sm font-medium text-indigo-700">Gramos PAVB</p>
              <p className="text-3xl font-bold text-indigo-600">{pavbCalculos.grams.toFixed(1)} g</p>
            </div>
            <div className="border-t pt-3">
              <p className="text-sm font-medium text-indigo-700">% PAVB del Total de Proteínas</p>
              <p className="text-3xl font-bold text-indigo-600">{pavbCalculos.percentage.toFixed(1)} %</p>
            </div>
          </div>
           <p className="text-xs text-gray-500 mt-2">Suma de proteínas de carnes, lácteos y la combinación 1 a 1 de cereales con leguminosas.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-green-100">
            <tr>
              <th className="p-2 border font-semibold">GRUPO</th>
              <th className="p-2 border font-semibold">PORCIONES</th>
              <th className="p-2 border font-semibold">CALORIAS</th>
              <th className="p-2 border font-semibold">HIDRATOS DE CARBONO (g)</th>
              <th className="p-2 border font-semibold">LÍPIDOS (g)</th>
              <th className="p-2 border font-semibold">PROTEÍNAS (g)</th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((grupo, index) => {
              if (grupo.type === 'header') {
                return (
                  <tr key={index} className="bg-gray-50">
                    <td className="p-2 border font-semibold" colSpan="6">{grupo.label}</td>
                  </tr>
                );
              }
              return (
                <tr key={grupo.key} className="hover:bg-gray-50">
                  <td className={`p-2 border ${grupo.indent ? 'pl-8' : ''}`}>{grupo.label}</td>
                  <td className="p-2 border w-24">
                    <input
                      type="number"
                      value={porciones[grupo.key]}
                      onChange={(e) => handlePorcionChange(grupo.key, e.target.value)}
                      className="w-full p-1 border rounded focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                      min="0"
                    />
                  </td>
                  <td className="p-2 border">{calculosPorGrupo[grupo.key]?.calorias.toFixed(1)}</td>
                  <td className="p-2 border">{calculosPorGrupo[grupo.key]?.hc.toFixed(1)}</td>
                  <td className="p-2 border">{calculosPorGrupo[grupo.key]?.lipidos.toFixed(1)}</td>
                  <td className="p-2 border">{calculosPorGrupo[grupo.key]?.proteinas.toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="font-bold">
            <tr className="bg-green-200">
              <td className="p-2 border" colSpan="2">TOTALES</td>
              <td className="p-2 border">{totalesCalculados.calorias.toFixed(1)}</td>
              <td className="p-2 border">{totalesCalculados.hc.toFixed(1)}</td>
              <td className="p-2 border">{totalesCalculados.lipidos.toFixed(1)}</td>
              <td className="p-2 border">{totalesCalculados.proteinas.toFixed(1)}</td>
            </tr>
            <tr className="bg-yellow-100">
              <td className="p-2 border" colSpan="2">% ADECUACION (vs. Objetivos)</td>
              <td className="p-2 border">{adecuacion.calorias.toFixed(1)}%</td>
              <td className="p-2 border">{adecuacion.hc.toFixed(1)}%</td>
              <td className="p-2 border">{adecuacion.lipidos.toFixed(1)}%</td>
              <td className="p-2 border">{adecuacion.proteinas.toFixed(1)}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default IntercambioSubTab;