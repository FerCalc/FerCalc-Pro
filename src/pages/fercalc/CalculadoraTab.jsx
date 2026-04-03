// src/CalculadoraTab.jsx
// VERSIÓN CORREGIDA: Usa useCallback para estabilizar la función de callback y romper el bucle de renderizado.

import React, { useState, useMemo, useEffect, useCallback } from 'react'; // CAMBIO 1: Importar useCallback
import { Plus, Trash2, X, BookOpen, BarChart2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import IntercambioSubTab from './IntercambioSubTab.jsx';

const CalculadoraTab = ({ dietaActual, setDietaActual, setDistribucion, patientData, dietGoals, onPlanIntercambioUpdate }) => {
  // =======================================================
  // ========= BASE DE DATOS DE ALIMENTOS COMPLETA =========
  // =======================================================
   const alimentosIniciales = [
    { nombre: "Leche condensada", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 5.6, proteina: 0.8, grasa: 0.8, na: 9.0, k: 0, p: 23.0, ca: 28.4, fe: 0, colesterol: 2.9, purinas: 0.0, fibra: 0, agua: 2.7, calorias: 32.8, categoria: "LÁCTEOS", origen: "animal" },
    { nombre: "Leche descremada fluida Trébol", medida: "1 taza", cantidad: 200, unidad: "ml", hc: 10.8, proteina: 7.4, grasa: 1.0, na: 104.0, k: 310.0, p: 176.0, ca: 230.0, fe: 0, colesterol: 6.0, purinas: 0.0, fibra: 0, agua: 178.0, calorias: 81.8, categoria: "LÁCTEOS", origen: "animal" },
    { nombre: "Leche descremada Mólico en polvo", medida: "1 cucharada", cantidad: 5, unidad: "g", hc: 2.6, proteina: 1.8, grasa: 0.1, na: 0, k: 0, p: 51.5, ca: 64.5, fe: 0.1, colesterol: 0.1, purinas: 0.0, fibra: 0, agua: 0.2, calorias: 18.5, categoria: "LÁCTEOS", origen: "animal" },
    { nombre: "Leche entera fluida", medida: "1 taza", cantidad: 200, unidad: "ml", hc: 9.6, proteina: 6.6, grasa: 6.0, na: 64.0, k: 286.0, p: 160.0, ca: 220.0, fe: 0, colesterol: 24.6, purinas: 0.0, fibra: 0, agua: 178.0, calorias: 118.8, categoria: "LÁCTEOS", origen: "animal" },
    { nombre: "Leche entera Nido en polvo", medida: "1 cucharada", cantidad: 5, unidad: "g", hc: 1.9, proteina: 1.3, grasa: 1.3, na: 46.5, k: 0, p: 37.5, ca: 46.5, fe: 37.5, colesterol: 4.8, purinas: 0.0, fibra: 0, agua: 0.2, calorias: 24.5, categoria: "LÁCTEOS", origen: "animal" },
    { nombre: "Queso Paraguay fresco (cucharada)", medida: "1 cucharada", cantidad: 20, unidad: "g", hc: 0.0, proteina: 3.4, grasa: 3.4, na: 16.8, k: 105.0, p: 0, ca: 40.0, fe: 0.1, colesterol: 19.4, purinas: 0.0, fibra: 0, agua: 13.2, calorias: 44.2, categoria: "LÁCTEOS", origen: "animal" },
    { nombre: "Queso Paraguay fresco (porción)", medida: "1 porc chica", cantidad: 50, unidad: "g", hc: 0.0, proteina: 8.5, grasa: 8.5, na: 42.5, k: 262.5, p: 0, ca: 100.0, fe: 0.2, colesterol: 48.5, purinas: 0.0, fibra: 0, agua: 33.0, calorias: 110.5, categoria: "LÁCTEOS", origen: "animal" },
    { nombre: "Queso ricotta descremado", medida: "1 cucharada", cantidad: 20, unidad: "g", hc: 1.0, proteina: 2.3, grasa: 1.6, na: 2.5, k: 25.0, p: 0, ca: 54.4, fe: 0.1, colesterol: 18.0, purinas: 0.0, fibra: 0, agua: 14.0, calorias: 27.6, categoria: "LÁCTEOS", origen: "animal" },
    { nombre: "Queso ricotta entero", medida: "1 cucharada", cantidad: 20, unidad: "g", hc: 0.6, proteina: 2.3, grasa: 2.6, na: 16.8, k: 21.0, p: 0, ca: 41.4, fe: 1.0, colesterol: 34.0, purinas: 0.0, fibra: 0, agua: 14.0, calorias: 35.0, categoria: "LÁCTEOS", origen: "animal" },
    { nombre: "Queso sándwich", medida: "1 feta", cantidad: 30, unidad: "g", hc: 0.6, proteina: 4.9, grasa: 5.1, na: 21.0, k: 0, p: 101.1, ca: 210.0, fe: 0.2, colesterol: 18.0, purinas: 0.0, fibra: 0, agua: 17.7, calorias: 67.8, categoria: "LÁCTEOS", origen: "animal" },
    { nombre: "Queso rallado", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 0.1, proteina: 3.2, grasa: 2.5, na: 117.0, k: 0, p: 69.0, ca: 117.0, fe: 0, colesterol: 9.1, purinas: 0.0, fibra: 0, agua: 3.0, calorias: 35.7, categoria: "LÁCTEOS", origen: "animal" },
    { nombre: "Yogur dietético (Lactolanda)", medida: "1 pote chico", cantidad: 140, unidad: "g", hc: 7.9, proteina: 4.6, grasa: 0.7, na: 85.4, k: 0, p: 137.2, ca: 140.0, fe: 0, colesterol: 6.4, purinas: 0.0, fibra: 0, agua: 107.8, calorias: 56.3, categoria: "LÁCTEOS", origen: "animal" },
    { nombre: "Yogur entero (Trebolín)", medida: "1 pote chico", cantidad: 140, unidad: "g", hc: 20.6, proteina: 5.9, grasa: 3.6, na: 98.0, k: 0, p: 123.0, ca: 145.0, fe: 0, colesterol: 17.1, purinas: 0.0, fibra: 0, agua: 107.8, calorias: 138.3, categoria: "LÁCTEOS", origen: "animal" },
    { nombre: "Yogur entero (Parmalat bebible)", medida: "1 pote chico", cantidad: 140, unidad: "g", hc: 19.6, proteina: 4.8, grasa: 3.5, na: 98.0, k: 0, p: 131.6, ca: 145.0, fe: 0, colesterol: 17.0, purinas: 0.0, fibra: 0, agua: 107.8, calorias: 129.1, categoria: "LÁCTEOS", origen: "animal" },
    { nombre: "Yogur entero (Coop bebible)", medida: "1 pote chico", cantidad: 160, unidad: "g", hc: 20.8, proteina: 6.4, grasa: 4.0, na: 112.0, k: 0, p: 150.4, ca: 167.0, fe: 0, colesterol: 19.5, purinas: 0.0, fibra: 0, agua: 123.2, calorias: 144.8, categoria: "LÁCTEOS", origen: "animal" },
    { nombre: "Clara de huevo (chica)", medida: "1 chica", cantidad: 30, unidad: "g", hc: 0.3, proteina: 3.3, grasa: 0.1, na: 33.0, k: 30.0, p: 6.0, ca: 2.7, fe: 0.2, colesterol: 0, purinas: 0.0, fibra: 0, agua: 26.1, calorias: 14.9, categoria: "HUEVOS", origen: "animal" },
    { nombre: "Clara de huevo (mediana)", medida: "1 mediana", cantidad: 35, unidad: "g", hc: 0.4, proteina: 3.9, grasa: 0.1, na: 38.5, k: 35.0, p: 7.0, ca: 3.2, fe: 0.3, colesterol: 0, purinas: 0.0, fibra: 0, agua: 30.4, calorias: 18.1, categoria: "HUEVOS", origen: "animal" },
    { nombre: "Huevo entero (chico)", medida: "1 chico", cantidad: 50, unidad: "g", hc: 1.4, proteina: 5.7, grasa: 4.9, na: 40.5, k: 50.0, p: 102.0, ca: 27.0, fe: 1.2, colesterol: 198.0, purinas: 0.0, fibra: 0, agua: 37.5, calorias: 72.5, categoria: "HUEVOS", origen: "animal" },
    { nombre: "Huevo entero (mediano)", medida: "1 mediano", cantidad: 70, unidad: "g", hc: 2.0, proteina: 7.9, grasa: 6.9, na: 56.7, k: 70.0, p: 142.8, ca: 37.8, fe: 1.7, colesterol: 277.2, purinas: 0.0, fibra: 0, agua: 52.5, calorias: 101.7, categoria: "HUEVOS", origen: "animal" },
    { nombre: "Huevo de codorniz", medida: "1 unidad", cantidad: 5, unidad: "g", hc: 0.2, proteina: 0.6, grasa: 0.7, na: 0, k: 0, p: 10.1, ca: 3.7, fe: 0.2, colesterol: 21.5, purinas: 0.0, fibra: 0, agua: 3.5, calorias: 9.5, categoria: "HUEVOS", origen: "animal" },
    { nombre: "Pollo (sin hueso ni piel) (1/2 pechuga)", medida: "½ pechuga", cantidad: 170, unidad: "g", hc: 0.0, proteina: 32.6, grasa: 2.5, na: 132.6, k: 544.0, p: 402.9, ca: 8.5, fe: 1.7, colesterol: 98.6, purinas: 280.5, fibra: 0, agua: 132.6, calorias: 152.9, categoria: "CARNE - AVES", origen: "animal" },
    { nombre: "Pollo (sin hueso ni piel) (1/4 pechuga)", medida: "¼ pechuga", cantidad: 90, unidad: "g", hc: 0.0, proteina: 17.2, grasa: 1.3, na: 70.2, k: 288.0, p: 213.3, ca: 4.5, fe: 0.9, colesterol: 52.2, purinas: 148.5, fibra: 0, agua: 70.2, calorias: 80.5, categoria: "CARNE - AVES", origen: "animal" },
    { nombre: "Pechuga de pollo picada", medida: "1 cucharada", cantidad: 20, unidad: "g", hc: 0.0, proteina: 3.8, grasa: 0.3, na: 15.6, k: 64.0, p: 47.4, ca: 1.0, fe: 0.2, colesterol: 11.6, purinas: 33.0, fibra: 0, agua: 15.6, calorias: 17.9, categoria: "CARNE - AVES", origen: "animal" },
    { nombre: "Bife magro (chico)", medida: "1 chico", cantidad: 80, unidad: "g", hc: 0.0, proteina: 17.0, grasa: 6.0, na: 37.6, k: 294.4, p: 187.2, ca: 1.6, fe: 2.6, colesterol: 48.0, purinas: 106.4, fibra: 0, agua: 59.2, calorias: 122.0, categoria: "CARNE - VACUNA", origen: "animal" },
    { nombre: "Bife magro (mediano)", medida: "1 mediano", cantidad: 150, unidad: "g", hc: 0.0, proteina: 32.0, grasa: 10.5, na: 70.5, k: 552.0, p: 351.0, ca: 3.0, fe: 4.8, colesterol: 90.0, purinas: 199.5, fibra: 0, agua: 111.0, calorias: 222.5, categoria: "CARNE - VACUNA", origen: "animal" },
    { nombre: "Bife magro (grande)", medida: "1 grande", cantidad: 200, unidad: "g", hc: 0.0, proteina: 42.0, grasa: 14.0, na: 94.0, k: 736.0, p: 468.0, ca: 4.0, fe: 6.4, colesterol: 120.0, purinas: 266.0, fibra: 0, agua: 148.0, calorias: 294.0, categoria: "CARNE - VACUNA", origen: "animal" },
    { nombre: "Carne molida de 1ª", medida: "1 cucharada", cantidad: 40, unidad: "g", hc: 0.0, proteina: 8.5, grasa: 3.0, na: 28.0, k: 143.2, p: 80.4, ca: 0.8, fe: 0.9, colesterol: 36.0, purinas: 53.2, fibra: 0, agua: 26.8, calorias: 61.0, categoria: "CARNE - VACUNA", origen: "animal" },
    { nombre: "Hígado (bife)", medida: "1 chico", cantidad: 100, unidad: "g", hc: 3.6, proteina: 19.8, grasa: 3.9, na: 110.0, k: 380.0, p: 278.0, ca: 8.0, fe: 5.1, colesterol: 354.0, purinas: 460.0, fibra: 0, agua: 71.0, calorias: 128.7, categoria: "CARNE - VACUNA", origen: "animal" },
    { nombre: "Atún enlatado al agua", medida: "1 cucharada", cantidad: 20, unidad: "g", hc: 0.0, proteina: 5.6, grasa: 0.2, na: 175.0, k: 55.0, p: 38.0, ca: 3.2, fe: 0.3, colesterol: 5.6, purinas: 51.4, fibra: 0, agua: 14.0, calorias: 24.2, categoria: "CARNE - PESCADO", origen: "animal" },
    { nombre: "Merluza", medida: "1 filet chico", cantidad: 100, unidad: "g", hc: 0.0, proteina: 19.3, grasa: 0.8, na: 61.0, k: 304.0, p: 318.0, ca: 30.0, fe: 1.1, colesterol: 56.0, purinas: 139.0, fibra: 0, agua: 79.0, calorias: 84.4, categoria: "CARNE - PESCADO", origen: "animal" },
    { nombre: "Surubí", medida: "1 filet chico", cantidad: 150, unidad: "g", hc: 0.0, proteina: 27.3, grasa: 6.0, na: 108.0, k: 414.0, p: 304.5, ca: 30.0, fe: 2.9, colesterol: 78.0, purinas: 210.0, fibra: 0, agua: 115.5, calorias: 163.2, categoria: "CARNE - PESCADO", origen: "animal" },
    { nombre: "Jamón cocido", medida: "1 feta", cantidad: 25, unidad: "g", hc: 0.5, proteina: 6.5, grasa: 5.2, na: 275.0, k: 57.6, p: 35.0, ca: 0, fe: 0, colesterol: 21.3, purinas: 10.8, fibra: 0, agua: 10.0, calorias: 74.8, categoria: "GRASAS", origen: "animal" },
    { nombre: "Manteca", medida: "1 cucharadita", cantidad: 4, unidad: "g", hc: 0.0, proteina: 0.0, grasa: 3.4, na: 8.9, k: 0.6, p: 1.0, ca: 0.6, fe: 0, colesterol: 9.6, purinas: 0.0, fibra: 0, agua: 0.6, calorias: 30.7, categoria: "GRASAS", origen: "animal" },
    { nombre: "Crema de leche (40%)", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 0.3, proteina: 0.2, grasa: 3.8, na: 3.2, k: 8.9, p: 5.9, ca: 7.5, fe: 0, colesterol: 136.0, purinas: 0.0, fibra: 0, agua: 5.7, calorias: 36.2, categoria: "GRASAS", origen: "animal" },
    { nombre: "Acelga cruda", medida: "1 taza", cantidad: 90, unidad: "g", hc: 5.1, proteina: 1.5, grasa: 0.4, na: 189.0, k: 648.0, p: 27.0, ca: 99.0, fe: 3.0, colesterol: 0, purinas: 0, fibra: 0.9, agua: 81.9, calorias: 30.0, categoria: "VEGETALES A", origen: "vegetal" },
    { nombre: "Berro", medida: "1 taza (té)", cantidad: 70, unidad: "g", hc: 2.3, proteina: 2.0, grasa: 0.3, na: 36.4, k: 239.4, p: 53.2, ca: 81.9, fe: 1.3, colesterol: 0, purinas: 0, fibra: 0.8, agua: 64.4, calorias: 19.9, categoria: "VEGETALES A", origen: "vegetal" },
    { nombre: "Berenjena cruda", medida: "½ taza", cantidad: 80, unidad: "g", hc: 5.0, proteina: 0.5, grasa: 0.2, na: 1.0, k: 152.0, p: 24.8, ca: 18.4, fe: 0.7, colesterol: 0, purinas: 2.0, fibra: 1.2, agua: 73.6, calorias: 23.8, categoria: "VEGETALES A", origen: "vegetal" },
    { nombre: "Brócoli", medida: "1 taza (té)", cantidad: 100, unidad: "g", hc: 6.4, proteina: 4.5, grasa: 0.6, na: 16.0, k: 400.0, p: 81.0, ca: 116.0, fe: 1.3, colesterol: 0, purinas: 40.0, fibra: 1.6, agua: 87.0, calorias: 49.0, categoria: "VEGETALES A", origen: "vegetal" },
    { nombre: "Coliflor", medida: "1 taza (té)", cantidad: 100, unidad: "g", hc: 6.5, proteina: 2.8, grasa: 0.4, na: 24.0, k: 400.0, p: 58.0, ca: 33.0, fe: 1.0, colesterol: 0, purinas: 25.0, fibra: 1.0, agua: 89.0, calorias: 40.8, categoria: "VEGETALES A", origen: "vegetal" },
    { nombre: "Espinaca", medida: "1 mazo", cantidad: 15, unidad: "g", hc: 0.7, proteina: 0.4, grasa: 0.1, na: 12.2, k: 117.0, p: 4.5, ca: 9.0, fe: 0.5, colesterol: 0, purinas: 4.1, fibra: 0.1, agua: 13.5, calorias: 5.3, categoria: "VEGETALES A", origen: "vegetal" },
    { nombre: "Lechuga", medida: "1 plato chico", cantidad: 50, unidad: "g", hc: 1.5, proteina: 0.7, grasa: 0.1, na: 5.0, k: 82.5, p: 17.0, ca: 21.5, fe: 0.7, colesterol: 0, purinas: 10.0, fibra: 0.4, agua: 47.5, calorias: 9.7, categoria: "VEGETALES A", origen: "vegetal" },
    { nombre: "Pepino", medida: "½ taza (té)", cantidad: 50, unidad: "g", hc: 1.7, proteina: 0.4, grasa: 0.1, na: 0.5, k: 115.0, p: 12.0, ca: 8.0, fe: 0.3, colesterol: 0, purinas: 4.0, fibra: 0.2, agua: 47.5, calorias: 8.9, categoria: "VEGETALES A", origen: "vegetal" },
    { nombre: "Rabanito", medida: "1 pequeño", cantidad: 20, unidad: "g", hc: 0.4, proteina: 0.2, grasa: 0.0, na: 1.4, k: 5.1, p: 5.2, ca: 6.8, fe: 0.3, colesterol: 0, purinas: 3.0, fibra: 0.1, agua: 18.8, calorias: 2.6, categoria: "VEGETALES A", origen: "vegetal" },
    { nombre: "Tomate perita", medida: "1 chico", cantidad: 100, unidad: "g", hc: 4.6, proteina: 0.8, grasa: 0.3, na: 3.0, k: 230.0, p: 24.0, ca: 7.0, fe: 0.6, colesterol: 0, purinas: 10.0, fibra: 0.6, agua: 94.0, calorias: 24.3, categoria: "VEGETALES A", origen: "vegetal" },
    { nombre: "Tomate (mediano)", medida: "1 mediano", cantidad: 150, unidad: "g", hc: 6.9, proteina: 1.2, grasa: 0.5, na: 4.5, k: 345.0, p: 36.0, ca: 10.5, fe: 0.9, colesterol: 0, purinas: 15.0, fibra: 0.9, agua: 141.0, calorias: 36.9, categoria: "VEGETALES A", origen: "vegetal" },
    { nombre: "Tomate (grande)", medida: "1 grande", cantidad: 200, unidad: "g", hc: 9.2, proteina: 1.6, grasa: 0.6, na: 6.0, k: 460.0, p: 48.0, ca: 14.0, fe: 1.2, colesterol: 0, purinas: 20.0, fibra: 1.2, agua: 188.0, calorias: 48.6, categoria: "VEGETALES A", origen: "vegetal" },
    { nombre: "Arveja enlatada", medida: "1 cucharada", cantidad: 25, unidad: "g", hc: 4.4, proteina: 0.2, grasa: 0.1, na: 72.8, k: 72.8, p: 4.3, ca: 2.3, fe: 0.4, colesterol: 0, purinas: 21.0, fibra: 0.4, agua: 21.8, calorias: 19.3, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Arveja natural cocida", medida: "1 cucharada", cantidad: 25, unidad: "g", hc: 5.3, proteina: 1.9, grasa: 0.1, na: 0.5, k: 79.0, p: 31.0, ca: 6.0, fe: 0.5, colesterol: 0, purinas: 11.8, fibra: 0.8, agua: 17.5, calorias: 29.7, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Calabaza", medida: "1 taza (té)", cantidad: 100, unidad: "g", hc: 7.6, proteina: 0.6, grasa: 0.2, na: 1.0, k: 260.0, p: 22.0, ca: 19.0, fe: 0.5, colesterol: 0, purinas: 0, fibra: 0.7, agua: 91.0, calorias: 34.6, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Cebolla (chica)", medida: "1 chica", cantidad: 90, unidad: "g", hc: 7.5, proteina: 1.4, grasa: 0.2, na: 0.9, k: 117.0, p: 37.8, ca: 30.6, fe: 1.3, colesterol: 0, purinas: 8.1, fibra: 0.9, agua: 81.0, calorias: 37.4, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Cebolla (mediana)", medida: "1 mediana", cantidad: 120, unidad: "g", hc: 10.0, proteina: 1.8, grasa: 0.2, na: 1.2, k: 156.0, p: 50.4, ca: 40.8, fe: 1.7, colesterol: 0, purinas: 10.8, fibra: 1.2, agua: 108.0, calorias: 49.0, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Cebollita de hoja", medida: "1 cucharada", cantidad: 5, unidad: "g", hc: 0.3, proteina: 0.1, grasa: 0.0, na: 0.2, k: 21.7, p: 3.8, ca: 3.8, fe: 0.1, colesterol: 0, purinas: 0.5, fibra: 0.0, agua: 4.6, calorias: 1.7, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Chaucha", medida: "½ taza (té)", cantidad: 50, unidad: "g", hc: 3.3, proteina: 1.0, grasa: 0.1, na: 17.0, k: 63.0, p: 22.5, ca: 27.5, fe: 0.6, colesterol: 0, purinas: 12.5, fibra: 0.6, agua: 45.0, calorias: 18.1, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Lenteja", medida: "1 cucharada", cantidad: 15, unidad: "g", hc: 9.0, proteina: 3.7, grasa: 0.2, na: 4.5, k: 11.9, p: 56.6, ca: 11.9, fe: 1.0, colesterol: 0, purinas: 17.1, fibra: 0.6, agua: 1.6, calorias: 52.6, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Locote entero", medida: "1 pequeño", cantidad: 80, unidad: "g", hc: 6.4, proteina: 1.8, grasa: 0.1, na: 0.8, k: 136.0, p: 22.4, ca: 6.4, fe: 1.4, colesterol: 0, purinas: 0, fibra: 1.8, agua: 71.5, calorias: 33.7, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Palmito", medida: "1 taza (té)", cantidad: 150, unidad: "g", hc: 7.8, proteina: 3.3, grasa: 0.3, na: 67.5, k: 504.0, p: 118.5, ca: 129.0, fe: 102.0, colesterol: 0, purinas: 0, fibra: 0.9, agua: 136.5, calorias: 47.1, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Poroto (manteca)", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 1.3, proteina: 0.5, grasa: 0.0, na: 33.6, k: 22.0, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 4.7, fibra: 0.7, agua: 0, calorias: 7.2, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Poroto (negros o rojos)", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 6.1, proteina: 2.2, grasa: 0.2, na: 1.9, k: 119.6, p: 42.5, ca: 7.7, fe: 0.8, colesterol: 0, purinas: 2.5, fibra: 0.5, agua: 1.1, calorias: 35.0, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Remolacha", medida: "1 pequeña", cantidad: 100, unidad: "g", hc: 9.5, proteina: 1.7, grasa: 0.1, na: 110.0, k: 350.0, p: 38.0, ca: 14.0, fe: 0.8, colesterol: 0, purinas: 15.0, fibra: 0.7, agua: 88.0, calorias: 45.7, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Repollo", medida: "1 taza (té)", cantidad: 100, unidad: "g", hc: 6.1, proteina: 1.7, grasa: 0.2, na: 5.0, k: 230.0, p: 36.0, ca: 43.0, fe: 0.7, colesterol: 0, purinas: 25.0, fibra: 3.1, agua: 91.0, calorias: 33.0, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Soja cruda (brote)", medida: "1 taza", cantidad: 50, unidad: "g", hc: 2.7, proteina: 3.1, grasa: 0.7, na: 15.0, k: 190.0, p: 3.4, ca: 24.0, fe: 0.5, colesterol: 0, purinas: 190.0, fibra: 0.4, agua: 41.0, calorias: 29.5, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Zanahoria", medida: "1 mediana", cantidad: 100, unidad: "g", hc: 8.9, proteina: 0.8, grasa: 0.4, na: 31.0, k: 410.0, p: 26.0, ca: 34.0, fe: 0.9, colesterol: 0, purinas: 23.0, fibra: 0.9, agua: 89.0, calorias: 42.4, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Zapallo", medida: "½ taza", cantidad: 80, unidad: "g", hc: 6.4, proteina: 1.4, grasa: 0.2, na: 1.6, k: 324.0, p: 19.2, ca: 25.6, fe: 1.8, colesterol: 0, purinas: 4.8, fibra: 0.7, agua: 71.2, calorias: 32.5, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Choclo enlatado", medida: "1 cucharada", cantidad: 20, unidad: "g", hc: 3.0, proteina: 0.4, grasa: 0.1, na: 62.7, k: 41.8, p: 14.0, ca: 0.6, fe: 0.1, colesterol: 0, purinas: 7.4, fibra: 0.1, agua: 16.4, calorias: 14.5, categoria: "VEGETALES C", origen: "vegetal" },
    { nombre: "Choclo natural", medida: "1 cucharada", cantidad: 20, unidad: "g", hc: 4.4, proteina: 0.8, grasa: 0.2, na: 0.2, k: 74.0, p: 0.4, ca: 1.6, fe: 0.2, colesterol: 0, purinas: 7.4, fibra: 0.2, agua: 14.6, calorias: 22.6, categoria: "VEGETALES C", origen: "vegetal" },
    { nombre: "Papa", medida: "1 mediana", cantidad: 200, unidad: "g", hc: 35.8, proteina: 3.6, grasa: 0.2, na: 2.0, k: 820.0, p: 80.0, ca: 12.0, fe: 1.6, colesterol: 0, purinas: 10.0, fibra: 0.8, agua: 158.0, calorias: 159.4, categoria: "VEGETALES C", origen: "vegetal" },
    { nombre: "Frutilla", medida: "1 taza (té)", cantidad: 100, unidad: "g", hc: 8.5, proteina: 0.8, grasa: 0.3, na: 1.0, k: 180.0, p: 29.8, ca: 29.0, fe: 1.0, colesterol: 0, purinas: 12.0, fibra: 1.3, agua: 90.0, calorias: 39.9, categoria: "FRUTAS A", origen: "vegetal" },
    { nombre: "Limón (jugo puro)", medida: "1 cucharada", cantidad: 5, unidad: "ml", hc: 0.4, proteina: 0.0, grasa: 0.0, na: 0.1, k: 6.5, p: 0.8, ca: 2.0, fe: 0.0, colesterol: 0, purinas: 0.0, fibra: 0.0, agua: 4.5, calorias: 2.0, categoria: "FRUTAS A", origen: "vegetal" },
    { nombre: "Mandarina", medida: "1 grande", cantidad: 150, unidad: "g", hc: 16.4, proteina: 1.1, grasa: 0.3, na: 3.0, k: 165.0, p: 24.0, ca: 45.0, fe: 0.6, colesterol: 0, purinas: 0.0, fibra: 0.6, agua: 132.0, calorias: 72.7, categoria: "FRUTAS A", origen: "vegetal" },
    { nombre: "Melón", medida: "1 rodaja", cantidad: 100, unidad: "g", hc: 6.2, proteina: 0.5, grasa: 0.1, na: 12.0, k: 230.0, p: 15.0, ca: 15.0, fe: 1.2, colesterol: 0, purinas: 0.0, fibra: 0.5, agua: 93.0, calorias: 27.7, categoria: "FRUTAS A", origen: "vegetal" },
    { nombre: "Naranja", medida: "1 mediana", cantidad: 150, unidad: "g", hc: 15.8, proteina: 1.2, grasa: 0.3, na: 1.5, k: 255.0, p: 30.0, ca: 51.0, fe: 1.5, colesterol: 0, purinas: 0.0, fibra: 0.6, agua: 132.0, calorias: 70.7, categoria: "FRUTAS A", origen: "vegetal" },
    { nombre: "Ciruela", medida: "1 mediana", cantidad: 85, unidad: "g", hc: 10.1, proteina: 0.5, grasa: 0.2, na: 0.9, k: 178.5, p: 12.7, ca: 6.8, fe: 0.3, colesterol: 0, purinas: 0.0, fibra: 0.3, agua: 73.9, calorias: 44.2, categoria: "FRUTAS B", origen: "vegetal" },
    { nombre: "Durazno natural", medida: "1 unidad", cantidad: 110, unidad: "g", hc: 14.6, proteina: 0.9, grasa: 0.2, na: 1.1, k: 176.0, p: 28.6, ca: 13.2, fe: 1.2, colesterol: 0, purinas: 0.0, fibra: 1.0, agua: 93.5, calorias: 63.8, categoria: "FRUTAS B", origen: "vegetal" },
    { nombre: "Mamón", medida: "½ chico", cantidad: 150, unidad: "g", hc: 29.9, proteina: 1.7, grasa: 0.3, na: 10.7, k: 0, p: 30.0, ca: 18.0, fe: 0.9, colesterol: 0, purinas: 0.0, fibra: 2.1, agua: 117.0, calorias: 129.1, categoria: "FRUTAS B", origen: "vegetal" },
    { nombre: "Manzana", medida: "1 mediana", cantidad: 170, unidad: "g", hc: 25.8, proteina: 0.5, grasa: 0.5, na: 1.7, k: 129.2, p: 17.0, ca: 10.2, fe: 0.7, colesterol: 0, purinas: 5.1, fibra: 1.2, agua: 142.8, calorias: 109.7, categoria: "FRUTAS B", origen: "vegetal" },
    { nombre: "Pera", medida: "1 mediana", cantidad: 180, unidad: "g", hc: 26.6, proteina: 0.5, grasa: 0.4, na: 3.6, k: 180.0, p: 18.5, ca: 11.0, fe: 0.9, colesterol: 0, purinas: 3.6, fibra: 3.1, agua: 151.2, calorias: 112.0, categoria: "FRUTAS B", origen: "vegetal" },
    { nombre: "Piña", medida: "1 rodaja", cantidad: 100, unidad: "g", hc: 13.7, proteina: 0.4, grasa: 0.2, na: 1.0, k: 210.0, p: 8.0, ca: 18.0, fe: 0.5, colesterol: 0, purinas: 0.0, fibra: 0.4, agua: 85.0, calorias: 58.2, categoria: "FRUTAS B", origen: "vegetal" },
    { nombre: "Banana", medida: "1 mediana", cantidad: 70, unidad: "g", hc: 16.6, proteina: 0.8, grasa: 0.1, na: 0.7, k: 294.0, p: 19.6, ca: 7.0, fe: 0.6, colesterol: 0, purinas: 0.0, fibra: 0.4, agua: 51.8, calorias: 70.5, categoria: "FRUTAS C", origen: "vegetal" },
    { nombre: "Almendras", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 2.0, proteina: 1.9, grasa: 5.4, na: 0.3, k: 6.9, p: 4.8, ca: 25.4, fe: 0.4, colesterol: 0, purinas: 3.0, fibra: 0.3, agua: 0.5, calorias: 64.2, categoria: "FRUTOS SECOS", origen: "vegetal" },
    { nombre: "Maní molido", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 1.8, proteina: 2.7, grasa: 4.7, na: 0.5, k: 6.8, p: 4.7, ca: 4.6, fe: 0.3, colesterol: 0, purinas: 9.0, fibra: 0.2, agua: 0.6, calorias: 60.3, categoria: "FRUTOS SECOS", origen: "vegetal" },
    { nombre: "Almidón de mandioca", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 8.1, proteina: 0.2, grasa: 0.1, na: 0.4, k: 2.2, p: 10.4, ca: 0, fe: 0.5, colesterol: 0, purinas: 0.0, fibra: 0.2, agua: 1.4, calorias: 33.7, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Arroz pulido", medida: "½ taza (té)", cantidad: 70, unidad: "g", hc: 56.3, proteina: 4.7, grasa: 0.3, na: 3.5, k: 64.4, p: 65.7, ca: 17.0, fe: 0.6, colesterol: 0, purinas: 0.0, fibra: 0.4, agua: 8.4, calorias: 246.7, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Arroz integral", medida: "½ taza (té)", cantidad: 70, unidad: "g", hc: 54.3, proteina: 5.3, grasa: 1.3, na: 6.3, k: 148.8, p: 148.4, ca: 22.4, fe: 1.1, colesterol: 0, purinas: 0.0, fibra: 1.0, agua: 8.4, calorias: 250.1, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Avena arrollada", medida: "1 cucharada", cantidad: 5, unidad: "g", hc: 2.9, proteina: 0.9, grasa: 0.4, na: 0, k: 25.0, p: 35.0, ca: 7.5, fe: 0.3, colesterol: 0, purinas: 0.0, fibra: 0.1, agua: 0, calorias: 18.8, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Avena (salvado)", medida: "1 cucharada", cantidad: 5, unidad: "g", hc: 3.2, proteina: 0.7, grasa: 0.5, na: 0.1, k: 17.6, p: 20.0, ca: 4.0, fe: 0.2, colesterol: 0, purinas: 0.0, fibra: 0.1, agua: 0.4, calorias: 20.1, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Cereal All Bran", medida: "1 taza (té)", cantidad: 30, unidad: "g", hc: 21.6, proteina: 3.6, grasa: 0.6, na: 307.8, k: 447.6, p: 0, ca: 0, fe: 6.3, colesterol: 0, purinas: 0, fibra: 0, agua: 0, calorias: 106.2, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Fideo (fino)", medida: "1 nido", cantidad: 45, unidad: "g", hc: 35.0, proteina: 7.1, grasa: 0.4, na: 3.6, k: 59.8, p: 59.8, ca: 2.7, fe: 1.3, colesterol: 0, purinas: 0, fibra: 5.0, agua: 4.9, calorias: 171.6, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Harina 000", medida: "1 cucharada", cantidad: 15, unidad: "g", hc: 10.7, proteina: 1.5, grasa: 0.2, na: 0.3, k: 16.2, p: 14.0, ca: 0, fe: 0, colesterol: 0, purinas: 2.1, fibra: 0.0, agua: 2.1, calorias: 50.2, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Harina de maíz", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 7.6, proteina: 0.5, grasa: 0.3, na: 0.1, k: 12.0, p: 25.6, ca: 1.8, fe: 0.2, colesterol: 0, purinas: 3.7, fibra: 0, agua: 1.2, calorias: 35.1, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Galleta", medida: "1 chica", cantidad: 50, unidad: "g", hc: 35.7, proteina: 6.4, grasa: 0.3, na: 15.0, k: 51.7, p: 57.5, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0.1, agua: 5.5, calorias: 171.1, categoria: "PANIFICADOS", origen: "vegetal" },
    { nombre: "Galletita Criollitas", medida: "1 unidad", cantidad: 7, unidad: "g", hc: 4.9, proteina: 0.9, grasa: 0.7, na: 38.3, k: 0, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 0.2, calorias: 29.5, categoria: "PANIFICADOS", origen: "vegetal" },
    { nombre: "Pan francés", medida: "1 rebanada", cantidad: 30, unidad: "g", hc: 17.2, proteina: 2.8, grasa: 0.1, na: 82.2, k: 27.9, p: 32.1, ca: 6.6, fe: 0.3, colesterol: 0, purinas: 0.0, fibra: 0.1, agua: 9.3, calorias: 80.9, categoria: "PANIFICADOS", origen: "vegetal" },
    { nombre: "Azúcar blanca granulada", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 10.0, proteina: 0.0, grasa: 0.0, na: 0, k: 0, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0.0, fibra: 0, agua: 0, calorias: 40.0, categoria: "DULCES", origen: "vegetal" },
    { nombre: "Dulce de batata", medida: "1 porc chica", cantidad: 50, unidad: "g", hc: 31.2, proteina: 0.1, grasa: 0.3, na: 28.4, k: 31.9, p: 3.9, ca: 4.1, fe: 0, colesterol: 0, purinas: 0, fibra: 0.6, agua: 16.0, calorias: 127.9, categoria: "DULCES", origen: "vegetal" },
    { nombre: "Dulce de leche", medida: "1 cucharada", cantidad: 20, unidad: "g", hc: 12.4, proteina: 1.6, grasa: 1.8, na: 24.4, k: 78.6, p: 51.4, ca: 64.4, fe: 0.1, colesterol: 0, purinas: 0, fibra: 0, agua: 4.8, calorias: 72.2, categoria: "DULCES", origen: "animal" },
    { nombre: "Mermelada", medida: "1 cucharadita", cantidad: 5, unidad: "g", hc: 3.5, proteina: 0.0, grasa: 0.0, na: 0.6, k: 4.4, p: 0.5, ca: 1.0, fe: 0.1, colesterol: 0, purinas: 0.0, fibra: 0.1, agua: 1.4, calorias: 14.1, categoria: "DULCES", origen: "vegetal" },
    { nombre: "Miel de abeja", medida: "1 cucharada", cantidad: 5, unidad: "g", hc: 3.9, proteina: 0.0, grasa: 0.0, na: 0.4, k: 0.5, p: 0.8, ca: 1.0, fe: 0.0, colesterol: 0, purinas: 0.0, fibra: 0, agua: 1.1, calorias: 15.6, categoria: "DULCES", origen: "animal" },
    { nombre: "Aceite", medida: "1 cucharada", cantidad: 5, unidad: "g", hc: 0.0, proteina: 0.0, grasa: 5.0, na: 0.1, k: 0.1, p: 0, ca: 0.8, fe: 0, colesterol: 0, purinas: 0.0, fibra: 0, agua: 0, calorias: 45.0, categoria: "GRASAS", origen: "vegetal" },
    { nombre: "Margarina", medida: "1 cucharadita", cantidad: 4, unidad: "g", hc: 0.0, proteina: 0.0, grasa: 3.0, na: 4.0, k: 0, p: 0, ca: 0, fe: 0, colesterol: 4.6, purinas: 0.0, fibra: 0, agua: 0, calorias: 27.0, categoria: "GRASAS", origen: "vegetal" },
    { nombre: "Cereal All Bran", medida: "1 cucharada", cantidad: 5, unidad: "g", hc: 3.6, proteina: 0.6, grasa: 0.1, na: 51.3, k: 74.6, p: 0, ca: 0, fe: 1.05, colesterol: 0, purinas: 0, fibra: 0, agua: 0, calorias: 17.7, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Cereal Kellogs (cornflekes)", medida: "1 cucharada", cantidad: 5, unidad: "g", hc: 4.2, proteina: 0.3, grasa: 0, na: 55, k: 5.9, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0.165, agua: 0, calorias: 18, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Cereal Kellogs (zucaritas)", medida: "1 cucharada", cantidad: 5, unidad: "g", hc: 4.7, proteina: 0.2, grasa: 0, na: 33.3, k: 0, p: 0, ca: 0, fe: 0.8, colesterol: 0, purinas: 0, fibra: 0.165, agua: 0, calorias: 19.6, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Cereal Cerelac", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 6.8, proteina: 1.55, grasa: 0.9, na: 18, k: 53, p: 33, ca: 0, fe: 0.75, colesterol: 0, purinas: 0, fibra: 1, agua: 0, calorias: 41.5, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Cereal de arroz", medida: "1 taza (té)", cantidad: 30, unidad: "g", hc: 25.8, proteina: 1.3, grasa: 0.8, na: 1.2, k: 31.2, p: 25.5, ca: 0, fe: 0.45, colesterol: 0, purinas: 0, fibra: 0.15, agua: 0.8, calorias: 115.6, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Cereal Nestúm (mixto)", medida: "1 cucharada", cantidad: 5, unidad: "g", hc: 4.2, proteina: 0.6, grasa: 0.1, na: 14, k: 10, p: 7.7, ca: 0, fe: 0.9, colesterol: 0, purinas: 0, fibra: 0.375, agua: 0, calorias: 20.1, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Fécula de maíz (Maizena)", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 8.8, proteina: 0.4, grasa: 0.6, na: 0.5, k: 0, p: 1.6, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 1.4, calorias: 42.2, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Fideo (moñito)", medida: "¾ taza", cantidad: 70, unidad: "g", hc: 52.5, proteina: 7.7, grasa: 0.7, na: 2.1, k: 0, p: 98, ca: 15.4, fe: 0.8, colesterol: 0, purinas: 0, fibra: 2, agua: 8.4, calorias: 247.1, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Fideo (sopero)", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 7.7, proteina: 1, grasa: 0.1, na: 3.7, k: 17.1, p: 9.8, ca: 0, fe: 0.3, colesterol: 0, purinas: 0, fibra: 0.11, agua: 1.3, calorias: 35.7, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Fideo (spaghetti)", medida: "1 puño", cantidad: 70, unidad: "g", hc: 51.2, proteina: 8.4, grasa: 1.5, na: 10.5, k: 0, p: 112, ca: 18.2, fe: 0.9, colesterol: 0, purinas: 0, fibra: 0.3, agua: 8.75, calorias: 251.9, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Germen de trigo", medida: "1 cucharada", cantidad: 5, unidad: "g", hc: 1.9, proteina: 1.4, grasa: 0.5, na: 2.5, k: 41.4, p: 72.9, ca: 2.2, fe: 0.1, colesterol: 0, purinas: 0, fibra: 1.25, agua: 0.6, calorias: 17.7, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Harina de arroz", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 8.4, proteina: 0.8, grasa: 0.1, na: 1.1, k: 7.3, p: 7.8, ca: 0, fe: 0.07, colesterol: 0, purinas: 0, fibra: 0.05, agua: 0.6, calorias: 37.7, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Harina de soja", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 3.7, proteina: 4.3, grasa: 0.7, na: 0.1, k: 185.9, p: 6.3, ca: 0, fe: 0.9, colesterol: 0, purinas: 38, fibra: 0.25, agua: 0.8, calorias: 38.3, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Harina leudante", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 7.2, proteina: 0.9, grasa: 0.1, na: 89, k: 0, p: 4.2, ca: 11, fe: 0.1, colesterol: 0, purinas: 1.4, fibra: 0.028, agua: 1.4, calorias: 33.3, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Salvado de trigo", medida: "1 cucharada", cantidad: 5, unidad: "g", hc: 3.1, proteina: 0.8, grasa: 0.2, na: 0.5, k: 56, p: 63.8, ca: 5.9, fe: 0.7, colesterol: 0, purinas: 0, fibra: 0.455, agua: 0.6, calorias: 17.4, categoria: "CEREALES", origen: "vegetal" },
    { nombre: "Galleta", medida: "1 mediana", cantidad: 70, unidad: "g", hc: 53, proteina: 9, grasa: 0.5, na: 21, k: 72.38, p: 80.5, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0.2, agua: 7.7, calorias: 252.5, categoria: "PANIFICADOS", origen: "vegetal" },
    { nombre: "Galleta molida", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 7.6, proteina: 1.3, grasa: 0.1, na: 3, k: 0, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 0.3, calorias: 36.5, categoria: "PANIFICADOS", origen: "vegetal" },
    { nombre: "Galletita Cerealita", medida: "1 unidad", cantidad: 6, unidad: "g", hc: 4, proteina: 0.6, grasa: 0.9, na: 33, k: 0, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 0.2, calorias: 26.5, categoria: "PANIFICADOS", origen: "vegetal" },
    { nombre: "Galletita Criollitas mini", medida: "1 unidad", cantidad: 4, unidad: "g", hc: 2.8, proteina: 0.5, grasa: 0.4, na: 21.9, k: 0, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 0.1, calorias: 16.8, categoria: "PANIFICADOS", origen: "vegetal" },
    { nombre: "Galletita Familiares de agua", medida: "1 unidad", cantidad: 7, unidad: "g", hc: 5.18, proteina: 0.78, grasa: 0.64, na: 44.9, k: 0, p: 17.1, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 0.2, calorias: 29.6, categoria: "PANIFICADOS", origen: "vegetal" },
    { nombre: "Galletita Familiares integral", medida: "1 unidad", cantidad: 6, unidad: "g", hc: 4.1, proteina: 0.8, grasa: 0.7, na: 64.4, k: 0, p: 19.2, ca: 3.8, fe: 0.1, colesterol: 0, purinas: 0, fibra: 0.5, agua: 0.2, calorias: 25.9, categoria: "PANIFICADOS", origen: "vegetal" },
    { nombre: "Galletita Familiares salvado", medida: "1 unidad", cantidad: 6, unidad: "g", hc: 4.2, proteina: 0.7, grasa: 0.6, na: 71.1, k: 0, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 0.2, calorias: 25, categoria: "PANIFICADOS", origen: "vegetal" },
    { nombre: "Galletita Sándwich sin sal", medida: "1 unidad", cantidad: 7, unidad: "g", hc: 4.8, proteina: 0.7, grasa: 1, na: 16.4, k: 0, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 0.2, calorias: 31, categoria: "PANIFICADOS", origen: "vegetal" },
    { nombre: "Palito/rosquitas", medida: "5 unidades", cantidad: 50, unidad: "g", hc: 36.3, proteina: 6.25, grasa: 0.1, na: 324, k: 0, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 0, calorias: 171.1, categoria: "PANIFICADOS", origen: "vegetal" },
    { nombre: "Pan Felipe (bollo)", medida: "1 unidad", cantidad: 50, unidad: "g", hc: 28.7, proteina: 4.7, grasa: 0.1, na: 137, k: 46.5, p: 53.5, ca: 0, fe: 0.6, colesterol: 0, purinas: 0, fibra: 0.1, agua: 15.5, calorias: 134.5, categoria: "PANIFICADOS", origen: "vegetal" },
    { nombre: "Pan salvado", medida: "1 unidad", cantidad: 30, unidad: "g", hc: 15.3, proteina: 2.1, grasa: 1.4, na: 288.7, k: 76.8, p: 76.2, ca: 0, fe: 0, colesterol: 0, purinas: 12, fibra: 0.5, agua: 10.8, calorias: 82.2, categoria: "PANIFICADOS", origen: "vegetal" },
    { nombre: "Pan Viena", medida: "1 unidad", cantidad: 40, unidad: "g", hc: 25, proteina: 3.9, grasa: 0.8, na: 110, k: 0, p: 62.8, ca: 15.6, fe: 0.3, colesterol: 0, purinas: 0, fibra: 0.1, agua: 10, calorias: 122.8, categoria: "PANIFICADOS", origen: "vegetal" },
    { nombre: "Azúcar impalpable", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 10, proteina: 0, grasa: 0, na: 0.1, k: 0.3, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 0.05, calorias: 40, categoria: "DULCES", origen: "vegetal" },
    { nombre: "Chocolate Nesquik (polvo)", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 8.9, proteina: 0.5, grasa: 0.3, na: 0, k: 0, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 0, calorias: 39.3, categoria: "DULCES", origen: "vegetal" },
    { nombre: "Chocolate Nestlé (polvo)", medida: "1 cucharada", cantidad: 10, unidad: "g", hc: 6, proteina: 1.3, grasa: 0.6, na: 0, k: 0, p: 0, ca: 0, fe: 0.9, colesterol: 0, purinas: 0, fibra: 0, agua: 0, calorias: 34.6, categoria: "DULCES", origen: "vegetal" },
    { nombre: "Dulce de membrillo", medida: "1 porc chica", cantidad: 50, unidad: "g", hc: 43.4, proteina: 0.5, grasa: 0.2, na: 32.3, k: 73.7, p: 5.2, ca: 0.9, fe: 0, colesterol: 0, purinas: 0, fibra: 0.4, agua: 17.5, calorias: 177.4, categoria: "DULCES", origen: "vegetal" },
    { nombre: "Gelatina dietética (1 taza)", medida: "1 taza (té)", cantidad: 200, unidad: "g", hc: 0.6, proteina: 3.4, grasa: 0, na: 218, k: 0, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 194, calorias: 16, categoria: "DULCES", origen: "animal" },
    { nombre: "Gelatina dietética (1 compotera)", medida: "1 compotera", cantidad: 100, unidad: "g", hc: 0.3, proteina: 1.7, grasa: 0, na: 109, k: 0, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 97.1, calorias: 8, categoria: "DULCES", origen: "animal" },
    { nombre: "Gelatina normal (1 taza)", medida: "1 taza (té)", cantidad: 200, unidad: "g", hc: 24.6, proteina: 3, grasa: 0, na: 102, k: 0, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 166.05, calorias: 110.4, categoria: "DULCES", origen: "animal" },
    { nombre: "Gelatina normal (1 compotera)", medida: "1 compotera", cantidad: 100, unidad: "g", hc: 12.3, proteina: 1.5, grasa: 0, na: 51, k: 0, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 83.1, calorias: 55.2, categoria: "DULCES", origen: "animal" },
    { nombre: "Jugo Ades Manzana/naranja", medida: "½ vaso", cantidad: 100, unidad: "ml", hc: 10, proteina: 0.5, grasa: 0.2, na: 17, k: 42.5, p: 12.2, ca: 0, fe: 0.2, colesterol: 0, purinas: 0, fibra: 0, agua: 90, calorias: 43.8, categoria: "DULCES", origen: "vegetal" },
    { nombre: "Jugo Ades Natural", medida: "½ vaso", cantidad: 100, unidad: "ml", hc: 3.2, proteina: 2.7, grasa: 1.7, na: 67.3, k: 163.8, p: 46.9, ca: 0, fe: 0.7, colesterol: 0, purinas: 0, fibra: 0, agua: 90, calorias: 38.9, categoria: "DULCES", origen: "vegetal" },
    { nombre: "Mermelada dietética", medida: "1 cucharadita", cantidad: 5, unidad: "g", hc: 1.3, proteina: 0, grasa: 0, na: 0, k: 0, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 1, calorias: 5.2, categoria: "DULCES", origen: "vegetal" },
    { nombre: "Miel negra", medida: "1 cucharada", cantidad: 5, unidad: "g", hc: 3.6, proteina: 0.02, grasa: 0, na: 0, k: 0, p: 2.1, ca: 3.5, fe: 0.1, colesterol: 0, purinas: 0, fibra: 0.25, agua: 1.3, calorias: 14.5, categoria: "DULCES", origen: "animal" },
    { nombre: "Naranja (pequeña)", medida: "1 pequeña", cantidad: 100, unidad: "g", hc: 10.5, proteina: 0.8, grasa: 0.2, na: 1, k: 170, p: 20, ca: 34, fe: 0.7, colesterol: 0, purinas: 0, fibra: 0.4, agua: 88, calorias: 47, categoria: "FRUTAS A", origen: "vegetal" },
    { nombre: "Naranja (grande)", medida: "1 grande", cantidad: 200, unidad: "g", hc: 21, proteina: 1.6, grasa: 0.4, na: 2, k: 340, p: 40, ca: 68, fe: 1.4, colesterol: 0, purinas: 0, fibra: 0.8, agua: 176, calorias: 94, categoria: "FRUTAS A", origen: "vegetal" },
    { nombre: "Naranja (jugo puro)", medida: "1 vaso", cantidad: 250, unidad: "ml", hc: 26.3, proteina: 2, grasa: 0.5, na: 2.5, k: 410, p: 40, ca: 85, fe: 0.8, colesterol: 0, purinas: 0, fibra: 1, agua: 218, calorias: 117.7, categoria: "FRUTAS A", origen: "vegetal" },
    { nombre: "Pomelo", medida: "1 grande", cantidad: 190, unidad: "g", hc: 18.2, proteina: 1.1, grasa: 0.4, na: 1.9, k: 380, p: 39.9, ca: 34.2, fe: 10, colesterol: 0, purinas: 0, fibra: 0.4, agua: 169.1, calorias: 80.8, categoria: "FRUTAS A", origen: "vegetal" },
    { nombre: "Pomelo (jugo puro)", medida: "1 grande", cantidad: 180, unidad: "ml", hc: 16.2, proteina: 1.1, grasa: 0.4, na: 1.8, k: 360, p: 37.8, ca: 32.4, fe: 0.9, colesterol: 0, purinas: 0, fibra: 0.4, agua: 160.2, calorias: 72.8, categoria: "FRUTAS A", origen: "vegetal" },
    { nombre: "Ciruela", medida: "1 chica", cantidad: 60, unidad: "g", hc: 7.1, proteina: 0.4, grasa: 0.1, na: 0.65, k: 136.5, p: 9.75, ca: 4.8, fe: 0.26, colesterol: 0, purinas: 0, fibra: 0.2, agua: 56.5, calorias: 30.9, categoria: "FRUTAS B", origen: "vegetal" },
    { nombre: "Durazno enlatado", medida: "2 mitades", cantidad: 110, unidad: "g", hc: 22.1, proteina: 0.4, grasa: 0.1, na: 2.2, k: 143, p: 13.2, ca: 4, fe: 0.33, colesterol: 0, purinas: 0, fibra: 1.8, agua: 86.9, calorias: 90.9, categoria: "FRUTAS B", origen: "vegetal" },
    { nombre: "Manzana (pequeña)", medida: "1 pequeña", cantidad: 140, unidad: "g", hc: 21.3, proteina: 0.4, grasa: 0.4, na: 1.4, k: 106.4, p: 14, ca: 8.4, fe: 0.56, colesterol: 0, purinas: 4.2, fibra: 1, agua: 117.6, calorias: 90.4, categoria: "FRUTAS B", origen: "vegetal" },
    { nombre: "Manzana (grande)", medida: "1 grande", cantidad: 200, unidad: "g", hc: 30.4, proteina: 0.6, grasa: 0.6, na: 2, k: 152, p: 20, ca: 12, fe: 0.8, colesterol: 0, purinas: 6, fibra: 1.4, agua: 168, calorias: 129.4, categoria: "FRUTAS B", origen: "vegetal" },
    { nombre: "Pera (pequeña)", medida: "1 pequeña", cantidad: 150, unidad: "g", hc: 20.7, proteina: 0.4, grasa: 0.3, na: 2.8, k: 140, p: 14, ca: 9, fe: 0.7, colesterol: 0, purinas: 3, fibra: 2.9, agua: 117.6, calorias: 87.1, categoria: "FRUTAS B", origen: "vegetal" },
    { nombre: "Pera (grande)", medida: "1 grande", cantidad: 200, unidad: "g", hc: 29.6, proteina: 0.6, grasa: 0.4, na: 4, k: 200, p: 20.6, ca: 12, fe: 1, colesterol: 0, purinas: 4, fibra: 3.4, agua: 168, calorias: 124.4, categoria: "FRUTAS B", origen: "vegetal" },
    { nombre: "Banana", medida: "1 chica", cantidad: 50, unidad: "g", hc: 11.9, proteina: 0.6, grasa: 0.1, na: 0.5, k: 210, p: 14, ca: 5, fe: 0.4, colesterol: 0, purinas: 0, fibra: 0.3, agua: 3.7, calorias: 50.9, categoria: "FRUTAS C", origen: "vegetal" },
    { nombre: "Berenjena cruda", medida: "1 taza grande", cantidad: 200, unidad: "g", hc: 12.6, proteina: 2, grasa: 0.6, na: 2, k: 380, p: 62, ca: 46, fe: 1.6, colesterol: 0, purinas: 2, fibra: 2.4, agua: 184, calorias: 63.8, categoria: "VEGETALES A", origen: "vegetal" },
    { nombre: "Cebolla", medida: "1 grande", cantidad: 200, unidad: "g", hc: 16.6, proteina: 3, grasa: 0.4, na: 2, k: 260, p: 84, ca: 68, fe: 2.8, colesterol: 0, purinas: 18, fibra: 2, agua: 180, calorias: 82, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Zanahoria (chica)", medida: "1 chica", cantidad: 70, unidad: "g", hc: 6.2, proteina: 0.5, grasa: 0.3, na: 21.7, k: 287, p: 18.2, ca: 23.8, fe: 0.63, colesterol: 0, purinas: 16.1, fibra: 0.6, agua: 62.3, calorias: 29.5, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Zanahoria rallada", medida: "1 taza (té)", cantidad: 80, unidad: "g", hc: 7.1, proteina: 0.6, grasa: 0.3, na: 24.8, k: 328, p: 20.8, ca: 27.2, fe: 0.72, colesterol: 0, purinas: 18.4, fibra: 0.6, agua: 71.2, calorias: 33.5, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Zapallito redondo (pequeño)", medida: "1 pequeño", cantidad: 100, unidad: "g", hc: 3.5, proteina: 0.8, grasa: 0.1, na: 2, k: 218, p: 14, ca: 18, fe: 2.3, colesterol: 0, purinas: 6, fibra: 0.4, agua: 95, calorias: 18.1, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Zapallito redondo (mediano)", medida: "1 mediano", cantidad: 150, unidad: "g", hc: 5.3, proteina: 1.2, grasa: 0.2, na: 3, k: 327, p: 21, ca: 27, fe: 3.45, colesterol: 0, purinas: 9, fibra: 0.6, agua: 142.5, calorias: 27.8, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Zapallito redondo (grande)", medida: "1 grande", cantidad: 250, unidad: "g", hc: 8.8, proteina: 2, grasa: 0.3, na: 5, k: 545, p: 35, ca: 45, fe: 5.8, colesterol: 0, purinas: 15, fibra: 1, agua: 237.5, calorias: 45.9, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Zuchini", medida: "1 taza (té)", cantidad: 100, unidad: "g", hc: 3.5, proteina: 0.8, grasa: 0.1, na: 95, k: 14, p: 14, ca: 18, fe: 2.3, colesterol: 0, purinas: 6, fibra: 0.4, agua: 95, calorias: 18.1, categoria: "VEGETALES B", origen: "vegetal" },
    { nombre: "Papa (pequeña)", medida: "1 pequeña", cantidad: 100, unidad: "g", hc: 17.9, proteina: 1.8, grasa: 0.1, na: 1, k: 410, p: 40, ca: 6, fe: 0.8, colesterol: 0, purinas: 5, fibra: 0.4, agua: 79, calorias: 79.7, categoria: "VEGETALES C", origen: "vegetal" },
    { nombre: "Papa (grande)", medida: "1 grande", cantidad: 300, unidad: "g", hc: 53.7, proteina: 5.4, grasa: 0.3, na: 3, k: 1230, p: 120, ca: 18, fe: 2.4, colesterol: 0, purinas: 15, fibra: 1.2, agua: 237, calorias: 239.1, categoria: "VEGETALES C", origen: "vegetal" }
  ];


  const [alimentos, setAlimentos] = useState(() => {
    // Tu lógica de localStorage está bien, la mantenemos.
    // Solo quito la dependencia de localStorage para este ejemplo.
    return alimentosIniciales;
  });

  // useEffect(() => {
  //   localStorage.setItem('alimentos', JSON.stringify(alimentos));
  // }, [alimentos]);
  
  const [activeSubTab, setActiveSubTab] = useState('intercambio'); 

  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const estadoInicialFormulario = { nombre: '', medida: '', cantidad: 0, unidad: 'g', hc: 0, proteina: 0, grasa: 0, na: 0, k: 0, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 0, calorias: 0, categoria: 'OTRO', origen: 'vegetal' };
  const [nuevoAlimento, setNuevoAlimento] = useState(estadoInicialFormulario);
  const categorias = useMemo(() => [...new Set(alimentos.map(a => a.categoria))].sort(), [alimentos]);
  const alimentosFiltrados = useMemo(() => alimentos.filter(a => a.nombre.toLowerCase().includes(busqueda.toLowerCase()) && (!filtroCategoria || a.categoria === filtroCategoria)), [alimentos, busqueda, filtroCategoria]);
  const totalesNutricionales = useMemo(() => { const totales = { cantidadUsada: 0, hc: 0, proteina: 0, grasa: 0, calorias: 0, na: 0, k: 0, p: 0, ca: 0, fe: 0, colesterol: 0, purinas: 0, fibra: 0, agua: 0 }; dietaActual.forEach(item => { const factor = item.cantidadUsada > 0 && item.alimento.cantidad > 0 ? item.cantidadUsada / item.alimento.cantidad : 0; Object.keys(totales).forEach(key => { if (key === 'cantidadUsada') totales.cantidadUsada += parseFloat(item.cantidadUsada) || 0; else totales[key] += (item.alimento[key] || 0) * factor; }); }); return totales; }, [dietaActual]);
  
  const agregarAlimentoADieta = (alimento) => { setDietaActual(prev => [...prev, { id: Date.now(), alimento: alimento, cantidadUsada: alimento.cantidad }]); toast.success(`${alimento.nombre} agregado.`); };
  const eliminarDeDieta = (id) => { setDietaActual(prev => prev.filter(item => item.id !== id)); setDistribucion(prev => { const n = { ...prev }; for (const day in n) { if (n[day][id]) { delete n[day][id]; } } return n; }); toast.error("Alimento eliminado."); };
  const actualizarCantidad = (id, nuevaCantidad) => setDietaActual(dietaActual.map(item => item.id === id ? { ...item, cantidadUsada: parseFloat(nuevaCantidad) || 0 } : item));
  const limpiarDieta = () => { if (window.confirm("¿Estás seguro de que quieres limpiar toda la dieta actual? Se borrarán todos los alimentos de la tabla.")) { setDietaActual([]); setDistribucion(Array(14).fill(null).map(() => ({}))); toast('Dieta limpiada.', { icon: '🗑️' }); } };
  
  const handleNuevoAlimentoChange = (e) => {
    const { name, value } = e.target;
    const isNumber = typeof estadoInicialFormulario[name] === 'number';
    setNuevoAlimento(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) || 0 : value }));
  };
  
  const handleGuardarNuevoAlimento = () => {
    if (!nuevoAlimento.nombre || !nuevoAlimento.categoria) { toast.error("Nombre y categoría son obligatorios."); return; }
    const caloriasCalculadas = (nuevoAlimento.hc * 4) + (nuevoAlimento.proteina * 4) + (nuevoAlimento.grasa * 9);
    const alimentoFinal = { ...nuevoAlimento, id: Date.now(), calorias: caloriasCalculadas };
    setAlimentos(prev => [...prev, alimentoFinal]);
    setNuevoAlimento(estadoInicialFormulario);
    setMostrarFormulario(false);
    toast.success("Nuevo alimento guardado.");
  };

  // CAMBIO 2: Crear una función "memorizada" con useCallback.
  // Esta función ahora tendrá una referencia estable y no se creará de nuevo en cada render,
  // rompiendo el bucle infinito.
  const handlePlanUpdate = useCallback((nuevoPlan) => {
    if (onPlanIntercambioUpdate) {
      onPlanIntercambioUpdate(nuevoPlan);
    }
  }, [onPlanIntercambioUpdate]); // La dependencia es la función que viene del padre.

  const tableHeaders = ["Alimento", "Gramos", "Kcal", "HC", "Proteina", "Grasa", "Agua", "Na", "K", "P", "Ca", "Fe", "Col.", "Purinas", "Fibra", "Accion"];

  const SubTabButton = ({ tabId, label, icon }) => (
    <button onClick={() => setActiveSubTab(tabId)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeSubTab === tabId ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
      {icon} {label}
    </button>
  );

  return (
    <div id="calculadora-tab-content">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="flex flex-wrap gap-2 mb-6 p-2 bg-gray-100 rounded-lg">
        <SubTabButton tabId="intercambio" label="Intercambio" icon={<BarChart2 size={16} />} />
        <SubTabButton tabId="desarrollada" label="Desarrollada" icon={<BookOpen size={16} />} />
      </div>

      <div style={{ display: activeSubTab === 'intercambio' ? 'block' : 'none' }}>
        {/* CAMBIO 3: Pasar la nueva función memorizada (handlePlanUpdate) al componente hijo. */}
        <IntercambioSubTab 
            patientData={patientData} 
            dietGoals={dietGoals} 
            onPlanUpdate={handlePlanUpdate} 
        />
      </div>

      <div style={{ display: activeSubTab === 'desarrollada' ? 'block' : 'none' }}>
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Agregar Nuevo Alimento</h3>
                <button onClick={() => setMostrarFormulario(false)}><X /></button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.keys(estadoInicialFormulario).map(key => (
                  <div key={key}>
                    <label className="block text-sm font-medium capitalize">{key}</label>
                    {key === 'origen' ? (
                      <select name={key} value={nuevoAlimento[key]} onChange={handleNuevoAlimentoChange} className="mt-1 block w-full px-3 py-2 border rounded-md">
                        <option value="vegetal">Vegetal</option>
                        <option value="animal">Animal</option>
                      </select>
                    ) : (
                      <input type={typeof estadoInicialFormulario[key] === 'number' ? 'number' : 'text'} name={key} value={nuevoAlimento[key]} onChange={handleNuevoAlimentoChange} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button onClick={() => setMostrarFormulario(false)} className="bg-gray-200 px-4 py-2 rounded-lg">Cancelar</button>
                <button onClick={handleGuardarNuevoAlimento} className="bg-green-600 text-white px-4 py-2 rounded-lg">Guardar</button>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col xl:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Base de Alimentos</h2>
              <button onClick={() => setMostrarFormulario(true)} className="bg-green-600 text-white px-3 py-1 rounded-lg flex items-center gap-2 text-sm"><Plus size={16} />Nuevo</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4 mb-4">
              <input type="text" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="px-3 py-2 border rounded-lg" />
              <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="px-3 py-2 border rounded-lg">
                <option value="">Todas</option>
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-grow h-96 xl:h-[60vh] overflow-y-auto border rounded-lg">
              {alimentosFiltrados.map((a, i) => (
                <div key={`${a.nombre}-${i}`} className="p-3 border-b flex justify-between items-center">
                  <div className="pr-2">
                    <h3 className="font-medium">{a.nombre}</h3>
                    <p className="text-sm text-gray-600">{a.medida} ({a.cantidad}{a.unidad})</p>
                  </div>
                  <button onClick={() => agregarAlimentoADieta(a)} className="bg-blue-600 text-white p-2 rounded-md flex-shrink-0"><Plus size={16} /></button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col xl:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Plan General de la Dieta</h2>
              <button onClick={limpiarDieta} disabled={!dietaActual.length} className="bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"><Trash2 size={16} />Limpiar</button>
            </div>
            <div className="overflow-x-auto">
              {dietaActual.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-500 border rounded-lg">Agrega alimentos desde la Base de Alimentos</div>
              ) : (
                <table className="w-full text-sm text-left table-auto">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>{tableHeaders.map(h => <th key={h} className="px-2 py-2 whitespace-nowrap">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {dietaActual.map(item => {
                      const factor = item.cantidadUsada > 0 && item.alimento.cantidad > 0 ? item.cantidadUsada / item.alimento.cantidad : 0;
                      return (
                        <tr key={item.id} className="bg-white border-b">
                          <td className="px-2 py-2 font-medium whitespace-nowrap">{item.alimento.nombre}</td>
                          <td className="px-2 py-2"><input type="number" value={item.cantidadUsada} onChange={e => actualizarCantidad(item.id, e.target.value)} className="w-20 px-2 py-1 border rounded" /></td>
                          <td className="px-2 py-2 font-bold text-green-600">{(item.alimento.calorias * factor).toFixed(1)}</td>
                          <td className="px-2 py-2">{(item.alimento.hc * factor).toFixed(1)}</td>
                          <td className="px-2 py-2">{(item.alimento.proteina * factor).toFixed(1)}</td>
                          <td className="px-2 py-2">{(item.alimento.grasa * factor).toFixed(1)}</td>
                          <td className="px-2 py-2">{(item.alimento.agua * factor).toFixed(1)}</td>
                          <td className="px-2 py-2">{(item.alimento.na * factor).toFixed(1)}</td>
                          <td className="px-2 py-2">{(item.alimento.k * factor).toFixed(1)}</td>
                          <td className="px-2 py-2">{(item.alimento.p * factor).toFixed(1)}</td>
                          <td className="px-2 py-2">{(item.alimento.ca * factor).toFixed(1)}</td>
                          <td className="px-2 py-2">{(item.alimento.fe * factor).toFixed(1)}</td>
                          <td className="px-2 py-2">{(item.alimento.colesterol * factor).toFixed(1)}</td>
                          <td className="px-2 py-2">{(item.alimento.purinas * factor).toFixed(1)}</td>
                          <td className="px-2 py-2">{(item.alimento.fibra * factor).toFixed(1)}</td>
                          <td className="px-2 py-2"><button onClick={() => eliminarDeDieta(item.id)} className="text-red-500"><Trash2 size={18} /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="font-bold bg-green-50">
                    <tr>
                      <td className="px-2 py-2">TOTALES</td>
                      <td className="px-2 py-2">{totalesNutricionales.cantidadUsada.toFixed(1)}</td>
                      <td className="px-2 py-2">{totalesNutricionales.calorias.toFixed(1)}</td>
                      <td className="px-2 py-2">{totalesNutricionales.hc.toFixed(1)}</td>
                      <td className="px-2 py-2">{totalesNutricionales.proteina.toFixed(1)}</td>
                      <td className="px-2 py-2">{totalesNutricionales.grasa.toFixed(1)}</td>
                      <td className="px-2 py-2">{totalesNutricionales.agua.toFixed(1)}</td>
                      <td className="px-2 py-2">{totalesNutricionales.na.toFixed(1)}</td>
                      <td className="px-2 py-2">{totalesNutricionales.k.toFixed(1)}</td>
                      <td className="px-2 py-2">{totalesNutricionales.p.toFixed(1)}</td>
                      <td className="px-2 py-2">{totalesNutricionales.ca.toFixed(1)}</td>
                      <td className="px-2 py-2">{totalesNutricionales.fe.toFixed(1)}</td>
                      <td className="px-2 py-2">{totalesNutricionales.colesterol.toFixed(1)}</td>
                      <td className="px-2 py-2">{totalesNutricionales.purinas.toFixed(1)}</td>
                      <td className="px-2 py-2">{totalesNutricionales.fibra.toFixed(1)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculadoraTab;