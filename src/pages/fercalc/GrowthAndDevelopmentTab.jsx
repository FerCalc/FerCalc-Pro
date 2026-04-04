import React, { useState, useMemo, useEffect } from 'react';
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, Area, Legend } from 'recharts';
import { AlertTriangle, CheckCircle, TrendingDown, Baby, Ruler, Weight, Info } from 'lucide-react';

// --- DATOS OMS (Z-scores) ---
const whoData = {
    boy: {
        wfa: [ { month: 0, neg3: 2.1, neg2: 2.5, neg1: 2.9, median: 3.3, pos1: 3.9, pos2: 4.4, pos3: 5.0 }, { month: 2, neg3: 3.8, neg2: 4.3, neg1: 4.9, median: 5.6, pos1: 6.3, pos2: 7.1, pos3: 8.0 }, { month: 6, neg3: 5.7, neg2: 6.4, neg1: 7.1, median: 7.9, pos1: 8.8, pos2: 9.8, pos3: 11.0 }, { month: 12, neg3: 7.0, neg2: 7.8, neg1: 8.6, median: 9.6, pos1: 10.8, pos2: 12.0, pos3: 13.3 }, { month: 18, neg3: 7.9, neg2: 8.8, neg1: 9.8, median: 10.9, pos1: 12.2, pos2: 13.7, pos3: 15.3 }, { month: 24, neg3: 8.6, neg2: 9.7, neg1: 10.8, median: 12.2, pos1: 13.6, pos2: 15.3, pos3: 17.2 }, { month: 36, neg3: 9.9, neg2: 11.0, neg1: 12.2, median: 14.3, pos1: 15.7, pos2: 17.5, pos3: 19.5 }, { month: 48, neg3: 11.1, neg2: 12.3, neg1: 13.6, median: 16.3, pos1: 17.9, pos2: 20.0, pos3: 22.3 }, { month: 60, neg3: 12.2, neg2: 13.6, neg1: 15.0, median: 18.3, pos1: 20.1, pos2: 22.5, pos3: 25.2 } ],
        lfa: [ { month: 0, neg3: 44.2, neg2: 46.1, neg1: 48.0, median: 49.9, pos1: 51.8, pos2: 53.7, pos3: 55.6 }, { month: 2, neg3: 52.8, neg2: 54.7, neg1: 56.7, median: 58.6, pos1: 60.6, pos2: 62.4, pos3: 64.3 }, { month: 6, neg3: 61.8, neg2: 63.6, neg1: 65.6, median: 67.6, pos1: 69.6, pos2: 71.6, pos3: 73.5 }, { month: 12, neg3: 69.2, neg2: 71.3, neg1: 73.4, median: 75.7, pos1: 78.0, pos2: 80.3, pos3: 82.5 }, { month: 18, neg3: 74.5, neg2: 76.5, neg1: 78.6, median: 81.2, pos1: 83.8, pos2: 86.5, pos3: 89.0 }, { month: 24, neg3: 78.0, neg2: 81.0, neg1: 83.2, median: 86.4, pos1: 89.6, pos2: 92.9, pos3: 96.1 }, { month: 36, neg3: 85.1, neg2: 88.7, neg1: 91.2, median: 95.1, pos1: 98.9, pos2: 102.8, pos3: 106.6 }, { month: 48, neg3: 91.3, neg2: 94.9, neg1: 97.6, median: 102.3, pos1: 106.9, pos2: 111.5, pos3: 116.0 }, { month: 60, neg3: 96.9, neg2: 100.7, neg1: 103.5, median: 108.9, pos1: 114.2, pos2: 119.5, pos3: 124.8 } ],
        hcfa: [ { month: 0, neg3: 31.2, neg2: 32.1, neg1: 33.4, median: 34.7, pos1: 36.0, pos2: 37.3, pos3: 38.2 }, { month: 2, neg3: 36.0, neg2: 36.9, neg1: 38.2, median: 39.5, pos1: 40.8, pos2: 42.0, pos3: 43.0 }, { month: 6, neg3: 40.5, neg2: 41.5, neg1: 42.8, median: 44.2, pos1: 45.5, pos2: 46.8, pos3: 47.8 }, { month: 12, neg3: 43.0, neg2: 44.0, neg1: 45.4, median: 46.8, pos1: 48.2, pos2: 49.5, pos3: 50.5 }, { month: 24, neg3: 45.5, neg2: 46.5, neg1: 47.9, median: 49.3, pos1: 50.7, pos2: 52.0, pos3: 53.1 }, { month: 36, neg3: 46.8, neg2: 47.9, neg1: 49.2, median: 50.7, pos1: 52.1, pos2: 53.5, pos3: 54.6 }, { month: 48, neg3: 47.5, neg2: 48.6, neg1: 50.0, median: 51.5, pos1: 53.0, pos2: 54.4, pos3: 55.5 }, { month: 60, neg3: 48.0, neg2: 49.1, neg1: 50.5, median: 52.0, pos1: 53.5, pos2: 54.9, pos3: 56.0 } ],
        wfh: [ { height: 65, neg3: 5.8, neg2: 6.3, neg1: 6.8, median: 7.3, pos1: 8.0, pos2: 8.7, pos3: 9.5 }, { height: 70, neg3: 6.7, neg2: 7.2, neg1: 7.8, median: 8.4, pos1: 9.1, pos2: 10.0, pos3: 10.9 }, { height: 75, neg3: 7.6, neg2: 8.2, neg1: 8.8, median: 9.5, pos1: 10.3, pos2: 11.2, pos3: 12.3 }, { height: 80, neg3: 8.5, neg2: 9.2, neg1: 9.9, median: 10.7, pos1: 11.6, pos2: 12.7, pos3: 13.9 }, { height: 85, neg3: 9.8, neg2: 10.5, neg1: 11.3, median: 12.3, pos1: 13.3, pos2: 14.5, pos3: 15.8 }, { height: 90, neg3: 10.5, neg2: 11.3, neg1: 12.1, median: 13.1, pos1: 14.2, pos2: 15.5, pos3: 16.9 }, { height: 95, neg3: 11.8, neg2: 12.7, neg1: 13.7, median: 14.8, pos1: 16.0, pos2: 17.4, pos3: 19.0 }, { height: 100, neg3: 12.7, neg2: 13.6, neg1: 14.6, median: 15.8, pos1: 17.1, pos2: 18.6, pos3: 20.4 }, { height: 105, neg3: 14.0, neg2: 15.1, neg1: 16.3, median: 17.7, pos1: 19.2, pos2: 21.0, pos3: 23.0 }, { height: 110, neg3: 15.2, neg2: 16.4, neg1: 17.7, median: 19.4, pos1: 21.0, pos2: 23.0, pos3: 25.2 }, { height: 115, neg3: 16.5, neg2: 17.9, neg1: 19.4, median: 21.2, pos1: 23.2, pos2: 25.4, pos3: 27.9 }, { height: 120, neg3: 17.9, neg2: 19.4, neg1: 21.1, median: 23.0, pos1: 25.2, pos2: 27.7, pos3: 30.5 } ],
        lfa_5_19: [ { month: 60, neg3: 99.9, neg2: 104.1, neg1: 108.3, median: 112.5, pos1: 116.7, pos2: 120.9, pos3: 125.1 }, { month: 120, neg3: 125.2, neg2: 130.5, neg1: 135.8, median: 141.1, pos1: 146.4, pos2: 151.7, pos3: 157.0 }, { month: 180, neg3: 154.3, neg2: 160.5, neg1: 166.7, median: 173.0, pos1: 179.2, pos2: 185.4, pos3: 191.6 }, { month: 228, neg3: 158.4, neg2: 164.8, neg1: 171.1, median: 177.5, pos1: 183.9, pos2: 190.2, pos3: 196.6 } ],
        bmifa_5_19: [ { month: 60, neg3: 12.7, neg2: 13.4, neg1: 14.2, median: 15.3, pos1: 16.6, pos2: 18.0, pos3: 19.8 }, { month: 120, neg3: 14.0, neg2: 15.0, neg1: 16.1, median: 17.8, pos1: 19.9, pos2: 22.1, pos3: 24.8 }, { month: 180, neg3: 16.2, neg2: 17.5, neg1: 19.0, median: 21.2, pos1: 24.0, pos2: 27.0, pos3: 30.5 }, { month: 228, neg3: 17.3, neg2: 18.7, neg1: 20.3, median: 22.8, pos1: 25.8, pos2: 29.2, pos3: 33.0 } ],
    },
    girl: {
        wfa: [ { month: 0, neg3: 2.0, neg2: 2.4, neg1: 2.8, median: 3.2, pos1: 3.7, pos2: 4.2, pos3: 4.8 }, { month: 2, neg3: 3.4, neg2: 3.9, neg1: 4.5, median: 5.1, pos1: 5.8, pos2: 6.6, pos3: 7.5 }, { month: 6, neg3: 5.1, neg2: 5.7, neg1: 6.4, median: 7.3, pos1: 8.2, pos2: 9.3, pos3: 10.6 }, { month: 12, neg3: 6.5, neg2: 7.1, neg1: 7.9, median: 8.9, pos1: 10.0, pos2: 11.4, pos3: 12.9 }, { month: 18, neg3: 7.4, neg2: 8.2, neg1: 9.1, median: 10.2, pos1: 11.6, pos2: 13.2, pos3: 14.8 }, { month: 24, neg3: 8.1, neg2: 8.9, neg1: 10.0, median: 11.5, pos1: 13.0, pos2: 14.8, pos3: 16.9 }, { month: 36, neg3: 9.4, neg2: 10.5, neg1: 11.8, median: 13.9, pos1: 15.4, pos2: 17.2, pos3: 19.2 }, { month: 48, neg3: 10.6, neg2: 11.8, neg1: 13.2, median: 15.8, pos1: 17.5, pos2: 19.5, pos3: 21.8 }, { month: 60, neg3: 11.8, neg2: 13.1, neg1: 14.6, median: 17.7, pos1: 19.7, pos2: 22.1, pos3: 24.8 } ],
        lfa: [ { month: 0, neg3: 43.6, neg2: 45.4, neg1: 47.3, median: 49.1, pos1: 51.0, pos2: 52.9, pos3: 54.7 }, { month: 2, neg3: 51.2, neg2: 53.0, neg1: 55.0, median: 57.1, pos1: 59.1, pos2: 61.1, pos3: 63.2 }, { month: 6, neg3: 59.5, neg2: 61.5, neg1: 63.5, median: 65.7, pos1: 67.9, pos2: 70.0, pos3: 72.2 }, { month: 12, neg3: 67.1, neg2: 68.9, neg1: 71.4, median: 74.0, pos1: 76.6, pos2: 79.2, pos3: 81.7 }, { month: 18, neg3: 72.8, neg2: 75.0, neg1: 77.5, median: 80.7, pos1: 83.2, pos2: 85.7, pos3: 88.0 }, { month: 24, neg3: 77.2, neg2: 79.1, neg1: 81.7, median: 85.5, pos1: 88.0, pos2: 90.7, pos3: 93.2 }, { month: 36, neg3: 83.9, neg2: 87.4, neg1: 90.7, median: 94.1, pos1: 97.6, pos2: 101.0, pos3: 104.5 }, { month: 48, neg3: 89.8, neg2: 93.5, neg1: 96.8, median: 101.6, pos1: 106.4, pos2: 111.2, pos3: 116.0 }, { month: 60, neg3: 95.2, neg2: 99.0, neg1: 102.7, median: 108.0, pos1: 113.3, pos2: 118.6, pos3: 124.0 } ],
        hcfa: [ { month: 0, neg3: 30.9, neg2: 31.7, neg1: 33.0, median: 34.2, pos1: 35.5, pos2: 36.6, pos3: 37.6 }, { month: 2, neg3: 35.1, neg2: 36.0, neg1: 37.3, median: 38.7, pos1: 40.0, pos2: 41.2, pos3: 42.2 }, { month: 6, neg3: 39.2, neg2: 40.2, neg1: 41.6, median: 43.0, pos1: 44.4, pos2: 45.8, pos3: 46.8 }, { month: 12, neg3: 41.7, neg2: 42.8, neg1: 44.2, median: 45.7, pos1: 47.1, pos2: 48.5, pos3: 49.5 }, { month: 24, neg3: 44.5, neg2: 45.5, neg1: 46.9, median: 48.3, pos1: 49.7, pos2: 51.1, pos3: 52.2 }, { month: 36, neg3: 45.8, neg2: 46.9, neg1: 48.3, median: 49.8, pos1: 51.2, pos2: 52.6, pos3: 53.7 }, { month: 48, neg3: 46.5, neg2: 47.6, neg1: 49.0, median: 50.5, pos1: 52.0, pos2: 53.4, pos3: 54.5 }, { month: 60, neg3: 47.0, neg2: 48.1, neg1: 49.5, median: 51.0, pos1: 52.5, pos2: 53.9, pos3: 55.0 } ],
        wfh: [ { height: 65, neg3: 5.6, neg2: 6.1, neg1: 6.6, median: 7.1, pos1: 7.7, pos2: 8.4, pos3: 9.2 }, { height: 70, neg3: 6.5, neg2: 7.0, neg1: 7.5, median: 8.2, pos1: 8.9, pos2: 9.7, pos3: 10.6 }, { height: 75, neg3: 7.4, neg2: 8.0, neg1: 8.6, median: 9.3, pos1: 10.1, pos2: 11.0, pos3: 12.0 }, { height: 80, neg3: 8.3, neg2: 9.0, neg1: 9.7, median: 10.5, pos1: 11.4, pos2: 12.4, pos3: 13.6 }, { height: 85, neg3: 9.5, neg2: 10.2, neg1: 11.0, median: 12.0, pos1: 13.0, pos2: 14.1, pos3: 15.4 }, { height: 90, neg3: 10.3, neg2: 11.1, neg1: 11.9, median: 12.9, pos1: 14.1, pos2: 15.3, pos3: 16.7 }, { height: 95, neg3: 11.5, neg2: 12.3, neg1: 13.3, median: 14.4, pos1: 15.7, pos2: 17.1, pos3: 18.7 }, { height: 100, neg3: 12.5, neg2: 13.5, neg1: 14.5, median: 15.8, pos1: 17.2, pos2: 18.8, pos3: 20.6 }, { height: 105, neg3: 13.7, neg2: 14.8, neg1: 16.0, median: 17.5, pos1: 19.1, pos2: 21.0, pos3: 23.1 }, { height: 110, neg3: 14.9, neg2: 16.1, neg1: 17.5, median: 19.2, pos1: 21.0, pos2: 23.1, pos3: 25.5 }, { height: 115, neg3: 16.2, neg2: 17.6, neg1: 19.2, median: 21.0, pos1: 23.1, pos2: 25.5, pos3: 28.1 }, { height: 120, neg3: 17.5, neg2: 19.1, neg1: 20.8, median: 22.8, pos1: 25.1, pos2: 27.7, pos3: 30.7 } ],
        lfa_5_19: [ { month: 60, neg3: 98.1, neg2: 102.7, neg1: 107.3, median: 112.0, pos1: 116.6, pos2: 121.2, pos3: 125.8 }, { month: 120, neg3: 124.5, neg2: 130.1, neg1: 135.7, median: 141.3, pos1: 146.9, pos2: 152.5, pos3: 158.1 }, { month: 180, neg3: 147.2, neg2: 152.6, neg1: 158.0, median: 163.4, pos1: 168.8, pos2: 174.2, pos3: 179.6 }, { month: 228, neg3: 148.0, neg2: 153.5, neg1: 159.0, median: 164.5, pos1: 170.0, pos2: 175.5, pos3: 181.0 } ],
        bmifa_5_19: [ { month: 60, neg3: 12.3, neg2: 13.0, neg1: 13.8, median: 15.0, pos1: 16.4, pos2: 18.0, pos3: 20.0 }, { month: 120, neg3: 13.8, neg2: 14.8, neg1: 16.0, median: 17.7, pos1: 20.0, pos2: 22.5, pos3: 25.5 }, { month: 180, neg3: 15.8, neg2: 17.2, neg1: 18.8, median: 21.0, pos1: 23.8, pos2: 27.0, pos3: 30.8 }, { month: 228, neg3: 16.5, neg2: 18.0, neg1: 19.7, median: 22.2, pos1: 25.2, pos2: 28.8, pos3: 33.0 } ],
    }
};

// --- CONFIGURACIÓN ---
// ▼▼▼ ¡REEMPLAZA ESTE BLOQUE CON EL CÓDIGO DEL SIMULADOR! ▼▼▼
const legendColorCodes = {
    red: '#EF4444',
    orange: '#F97316',
    yellow: '#EAB308',
    green: '#22C55E'
};

const zoneColors = {
    red:    legendColorCodes.red,
    orange: legendColorCodes.orange,
    yellow: legendColorCodes.yellow,
    green:  legendColorCodes.green,
};
// ▲▲▲ ¡REEMPLAZA ESTE BLOQUE CON EL CÓDIGO DEL SIMULADOR! ▲▲▲

const chartConfig = {
    pe: { key: 'pe', name: 'P/E', title: 'Peso para la Edad (0-2 años)', icon: Weight, unit: 'kg', dataKey: 'wfa', xAxisKey: 'month',
        diagnostics: (val, sds) => {
            if (val < sds.neg3) return { text: 'Desnutrición grave', color: 'red' };
            if (val < sds.neg2) return { text: 'Desnutrición moderada', color: 'orange' };
            if (val < sds.neg1) return { text: 'En riesgo de desnutrición', color: 'yellow' };
            return { text: 'Adecuado', color: 'green' };
        },
        legendMap: { green: 'Adecuado', yellow: 'En riesgo de desnutrición', orange: 'Desnutrición moderada', red: 'Desnutrición grave' }
    },
    te: { key: 'te', name: 'T/E', title: 'Talla para la Edad', icon: Ruler, unit: 'cm', dataKey: 'lfa', xAxisKey: 'month',
        diagnostics: (val, sds) => {
            if (val < sds.neg3) return { text: 'Talla muy baja', color: 'red' };
            if (val < sds.neg2) return { text: 'Talla baja', color: 'orange' };
            if (val < sds.neg1) return { text: 'En riesgo de talla baja', color: 'yellow' };
            return { text: 'Talla adecuada', color: 'green' };
        },
        legendMap: { green: 'Talla adecuada', yellow: 'En riesgo de talla baja', orange: 'Talla baja', red: 'Talla muy baja' }
    },
    hc: { key: 'hc', name: 'C. Cefálica', title: 'Perímetro Cefálico (0-3 años)', icon: Baby, unit: 'cm', dataKey: 'hcfa', xAxisKey: 'month',
        diagnostics: (val, sds) => {
            if (val > sds.pos2) return { text: 'Macrocefalia', color: 'red' };
            if (val > sds.pos1) return { text: 'Riesgo de Macrocefalia', color: 'yellow' };
            if (val < sds.neg2) return { text: 'Microcefalia', color: 'red' };
            if (val < sds.neg1) return { text: 'Riesgo de Microcefalia', color: 'yellow' };
            return { text: 'Adecuado', color: 'green' };
        },
        legendMap: { red: 'Microcefalia / Macrocefalia', yellow: 'Riesgo de Micro/Macrocefalia', green: 'Adecuado' }
    },
    pt: { key: 'pt', name: 'P/T', title: 'Peso para la Talla (2-5 años)', icon: Weight, unit: 'kg', dataKey: 'wfh', xAxisKey: 'height',
        diagnostics: (val, sds) => {
            if (val > sds.pos2) return { text: 'Obesidad', color: 'red' };
            if (val > sds.pos1) return { text: 'Sobrepeso', color: 'yellow' };
            if (val < sds.neg3) return { text: 'Desnutrición grave', color: 'red' };
            if (val < sds.neg2) return { text: 'Desnutrición moderada', color: 'orange' };
            if (val < sds.neg1) return { text: 'En riesgo de desnutrición', color: 'yellow' };
            return { text: 'Adecuado', color: 'green' };
        },
        legendMap: { red: 'Obesidad / Desnutrición grave', orange: 'Desnutrición moderada', yellow: 'Sobrepeso / Riesgo de desnutrición', green: 'Adecuado' }
    },
    bmifa_5_19: { key: 'bmifa_5_19', name: 'IMC/E', title: 'IMC para la Edad (5-19 años)', icon: Weight, unit: 'IMC', dataKey: 'bmifa_5_19', xAxisKey: 'month',
        diagnostics: (val, sds) => {
            if (val > sds.pos2) return { text: 'Obesidad', color: 'red' };
            if (val > sds.pos1) return { text: 'Sobrepeso', color: 'yellow' };
            if (val < sds.neg2) return { text: 'Desnutrición', color: 'red' };
            if (val < sds.neg1) return { text: 'En riesgo de desnutrición', color: 'yellow' };
            return { text: 'Adecuado', color: 'green' };
        },
        legendMap: { red: 'Obesidad / Desnutrición', yellow: 'Sobrepeso / Riesgo de desnutrición', green: 'Adecuado' }
    },
    lfa_5_19: { key: 'lfa_5_19', name: 'T/E', title: 'Talla para la Edad (5-19 años)', icon: Ruler, unit: 'cm', dataKey: 'lfa_5_19', xAxisKey: 'month',
        diagnostics: (val, sds) => {
            if (val < sds.neg3) return { text: 'Talla muy baja', color: 'red' };
            if (val < sds.neg2) return { text: 'Talla baja', color: 'orange' };
            if (val < sds.neg1) return { text: 'En riesgo de talla baja', color: 'yellow' };
            return { text: 'Talla adecuada', color: 'green' };
        },
        legendMap: { green: 'Talla adecuada', yellow: 'En riesgo de talla baja', orange: 'Talla baja', red: 'Talla muy baja' }
    },
};

const interpolate = (x, x0, x1, y0, y1) => { if (x1 === x0) return y0; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); };

const formatAge = (totalMonths) => {
    if (totalMonths < 12) return `${totalMonths} meses`;
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    if (months === 0) return `${years} años`;
    return `${years} años y ${months} meses`;
};

const CustomLegend = (props) => {
    const { legendMap } = props;
    if (!legendMap) return null;

    const order = ['green', 'yellow', 'orange', 'red'];
    const sortedLegend = Object.entries(legendMap).sort(([a], [b]) => order.indexOf(a) - order.indexOf(b));

    return (
        <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-slate-600">
            {sortedLegend.map(([color, text]) => (
                <div key={color} className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: legendColorCodes[color] }}></span>
                    <span>{text}</span>
                </div>
            ))}
        </div>
    );
};

export default function GrowthAndDevelopmentTab() {
    const [gender, setGender] = useState('boy');
    const [ageInMonths, setAgeInMonths] = useState(72);
    const [weightKg, setWeightKg] = useState(22);
    const [heightCm, setHeightCm] = useState(115);
    const [headCircumferenceCm, setHeadCircumferenceCm] = useState(47);

    const availableMainTabs = useMemo(() => {
        const tabs = {};
        if (ageInMonths <= 24) tabs['0-2'] = { name: '0 a 2 años', charts: ['pe', 'te'] };
        if (ageInMonths > 24 && ageInMonths < 60) tabs['2-5'] = { name: '2 a 5 años', charts: ['pt', 'te'] };
        if (ageInMonths >= 60 && ageInMonths <= 228) tabs['5-19'] = { name: '5 a 19 años', charts: ['bmifa_5_19', 'lfa_5_19'] };
        if (ageInMonths <= 36) tabs['hc'] = { name: 'C. Cefálica', charts: ['hc'] };
        return tabs;
    }, [ageInMonths]);

    const [activeMainTab, setActiveMainTab] = useState('5-19');
    const [activeSubChart, setActiveSubChart] = useState('bmifa_5_19');

    useEffect(() => {
        const mainTabsKeys = Object.keys(availableMainTabs);
        const currentMainTabIsValid = mainTabsKeys.includes(activeMainTab);
        
        let newMainTab = activeMainTab;
        if (!currentMainTabIsValid) {
            newMainTab = mainTabsKeys[0] || null;
            setActiveMainTab(newMainTab);
        }

        if (newMainTab) {
            const subCharts = availableMainTabs[newMainTab].charts;
            const currentSubChartIsValid = subCharts.includes(activeSubChart);
            if (!currentSubChartIsValid) {
                setActiveSubChart(subCharts[0]);
            }
        } else {
            setActiveSubChart(null);
        }
    }, [availableMainTabs, activeMainTab, activeSubChart]);

    const handleMainTabClick = (tabKey) => {
        setActiveMainTab(tabKey);
        const charts = availableMainTabs[tabKey].charts;
        if (!charts.includes(activeSubChart)) {
            setActiveSubChart(charts[0]);
        }
    };

    const { currentConfig, chartData, userPoint, diagnosis, fullTitle, xAxisDomain, yAxisDomain, xAxisTicks, xAxisTickFormatter, xAxisLabel, areaFills } = useMemo(() => {
        const chartKey = activeSubChart;
        if (!chartKey) return {};

        let config = { ...chartConfig[chartKey] };
        if (chartKey === 'te') {
            config.title = ageInMonths <= 24 ? 'Talla para la Edad (0-2 años)' : 'Talla para la Edad (2-5 años)';
        }

        const bmi = (heightCm > 0) ? weightKg / ((heightCm / 100) ** 2) : 0;
        const measurements = { pe: weightKg, te: heightCm, hc: headCircumferenceCm, pt: weightKg, lfa_5_19: heightCm, bmifa_5_19: bmi };
        const measurement = measurements[chartKey];
        
        let rawData = whoData[gender][config.dataKey];
        let xValue = config.xAxisKey === 'height' ? heightCm : ageInMonths;

        const lowerPoint = [...rawData].reverse().find(d => d[config.xAxisKey] <= xValue);
        const upperPoint = rawData.find(d => d[config.xAxisKey] >= xValue);

        let sds = {};
        if (lowerPoint && upperPoint) {
            ['neg3', 'neg2', 'neg1', 'median', 'pos1', 'pos2', 'pos3'].forEach(key => {
                sds[key] = interpolate(xValue, lowerPoint[config.xAxisKey], upperPoint[config.xAxisKey], lowerPoint[key], upperPoint[key]);
            });
        }
        
        const userPt = { [config.xAxisKey]: xValue, userValue: measurement };
        const genderText = gender === 'boy' ? 'Niño' : 'Niña';

        const xDomains = { pe: [0, 24], te: [0, 60], hc: [0, 36], pt: [65, 120], lfa_5_19: [60, 228], bmifa_5_19: [60, 228] };
        let yDomain;
        switch(chartKey) {
            case 'pe': yDomain = [2, 18]; break;
            case 'pt': yDomain = [5, 32]; break;
            case 'hc': yDomain = [30, 57]; break;
            case 'te': yDomain = ageInMonths <= 24 ? [40, 90] : [80, 130]; break;
            case 'lfa_5_19': yDomain = [100, 200]; break;
            case 'bmifa_5_19': yDomain = [10, 35]; break;
            default: yDomain = ['auto', 'auto'];
        }
        
        const ticks = {
            pe: [0, 6, 12, 18, 24],
            te: ageInMonths <= 24 ? [0, 6, 12, 18, 24] : [0, 12, 24, 36, 48, 60],
            hc: [0, 6, 12, 24, 36],
            pt: [65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120],
            lfa_5_19: [60, 96, 132, 168, 204, 228],
            bmifa_5_19: [60, 96, 132, 168, 204, 228]
        };

        const tickFormatters = {
            pe: (tick) => `${tick} meses`,
            te: (tick) => `${tick} meses`,
            hc: (tick) => `${tick} meses`,
            pt: (tick) => tick,
            lfa_5_19: (tick) => `${Math.floor(tick/12)}a`,
            bmifa_5_19: (tick) => `${Math.floor(tick/12)}a`,
        };
        
        let fills = {};
        const { green, yellow, orange, red } = zoneColors;
        switch (chartKey) {
            case 'pe': case 'te': case 'lfa_5_19':
                fills = { pos3: green, pos2: green, pos1: green, neg1: yellow, neg2: orange, neg3: red }; break;
            case 'hc':
                fills = { pos3: red, pos2: yellow, pos1: green, neg1: yellow, neg2: red, neg3: red }; break;
            case 'pt':
                fills = { pos3: red, pos2: yellow, pos1: green, neg1: yellow, neg2: orange, neg3: red }; break;
            case 'bmifa_5_19':
                fills = { pos3: red, pos2: yellow, pos1: green, neg1: yellow, neg2: red, neg3: red }; break;
            default:
                fills = { pos3: red, pos2: yellow, pos1: green, neg1: yellow, neg2: orange, neg3: red };
        }

        return {
            currentConfig: config,
            chartData: rawData,
            userPoint: [userPt],
            diagnosis: measurement && Object.keys(sds).length > 0 ? config.diagnostics(measurement, sds) : null,
            fullTitle: `${config.title} | ${genderText} | ${formatAge(ageInMonths)}`,
            xAxisDomain: xDomains[chartKey],
            yAxisDomain: yDomain,
            xAxisTicks: ticks[chartKey],
            xAxisTickFormatter: tickFormatters[chartKey],
            xAxisLabel: config.xAxisKey === 'height' ? 'Talla (cm)' : 'Edad',
            areaFills: fills,
        };
    }, [activeMainTab, activeSubChart, ageInMonths, gender, weightKg, heightCm, headCircumferenceCm]);

    const diagnosisColors = { red: 'bg-red-100 border-red-500 text-red-800', orange: 'bg-orange-100 border-orange-500 text-orange-800', yellow: 'bg-yellow-100 border-yellow-500 text-yellow-800', green: 'bg-green-100 border-green-500 text-green-800' };

    return (
        <div className="bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">Curvas de Crecimiento y Desarrollo</h1>
                    <p className="text-slate-600 mt-2">Evaluación del crecimiento infantil basada en estándares de la OMS.</p>
                </header>

                <div className="mb-6 bg-white p-4 rounded-xl shadow-md border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Simulador de Datos del Paciente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Sexo</label>
                            <div className="flex space-x-4">
                                <label className="flex items-center"><input type="radio" name="gender" value="boy" checked={gender === 'boy'} onChange={() => setGender('boy')} className="h-4 w-4 text-sky-600 border-slate-300 focus:ring-sky-500" /> <span className="ml-2">Niño</span></label>
                                <label className="flex items-center"><input type="radio" name="gender" value="girl" checked={gender === 'girl'} onChange={() => setGender('girl')} className="h-4 w-4 text-pink-600 border-slate-300 focus:ring-pink-500" /> <span className="ml-2">Niña</span></label>
                            </div>
                        </div>
                        <div>
                             <label htmlFor="age" className="block text-sm font-medium text-slate-700">Edad: <span className="font-bold text-sky-600">{formatAge(ageInMonths)}</span></label>
                             <input id="age" type="range" min="0" max="228" value={ageInMonths} onChange={(e) => setAgeInMonths(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                             <label htmlFor="weight" className="block text-sm font-medium text-slate-700">Peso: <span className="font-bold text-sky-600">{weightKg.toFixed(1)} kg</span></label>
                             <input id="weight" type="range" min="1" max="120" step="0.1" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                             <label htmlFor="height" className="block text-sm font-medium text-slate-700">Talla: <span className="font-bold text-sky-600">{heightCm} cm</span></label>
                             <input id="height" type="range" min="40" max="200" value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-2 sm:p-4 rounded-xl shadow-md border border-slate-200">
                    <div className="border-b border-slate-200">
                        <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto" aria-label="Tabs">
                            {Object.entries(availableMainTabs).map(([key, { name }]) => (
                                <button key={key} onClick={() => handleMainTabClick(key)} className={`whitespace-nowrap flex items-center py-3 px-2 sm:px-4 border-b-2 font-semibold text-base transition-colors ${activeMainTab === key ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                                    {name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {Object.keys(availableMainTabs).length === 0 ? (
                        <div className="p-8 text-center">
                            <Info className="mx-auto h-12 w-12 text-sky-500" />
                            <h3 className="mt-2 text-lg font-medium text-slate-900">Edad fuera de rango</h3>
                            <p className="mt-1 text-sm text-slate-600">El paciente tiene más de 19 años. Estos gráficos aplican solo hasta los 19 años (228 meses).</p>
                        </div>
                    ) : (
                        <div className="pt-4">
                            {activeMainTab && availableMainTabs[activeMainTab]?.charts.length > 1 && (
                                <div className="px-2 sm:px-4 mb-4">
                                    <div className="flex space-x-2 p-1 bg-slate-100 rounded-lg">
                                        {availableMainTabs[activeMainTab].charts.map(chartKey => (
                                            <button key={chartKey} onClick={() => setActiveSubChart(chartKey)} className={`w-full text-center rounded-md py-1.5 text-sm font-medium transition-colors ${activeSubChart === chartKey ? 'bg-white text-slate-800 shadow' : 'text-slate-600 hover:bg-slate-200'}`}>
                                                {chartConfig[chartKey].name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentConfig && (
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                    <div className="lg:col-span-3 w-full h-96 min-h-max">
                                        <h3 className="text-center font-semibold text-slate-700 mb-2">{fullTitle}</h3>
                                        <ResponsiveContainer>
                                            <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 25, bottom: 20 }}>
                                                <XAxis dataKey={currentConfig.xAxisKey} type="number" domain={xAxisDomain} ticks={xAxisTicks} tickFormatter={xAxisTickFormatter} label={{ value: xAxisLabel, position: "insideBottom", offset: -15 }} allowDataOverflow={true} />
                                                <YAxis type="number" domain={yAxisDomain} unit={currentConfig.unit} label={{ value: `${currentConfig.name} (${currentConfig.unit})`, angle: -90, position: 'insideLeft', offset: -10 }} allowDataOverflow={true} />
                                                <Tooltip formatter={(value, name, props) => [`${typeof value === 'number' ? value.toFixed(2) : value} ${props.unit}`]} labelFormatter={(label) => `${xAxisLabel}: ${currentConfig.xAxisKey === 'month' ? formatAge(label) : label}`} />
                                                <Legend content={<CustomLegend legendMap={currentConfig.legendMap} />} verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }}/>

                                                {areaFills && <>
                                                    <Area type="monotone" dataKey="pos3" stroke={null} fill={areaFills.pos3} dot={false} activeDot={false} />
                                                    <Area type="monotone" dataKey="pos2" stroke={null} fill={areaFills.pos2} dot={false} activeDot={false} />
                                                    <Area type="monotone" dataKey="pos1" stroke={null} fill={areaFills.pos1} dot={false} activeDot={false} />
                                                    <Area type="monotone" dataKey="neg1" stroke={null} fill={areaFills.neg1} dot={false} activeDot={false} />
                                                    <Area type="monotone" dataKey="neg2" stroke={null} fill={areaFills.neg2} dot={false} activeDot={false} />
                                                    <Area type="monotone" dataKey="neg3" stroke={null} fill={areaFills.neg3} dot={false} activeDot={false} />
                                                </>}

                                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

                                                <Scatter name="Paciente" data={userPoint} dataKey="userValue" fill="rgb(79 70 229)" stroke="#ffffff" strokeWidth={3} r={10} zIndex={100} unit={currentConfig.unit} />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="lg:col-span-2 flex flex-col space-y-4">
                                        {activeSubChart === 'hc' && (
                                            <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                                                <label htmlFor="hc-input" className="block text-sm font-medium text-slate-700">C. Cefálica del Paciente: <span className="font-bold text-sky-600">{headCircumferenceCm} cm</span></label>
                                                <input id="hc-input" type="range" min="30" max="57" step="0.5" value={headCircumferenceCm} onChange={(e) => setHeadCircumferenceCm(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                                            </div>
                                        )}
                                        <div className="bg-white p-4 rounded-lg border border-slate-200 flex-grow">
                                            <h4 className="text-lg font-bold text-slate-800 mb-3">Diagnóstico Nutricional</h4>
                                            {diagnosis ? (
                                                <div className={`p-4 border-l-4 rounded-r-lg ${diagnosisColors[diagnosis.color]}`}>
                                                    <div className="flex">
                                                        <div className="flex-shrink-0">
                                                            {diagnosis.color === 'red' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                                                            {diagnosis.color === 'orange' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                                                            {diagnosis.color === 'yellow' && <TrendingDown className="h-5 w-5 text-yellow-500" />}
                                                            {diagnosis.color === 'green' && <CheckCircle className="h-5 w-5 text-green-500" />}
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-sm font-bold">{diagnosis.text}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <Info className="mx-auto h-8 w-8 text-slate-400" />
                                                    <p className="mt-2 text-sm text-slate-600">Datos insuficientes para el diagnóstico.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}