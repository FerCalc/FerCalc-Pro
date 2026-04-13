// src/GyTTab.jsx
// VERSIÓN CORREGIDA: Se han recalibrado las constantes de mapeo visual de la curva
// para garantizar una ubicación precisa del punto de diagnóstico.

import React, { useMemo, useState } from 'react';
import { Ruler, AreaChart, Table } from 'lucide-react';

// Se asume que las imágenes están en la ruta correcta, no se modifica esta parte.
import nomogramaImage from './assets/nomograma.png';
import curvaImage from './assets/curva-embarazo.png';

// --- BASE DE DATOS NUMÉRICA ---
// Esta es la fuente de verdad para el CÁLCULO del %P/T.
const NOMOGRAMA_DATA = [
  { talla: 140, peso: 30, pt: 68 }, { talla: 140, peso: 31, pt: 69.5 }, { talla: 140, peso: 32, pt: 71 }, { talla: 140, peso: 33, pt: 73.5 },
  { talla: 140, peso: 34, pt: 76 }, { talla: 140, peso: 35, pt: 78.5 }, { talla: 140, peso: 36, pt: 81 }, { talla: 140, peso: 37, pt: 83 }, { talla: 140, peso: 38, pt: 85 }, { talla: 140, peso: 39, pt: 87 },
  { talla: 140, peso: 40, pt: 89.5 }, { talla: 140, peso: 41, pt: 92 },{ talla: 140, peso: 42, pt: 95 }, { talla: 140, peso: 43, pt: 97 }, 
  { talla: 140, peso: 44, pt: 99.5 }, { talla: 140, peso: 45, pt: 102 }, { talla: 140, peso: 46, pt: 104.5 }, { talla: 140, peso: 47, pt: 107 },
  { talla: 140, peso: 48, pt: 109.5 }, { talla: 140, peso: 49, pt: 112 }, { talla: 140, peso: 50, pt: 114 }, { talla: 140, peso: 51, pt: 116 }, 
  { talla: 140, peso: 52, pt: 118 }, { talla: 140, peso: 53, pt: 120 }, { talla: 140, peso: 54, pt: 122 }, { talla: 140, peso: 55, pt: 124 },
  { talla: 140, peso: 56, pt: 126.7 }, { talla: 140, peso: 57, pt: 127.5 }, { talla: 140, peso: 58, pt: 129 }, { talla: 140, peso: 59, pt: 130.9 },
  { talla: 140, peso: 60, pt: 132 }, { talla: 140, peso: 61, pt: 133.3 }, { talla: 140, peso: 62, pt: 135 }, { talla: 140, peso: 63, pt: 136 }, 
  { talla: 140, peso: 64, pt: 137 }, { talla: 140, peso: 65, pt: 138 }, { talla: 140, peso: 66, pt: 139 }, { talla: 140, peso: 67, pt: 140 },
  { talla: 140, peso: 68, pt: 141 }, { talla: 140, peso: 69, pt: 142 }, { talla: 140, peso: 70, pt: 143 }, { talla: 140, peso: 71, pt: 144 },
  { talla: 140, peso: 72, pt: 145 }, { talla: 140, peso: 73, pt: 146 }, { talla: 140, peso: 74, pt: 147 }, { talla: 140, peso: 74, pt: 148 }, 
  { talla: 140, peso: 75, pt: 149 }, { talla: 140, peso: 76, pt: 150 }, { talla: 140, peso: 77, pt: 151 }, { talla: 140, peso: 78, pt: 152 },
  { talla: 141, peso: 30, pt: 67.5 }, { talla: 141, peso: 31, pt: 69 }, { talla: 141, peso: 32, pt: 70 }, { talla: 141, peso: 33, pt: 72.5 },
  { talla: 141, peso: 34, pt: 75 }, { talla: 141, peso: 35, pt: 77.5 }, { talla: 141, peso: 36, pt: 80 }, { talla: 141, peso: 37, pt: 82 }, { talla: 141, peso: 38, pt: 84.5 }, { talla: 141, peso: 39, pt: 86 },
  { talla: 141, peso: 40, pt: 88 }, { talla: 141, peso: 41, pt: 90.5 }, { talla: 141, peso: 42, pt: 93 }, { talla: 141, peso: 43, pt: 95.8 },
  { talla: 141, peso: 44, pt: 98 }, { talla: 141, peso: 45, pt: 100.5 }, { talla: 141, peso: 46, pt: 103 }, { talla: 141, peso: 47, pt: 105.7 },
  { talla: 141, peso: 48, pt: 108.2 }, { talla: 141, peso: 49, pt: 110.5 }, { talla: 141, peso: 50, pt: 112.5 }, { talla: 141, peso: 51, pt: 114.5 },
  { talla: 141, peso: 52, pt: 116.8 }, { talla: 141, peso: 53, pt: 118.7 }, { talla: 141, peso: 54, pt: 120.5 }, { talla: 141, peso: 55, pt: 122.5 },
  { talla: 141, peso: 56, pt: 124.5 }, { talla: 141, peso: 57, pt: 126.2 }, { talla: 141, peso: 58, pt: 127.5 }, { talla: 141, peso: 59, pt: 129.5 },
  { talla: 141, peso: 60, pt: 131 }, { talla: 141, peso: 61, pt: 132.2 }, { talla: 141, peso: 62, pt: 133.5 }, { talla: 141, peso: 63, pt: 135 },
  { talla: 141, peso: 64, pt: 136 }, { talla: 141, peso: 65, pt: 137 }, { talla: 141, peso: 66, pt: 138 }, { talla: 141, peso: 67, pt: 139 }, 
  { talla: 141, peso: 68, pt: 140 }, { talla: 141, peso: 69, pt: 141 }, { talla: 141, peso: 70, pt: 142 }, { talla: 141, peso: 71, pt: 143 },
  { talla: 141, peso: 72, pt: 144 }, { talla: 141, peso: 73, pt: 145 }, { talla: 141, peso: 74, pt: 146 }, { talla: 141, peso: 75, pt: 147 },
  { talla: 141, peso: 76, pt: 148 }, { talla: 141, peso: 77, pt: 149 }, { talla: 141, peso: 78, pt: 150 }, { talla: 141, peso: 79, pt: 151 }, { talla: 141, peso: 80, pt: 152 },
  { talla: 142, peso: 30, pt: 66 }, { talla: 142, peso: 31, pt: 68 }, { talla: 142, peso: 32, pt: 70 }, { talla: 142, peso: 33, pt: 71.5 },
  { talla: 142, peso: 34, pt: 74 }, { talla: 142, peso: 35, pt: 76.5 }, { talla: 142, peso: 36, pt: 79 }, { talla: 142, peso: 37, pt: 81 },
  { talla: 142, peso: 38, pt: 83.5 }, { talla: 142, peso: 39, pt: 85 }, { talla: 142, peso: 40, pt: 87 }, { talla: 142, peso: 41, pt: 89 },
  { talla: 142, peso: 42, pt: 91.5 }, { talla: 142, peso: 43, pt: 94.5 }, { talla: 142, peso: 44, pt: 96.7 }, { talla: 142, peso: 45, pt: 99 },
  { talla: 142, peso: 46, pt: 101.5 }, { talla: 142, peso: 47, pt: 104 }, { talla: 142, peso: 48, pt: 106.5 }, { talla: 142, peso: 49, pt: 109 },
  { talla: 142, peso: 50, pt: 111.5 }, { talla: 142, peso: 51, pt: 113.5 }, { talla: 142, peso: 52, pt: 115 }, { talla: 142, peso: 53, pt: 117.5 },
  { talla: 142, peso: 54, pt: 119 }, { talla: 142, peso: 55, pt: 121 }, { talla: 142, peso: 56, pt: 123 }, { talla: 142, peso: 57, pt: 125 },
  { talla: 142, peso: 58, pt: 126.5 }, { talla: 142, peso: 59, pt: 128 }, { talla: 142, peso: 60, pt: 129.5 }, { talla: 142, peso: 61, pt: 131 },
  { talla: 142, peso: 62, pt: 132.2 }, { talla: 142, peso: 63, pt: 133.8 }, { talla: 142, peso: 64, pt: 135 }, { talla: 142, peso: 65, pt: 136 },
  { talla: 142, peso: 66, pt: 137 }, { talla: 142, peso: 67, pt: 138 }, { talla: 142, peso: 68, pt: 139 }, { talla: 142, peso: 69, pt: 140 },
  { talla: 142, peso: 70, pt: 141 }, { talla: 142, peso: 71, pt: 142 }, { talla: 142, peso: 72, pt: 143 }, { talla: 142, peso: 73, pt: 144 },
  { talla: 142, peso: 74, pt: 145 }, { talla: 142, peso: 75, pt: 146 }, { talla: 142, peso: 76, pt: 147 }, { talla: 142, peso: 77, pt: 148 }, { talla: 142, peso: 78, pt: 149 },{ talla: 142, peso: 79, pt: 150 }, { talla: 142, peso: 80, pt: 152 },
  { talla: 143, peso: 33, pt: 65 }, { talla: 143, peso: 31, pt: 67 }, { talla: 143, peso: 32, pt: 69 }, { talla: 143, peso: 33, pt: 70.5 },
  { talla: 143, peso: 34, pt: 73 }, { talla: 143, peso: 35, pt: 75.5 }, { talla: 143, peso: 36, pt: 77.5 }, { talla: 143, peso: 37, pt: 80 },
  { talla: 143, peso: 38, pt: 82.5 }, { talla: 143, peso: 39, pt: 84.5 }, { talla: 143, peso: 40, pt: 86 }, { talla: 143, peso: 41, pt: 88 },
  { talla: 143, peso: 42, pt: 90.5 }, { talla: 143, peso: 43, pt: 93 }, { talla: 143, peso: 44, pt: 95.7 }, { talla: 143, peso: 45, pt: 97.7 },
  { talla: 143, peso: 46, pt: 100.5 }, { talla: 143, peso: 47, pt: 102.5 }, { talla: 143, peso: 48, pt: 105 }, { talla: 143, peso: 49, pt: 107.5 },
  { talla: 143, peso: 50, pt: 110 }, { talla: 143, peso: 51, pt: 112 }, { talla: 143, peso: 52, pt: 114 }, { talla: 143, peso: 53, pt: 116 },
  { talla: 143, peso: 54, pt: 117.8 }, { talla: 143, peso: 55, pt: 120 }, { talla: 143, peso: 56, pt: 121.5 }, { talla: 143, peso: 57, pt: 123.3 },
  { talla: 143, peso: 58, pt: 125 }, { talla: 143, peso: 59, pt: 126.8 }, { talla: 143, peso: 60, pt: 128 }, { talla: 143, peso: 61, pt: 130 },
  { talla: 143, peso: 62, pt: 131.3 }, { talla: 143, peso: 63, pt: 132.5 }, { talla: 143, peso: 64, pt: 133.8 }, { talla: 143, peso: 65, pt: 135 },
  { talla: 143, peso: 66, pt: 136 }, { talla: 143, peso: 67, pt: 137 }, { talla: 143, peso: 68, pt: 138 }, { talla: 143, peso: 69, pt: 139 },
  { talla: 143, peso: 70, pt: 140 }, { talla: 143, peso: 71, pt: 141 }, { talla: 143, peso: 72, pt: 142 }, { talla: 143, peso: 73, pt: 143 },
  { talla: 143, peso: 74, pt: 144 }, { talla: 143, peso: 75, pt: 145 }, { talla: 143, peso: 76, pt: 146 }, { talla: 143, peso: 77, pt: 147 },
  { talla: 143, peso: 78, pt: 148 }, { talla: 143, peso: 79, pt: 149 }, { talla: 143, peso: 80, pt: 150 }, { talla: 143, peso: 81, pt: 151 },
  { talla: 144, peso: 33, pt: 70 }, { talla: 144, peso: 34, pt: 72 }, { talla: 144, peso: 35, pt: 74.5 }, { talla: 144, peso: 36, pt: 77 },
  { talla: 144, peso: 37, pt: 79 }, { talla: 144, peso: 38, pt: 81.5 }, { talla: 144, peso: 39, pt: 83.5 }, { talla: 144, peso: 40, pt: 85.5 },
  { talla: 144, peso: 41, pt: 87 }, { talla: 144, peso: 42, pt: 89 }, { talla: 144, peso: 43, pt: 91.5 }, { talla: 144, peso: 44, pt: 94.5 },
  { talla: 144, peso: 45, pt: 96.5 }, { talla: 144, peso: 46, pt: 99 }, { talla: 144, peso: 47, pt: 101 }, { talla: 144, peso: 48, pt: 103.5 },
  { talla: 144, peso: 49, pt: 106 }, { talla: 144, peso: 50, pt: 108.5 }, { talla: 144, peso: 51, pt: 110.5 }, { talla: 144, peso: 52, pt: 112.5 },
  { talla: 144, peso: 53, pt: 114.5 }, { talla: 144, peso: 54, pt: 116.5 }, { talla: 144, peso: 55, pt: 118.5 }, { talla: 144, peso: 56, pt: 120 },
  { talla: 144, peso: 57, pt: 122 }, { talla: 144, peso: 58, pt: 123.5 }, { talla: 144, peso: 59, pt: 125.5 }, { talla: 144, peso: 60, pt: 127 },
  { talla: 144, peso: 61, pt: 128.5 }, { talla: 144, peso: 62, pt: 130 }, { talla: 144, peso: 63, pt: 131.5 }, { talla: 144, peso: 64, pt: 132.8 },
  { talla: 144, peso: 65, pt: 133.8 }, { talla: 144, peso: 66, pt: 135 }, { talla: 144, peso: 67, pt: 136 }, { talla: 144, peso: 68, pt: 137 },
  { talla: 144, peso: 69, pt: 138 }, { talla: 144, peso: 70, pt: 139 }, { talla: 144, peso: 71, pt: 140 }, { talla: 144, peso: 72, pt: 141 },
  { talla: 144, peso: 73, pt: 142 }, { talla: 144, peso: 74, pt: 143 }, { talla: 144, peso: 75, pt: 144 }, { talla: 144, peso: 76, pt: 145 },
  { talla: 144, peso: 77, pt: 146 }, { talla: 144, peso: 78, pt: 147 }, { talla: 144, peso: 79, pt: 148 }, { talla: 144, peso: 80, pt: 149 },
  { talla: 144, peso: 81, pt: 150 }, { talla: 144, peso: 82, pt: 151 }, { talla: 144, peso: 83, pt: 152 }, { talla: 144, peso: 84, pt: 153 },
  { talla: 145, peso: 33, pt: 69.5 }, { talla: 145, peso: 34, pt: 71 }, { talla: 145, peso: 35, pt: 73.5 }, { talla: 145, peso: 36, pt: 75.5 },
  { talla: 145, peso: 37, pt: 78.5 }, { talla: 145, peso: 38, pt: 80.5 }, { talla: 145, peso: 39, pt: 82.5 }, { talla: 145, peso: 40, pt: 84.5 },
  { talla: 145, peso: 41, pt: 86 }, { talla: 145, peso: 42, pt: 88 }, { talla: 145, peso: 43, pt: 90 }, { talla: 145, peso: 44, pt: 92.5 },
  { talla: 145, peso: 45, pt: 95.5 }, { talla: 145, peso: 46, pt: 97.5 }, { talla: 145, peso: 47, pt: 100 }, { talla: 145, peso: 48, pt: 102 },
  { talla: 145, peso: 49, pt: 104.5 }, { talla: 145, peso: 50, pt: 106.5 }, { talla: 145, peso: 51, pt: 109 }, { talla: 145, peso: 52, pt: 111.5 },
  { talla: 145, peso: 53, pt: 113.3 }, { talla: 145, peso: 54, pt: 115 }, { talla: 145, peso: 55, pt: 117 }, { talla: 145, peso: 56, pt: 118.8 },
  { talla: 145, peso: 57, pt: 120.8 }, { talla: 145, peso: 58, pt: 122.5 }, { talla: 145, peso: 59, pt: 124 }, { talla: 145, peso: 60, pt: 125.8 },
  { talla: 145, peso: 61, pt: 127.4 }, { talla: 145, peso: 62, pt: 128.8 }, { talla: 145, peso: 63, pt: 130.5 }, { talla: 145, peso: 64, pt: 131.8 },
  { talla: 145, peso: 65, pt: 132.8 }, { talla: 145, peso: 66, pt: 134 }, { talla: 145, peso: 67, pt: 135.5 }, { talla: 145, peso: 68, pt: 136.5 },
  { talla: 145, peso: 69, pt: 137.5 }, { talla: 145, peso: 70, pt: 138.5 }, { talla: 145, peso: 71, pt: 139.5 }, { talla: 145, peso: 72, pt: 140.5 },
  { talla: 145, peso: 73, pt: 141.5 }, { talla: 145, peso: 75, pt: 142.5 }, { talla: 145, peso: 76, pt: 143.5 }, { talla: 145, peso: 77, pt: 144.5 },
  { talla: 145, peso: 78, pt: 145.5 }, { talla: 145, peso: 79, pt: 146.5 }, { talla: 145, peso: 80, pt: 147.5 }, { talla: 145, peso: 81, pt: 148.5 },
  { talla: 145, peso: 82, pt: 150}, { talla: 145, peso: 83, pt: 151 }, { talla: 145, peso: 84, pt: 152 }, { talla: 145, peso: 85, pt: 153 },
  { talla: 146, peso: 33, pt: 69 }, { talla: 146, peso: 34, pt: 70.5 }, { talla: 146, peso: 35, pt: 72.5 },
  { talla: 146, peso: 36, pt: 75 }, { talla: 146, peso: 37, pt: 77 }, { talla: 146, peso: 38, pt: 79.5 }, { talla: 146, peso: 39, pt: 81.5 },
  { talla: 146, peso: 40, pt: 83.5 }, { talla: 146, peso: 41, pt: 85 }, { talla: 146, peso: 42, pt: 87 }, { talla: 146, peso: 43, pt: 89 },
  { talla: 146, peso: 44, pt: 91.5 }, { talla: 146, peso: 45, pt: 94 }, { talla: 146, peso: 46, pt: 96.5 }, { talla: 146, peso: 47, pt: 98.5 },
  { talla: 146, peso: 48, pt: 100.5 }, { talla: 146, peso: 49, pt: 103 }, { talla: 146, peso: 50, pt: 105 }, { talla: 146, peso: 51, pt: 107.5 },
  { talla: 146, peso: 52, pt: 109.5 }, { talla: 146, peso: 53, pt: 112 }, { talla: 146, peso: 54, pt: 113.8 }, { talla: 146, peso: 55, pt: 115.5 },
  { talla: 146, peso: 56, pt: 117.5 }, { talla: 146, peso: 57, pt: 119.5 }, { talla: 146, peso: 58, pt: 121 }, { talla: 146, peso: 59, pt: 122.8 },
  { talla: 146, peso: 60, pt: 124.5 }, { talla: 146, peso: 61, pt: 126 }, { talla: 146, peso: 62, pt: 127.5 }, { talla: 146, peso: 63, pt: 129 },
  { talla: 146, peso: 64, pt: 130.5 }, { talla: 146, peso: 65, pt: 131.8 }, { talla: 146, peso: 66, pt: 133 }, { talla: 146, peso: 67, pt: 134 },
  { talla: 146, peso: 68, pt: 135.5 }, { talla: 146, peso: 69, pt: 136.5 }, { talla: 146, peso: 70, pt: 137.5 }, { talla: 146, peso: 71, pt: 138.5 },
  { talla: 146, peso: 72, pt: 139.5 }, { talla: 146, peso: 73, pt: 140.5 }, { talla: 146, peso: 74, pt: 141.5 }, { talla: 146, peso: 75, pt: 142.5 },
  { talla: 146, peso: 76, pt: 143.5 }, { talla: 146, peso: 77, pt: 144.5 }, { talla: 146, peso: 78, pt: 145.5 }, { talla: 146, peso: 79, pt: 146.5 },
  { talla: 146, peso: 80, pt: 147.5 }, { talla: 146, peso: 81, pt: 148.5 }, { talla: 146, peso: 82, pt: 150 }, { talla: 146, peso: 83, pt: 151 }, 
  { talla: 146, peso: 84, pt: 152 }, { talla: 146, peso: 85, pt: 153 },
  { talla: 147, peso: 34, pt: 70 }, { talla: 147, peso: 35, pt: 71.5 }, { talla: 147, peso: 36, pt: 74 }, { talla: 147, peso: 37, pt: 76.5 },
  { talla: 147, peso: 38, pt: 78.5 }, { talla: 147, peso: 39, pt: 80.5 }, { talla: 147, peso: 40, pt: 82.5 }, { talla: 147, peso: 41, pt: 84.5 },
  { talla: 147, peso: 42, pt: 86.5 }, { talla: 147, peso: 43, pt: 88 }, { talla: 147, peso: 44, pt: 90 }, { talla: 147, peso: 45, pt: 92.5 },
  { talla: 147, peso: 46, pt: 95 }, { talla: 147, peso: 47, pt: 97 }, { talla: 147, peso: 48, pt: 99.5 }, { talla: 147, peso: 49, pt: 101.5 },
  { talla: 147, peso: 50, pt: 104 }, { talla: 147, peso: 51, pt: 106.5 }, { talla: 147, peso: 52, pt: 108.5 }, { talla: 147, peso: 53, pt: 110.5 },
  { talla: 147, peso: 54, pt: 112.5 }, { talla: 147, peso: 55, pt: 114 }, { talla: 147, peso: 56, pt: 116 }, { talla: 147, peso: 57, pt: 118 },
  { talla: 147, peso: 58, pt: 119.5 }, { talla: 147, peso: 59, pt: 121.5 }, { talla: 147, peso: 60, pt: 123 }, { talla: 147, peso: 61, pt: 125 },
  { talla: 147, peso: 62, pt: 126.5 }, { talla: 147, peso: 63, pt: 127.8 }, { talla: 147, peso: 64, pt: 129.3 }, { talla: 147, peso: 65, pt: 130.8 },
  { talla: 147, peso: 66, pt: 132 }, { talla: 147, peso: 67, pt: 133 }, { talla: 147, peso: 68, pt: 134 }, { talla: 147, peso: 69, pt: 135.5 },
  { talla: 147, peso: 70, pt: 136.5 }, { talla: 147, peso: 71, pt: 137.5 }, { talla: 147, peso: 72, pt: 138.5 }, { talla: 147, peso: 73, pt: 139.5 },
  { talla: 147, peso: 74, pt: 140.5 }, { talla: 147, peso: 75, pt: 141.5 }, { talla: 147, peso: 76, pt: 142.5 }, { talla: 147, peso: 77, pt: 143.5 },
  { talla: 147, peso: 78, pt: 144.5 }, { talla: 147, peso: 79, pt: 145.5 }, { talla: 147, peso: 80, pt: 146.5 }, { talla: 147, peso: 81, pt: 147.5 },
  { talla: 147, peso: 82, pt: 148.5 }, { talla: 147, peso: 83, pt: 149.5 }, { talla: 147, peso: 84, pt: 150.5 }, { talla: 147, peso: 85, pt: 152 }, 
  { talla: 147, peso: 86, pt: 153 },
  { talla: 148, peso: 34, pt: 69.5 }, { talla: 148, peso: 35, pt: 70.5 }, { talla: 148, peso: 36, pt: 73 }, { talla: 148, peso: 37, pt: 75 }, { talla: 148, peso: 38, pt: 77 },
  { talla: 148, peso: 39, pt: 79.5 }, { talla: 148, peso: 40, pt: 81.5 }, { talla: 148, peso: 41, pt: 83.5 }, { talla: 148, peso: 42, pt: 85 },
  { talla: 148, peso: 43, pt: 87 }, { talla: 148, peso: 44, pt: 89 }, { talla: 148, peso: 45, pt: 91 }, { talla: 148, peso: 46, pt: 93.5 }, { talla: 148, peso: 47, pt: 96 },
  { talla: 148, peso: 48, pt: 97.5 }, { talla: 148, peso: 49, pt: 100 }, { talla: 148, peso: 50, pt: 102.5 }, { talla: 148, peso: 51, pt: 105 },
  { talla: 148, peso: 52, pt: 107 }, { talla: 148, peso: 53, pt: 109 }, { talla: 148, peso: 54, pt: 111.5 }, { talla: 148, peso: 55, pt: 113 }, { talla: 148, peso: 56, pt: 114.5 },
  { talla: 148, peso: 57, pt: 116.5 }, { talla: 148, peso: 58, pt: 118.5 }, { talla: 148, peso: 59, pt: 120 }, { talla: 148, peso: 60, pt: 122 },
  { talla: 148, peso: 61, pt: 123.5 }, { talla: 148, peso: 62, pt: 125 }, { talla: 148, peso: 63, pt: 126.5 }, { talla: 148, peso: 64, pt: 128 },
  { talla: 148, peso: 65, pt: 129.5 }, { talla: 148, peso: 66, pt: 131 }, { talla: 148, peso: 67, pt: 132 }, { talla: 148, peso: 68, pt: 133 },
  { talla: 148, peso: 69, pt: 134.5 }, { talla: 148, peso: 70, pt: 136 }, { talla: 148, peso: 71, pt: 137 }, { talla: 148, peso: 72, pt: 138 },
  { talla: 148, peso: 73, pt: 139 }, { talla: 148, peso: 74, pt: 140 }, { talla: 148, peso: 75, pt: 141 }, { talla: 148, peso: 76, pt: 142 },
  { talla: 148, peso: 77, pt: 143 }, { talla: 148, peso: 78, pt: 144 }, { talla: 148, peso: 79, pt: 145 }, { talla: 148, peso: 80, pt: 146 }, { talla: 148, peso: 81, pt: 147 },
  { talla: 148, peso: 82, pt: 148 }, { talla: 148, peso: 83, pt: 149 }, { talla: 148, peso: 84, pt: 150 }, { talla: 148, peso: 85, pt: 151 }, 
  { talla: 148, peso: 86, pt: 152 }, { talla: 148, peso: 87, pt: 153 },
  { talla: 149, peso: 34, pt: 69 }, { talla: 149, peso: 35, pt: 70 }, { talla: 149, peso: 36, pt: 72 }, { talla: 149, peso: 37, pt: 74 }, { talla: 149, peso: 38, pt: 76.5 },
  { talla: 149, peso: 39, pt: 78.5 }, { talla: 149, peso: 40, pt: 80.5 }, { talla: 149, peso: 41, pt: 82.5 }, { talla: 149, peso: 42, pt: 84.5 },
  { talla: 149, peso: 43, pt: 86 }, { talla: 149, peso: 44, pt: 87.5 }, { talla: 149, peso: 45, pt: 89.5 }, { talla: 149, peso: 46, pt: 92 }, { talla: 149, peso: 47, pt: 94.5 },
  { talla: 149, peso: 48, pt: 96.5 }, { talla: 149, peso: 49, pt: 98.5 }, { talla: 149, peso: 50, pt: 101 }, { talla: 149, peso: 51, pt: 103 }, 
  { talla: 149, peso: 52, pt: 105.5 }, { talla: 149, peso: 53, pt: 107.5 }, { talla: 149, peso: 54, pt: 110 }, { talla: 149, peso: 55, pt: 112 },
  { talla: 149, peso: 56, pt: 113.5 }, { talla: 149, peso: 57, pt: 115 }, { talla: 149, peso: 58, pt: 117 }, { talla: 149, peso: 59, pt: 118.8 },
  { talla: 149, peso: 60, pt: 120.5 }, { talla: 149, peso: 61, pt: 122 }, { talla: 149, peso: 62, pt: 123.8 }, { talla: 149, peso: 63, pt: 125.5 },
  { talla: 149, peso: 64, pt: 127 }, { talla: 149, peso: 65, pt: 128.3 }, { talla: 149, peso: 66, pt: 129.8 }, { talla: 149, peso: 67, pt: 131.2 },
  { talla: 149, peso: 68, pt: 132.2 }, { talla: 149, peso: 69, pt: 133.2 }, { talla: 149, peso: 70, pt: 134.5 }, { talla: 149, peso: 71, pt: 136 },
  { talla: 149, peso: 72, pt: 137 }, { talla: 149, peso: 73, pt: 138 }, { talla: 149, peso: 74, pt: 139 }, { talla: 149, peso: 75, pt: 140 }, { talla: 149, peso: 76, pt: 141 },
  { talla: 149, peso: 77, pt: 142 }, { talla: 149, peso: 78, pt: 143 }, { talla: 149, peso: 79, pt: 144 }, { talla: 149, peso: 80, pt: 145 },
  { talla: 149, peso: 81, pt: 146 }, { talla: 149, peso: 82, pt: 147 }, { talla: 149, peso: 83, pt: 148 }, { talla: 149, peso: 84, pt: 149 }, { talla: 149, peso: 85, pt: 150 },
  { talla: 149, peso: 86, pt: 151 }, { talla: 149, peso: 87, pt: 152 }, { talla: 149, peso: 88, pt: 153 },
  { talla: 150, peso: 34, pt: 68 }, { talla: 150, peso: 35, pt: 70 }, { talla: 150, peso: 36, pt: 71 }, { talla: 150, peso: 37, pt: 73 }, { talla: 150, peso: 38, pt: 75.5 },
  { talla: 150, peso: 39, pt: 77.5 }, { talla: 150, peso: 40, pt: 80 }, { talla: 150, peso: 41, pt: 81.5 }, { talla: 150, peso: 42, pt: 83.5 }, { talla: 150, peso: 43, pt: 85 },
  { talla: 150, peso: 44, pt: 87 }, { talla: 150, peso: 45, pt: 88.5 }, { talla: 150, peso: 46, pt: 90.5 }, { talla: 150, peso: 47, pt: 93 }, { talla: 150, peso: 48, pt: 95.5 },
  { talla: 150, peso: 49, pt: 97.5 }, { talla: 150, peso: 50, pt: 99.5 }, { talla: 150, peso: 51, pt: 101.5 }, { talla: 150, peso: 52, pt: 104 }, { talla: 150, peso: 53, pt: 106.5 },
  { talla: 150, peso: 54, pt: 108.5 }, { talla: 150, peso: 55, pt: 110.5 }, { talla: 150, peso: 56, pt: 112.5 }, { talla: 150, peso: 57, pt: 114 }, { talla: 150, peso: 58, pt: 116 },
  { talla: 150, peso: 59, pt: 117.5 }, { talla: 150, peso: 60, pt: 119.5 }, { talla: 150, peso: 61, pt: 121 }, { talla: 150, peso: 62, pt: 122.5 }, { talla: 150, peso: 63, pt: 124 },
  { talla: 150, peso: 64, pt: 125.8 }, { talla: 150, peso: 65, pt: 127 }, { talla: 150, peso: 66, pt: 128.5 }, { talla: 150, peso: 67, pt: 130 }, { talla: 150, peso: 68, pt: 131.3 },
  { talla: 150, peso: 69, pt: 132.3 }, { talla: 150, peso: 70, pt: 133.3 }, { talla: 150, peso: 71, pt: 135 }, { talla: 150, peso: 72, pt: 136 }, { talla: 150, peso: 73, pt: 137 },
  { talla: 150, peso: 74, pt: 138 }, { talla: 150, peso: 75, pt: 139 }, { talla: 150, peso: 76, pt: 140 }, { talla: 150, peso: 77, pt: 141 }, { talla: 150, peso: 78, pt: 142 },
  { talla: 150, peso: 79, pt: 143 }, { talla: 150, peso: 80, pt: 144 }, { talla: 150, peso: 81, pt: 145 }, { talla: 150, peso: 82, pt: 146 }, { talla: 150, peso: 83, pt: 147 },
  { talla: 150, peso: 84, pt: 148 }, { talla: 150, peso: 85, pt: 149 }, { talla: 150, peso: 86, pt: 150 }, { talla: 150, peso: 87, pt: 151 }, { talla: 150, peso: 88, pt: 152 }, 
  { talla: 150, peso: 89, pt: 153 }, { talla: 150, peso: 90, pt: 154 },
  { talla: 151, peso: 35, pt: 69 }, { talla: 151, peso: 36, pt: 70.5 }, { talla: 151, peso: 37, pt: 72 }, { talla: 151, peso: 38, pt: 74.5 }, 
  { talla: 151, peso: 39, pt: 76.5 },{ talla: 151, peso: 40, pt: 79 }, { talla: 151, peso: 41, pt: 81 }, { talla: 151, peso: 42, pt: 82.5 }, 
  { talla: 151, peso: 43, pt: 84.5 }, { talla: 151, peso: 44, pt: 86 }, { talla: 151, peso: 45, pt: 87.5 }, { talla: 151, peso: 46, pt: 89.5 }, 
  { talla: 151, peso: 47, pt: 92 }, { talla: 151, peso: 48, pt: 94.5 }, { talla: 151, peso: 49, pt: 96.5 }, { talla: 151, peso: 50, pt: 98.5 }, 
  { talla: 151, peso: 51, pt: 100.5 }, { talla: 151, peso: 52, pt: 102.5 }, { talla: 151, peso: 53, pt: 105 }, { talla: 151, peso: 54, pt: 107 },
  { talla: 151, peso: 55, pt: 109 }, { talla: 151, peso: 56, pt: 111.5 }, { talla: 151, peso: 57, pt: 113 }, { talla: 151, peso: 58, pt: 114.5 }, 
  { talla: 151, peso: 59, pt: 116.5 },{ talla: 151, peso: 60, pt: 118 }, { talla: 151, peso: 61, pt: 119.5 }, { talla: 151, peso: 62, pt: 121.5 }, 
  { talla: 151, peso: 63, pt: 123 }, { talla: 151, peso: 64, pt: 124.5 }, { talla: 151, peso: 65, pt: 126 }, { talla: 151, peso: 66, pt: 122.3 },
  { talla: 151, peso: 67, pt: 128.8 }, { talla: 151, peso: 68, pt: 130 }, { talla: 151, peso: 69, pt: 131.5 }, { talla: 151, peso: 70, pt: 132.5 },
  { talla: 151, peso: 71, pt: 133.5 }, { talla: 151, peso: 72, pt: 135 }, { talla: 151, peso: 73, pt: 136 }, { talla: 151, peso: 74, pt: 137 },
  { talla: 151, peso: 75, pt: 138 }, { talla: 151, peso: 76, pt: 139 }, { talla: 151, peso: 77, pt: 140 }, { talla: 151, peso: 78, pt: 141 },
  { talla: 151, peso: 79, pt: 142 }, { talla: 151, peso: 80, pt: 143 }, { talla: 151, peso: 81, pt: 144 }, { talla: 151, peso: 82, pt: 145 },
  { talla: 151, peso: 83, pt: 146 }, { talla: 151, peso: 84, pt: 147 }, { talla: 151, peso: 85, pt: 148 }, { talla: 151, peso: 86, pt: 149 },
  { talla: 151, peso: 87, pt: 150 }, { talla: 151, peso: 88, pt: 151 }, { talla: 151, peso: 89, pt: 152 }, { talla: 151, peso: 90, pt: 153 },
  { talla: 152, peso: 36, pt: 70 }, { talla: 152, peso: 37, pt: 71.5 }, { talla: 152, peso: 38, pt: 73.5 }, { talla: 152, peso: 39, pt: 75.5 },
  { talla: 152, peso: 40, pt: 78 }, { talla: 152, peso: 41, pt: 80 }, { talla: 152, peso: 42, pt: 81.5 }, { talla: 152, peso: 43, pt: 83.5 },
  { talla: 152, peso: 44, pt: 85 }, { talla: 152, peso: 45, pt: 86.5 }, { talla: 152, peso: 46, pt: 88.5 }, { talla: 152, peso: 47, pt: 90.5 },
  { talla: 152, peso: 48, pt: 93 }, { talla: 152, peso: 49, pt: 95 }, { talla: 152, peso: 50, pt: 97 }, { talla: 152, peso: 51, pt: 99 },
  { talla: 152, peso: 52, pt: 101.5 }, { talla: 152, peso: 53, pt: 103.5 }, { talla: 152, peso: 54, pt: 105.5 }, { talla: 152, peso: 55, pt: 107.5 },
  { talla: 152, peso: 56, pt: 110 }, { talla: 152, peso: 57, pt: 111.5 }, { talla: 152, peso: 58, pt: 113.5 }, { talla: 152, peso: 59, pt: 115 },
  { talla: 152, peso: 60, pt: 117 }, { talla: 152, peso: 61, pt: 118.5 }, { talla: 152, peso: 62, pt: 120 }, { talla: 152, peso: 63, pt: 121.8 },
  { talla: 152, peso: 64, pt: 123.5 }, { talla: 152, peso: 65, pt: 125 }, { talla: 152, peso: 66, pt: 126.4 }, { talla: 152, peso: 67, pt: 127.5 },
  { talla: 152, peso: 68, pt: 129 }, { talla: 152, peso: 69, pt: 130.5 }, { talla: 152, peso: 70, pt: 131.5 }, { talla: 152, peso: 71, pt: 132.5 },
  { talla: 152, peso: 72, pt: 133.8 }, { talla: 152, peso: 73, pt: 135 }, { talla: 152, peso: 74, pt: 136.5 }, { talla: 152, peso: 75, pt: 138 },
  { talla: 152, peso: 76, pt: 139.5 }, { talla: 152, peso: 77, pt: 141 }, { talla: 152, peso: 78, pt: 142.5 }, { talla: 152, peso: 79, pt: 144 },
  { talla: 152, peso: 80, pt: 145.5 }, { talla: 152, peso: 81, pt: 147 }, { talla: 152, peso: 82, pt: 148.5 }, { talla: 152, peso: 83, pt: 150 },
  { talla: 152, peso: 84, pt: 151.5 }, { talla: 152, peso: 85, pt: 153 },
  { talla: 153, peso: 36, pt: 69.5 }, { talla: 153, peso: 37, pt: 71 }, { talla: 153, peso: 38, pt: 73 }, { talla: 153, peso: 39, pt: 75 },
  { talla: 153, peso: 40, pt: 77 }, { talla: 153, peso: 41, pt: 79 }, { talla: 153, peso: 42, pt: 81 }, { talla: 153, peso: 43, pt: 83 },
  { talla: 153, peso: 44, pt: 84.5 }, { talla: 153, peso: 45, pt: 86 }, { talla: 153, peso: 46, pt: 87.5 }, { talla: 153, peso: 47, pt: 89.5 },
  { talla: 153, peso: 48, pt: 91.5 }, { talla: 153, peso: 49, pt: 94 }, { talla: 153, peso: 50, pt: 96 }, { talla: 153, peso: 51, pt: 98 }, 
  { talla: 153, peso: 52, pt: 100 }, { talla: 153, peso: 53, pt: 102 }, { talla: 153, peso: 54, pt: 104 }, { talla: 153, peso: 55, pt: 106.5 },
  { talla: 153, peso: 56, pt: 108.5 }, { talla: 153, peso: 57, pt: 110.5 }, { talla: 153, peso: 58, pt: 112.5 }, { talla: 153, peso: 59, pt: 114.5 },
  { talla: 153, peso: 60, pt: 115.5 }, { talla: 153, peso: 61, pt: 117.5 }, { talla: 153, peso: 62, pt: 119 }, { talla: 153, peso: 63, pt: 120.5 },
  { talla: 153, peso: 64, pt: 122 }, { talla: 153, peso: 65, pt: 123.5 }, { talla: 153, peso: 66, pt: 125 }, { talla: 153, peso: 67, pt: 126.5 },
  { talla: 153, peso: 68, pt: 128 }, { talla: 153, peso: 69, pt: 129 }, { talla: 153, peso: 70, pt: 130.5 }, { talla: 153, peso: 71, pt: 131.8 },
  { talla: 153, peso: 72, pt: 132.8 }, { talla: 153, peso: 73, pt: 133.8 }, { talla: 153, peso: 74, pt: 135 }, { talla: 153, peso: 75, pt: 136.5 },
  { talla: 153, peso: 76, pt: 138 }, { talla: 153, peso: 77, pt: 139.5 }, { talla: 153, peso: 78, pt: 141 }, { talla: 153, peso: 79, pt: 142.5 },
  { talla: 153, peso: 80, pt: 144 }, { talla: 153, peso: 81, pt: 145.5 }, { talla: 153, peso: 82, pt: 147 }, { talla: 153, peso: 83, pt: 148.5 },
  { talla: 153, peso: 84, pt: 150 }, { talla: 153, peso: 85, pt: 151.5 },
  { talla: 154, peso: 37, pt: 70 }, { talla: 154, peso: 38, pt: 72 }, { talla: 154, peso: 39, pt: 74 }, { talla: 154, peso: 40, pt: 76 },
  { talla: 154, peso: 41, pt: 78 }, { talla: 154, peso: 42, pt: 80 }, { talla: 154, peso: 43, pt: 82 }, { talla: 154, peso: 44, pt: 83.5 },
  { talla: 154, peso: 45, pt: 85 }, { talla: 154, peso: 46, pt: 87 }, { talla: 154, peso: 47, pt: 88.5 }, { talla: 154, peso: 48, pt: 90 },
  { talla: 154, peso: 49, pt: 93 }, { talla: 154, peso: 50, pt: 95 }, { talla: 154, peso: 51, pt: 97 }, { talla: 154, peso: 52, pt: 99 },
  { talla: 154, peso: 53, pt: 101 }, { talla: 154, peso: 54, pt: 103 }, { talla: 154, peso: 55, pt: 105 }, { talla: 154, peso: 56, pt: 107 },
  { talla: 154, peso: 57, pt: 109 }, { talla: 154, peso: 58, pt: 111.5 }, { talla: 154, peso: 59, pt: 112.5 }, { talla: 154, peso: 60, pt: 114.5 },
  { talla: 154, peso: 61, pt: 116 }, { talla: 154, peso: 62, pt: 117.5 }, { talla: 154, peso: 63, pt: 119.5 }, { talla: 154, peso: 64, pt: 121 },
  { talla: 154, peso: 65, pt: 122.5 }, { talla: 154, peso: 66, pt: 124 }, { talla: 154, peso: 67, pt: 125.5 }, { talla: 154, peso: 68, pt: 126.8 }, 
  { talla: 154, peso: 69, pt: 128 }, { talla: 154, peso: 70, pt: 129.5 }, { talla: 154, peso: 71, pt: 131 }, { talla: 154, peso: 72, pt: 132 },
  { talla: 154, peso: 73, pt: 133 }, { talla: 154, peso: 74, pt: 134 }, { talla: 154, peso: 75, pt: 135 }, { talla: 154, peso: 76, pt: 136.5 },
  { talla: 154, peso: 77, pt: 138 }, { talla: 154, peso: 78, pt: 139.5 }, { talla: 154, peso: 79, pt: 141 }, { talla: 154, peso: 80, pt: 142.5 }, 
  { talla: 154, peso: 81, pt: 144 }, { talla: 154, peso: 82, pt: 145.5 }, { talla: 154, peso: 83, pt: 147 }, { talla: 154, peso: 84, pt: 148.5 },
  { talla: 154, peso: 85, pt: 150 },
  { talla: 155, peso: 37, pt: 70 }, { talla: 155, peso: 38, pt: 71.5 }, { talla: 155, peso: 39, pt: 73.5 }, { talla: 155, peso: 40, pt: 75.5 },
  { talla: 155, peso: 41, pt: 77.5 }, { talla: 155, peso: 42, pt: 80 }, { talla: 155, peso: 43, pt: 81.5 }, { talla: 155, peso: 44, pt: 83 },
  { talla: 155, peso: 45, pt: 85 }, { talla: 155, peso: 46, pt: 86 }, { talla: 155, peso: 47, pt: 87.5 }, { talla: 155, peso: 48, pt: 89.5 },
  { talla: 155, peso: 49, pt: 91.5 }, { talla: 155, peso: 50, pt: 93.5 }, { talla: 155, peso: 51, pt: 96 }, { talla: 155, peso: 52, pt: 97.5 },
  { talla: 155, peso: 53, pt: 100 }, { talla: 155, peso: 54, pt: 101.5 }, { talla: 155, peso: 55, pt: 104.5 }, { talla: 155, peso: 56, pt: 106 },
  { talla: 155, peso: 57, pt: 107 }, { talla: 155, peso: 58, pt: 110 }, { talla: 155, peso: 59, pt: 111.5 }, { talla: 155, peso: 60, pt: 113 },
  { talla: 155, peso: 61, pt: 115 }, { talla: 155, peso: 62, pt: 116.5 }, { talla: 155, peso: 63, pt: 118 }, { talla: 155, peso: 64, pt: 120 },
  { talla: 155, peso: 65, pt: 121.5 }, { talla: 155, peso: 66, pt: 123 }, { talla: 155, peso: 67, pt: 124 }, { talla: 155, peso: 68, pt: 125.8 },
  { talla: 155, peso: 69, pt: 127 }, { talla: 155, peso: 70, pt: 128.2 }, { talla: 155, peso: 71, pt: 129.5 }, { talla: 155, peso: 72, pt: 131 },
  { talla: 155, peso: 73, pt: 132 }, { talla: 155, peso: 74, pt: 133 }, { talla: 155, peso: 75, pt: 134 }, { talla: 155, peso: 76, pt: 135 },
  { talla: 155, peso: 77, pt: 136.5 }, { talla: 155, peso: 78, pt: 138 }, { talla: 155, peso: 79, pt: 139.5 }, { talla: 155, peso: 80, pt: 141 },
  { talla: 155, peso: 81, pt: 142.5 }, { talla: 155, peso: 82, pt: 144 }, { talla: 155, peso: 83, pt: 145.5 }, { talla: 155, peso: 84, pt: 147 },
  { talla: 155, peso: 85, pt: 148.5 }, { talla: 155, peso: 86, pt: 150 },
  { talla: 156, peso: 38, pt: 70.5 }, { talla: 156, peso: 39, pt: 72.5 }, { talla: 156, peso: 40, pt: 75 }, { talla: 156, peso: 41, pt: 76.5 },
  { talla: 156, peso: 42, pt: 78.5 }, { talla: 156, peso: 43, pt: 80.5 }, { talla: 156, peso: 44, pt: 82 }, { talla: 156, peso: 45, pt: 83.5 },
  { talla: 156, peso: 46, pt: 85 }, { talla: 156, peso: 47, pt: 87 }, { talla: 156, peso: 48, pt: 88.5 }, { talla: 156, peso: 49, pt: 90 },
  { talla: 156, peso: 50, pt: 92.5 }, { talla: 156, peso: 51, pt: 95 }, { talla: 156, peso: 52, pt: 96.5 }, { talla: 156, peso: 53, pt: 98.5 },
  { talla: 156, peso: 54, pt: 100.5 }, { talla: 156, peso: 55, pt: 102.5 }, { talla: 156, peso: 56, pt: 105 }, { talla: 156, peso: 57, pt: 106.5 },
  { talla: 156, peso: 58, pt: 108.5 }, { talla: 156, peso: 59, pt: 110.5 }, { talla: 156, peso: 60, pt: 112 }, { talla: 156, peso: 61, pt: 113.5 },
  { talla: 156, peso: 62, pt: 115.5 }, { talla: 156, peso: 63, pt: 117 }, { talla: 156, peso: 64, pt: 118.5 }, { talla: 156, peso: 65, pt: 120 },
  { talla: 156, peso: 66, pt: 121.5 }, { talla: 156, peso: 67, pt: 123 }, { talla: 156, peso: 68, pt: 124.5 }, { talla: 156, peso: 69, pt: 126 },
  { talla: 156, peso: 70, pt: 127.2 }, { talla: 156, peso: 71, pt: 128.5 }, { talla: 156, peso: 72, pt: 130 }, { talla: 156, peso: 73, pt: 131.2 },
  { talla: 156, peso: 74, pt: 132 }, { talla: 156, peso: 75, pt: 133 }, { talla: 156, peso: 76, pt: 134 }, { talla: 156, peso: 77, pt: 135 },
  { talla: 156, peso: 78, pt: 136.5 }, { talla: 156, peso: 79, pt: 138 }, { talla: 156, peso: 80, pt: 139.5 }, { talla: 156, peso: 81, pt: 141 },
  { talla: 156, peso: 82, pt: 142.5 }, { talla: 156, peso: 83, pt: 144 }, { talla: 156, peso: 84, pt: 145.5 }, { talla: 156, peso: 85, pt: 147 },
  { talla: 156, peso: 86, pt: 148.5 }, { talla: 156, peso: 87, pt: 150 },
  { talla: 157, peso: 38, pt: 70 },   { talla: 157, peso: 39, pt: 71.5 }, { talla: 157, peso: 40, pt: 73.5 }, { talla: 157, peso: 41, pt: 75.5 },
  { talla: 157, peso: 42, pt: 77.5 }, { talla: 157, peso: 43, pt: 80 }, { talla: 157, peso: 44, pt: 81.5 }, { talla: 157, peso: 45, pt: 83 },
  { talla: 157, peso: 46, pt: 84.5 }, { talla: 157, peso: 47, pt: 86 }, { talla: 157, peso: 48, pt: 87.5 }, { talla: 157, peso: 49, pt: 89.5 },
  { talla: 157, peso: 50, pt: 91.5 }, { talla: 157, peso: 51, pt: 93.5 },{ talla: 157, peso: 52, pt: 95.5 }, { talla: 157, peso: 53, pt: 97.5 },
  { talla: 157, peso: 54, pt: 99 }, { talla: 157, peso: 55, pt: 101 }, { talla: 157, peso: 56, pt: 103 }, { talla: 157, peso: 57, pt: 105 },
  { talla: 157, peso: 58, pt: 107 }, { talla: 157, peso: 59, pt: 109 }, { talla: 157, peso: 60, pt: 111 }, { talla: 157, peso: 61, pt: 112.5 },
  { talla: 157, peso: 62, pt: 114 }, { talla: 157, peso: 63, pt: 116 }, { talla: 157, peso: 64, pt: 117.5 },{ talla: 157, peso: 65, pt: 119 },
  { talla: 157, peso: 66, pt: 120.5 },{ talla: 157, peso: 67, pt: 122 }, { talla: 157, peso: 68, pt: 123.5 },{ talla: 157, peso: 69, pt: 125 },
  { talla: 157, peso: 70, pt: 126.5 },{ talla: 157, peso: 71, pt: 127.5 },{ talla: 157, peso: 72, pt: 129 }, { talla: 157, peso: 73, pt: 130 },
  { talla: 157, peso: 74, pt: 131.5 },{ talla: 157, peso: 75, pt: 132 }, { talla: 157, peso: 76, pt: 133.5 },{ talla: 157, peso: 77, pt: 134 },
  { talla: 157, peso: 78, pt: 135.5 },{ talla: 157, peso: 79, pt: 137 }, { talla: 157, peso: 80, pt: 138.5 },{ talla: 157, peso: 81, pt: 140 },
  { talla: 157, peso: 82, pt: 141.5 },{ talla: 157, peso: 83, pt: 143 }, { talla: 157, peso: 84, pt: 144.5 },{ talla: 157, peso: 85, pt: 146 },
  { talla: 157, peso: 86, pt: 147.5 },{ talla: 157, peso: 87, pt: 149 }, { talla: 157, peso: 88, pt: 150.5 },
  { talla: 158, peso: 38, pt: 70 }, { talla: 158, peso: 40, pt: 72.5 },{ talla: 158, peso: 41, pt: 75 }, { talla: 158, peso: 42, pt: 76.5 },
  { talla: 158, peso: 43, pt: 78.5 }, { talla: 158, peso: 44, pt: 80 }, { talla: 158, peso: 45, pt: 82 }, { talla: 158, peso: 46, pt: 83.5 },
  { talla: 158, peso: 47, pt: 85.5 }, { talla: 158, peso: 48, pt: 86.5 }, { talla: 158, peso: 49, pt: 88.5 }, { talla: 158, peso: 50, pt: 89.5 },
  { talla: 158, peso: 51, pt: 92 }, { talla: 158, peso: 52, pt: 94.5 }, { talla: 158, peso: 53, pt: 96.5 }, { talla: 158, peso: 54, pt: 97.5 },
  { talla: 158, peso: 55, pt: 100 }, { talla: 158, peso: 56, pt: 101.5 },{ talla: 158, peso: 57, pt: 103.5 },{ talla: 158, peso: 58, pt: 106 },
  { talla: 158, peso: 59, pt: 108 }, { talla: 158, peso: 60, pt: 110 }, { talla: 158, peso: 61, pt: 111.5 },{ talla: 158, peso: 62, pt: 113 },
  { talla: 158, peso: 63, pt: 114.5 },{ talla: 158, peso: 64, pt: 116.5 },{ talla: 158, peso: 65, pt: 117.5 },{ talla: 158, peso: 66, pt: 119.5 },
  { talla: 158, peso: 67, pt: 121 }, { talla: 158, peso: 68, pt: 122 }, { talla: 158, peso: 69, pt: 123.5 },{ talla: 158, peso: 70, pt: 125 },
  { talla: 158, peso: 71, pt: 126.5 },{ talla: 158, peso: 72, pt: 127.5 },{ talla: 158, peso: 73, pt: 129 }, { talla: 158, peso: 74, pt: 130 },
  { talla: 158, peso: 75, pt: 131.5 },{ talla: 158, peso: 76, pt: 132.4 },{ talla: 158, peso: 77, pt: 133.4 },{ talla: 158, peso: 78, pt: 134.4 },
  { talla: 158, peso: 79, pt: 135.5 },{ talla: 158, peso: 80, pt: 137 }, { talla: 158, peso: 81, pt: 138.5 },{ talla: 158, peso: 82, pt: 140 },
  { talla: 158, peso: 83, pt: 141.5 },{ talla: 158, peso: 84, pt: 143 }, { talla: 158, peso: 85, pt: 144.5 },{ talla: 158, peso: 86, pt: 146 },
  { talla: 158, peso: 87, pt: 147.5 },{ talla: 158, peso: 88, pt: 149 }, { talla: 158, peso: 89, pt: 150.5 },
  { talla: 159, peso: 39, pt: 70.5 }, { talla: 159, peso: 40, pt: 72 }, { talla: 159, peso: 41, pt: 74 }, { talla: 159, peso: 42, pt: 76 },
  { talla: 159, peso: 43, pt: 78 }, { talla: 159, peso: 44, pt: 80 }, { talla: 159, peso: 45, pt: 81.5 }, { talla: 159, peso: 46, pt: 83 },
  { talla: 159, peso: 47, pt: 85 }, { talla: 159, peso: 48, pt: 86 }, { talla: 159, peso: 49, pt: 87.5 }, { talla: 159, peso: 50, pt: 89 },
  { talla: 159, peso: 51, pt: 91 }, { talla: 159, peso: 52, pt: 93 }, { talla: 159, peso: 53, pt: 95.5 }, { talla: 159, peso: 54, pt: 97 },
  { talla: 159, peso: 55, pt: 99 }, { talla: 159, peso: 56, pt: 101 }, { talla: 159, peso: 57, pt: 102.5 },{ talla: 159, peso: 58, pt: 105 },
  { talla: 159, peso: 59, pt: 106.5 },{ talla: 159, peso: 60, pt: 108.5 },{ talla: 159, peso: 61, pt: 110.5 },{ talla: 159, peso: 62, pt: 112 },
  { talla: 159, peso: 63, pt: 113.5 },{ talla: 159, peso: 64, pt: 115 },  { talla: 159, peso: 65, pt: 116.8 },{ talla: 159, peso: 66, pt: 118 },
  { talla: 159, peso: 67, pt: 119.5 },{ talla: 159, peso: 68, pt: 121 },  { talla: 159, peso: 69, pt: 122.5 },{ talla: 159, peso: 70, pt: 124 },
  { talla: 159, peso: 71, pt: 125.5 },{ talla: 159, peso: 72, pt: 126.8 },{ talla: 159, peso: 73, pt: 127.8 },{ talla: 159, peso: 74, pt: 129 },
  { talla: 159, peso: 75, pt: 130.5 },{ talla: 159, peso: 76, pt: 131.5 },{ talla: 159, peso: 77, pt: 132.5 },{ talla: 159, peso: 78, pt: 133.5 },
  { talla: 159, peso: 79, pt: 134.5 },{ talla: 159, peso: 80, pt: 135.5 },{ talla: 159, peso: 81, pt: 137 }, { talla: 159, peso: 82, pt: 138.5 },
  { talla: 159, peso: 83, pt: 140 }, { talla: 159, peso: 84, pt: 141.5 },{ talla: 159, peso: 85, pt: 143 }, { talla: 159, peso: 86, pt: 144.5 },
  { talla: 159, peso: 87, pt: 146 }, { talla: 159, peso: 88, pt: 147.5 },{ talla: 159, peso: 89, pt: 149 }, { talla: 159, peso: 90, pt: 150.5 },
  { talla: 160, peso: 39, pt: 70 }, { talla: 160, peso: 40, pt: 71.5 }, { talla: 160, peso: 41, pt: 73 }, { talla: 160, peso: 42, pt: 75.5 },
  { talla: 160, peso: 43, pt: 77 }, { talla: 160, peso: 44, pt: 79 }, { talla: 160, peso: 45, pt: 80.5 }, { talla: 160, peso: 46, pt: 82.5 },
  { talla: 160, peso: 47, pt: 83.5 }, { talla: 160, peso: 48, pt: 85.5 }, { talla: 160, peso: 49, pt: 86.5 }, { talla: 160, peso: 50, pt: 88 },
  { talla: 160, peso: 51, pt: 90 }, { talla: 160, peso: 52, pt: 92 }, { talla: 160, peso: 53, pt: 94 }, { talla: 160, peso: 54, pt: 96.5 },
  { talla: 160, peso: 55, pt: 97.5 }, { talla: 160, peso: 56, pt: 100 }, { talla: 160, peso: 57, pt: 101.5 },{ talla: 160, peso: 58, pt: 103.5 },
  { talla: 160, peso: 59, pt: 105.5 },{ talla: 160, peso: 60, pt: 107 }, { talla: 160, peso: 61, pt: 109 }, { talla: 160, peso: 62, pt: 111 },
  { talla: 160, peso: 63, pt: 112.5 },{ talla: 160, peso: 64, pt: 114 }, { talla: 160, peso: 65, pt: 115.5 },{ talla: 160, peso: 66, pt: 117 },
  { talla: 160, peso: 67, pt: 118.5 },{ talla: 160, peso: 68, pt: 120 }, { talla: 160, peso: 69, pt: 121.5 },{ talla: 160, peso: 70, pt: 123 },
  { talla: 160, peso: 71, pt: 124.5 },{ talla: 160, peso: 72, pt: 126 }, { talla: 160, peso: 73, pt: 127 }, { talla: 160, peso: 74, pt: 128 },
  { talla: 160, peso: 75, pt: 129.4 },{ talla: 160, peso: 76, pt: 130.5 },{ talla: 160, peso: 77, pt: 131.8 },{ talla: 160, peso: 78, pt: 132.5 },
  { talla: 160, peso: 79, pt: 133.5 },{ talla: 160, peso: 80, pt: 134.5 },{ talla: 160, peso: 81, pt: 136 }, { talla: 160, peso: 82, pt: 137.5 },
  { talla: 160, peso: 83, pt: 139 }, { talla: 160, peso: 84, pt: 140.5 },{ talla: 160, peso: 85, pt: 142 }, { talla: 160, peso: 86, pt: 143.5 },
  { talla: 160, peso: 87, pt: 145 }, { talla: 160, peso: 88, pt: 146.5 },{ talla: 160, peso: 89, pt: 148 }, { talla: 160, peso: 90, pt: 149.5 },
  { talla: 160, peso: 91, pt: 151 },
  { talla: 161, peso: 40, pt: 70.5 }, { talla: 161, peso: 41, pt: 72.5 }, { talla: 161, peso: 42, pt: 75 }, { talla: 161, peso: 43, pt: 76.5 },
  { talla: 161, peso: 44, pt: 78.5 }, { talla: 161, peso: 45, pt: 80 }, { talla: 161, peso: 46, pt: 81 }, { talla: 161, peso: 47, pt: 83 },
  { talla: 161, peso: 48, pt: 84.5 }, { talla: 161, peso: 49, pt: 86 },   { talla: 161, peso: 50, pt: 87 }, { talla: 161, peso: 51, pt: 89 },
  { talla: 161, peso: 52, pt: 90.5 }, { talla: 161, peso: 53, pt: 92.5 }, { talla: 161, peso: 54, pt: 95 }, { talla: 161, peso: 55, pt: 96.5 },
  { talla: 161, peso: 56, pt: 98.5 }, { talla: 161, peso: 57, pt: 100.5 },{ talla: 161, peso: 58, pt: 102.5 },{ talla: 161, peso: 59, pt: 104 },
  { talla: 161, peso: 60, pt: 106 }, { talla: 161, peso: 61, pt: 108 }, { talla: 161, peso: 62, pt: 109.5 },{ talla: 161, peso: 63, pt: 111.5 },
  { talla: 161, peso: 64, pt: 113 }, { talla: 161, peso: 65, pt: 114.5 },{ talla: 161, peso: 66, pt: 116 }, { talla: 161, peso: 67, pt: 117.5 },
  { talla: 161, peso: 68, pt: 119 }, { talla: 161, peso: 69, pt: 120.5 },{ talla: 161, peso: 70, pt: 122 }, { talla: 161, peso: 71, pt: 123.4 },
  { talla: 161, peso: 72, pt: 124.5 },{ talla: 161, peso: 73, pt: 126 },  { talla: 161, peso: 74, pt: 127 }, { talla: 161, peso: 75, pt: 128 },
  { talla: 161, peso: 76, pt: 129.5 },{ talla: 161, peso: 77, pt: 130.8 },{ talla: 161, peso: 78, pt: 131.8 },{ talla: 161, peso: 79, pt: 132.8 },
  { talla: 161, peso: 80, pt: 133.8 },{ talla: 161, peso: 81, pt: 135 }, { talla: 161, peso: 82, pt: 136.5 },{ talla: 161, peso: 83, pt: 138 },
  { talla: 161, peso: 84, pt: 139.5 },{ talla: 161, peso: 85, pt: 141 }, { talla: 161, peso: 86, pt: 142.5 },{ talla: 161, peso: 87, pt: 144 },
  { talla: 161, peso: 88, pt: 145.5 },{ talla: 161, peso: 89, pt: 147 }, { talla: 161, peso: 90, pt: 148.5 },
  { talla: 161, peso: 91, pt: 150 },
  { talla: 162, peso: 40, pt: 70.5 }, { talla: 162, peso: 41, pt: 71.5 }, { talla: 162, peso: 42, pt: 73.5 }, { talla: 162, peso: 43, pt: 75.5 },
{ talla: 162, peso: 44, pt: 77.5 }, { talla: 162, peso: 45, pt: 79 }, { talla: 162, peso: 46, pt: 81 }, { talla: 162, peso: 47, pt: 82.5 },
{ talla: 162, peso: 48, pt: 84 }, { talla: 162, peso: 49, pt: 85.5 }, { talla: 162, peso: 50, pt: 86.5 }, { talla: 162, peso: 51, pt: 88 },
{ talla: 162, peso: 52, pt: 90 }, { talla: 162, peso: 53, pt: 91.5 }, { talla: 162, peso: 54, pt: 94 }, { talla: 162, peso: 55, pt: 95.5 },
{ talla: 162, peso: 56, pt: 97.5 }, { talla: 162, peso: 57, pt: 99 }, { talla: 162, peso: 58, pt: 101 }, { talla: 162, peso: 59, pt: 102.5 },
{ talla: 162, peso: 60, pt: 105 }, { talla: 162, peso: 61, pt: 106.5 },{ talla: 162, peso: 62, pt: 108.5 },{ talla: 162, peso: 63, pt: 110 },
{ talla: 162, peso: 64, pt: 112 }, { talla: 162, peso: 65, pt: 113.5 },{ talla: 162, peso: 66, pt: 115 }, { talla: 162, peso: 67, pt: 116.5 },
{ talla: 162, peso: 68, pt: 118 }, { talla: 162, peso: 69, pt: 119.5 },{ talla: 162, peso: 70, pt: 121 }, { talla: 162, peso: 71, pt: 122 },
{ talla: 162, peso: 72, pt: 123.5 },{ talla: 162, peso: 73, pt: 125 }, { talla: 162, peso: 74, pt: 126 }, { talla: 162, peso: 75, pt: 127.4 },
{ talla: 162, peso: 76, pt: 128.5 },{ talla: 162, peso: 77, pt: 129.8 },{ talla: 162, peso: 78, pt: 131 }, { talla: 162, peso: 79, pt: 131.8 },
{ talla: 162, peso: 80, pt: 132.8 },{ talla: 162, peso: 81, pt: 133.8 },{ talla: 162, peso: 82, pt: 135 }, { talla: 162, peso: 83, pt: 136.5 },
{ talla: 162, peso: 84, pt: 138 }, { talla: 162, peso: 85, pt: 139.5 },{ talla: 162, peso: 86, pt: 141 }, { talla: 162, peso: 87, pt: 142.5 },
{ talla: 162, peso: 88, pt: 144 }, { talla: 162, peso: 89, pt: 145.5 },{ talla: 162, peso: 90, pt: 147 }, { talla: 162, peso: 91, pt: 148.5 },
{ talla: 162, peso: 92, pt: 150 },
{ talla: 163, peso: 40, pt: 70 },  { talla: 163, peso: 41, pt: 71 }, { talla: 163, peso: 42, pt: 73 }, { talla: 163, peso: 43, pt: 75 },
{ talla: 163, peso: 44, pt: 76.5 },{ talla: 163, peso: 45, pt: 78.5 },{ talla: 163, peso: 46, pt: 80.5 },{ talla: 163, peso: 47, pt: 81.5 },
{ talla: 163, peso: 48, pt: 83.5 },{ talla: 163, peso: 49, pt: 84.5 },{ talla: 163, peso: 50, pt: 86 }, { talla: 163, peso: 51, pt: 87.5 },
{ talla: 163, peso: 52, pt: 89 }, { talla: 163, peso: 53, pt: 90.5 },{ talla: 163, peso: 54, pt: 93 }, { talla: 163, peso: 55, pt: 95 },
{ talla: 163, peso: 56, pt: 96.5 },{ talla: 163, peso: 57, pt: 98 },  { talla: 163, peso: 58, pt: 100 }, { talla: 163, peso: 59, pt: 101.5 },
{ talla: 163, peso: 60, pt: 103.5 },{ talla: 163, peso: 61, pt: 105.5 },{ talla: 163, peso: 62, pt: 107.5 },{ talla: 163, peso: 63, pt: 109 },
{ talla: 163, peso: 64, pt: 111 }, { talla: 163, peso: 65, pt: 112.5 },{ talla: 163, peso: 66, pt: 113.5 },{ talla: 163, peso: 67, pt: 115 },
{ talla: 163, peso: 68, pt: 116.5 },{ talla: 163, peso: 69, pt: 118.4 },{ talla: 163, peso: 70, pt: 119 }, { talla: 163, peso: 71, pt: 121 },
{ talla: 163, peso: 72, pt: 122.5 },{ talla: 163, peso: 73, pt: 123.5 },{ talla: 163, peso: 74, pt: 125 }, { talla: 163, peso: 75, pt: 126.5 },
{ talla: 163, peso: 76, pt: 127.5 },{ talla: 163, peso: 77, pt: 128.8 },{ talla: 163, peso: 78, pt: 130 }, { talla: 163, peso: 79, pt: 131.2 },
{ talla: 163, peso: 80, pt: 132 }, { talla: 163, peso: 81, pt: 132.8 },{ talla: 163, peso: 82, pt: 133.8 },{ talla: 163, peso: 83, pt: 135 },
{ talla: 163, peso: 84, pt: 136.5 },{ talla: 163, peso: 85, pt: 138 }, { talla: 163, peso: 86, pt: 139.5 },{ talla: 163, peso: 87, pt: 141 },
{ talla: 163, peso: 88, pt: 142.5 },{ talla: 163, peso: 89, pt: 144 }, { talla: 163, peso: 90, pt: 145.5 },
{ talla: 163, peso: 91, pt: 147 }, { talla: 163, peso: 92, pt: 148.5 },{ talla: 163, peso: 93, pt: 150 },
{ talla: 164, peso: 40, pt: 69 }, { talla: 164, peso: 41, pt: 70.5 }, { talla: 164, peso: 42, pt: 72 }, { talla: 164, peso: 43, pt: 73.5 },
{ talla: 164, peso: 44, pt: 76 }, { talla: 164, peso: 45, pt: 77.5 }, { talla: 164, peso: 46, pt: 79.5 }, { talla: 164, peso: 47, pt: 81 },
{ talla: 164, peso: 48, pt: 82.5 }, { talla: 164, peso: 49, pt: 84 }, { talla: 164, peso: 50, pt: 85.5 }, { talla: 164, peso: 51, pt: 86.5 },
{ talla: 164, peso: 52, pt: 88 }, { talla: 164, peso: 53, pt: 89.5 }, { talla: 164, peso: 54, pt: 91.5 }, { talla: 164, peso: 55, pt: 93.5 },
{ talla: 164, peso: 56, pt: 95.5 }, { talla: 164, peso: 57, pt: 97 }, { talla: 164, peso: 58, pt: 99 }, { talla: 164, peso: 59, pt: 100.5 },
{ talla: 164, peso: 60, pt: 102.5 }, { talla: 164, peso: 61, pt: 104 }, { talla: 164, peso: 62, pt: 106.5 }, { talla: 164, peso: 63, pt: 108 },
{ talla: 164, peso: 64, pt: 110 }, { talla: 164, peso: 65, pt: 111.5 }, { talla: 164, peso: 66, pt: 112.5 }, { talla: 164, peso: 67, pt: 114 },
{ talla: 164, peso: 68, pt: 116 }, { talla: 164, peso: 69, pt: 117.4 }, { talla: 164, peso: 70, pt: 118.5 }, { talla: 164, peso: 71, pt: 120 },
{ talla: 164, peso: 72, pt: 121.5 }, { talla: 164, peso: 73, pt: 122.5 }, { talla: 164, peso: 74, pt: 124 }, { talla: 164, peso: 75, pt: 125.5 },
{ talla: 164, peso: 76, pt: 126.5 }, { talla: 164, peso: 77, pt: 127.8 }, { talla: 164, peso: 78, pt: 129 }, { talla: 164, peso: 79, pt: 130 },
{ talla: 164, peso: 80, pt: 131 }, { talla: 164, peso: 81, pt: 132 }, { talla: 164, peso: 82, pt: 133 }, { talla: 164, peso: 83, pt: 134 },
{ talla: 164, peso: 84, pt: 135 }, { talla: 164, peso: 85, pt: 136.5 }, { talla: 164, peso: 86, pt: 138 }, { talla: 164, peso: 87, pt: 139.5 },
{ talla: 164, peso: 88, pt: 141 }, { talla: 164, peso: 89, pt: 142.5 }, { talla: 164, peso: 90, pt: 144 }, { talla: 164, peso: 91, pt: 145.5 },
{ talla: 164, peso: 92, pt: 147 }, { talla: 164, peso: 93, pt: 148.5 }, { talla: 164, peso: 94, pt: 150 },
{ talla: 165, peso: 41, pt: 70 }, { talla: 165, peso: 42, pt: 71.5 }, { talla: 165, peso: 43, pt: 73.5 }, { talla: 165, peso: 44, pt: 75 },
{ talla: 165, peso: 45, pt: 77 }, { talla: 165, peso: 46, pt: 78.5 }, { talla: 165, peso: 47, pt: 80.5 }, { talla: 165, peso: 48, pt: 81.5 },
{ talla: 165, peso: 49, pt: 83.5 }, { talla: 165, peso: 50, pt: 84.5 }, { talla: 165, peso: 51, pt: 86.5 }, { talla: 165, peso: 52, pt: 87.5 },
{ talla: 165, peso: 53, pt: 89 }, { talla: 165, peso: 54, pt: 90.5 }, { talla: 165, peso: 55, pt: 92.5 }, { talla: 165, peso: 56, pt: 94.5 },
{ talla: 165, peso: 57, pt: 96.5 }, { talla: 165, peso: 58, pt: 98 }, { talla: 165, peso: 59, pt: 100 }, { talla: 165, peso: 60, pt: 101.5 },
{ talla: 165, peso: 61, pt: 103 }, { talla: 165, peso: 62, pt: 105 }, { talla: 165, peso: 63, pt: 107 }, { talla: 165, peso: 64, pt: 108.5 },
{ talla: 165, peso: 65, pt: 110 }, { talla: 165, peso: 66, pt: 112 }, { talla: 165, peso: 67, pt: 113.4 }, { talla: 165, peso: 68, pt: 114.5 },
{ talla: 165, peso: 69, pt: 116.5 }, { talla: 165, peso: 70, pt: 117.5 }, { talla: 165, peso: 71, pt: 119 }, { talla: 165, peso: 72, pt: 120.5 },
{ talla: 165, peso: 73, pt: 121.8 }, { talla: 165, peso: 74, pt: 123 }, { talla: 165, peso: 75, pt: 124.5 }, { talla: 165, peso: 76, pt: 125.5 },
{ talla: 165, peso: 77, pt: 126.8 }, { talla: 165, peso: 78, pt: 128 }, { talla: 165, peso: 79, pt: 129 }, { talla: 165, peso: 80, pt: 130.4 },
{ talla: 165, peso: 81, pt: 131.4 }, { talla: 165, peso: 82, pt: 132 }, { talla: 165, peso: 83, pt: 133 }, { talla: 165, peso: 84, pt: 134 },
{ talla: 165, peso: 85, pt: 135 }, { talla: 165, peso: 86, pt: 136.5 }, { talla: 165, peso: 87, pt: 138 }, { talla: 165, peso: 88, pt: 139.5 },
{ talla: 165, peso: 89, pt: 141 }, { talla: 165, peso: 90, pt: 142.5 }, { talla: 165, peso: 91, pt: 144 }, { talla: 165, peso: 92, pt: 145.5 },
{ talla: 165, peso: 93, pt: 147 }, { talla: 165, peso: 94, pt: 148.5 }, { talla: 165, peso: 95, pt: 150 },
{ talla: 166, peso: 41, pt: 70 }, { talla: 166, peso: 42, pt: 71 }, { talla: 166, peso: 43, pt: 72.5 }, { talla: 166, peso: 44, pt: 75 },
{ talla: 166, peso: 45, pt: 76 }, { talla: 166, peso: 46, pt: 77.5 }, { talla: 166, peso: 47, pt: 80 }, { talla: 166, peso: 48, pt: 81 },
{ talla: 166, peso: 49, pt: 82.5 }, { talla: 166, peso: 50, pt: 84 }, { talla: 166, peso: 51, pt: 85.5 }, { talla: 166, peso: 52, pt: 87 },
{ talla: 166, peso: 53, pt: 88 }, { talla: 166, peso: 54, pt: 89.5 }, { talla: 166, peso: 55, pt: 91.5 }, { talla: 166, peso: 56, pt: 93 },
{ talla: 166, peso: 57, pt: 95.5 }, { talla: 166, peso: 58, pt: 97 }, { talla: 166, peso: 59, pt: 98.5 }, { talla: 166, peso: 60, pt: 100.5 },
{ talla: 166, peso: 61, pt: 102 }, { talla: 166, peso: 62, pt: 104 }, { talla: 166, peso: 63, pt: 105.5 }, { talla: 166, peso: 64, pt: 107.5 },
{ talla: 166, peso: 65, pt: 109 }, { talla: 166, peso: 66, pt: 111 }, { talla: 166, peso: 67, pt: 112.5 }, { talla: 166, peso: 68, pt: 113.5 },
{ talla: 166, peso: 69, pt: 115 }, { talla: 166, peso: 70, pt: 116.5 }, { talla: 166, peso: 71, pt: 118 }, { talla: 166, peso: 72, pt: 119.5 },
{ talla: 166, peso: 73, pt: 120.8 }, { talla: 166, peso: 74, pt: 122 }, { talla: 166, peso: 75, pt: 123.4 }, { talla: 166, peso: 76, pt: 124.5 },
{ talla: 166, peso: 77, pt: 126 }, { talla: 166, peso: 78, pt: 127 }, { talla: 166, peso: 79, pt: 128 }, { talla: 166, peso: 80, pt: 129.1 },
{ talla: 166, peso: 81, pt: 130.5 }, { talla: 166, peso: 82, pt: 131.5 }, { talla: 166, peso: 83, pt: 132.2 }, { talla: 166, peso: 84, pt: 133 },
{ talla: 166, peso: 85, pt: 134 }, { talla: 166, peso: 86, pt: 135 }, { talla: 166, peso: 87, pt: 136.5 }, { talla: 166, peso: 88, pt: 138 },
{ talla: 166, peso: 89, pt: 139.5 }, { talla: 166, peso: 90, pt: 141 }, { talla: 166, peso: 91, pt: 142.5 }, { talla: 166, peso: 92, pt: 144 },
{ talla: 166, peso: 93, pt: 145.5 }, { talla: 166, peso: 94, pt: 147 }, { talla: 166, peso: 95, pt: 148.5 }, { talla: 166, peso: 96, pt: 150 },
{ talla: 166, peso: 97, pt: 151.5 },
{ talla: 167, peso: 42, pt: 70.5 }, { talla: 167, peso: 43, pt: 71.5 }, { talla: 167, peso: 44, pt: 73.5 }, { talla: 167, peso: 45, pt: 75.5 },
{ talla: 167, peso: 46, pt: 76.5 }, { talla: 167, peso: 47, pt: 78.5 }, { talla: 167, peso: 48, pt: 80.5 }, { talla: 167, peso: 49, pt: 81.5 },
{ talla: 167, peso: 50, pt: 83.5 }, { talla: 167, peso: 51, pt: 85 }, { talla: 167, peso: 52, pt: 86.4 }, { talla: 167, peso: 53, pt: 87.5 },
{ talla: 167, peso: 54, pt: 88.5 }, { talla: 167, peso: 55, pt: 90.5 }, { talla: 167, peso: 56, pt: 92 }, { talla: 167, peso: 57, pt: 94.5 },
{ talla: 167, peso: 58, pt: 96 }, { talla: 167, peso: 59, pt: 97.5 }, { talla: 167, peso: 60, pt: 99.5 }, { talla: 167, peso: 61, pt: 101 },
{ talla: 167, peso: 62, pt: 102.5 }, { talla: 167, peso: 63, pt: 104.5 }, { talla: 167, peso: 64, pt: 106.5 }, { talla: 167, peso: 65, pt: 108 },
{ talla: 167, peso: 66, pt: 110 }, { talla: 167, peso: 67, pt: 111.2 }, { talla: 167, peso: 68, pt: 112.9 }, { talla: 167, peso: 69, pt: 114 },
{ talla: 167, peso: 70, pt: 115.5 }, { talla: 167, peso: 71, pt: 117 }, { talla: 167, peso: 72, pt: 118.5 }, { talla: 167, peso: 73, pt: 119.5 },
{ talla: 167, peso: 74, pt: 121 }, { talla: 167, peso: 75, pt: 122.5 }, { talla: 167, peso: 76, pt: 123.5 }, { talla: 167, peso: 77, pt: 125 },
{ talla: 167, peso: 78, pt: 126 }, { talla: 167, peso: 79, pt: 127 }, { talla: 167, peso: 80, pt: 128 }, { talla: 167, peso: 81, pt: 129.5 },
{ talla: 167, peso: 82, pt: 130.8 }, { talla: 167, peso: 83, pt: 131.5 }, { talla: 167, peso: 84, pt: 132.4 }, { talla: 167, peso: 85, pt: 133.5 },
{ talla: 167, peso: 86, pt: 134.2 }, { talla: 167, peso: 87, pt: 135 }, { talla: 167, peso: 88, pt: 136.5 }, { talla: 167, peso: 89, pt: 138 },
{ talla: 167, peso: 90, pt: 139.5 }, { talla: 167, peso: 91, pt: 141 }, { talla: 167, peso: 92, pt: 142.5 }, { talla: 167, peso: 93, pt: 144 },
{ talla: 167, peso: 94, pt: 145.5 }, { talla: 167, peso: 95, pt: 147 }, { talla: 167, peso: 96, pt: 148.5 }, { talla: 167, peso: 97, pt: 150 },
{ talla: 167, peso: 98, pt: 151.5 },
{ talla: 168, peso: 42, pt: 70 }, { talla: 168, peso: 43, pt: 71.5 }, { talla: 168, peso: 44, pt: 73 }, { talla: 168, peso: 45, pt: 75 },
{ talla: 168, peso: 46, pt: 76.5 }, { talla: 168, peso: 47, pt: 78 }, { talla: 168, peso: 48, pt: 80 }, { talla: 168, peso: 49, pt: 81 },
{ talla: 168, peso: 50, pt: 82.5 }, { talla: 168, peso: 51, pt: 84 }, { talla: 168, peso: 52, pt: 85.5 }, { talla: 168, peso: 53, pt: 86.5 },
{ talla: 168, peso: 54, pt: 88 }, { talla: 168, peso: 55, pt: 89.5 }, { talla: 168, peso: 56, pt: 91 }, { talla: 168, peso: 57, pt: 93 },
{ talla: 168, peso: 58, pt: 95.5 }, { talla: 168, peso: 59, pt: 96.5 }, { talla: 168, peso: 60, pt: 98 }, { talla: 168, peso: 61, pt: 100 },
{ talla: 168, peso: 62, pt: 101.5 }, { talla: 168, peso: 63, pt: 103.5 }, { talla: 168, peso: 64, pt: 105.5 }, { talla: 168, peso: 65, pt: 107 },
{ talla: 168, peso: 66, pt: 108.1 }, { talla: 168, peso: 67, pt: 110 }, { talla: 168, peso: 68, pt: 111.8 }, { talla: 168, peso: 69, pt: 113.4 },
{ talla: 168, peso: 70, pt: 114.5 }, { talla: 168, peso: 71, pt: 116 }, { talla: 168, peso: 72, pt: 117.5 }, { talla: 168, peso: 73, pt: 118.5 },
{ talla: 168, peso: 74, pt: 120 }, { talla: 168, peso: 75, pt: 121.5 }, { talla: 168, peso: 76, pt: 122.5 }, { talla: 168, peso: 77, pt: 123.8 },
{ talla: 168, peso: 78, pt: 125 }, { talla: 168, peso: 79, pt: 126.4 }, { talla: 168, peso: 80, pt: 127.4 }, { talla: 168, peso: 81, pt: 128.5 },
{ talla: 168, peso: 82, pt: 129.5 }, { talla: 168, peso: 83, pt: 130.8 }, { talla: 168, peso: 84, pt: 131.8 }, { talla: 168, peso: 85, pt: 132.6 },
{ talla: 168, peso: 86, pt: 133.4 }, { talla: 168, peso: 87, pt: 134.4 }, { talla: 168, peso: 88, pt: 135.5 }, { talla: 168, peso: 89, pt: 137 },
{ talla: 168, peso: 90, pt: 138.5 }, { talla: 168, peso: 91, pt: 140 }, { talla: 168, peso: 92, pt: 141.5 }, { talla: 168, peso: 93, pt: 143 },
{ talla: 168, peso: 94, pt: 144.5 }, { talla: 168, peso: 95, pt: 146 }, { talla: 168, peso: 96, pt: 147.5 }, { talla: 168, peso: 97, pt: 149 },
{ talla: 168, peso: 98, pt: 150.5 }, { talla: 168, peso: 99, pt: 152 }, { talla: 168, peso: 100, pt: 153.5 },
{ talla: 169, peso: 42, pt: 70 }, { talla: 169, peso: 43, pt: 71 }, { talla: 169, peso: 44, pt: 72.5 }, { talla: 169, peso: 45, pt: 73.5 },
{ talla: 169, peso: 46, pt: 75.5 }, { talla: 169, peso: 47, pt: 77 }, { talla: 169, peso: 48, pt: 79 }, { talla: 169, peso: 49, pt: 80.5 },
{ talla: 169, peso: 50, pt: 82 }, { talla: 169, peso: 51, pt: 83.5 }, { talla: 169, peso: 52, pt: 84.5 }, { talla: 169, peso: 53, pt: 86 },
{ talla: 169, peso: 54, pt: 87 }, { talla: 169, peso: 55, pt: 88.5 }, { talla: 169, peso: 56, pt: 90 }, { talla: 169, peso: 57, pt: 92 },
{ talla: 169, peso: 58, pt: 94 }, { talla: 169, peso: 59, pt: 96 }, { talla: 169, peso: 60, pt: 97.5 }, { talla: 169, peso: 61, pt: 99 },
{ talla: 169, peso: 62, pt: 100.5 }, { talla: 169, peso: 63, pt: 102.5 }, { talla: 169, peso: 64, pt: 104 }, { talla: 169, peso: 65, pt: 106 },
{ talla: 169, peso: 66, pt: 107 }, { talla: 169, peso: 67, pt: 109 }, { talla: 169, peso: 68, pt: 110 }, { talla: 169, peso: 69, pt: 112 },
{ talla: 169, peso: 70, pt: 113.5 }, { talla: 169, peso: 71, pt: 115 }, { talla: 169, peso: 72, pt: 116.5 }, { talla: 169, peso: 73, pt: 117.5 },
{ talla: 169, peso: 74, pt: 119 }, { talla: 169, peso: 75, pt: 120.5 }, { talla: 169, peso: 76, pt: 121.5 }, { talla: 169, peso: 77, pt: 122.8 },
{ talla: 169, peso: 78, pt: 124 }, { talla: 169, peso: 79, pt: 125.5 }, { talla: 169, peso: 80, pt: 126.5 }, { talla: 169, peso: 81, pt: 127.5 },
{ talla: 169, peso: 82, pt: 128.8 }, { talla: 169, peso: 83, pt: 130 }, { talla: 169, peso: 84, pt: 131 }, { talla: 169, peso: 85, pt: 131.9 },
{ talla: 169, peso: 86, pt: 132.8 }, { talla: 169, peso: 87, pt: 133.4 }, { talla: 169, peso: 88, pt: 134.2 }, { talla: 169, peso: 89, pt: 135.5 },
{ talla: 169, peso: 90, pt: 137 }, { talla: 169, peso: 91, pt: 138.5 }, { talla: 169, peso: 92, pt: 140 }, { talla: 169, peso: 93, pt: 141.5 },
{ talla: 169, peso: 94, pt: 143 }, { talla: 169, peso: 95, pt: 144.5 }, { talla: 169, peso: 96, pt: 146 }, { talla: 169, peso: 97, pt: 147.5 },
{ talla: 169, peso: 98, pt: 149 }, { talla: 169, peso: 99, pt: 150.5 }, { talla: 169, peso: 100, pt: 152 },
{ talla: 170, peso: 43, pt: 70 }, { talla: 170, peso: 44, pt: 71.5 }, { talla: 170, peso: 45, pt: 73.5 }, { talla: 170, peso: 46, pt: 75 },
{ talla: 170, peso: 47, pt: 76.5 }, { talla: 170, peso: 48, pt: 78 }, { talla: 170, peso: 49, pt: 80 }, { talla: 170, peso: 50, pt: 81.5 },
{ talla: 170, peso: 51, pt: 82.5 }, { talla: 170, peso: 52, pt: 84 }, { talla: 170, peso: 53, pt: 85.5 }, { talla: 170, peso: 54, pt: 86.5 },
{ talla: 170, peso: 55, pt: 88 }, { talla: 170, peso: 56, pt: 89.5 }, { talla: 170, peso: 57, pt: 91.5 }, { talla: 170, peso: 58, pt: 93 },
{ talla: 170, peso: 59, pt: 95 }, { talla: 170, peso: 60, pt: 96.5 }, { talla: 170, peso: 61, pt: 97.5 }, { talla: 170, peso: 62, pt: 99.5 },
{ talla: 170, peso: 63, pt: 101 }, { talla: 170, peso: 64, pt: 103 }, { talla: 170, peso: 65, pt: 105 }, { talla: 170, peso: 66, pt: 106 },
{ talla: 170, peso: 67, pt: 108.5 }, { talla: 170, peso: 68, pt: 110 }, { talla: 170, peso: 69, pt: 111 }, { talla: 170, peso: 70, pt: 112.5 },
{ talla: 170, peso: 71, pt: 113.8 }, { talla: 170, peso: 72, pt: 115.5 }, { talla: 170, peso: 73, pt: 117 }, { talla: 170, peso: 74, pt: 118 },
{ talla: 170, peso: 75, pt: 119.5 }, { talla: 170, peso: 76, pt: 120.5 }, { talla: 170, peso: 77, pt: 122 }, { talla: 170, peso: 78, pt: 123 },
{ talla: 170, peso: 79, pt: 124.5 }, { talla: 170, peso: 80, pt: 125.5 }, { talla: 170, peso: 81, pt: 126.8 }, { talla: 170, peso: 82, pt: 127.8 },
{ talla: 170, peso: 83, pt: 128.8 }, { talla: 170, peso: 84, pt: 130 }, { talla: 170, peso: 85, pt: 131.1 }, { talla: 170, peso: 86, pt: 131.8 },
{ talla: 170, peso: 87, pt: 132.8 }, { talla: 170, peso: 88, pt: 133.8 }, { talla: 170, peso: 89, pt: 134.5 }, { talla: 170, peso: 90, pt: 136 },
{ talla: 170, peso: 91, pt: 137.5 }, { talla: 170, peso: 92, pt: 139 }, { talla: 170, peso: 93, pt: 140.5 }, { talla: 170, peso: 94, pt: 142 },
{ talla: 170, peso: 95, pt: 143.5 }, { talla: 170, peso: 96, pt: 145 }, { talla: 170, peso: 97, pt: 146.5 }, { talla: 170, peso: 98, pt: 148 },
{ talla: 170, peso: 99, pt: 149.5 }, { talla: 170, peso: 100, pt: 151 }, { talla: 170, peso: 101, pt: 152.5 },
{ talla: 171, peso: 43, pt: 70 }, { talla: 171, peso: 44, pt: 71.5 }, { talla: 171, peso: 45, pt: 72.5 }, { talla: 171, peso: 46, pt: 74 },
{ talla: 171, peso: 47, pt: 75.5 }, { talla: 171, peso: 48, pt: 77.5 }, { talla: 171, peso: 49, pt: 79 }, { talla: 171, peso: 50, pt: 81 },
{ talla: 171, peso: 51, pt: 82 }, { talla: 171, peso: 52, pt: 83.5 }, { talla: 171, peso: 53, pt: 85 }, { talla: 171, peso: 54, pt: 86.5 },
{ talla: 171, peso: 55, pt: 87.5 }, { talla: 171, peso: 56, pt: 88.5 }, { talla: 171, peso: 57, pt: 90.5 }, { talla: 171, peso: 58, pt: 91.5 },
{ talla: 171, peso: 59, pt: 93.5 }, { talla: 171, peso: 60, pt: 95.5 }, { talla: 171, peso: 61, pt: 97 }, { talla: 171, peso: 62, pt: 98.5 },
{ talla: 171, peso: 63, pt: 100.5 }, { talla: 171, peso: 64, pt: 102 }, { talla: 171, peso: 65, pt: 103.5 }, { talla: 171, peso: 66, pt: 105 },
{ talla: 171, peso: 67, pt: 107 }, { talla: 171, peso: 68, pt: 108.9 }, { talla: 171, peso: 69, pt: 110 }, { talla: 171, peso: 70, pt: 112 },
{ talla: 171, peso: 71, pt: 113 }, { talla: 171, peso: 72, pt: 114 }, { talla: 171, peso: 73, pt: 115.5 }, { talla: 171, peso: 74, pt: 117 },
{ talla: 171, peso: 75, pt: 118.5 }, { talla: 171, peso: 76, pt: 119.5 }, { talla: 171, peso: 77, pt: 121 }, { talla: 171, peso: 78, pt: 122 },
{ talla: 171, peso: 79, pt: 123.5 }, { talla: 171, peso: 80, pt: 124.5 }, { talla: 171, peso: 81, pt: 126 }, { talla: 171, peso: 82, pt: 127 },
{ talla: 171, peso: 83, pt: 128 }, { talla: 171, peso: 84, pt: 129 }, { talla: 171, peso: 85, pt: 130.1 }, { talla: 171, peso: 86, pt: 131.2 },
{ talla: 171, peso: 87, pt: 132 }, { talla: 171, peso: 88, pt: 132.8 }, { talla: 171, peso: 89, pt: 133.8 }, { talla: 171, peso: 90, pt: 134.5 },
{ talla: 171, peso: 91, pt: 136 }, { talla: 171, peso: 92, pt: 137.5 }, { talla: 171, peso: 93, pt: 139 }, { talla: 171, peso: 94, pt: 140.5 },
{ talla: 171, peso: 95, pt: 142 }, { talla: 171, peso: 96, pt: 143.5 }, { talla: 171, peso: 97, pt: 145 }, { talla: 171, peso: 98, pt: 146.5 },
{ talla: 171, peso: 99, pt: 148 }, { talla: 171, peso: 100, pt: 149.5 }, { talla: 171, peso: 101, pt: 151 }, { talla: 171, peso: 102, pt: 152.5 },
{ talla: 172, peso: 43, pt: 69.5 }, { talla: 172, peso: 44, pt: 70.5 }, { talla: 172, peso: 45, pt: 72.0 }, { talla: 172, peso: 46, pt: 73.5 },
{ talla: 172, peso: 47, pt: 75.5 }, { talla: 172, peso: 48, pt: 77.0 }, { talla: 172, peso: 49, pt: 78.5 }, { talla: 172, peso: 50, pt: 80.0 },
{ talla: 172, peso: 51, pt: 81.5 }, { talla: 172, peso: 52, pt: 82.5 }, { talla: 172, peso: 53, pt: 84.0 }, { talla: 172, peso: 54, pt: 85.5 },
{ talla: 172, peso: 55, pt: 86.5 }, { talla: 172, peso: 56, pt: 88.0 }, { talla: 172, peso: 57, pt: 89.0 }, { talla: 172, peso: 58, pt: 91.0 },
{ talla: 172, peso: 59, pt: 92.5 }, { talla: 172, peso: 60, pt: 95.0 }, { talla: 172, peso: 61, pt: 96.5 }, { talla: 172, peso: 62, pt: 97.5 },
{ talla: 172, peso: 63, pt: 99.0 }, { talla: 172, peso: 64, pt: 101.0 }, { talla: 172, peso: 65, pt: 102.5 }, { talla: 172, peso: 66, pt: 104.0 },
{ talla: 172, peso: 67, pt: 106.0 }, { talla: 172, peso: 68, pt: 107.7 }, { talla: 172, peso: 69, pt: 109.0 }, { talla: 172, peso: 70, pt: 111.0 },
{ talla: 172, peso: 71, pt: 112.0 }, { talla: 172, peso: 72, pt: 113.0 }, { talla: 172, peso: 73, pt: 114.5 }, { talla: 172, peso: 74, pt: 116.5 },
{ talla: 172, peso: 75, pt: 117.5 }, { talla: 172, peso: 76, pt: 118.5 }, { talla: 172, peso: 77, pt: 120.0 }, { talla: 172, peso: 78, pt: 121.5 },
{ talla: 172, peso: 79, pt: 122.5 }, { talla: 172, peso: 80, pt: 123.5 }, { talla: 172, peso: 81, pt: 125.0 }, { talla: 172, peso: 82, pt: 126.0 },
{ talla: 172, peso: 83, pt: 127.0 }, { talla: 172, peso: 84, pt: 128.0 }, { talla: 172, peso: 85, pt: 129.1 }, { talla: 172, peso: 86, pt: 130.5 },
{ talla: 172, peso: 87, pt: 131.4 }, { talla: 172, peso: 88, pt: 132.0 }, { talla: 172, peso: 89, pt: 133.0 }, { talla: 172, peso: 90, pt: 133.8 },
{ talla: 172, peso: 91, pt: 135.0 }, { talla: 172, peso: 92, pt: 136.5 }, { talla: 172, peso: 93, pt: 138.0 }, { talla: 172, peso: 94, pt: 139.5 },
{ talla: 172, peso: 95, pt: 141.0 }, { talla: 172, peso: 96, pt: 142.5 }, { talla: 172, peso: 97, pt: 144.0 }, { talla: 172, peso: 98, pt: 145.5 },
{ talla: 172, peso: 99, pt: 147.0 }, { talla: 172, peso: 100, pt: 148.5 }, { talla: 172, peso: 101, pt: 150.0 }, { talla: 172, peso: 102, pt: 151.5 },
{ talla: 172, peso: 103, pt: 153.0 }, { talla: 172, peso: 104, pt: 154.5 },
{ talla: 173, peso: 44, pt: 70 }, { talla: 173, peso: 45, pt: 71.5 }, { talla: 173, peso: 46, pt: 72.5 }, { talla: 173, peso: 47, pt: 75 },
{ talla: 173, peso: 48, pt: 76 }, { talla: 173, peso: 49, pt: 77.5 }, { talla: 173, peso: 50, pt: 79.5 }, { talla: 173, peso: 51, pt: 81 },
{ talla: 173, peso: 52, pt: 82 }, { talla: 173, peso: 53, pt: 83.5 }, { talla: 173, peso: 54, pt: 85 }, { talla: 173, peso: 55, pt: 86.5 },
{ talla: 173, peso: 56, pt: 87.5 }, { talla: 173, peso: 57, pt: 88.5 }, { talla: 173, peso: 58, pt: 90 }, { talla: 173, peso: 59, pt: 91.5 },
{ talla: 173, peso: 60, pt: 93.5 }, { talla: 173, peso: 61, pt: 95.5 }, { talla: 173, peso: 62, pt: 97 }, { talla: 173, peso: 63, pt: 98.5 },
{ talla: 173, peso: 64, pt: 100 }, { talla: 173, peso: 65, pt: 101.5 }, { talla: 173, peso: 66, pt: 103 }, { talla: 173, peso: 67, pt: 104 },
{ talla: 173, peso: 68, pt: 106 }, { talla: 173, peso: 69, pt: 108 }, { talla: 173, peso: 70, pt: 109.5 }, { talla: 173, peso: 71, pt: 111.5 },
{ talla: 173, peso: 72, pt: 112.5 }, { talla: 173, peso: 73, pt: 113.5 }, { talla: 173, peso: 74, pt: 115 }, { talla: 173, peso: 75, pt: 116.5 },
{ talla: 173, peso: 76, pt: 117.5 }, { talla: 173, peso: 77, pt: 119 }, { talla: 173, peso: 78, pt: 120.5 }, { talla: 173, peso: 79, pt: 121.5 },
{ talla: 173, peso: 80, pt: 122.5 }, { talla: 173, peso: 81, pt: 124 }, { talla: 173, peso: 82, pt: 125 }, { talla: 173, peso: 83, pt: 126.4 },
{ talla: 173, peso: 84, pt: 127.4 }, { talla: 173, peso: 85, pt: 128.1 }, { talla: 173, peso: 86, pt: 129.5 }, { talla: 173, peso: 87, pt: 130.5 },
{ talla: 173, peso: 88, pt: 131.4 }, { talla: 173, peso: 89, pt: 132 }, { talla: 173, peso: 90, pt: 133 }, { talla: 173, peso: 91, pt: 134 },
{ talla: 173, peso: 92, pt: 135 }, { talla: 173, peso: 93, pt: 136.5 }, { talla: 173, peso: 94, pt: 138 }, { talla: 173, peso: 95, pt: 139.5 },
{ talla: 173, peso: 96, pt: 141 }, { talla: 173, peso: 97, pt: 142.5 }, { talla: 173, peso: 98, pt: 144 }, { talla: 173, peso: 99, pt: 145.5 },
{ talla: 173, peso: 100, pt: 147 }, { talla: 173, peso: 101, pt: 148.5 }, { talla: 173, peso: 102, pt: 150 }, { talla: 173, peso: 103, pt: 151.5 },
{ talla: 173, peso: 104, pt: 153 }, { talla: 173, peso: 105, pt: 154.5 },
{ talla: 174, peso: 45, pt: 70.5 }, { talla: 174, peso: 46, pt: 72.5 }, { talla: 174, peso: 47, pt: 73.5 }, { talla: 174, peso: 48, pt: 75.5 },
{ talla: 174, peso: 49, pt: 76.5 }, { talla: 174, peso: 50, pt: 78.5 }, { talla: 174, peso: 51, pt: 80.5 }, { talla: 174, peso: 52, pt: 81.5 },
{ talla: 174, peso: 53, pt: 82.5 }, { talla: 174, peso: 54, pt: 84.5 }, { talla: 174, peso: 55, pt: 85.5 }, { talla: 174, peso: 56, pt: 86.5 },
{ talla: 174, peso: 57, pt: 88 }, { talla: 174, peso: 58, pt: 89.5 }, { talla: 174, peso: 59, pt: 90.5 }, { talla: 174, peso: 60, pt: 92.5 },
{ talla: 174, peso: 61, pt: 95 }, { talla: 174, peso: 62, pt: 96.5 }, { talla: 174, peso: 63, pt: 97.5 }, { talla: 174, peso: 64, pt: 99 },
{ talla: 174, peso: 65, pt: 100.5 }, { talla: 174, peso: 66, pt: 102 }, { talla: 174, peso: 67, pt: 103.5 }, { talla: 174, peso: 68, pt: 105.1 },
{ talla: 174, peso: 69, pt: 107 }, { talla: 174, peso: 70, pt: 108.5 }, { talla: 174, peso: 71, pt: 110.5 }, { talla: 174, peso: 72, pt: 111.5 },
{ talla: 174, peso: 73, pt: 113 }, { talla: 174, peso: 74, pt: 113.8 }, { talla: 174, peso: 75, pt: 115.5 }, { talla: 174, peso: 76, pt: 117 },
{ talla: 174, peso: 77, pt: 118 }, { talla: 174, peso: 78, pt: 119.5 }, { talla: 174, peso: 79, pt: 120.5 }, { talla: 174, peso: 80, pt: 121.8 },
{ talla: 174, peso: 81, pt: 123 }, { talla: 174, peso: 82, pt: 124 }, { talla: 174, peso: 83, pt: 125.5 }, { talla: 174, peso: 84, pt: 126.5 },
{ talla: 174, peso: 85, pt: 127.3 }, { talla: 174, peso: 86, pt: 128.5 }, { talla: 174, peso: 87, pt: 129.5 }, { talla: 174, peso: 88, pt: 130.5 },
{ talla: 174, peso: 89, pt: 131.5 }, { talla: 174, peso: 90, pt: 132.2 }, { talla: 174, peso: 91, pt: 133 }, { talla: 174, peso: 92, pt: 134 },
{ talla: 174, peso: 93, pt: 135 }, { talla: 174, peso: 94, pt: 136.5 }, { talla: 174, peso: 95, pt: 138 }, { talla: 174, peso: 96, pt: 139.5 },
{ talla: 174, peso: 97, pt: 141 }, { talla: 174, peso: 98, pt: 142.5 }, { talla: 174, peso: 99, pt: 144 }, { talla: 174, peso: 100, pt: 145.5 },
{ talla: 174, peso: 101, pt: 147 }, { talla: 174, peso: 102, pt: 148.5 }, { talla: 174, peso: 103, pt: 150 }, { talla: 174, peso: 104, pt: 151.5 },
{ talla: 174, peso: 105, pt: 153 }, { talla: 174, peso: 106, pt: 154.5 },
  { talla: 175, peso: 45, pt: 70 }, { talla: 175, peso: 46, pt: 71.5 }, { talla: 175, peso: 47, pt: 73 }, { talla: 175, peso: 48, pt: 75 },
  { talla: 175, peso: 49, pt: 76.5 }, { talla: 175, peso: 50, pt: 78 }, { talla: 175, peso: 51, pt: 79.5 }, { talla: 175, peso: 52, pt: 81 },
  { talla: 175, peso: 53, pt: 82.5 }, { talla: 175, peso: 54, pt: 83.5 }, { talla: 175, peso: 55, pt: 85 }, { talla: 175, peso: 56, pt: 86 },
  { talla: 175, peso: 57, pt: 87.5 }, { talla: 175, peso: 58, pt: 88.5 }, { talla: 175, peso: 59, pt: 90 }, { talla: 175, peso: 60, pt: 91.5 },
  { talla: 175, peso: 61, pt: 93.5 }, { talla: 175, peso: 62, pt: 95 }, { talla: 175, peso: 63, pt: 96.5 }, { talla: 175, peso: 64, pt: 98 },
  { talla: 175, peso: 65, pt: 99.5 }, { talla: 175, peso: 66, pt: 101 }, { talla: 175, peso: 67, pt: 102.5 }, { talla: 175, peso: 68, pt: 104.5 }, 
  { talla: 175, peso: 69, pt: 106 }, { talla: 175, peso: 70, pt: 107.5 }, { talla: 175, peso: 71, pt: 109 }, { talla: 175, peso: 72, pt: 111 },
  { talla: 175, peso: 73, pt: 112 }, { talla: 175, peso: 74, pt: 113.5 }, { talla: 175, peso: 75, pt: 114.5 }, { talla: 175, peso: 76, pt: 116 },
  { talla: 175, peso: 77, pt: 117 }, { talla: 175, peso: 78, pt: 118.5 }, { talla: 175, peso: 79, pt: 119.5 }, { talla: 175, peso: 80, pt: 121 }, 
  { talla: 175, peso: 81, pt: 122 }, { talla: 175, peso: 82, pt: 123 }, { talla: 175, peso: 83, pt: 124 }, { talla: 175, peso: 84, pt: 125.5 }, 
  { talla: 175, peso: 85, pt: 126.9 }, { talla: 175, peso: 86, pt: 127.5 }, { talla: 175, peso: 87, pt: 128.5 }, { talla: 175, peso: 88, pt: 129.5 },
  { talla: 175, peso: 89, pt: 130.9 }, { talla: 175, peso: 90, pt: 131.5 }, { talla: 175, peso: 91, pt: 132.3 }, { talla: 175, peso: 92, pt: 133 }, 
  { talla: 175, peso: 93, pt: 134 }, { talla: 175, peso: 94, pt: 135 }, { talla: 175, peso: 95, pt: 136 }, { talla: 175, peso: 96, pt: 137 }, 
  { talla: 175, peso: 97, pt: 138 }, { talla: 175, peso: 98, pt: 139 }, { talla: 175, peso: 99, pt: 140 }, { talla: 175, peso: 100, pt: 141 }, 
  { talla: 175, peso: 101, pt: 142 }, { talla: 175, peso: 102, pt: 143 }, { talla: 175, peso: 103, pt: 144 }, { talla: 175, peso: 104, pt: 145 },
  { talla: 175, peso: 105, pt: 146 }, { talla: 175, peso: 106, pt: 147 }, { talla: 175, peso: 107, pt: 148 }, { talla: 175, peso: 108, pt: 149 },
  { talla: 175, peso: 109, pt: 150 }, { talla: 175, peso: 110, pt: 151 }, { talla: 175, peso: 111, pt: 152 }, { talla: 175, peso: 112, pt: 153 },
];

const getNomogramaPTFromData = (talla, peso) => {
  const TALLA_RANGE = 175 - 140;
  const PESO_RANGE = 100 - 30;
  const TALLA_WEIGHT = PESO_RANGE / TALLA_RANGE;
  let distances = NOMOGRAMA_DATA.map((point, index) => {
    const distTalla = (point.talla - talla) * TALLA_WEIGHT;
    const distPeso = point.peso - peso;
    const distance = Math.sqrt(distTalla * distTalla + distPeso * distPeso);
    return { index, distance };
  });
  distances.sort((a, b) => a.distance - b.distance);
  if (distances[0].distance < 0.01) return NOMOGRAMA_DATA[distances[0].index].pt;
  const neighbors = distances.slice(0, 4);
  let totalWeight = 0, totalValue = 0;
  neighbors.forEach(neighbor => {
    const weight = 1 / Math.pow(neighbor.distance, 2);
    totalWeight += weight;
    totalValue += NOMOGRAMA_DATA[neighbor.index].pt * weight;
  });
  return totalValue / totalWeight;
};

const CURVA_LIMITES = {
    limiteA: { 10: 95, 11: 95, 12: 95, 13: 96, 14: 96, 15: 97, 16: 98, 17: 98.5, 18: 99, 19: 100, 20: 101, 21: 101, 22: 102, 23: 103, 24: 104, 25: 105, 26: 106, 27: 107.5, 28: 109, 29: 110, 30: 111, 31: 111.5, 32: 112.5, 33: 113.5, 34: 115, 35: 116, 36: 116.5, 37: 117.5, 38: 118.5, 39: 119, 40: 120, 41: 121, 42: 121.5 },
    limiteB: { 10: 110, 11: 110, 12: 111, 13: 111, 14: 112, 15: 112, 16: 113, 17: 113, 18: 114, 19: 114, 20: 115, 21: 116, 22: 116, 23: 117, 24: 118, 25: 118, 26: 119, 27: 119.5, 28: 120, 29: 121, 30: 122, 31: 122.5, 32: 123.5, 33: 124, 34: 125, 35: 126, 36: 126.5, 37: 127, 38: 128, 39: 129, 40: 129, 41: 130, 42: 131 },
    limiteC: { 10: 120, 11: 120, 12: 120.5, 13: 121, 14: 121, 15: 122, 16: 122, 17: 123, 18: 123, 19: 123.5, 20: 124, 21: 124.5, 22: 125, 23: 126, 24: 126.5, 25: 127, 26: 128, 27: 128, 28: 129, 29: 129, 30: 130, 31: 130, 32: 131, 33: 131, 34: 132, 35: 132, 36: 133, 37: 133, 38: 134, 39: 134, 40: 134.5, 41: 135, 42: 135.5 }
};

const getDiagnosticoCurva = (pt, semanas) => {
    const semanaKey = Math.max(10, Math.min(42, Math.round(semanas)));
    if (!pt || !CURVA_LIMITES.limiteA[semanaKey]) return { cat: 'Error', label: 'Datos inválidos' };
    if (pt < CURVA_LIMITES.limiteA[semanaKey]) return { cat: 'A', label: 'Bajo Peso' };
    if (pt < CURVA_LIMITES.limiteB[semanaKey]) return { cat: 'B', label: 'Normal' };
    if (pt < CURVA_LIMITES.limiteC[semanaKey]) return { cat: 'C', label: 'Sobrepeso' };
    return { cat: 'D', label: 'Obesidad' };
};

// --- MAPAS VISUALES ---
const NOMOGRAMA_VISUAL_MAP = {
  talla: { valMin: 140, valMax: 175, x: 15.2344, yMin: 12.5598, yMax: 98.9631 },
  peso: { valMin: 30, valMax: 100, x: 51.0603, yMin: 12.4809, yMax: 98.9631 },
  pt: { valMin: 70, valMax: 135, x1: 59.1512, y1: 14.8314, x2: 81.0345, y2: 85.4382 }
};

// ===================================================================================
// --- INICIO DE LA CORRECCIÓN ---
// Se han ajustado y simplificado los valores para una calibración más precisa con la imagen de fondo.
// Se eliminaron los promedios para mayor claridad y se afinaron las coordenadas.
const CURVA_VISUAL_MAP = {
  semanas: { valMin: 10, valMax: 42, xMin: 16.8, xMax: 87.1 },
  pt:      { valMin: 80, valMax: 150, yMin: 76.7, yMax: 6.8 }
};
// --- FIN DE LA CORRECCIÓN ---
// ===================================================================================


// --- FUNCIONES DE CÁLCULO GEOMÉTRICO ---
const interpolate = (value, valMin, valMax, posMin, posMax) => {
  if (valMax === valMin) return posMin;
  const percentage = (value - valMin) / (valMax - valMin);
  return posMin + (percentage * (posMax - posMin));
};

const getLineIntersection = (line1, line2) => {
  const x1 = line1.x1, y1 = line1.y1, x2 = line1.x2, y2 = line1.y2;
  const x3 = line2.x1, y3 = line2.y1, x4 = line2.x2, y4 = line2.y2;
  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (den === 0) return null;
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
  const x = x1 + t * (x2 - x1);
  const y = y1 + t * (y2 - y1);
  return { x, y };
};

const useGyTLogic = (talla, peso, semanas) => {
  return useMemo(() => {
    if (!talla || !peso || talla <= 0 || peso <= 0) return { isValid: false };

    let finalTalla = talla;
    let finalPeso = peso;
    if (talla > 175) {
      finalTalla = 175;
      finalPeso = peso - ((talla - 175) * 0.5);
    } else if (talla < 140) {
      finalTalla = 140;
      finalPeso = peso + ((140 - talla) * 0.5);
    }
    finalPeso = Math.max(30, Math.min(100, finalPeso));

    // --- LÓGICA HÍBRIDA: NÚMERO DE DATOS, VISUAL GEOMÉTRICO ---
    
    // 1. La fuente de verdad para el NÚMERO es la tabla de datos.
    const porcentajePT = getNomogramaPTFromData(finalTalla, finalPeso);

    // 2. La fuente de verdad para el GRÁFICO es la proyección geométrica.
    const mapN = NOMOGRAMA_VISUAL_MAP;
    const tallaPos = { x: mapN.talla.x, y: interpolate(finalTalla, mapN.talla.valMin, mapN.talla.valMax, mapN.talla.yMin, mapN.talla.yMax) };
    const pesoPos = { x: mapN.peso.x, y: interpolate(finalPeso, mapN.peso.valMin, mapN.peso.valMax, mapN.peso.yMin, mapN.peso.yMax) };
    const projectionLine = { x1: tallaPos.x, y1: tallaPos.y, x2: pesoPos.x, y2: pesoPos.y };
    const ptAxisLine = { x1: mapN.pt.x1, y1: mapN.pt.y1, x2: mapN.pt.x2, y2: mapN.pt.y2 };
    const ptPos = getLineIntersection(projectionLine, ptAxisLine);
    
    if (!ptPos) return { isValid: false };

    // --- Lógica de la Curva (Usa el %P/T de la tabla de datos, el más preciso) ---
    const mapC = CURVA_VISUAL_MAP;
    const puntoCurvaX = interpolate(semanas, mapC.semanas.valMin, mapC.semanas.valMax, mapC.semanas.xMin, mapC.semanas.xMax);
    const puntoCurvaY = interpolate(porcentajePT, mapC.pt.valMin, mapC.pt.valMax, mapC.pt.yMin, mapC.pt.yMax);
    const diagnostico = getDiagnosticoCurva(porcentajePT, semanas);

    return {
      isValid: true,
      // El número viene de la tabla, los puntos vienen de la geometría.
      nomograma: { porcentajePT, tallaPos, pesoPos, ptPos },
      curva: { diagnostico, punto: { x: puntoCurvaX, y: puntoCurvaY } }
    };
  }, [talla, peso, semanas]);
};

// --- COMPONENTES DE RENDERIZADO (Sin cambios) ---

const CalculadoraPT = ({ talla, peso, logic }) => {
  const { isValid, nomograma } = logic;
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg dark:shadow-gray-900">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white"><Ruler /> Calculadora de Porcentaje Peso/Talla (%P/T)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="space-y-4">
            <div><p className="text-sm font-medium text-gray-600">Talla:</p><p className="text-2xl font-bold text-blue-600">{talla} cm</p></div>
            <div><p className="text-sm font-medium text-gray-600">Peso Actual:</p><p className="text-2xl font-bold text-blue-600">{peso} kg</p></div>
          </div>
          <div className="mt-6 p-4 bg-green-50 rounded-lg text-center">
            <p className="text-lg font-medium text-green-800">Resultado %P/T:</p>
            <p className="text-5xl font-bold text-green-600">{isValid ? nomograma.porcentajePT.toFixed(1) : 'N/A'}</p>
          </div>
        </div>
        <div className="relative w-full max-w-sm mx-auto aspect-[389/557]">
          <img src={nomogramaImage} alt="Nomograma" className="absolute top-0 left-0 w-full h-full" />
          {isValid && (
            <>
              <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 1 }}>
                <line x1={`${nomograma.tallaPos.x}%`} y1={`${nomograma.tallaPos.y}%`} x2={`${nomograma.ptPos.x}%`} y2={`${nomograma.ptPos.y}%`} stroke="red" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
              <div style={{ top: `${nomograma.tallaPos.y}%`, left: `${nomograma.tallaPos.x}%`, zIndex: 2 }} className="absolute w-3 h-3 bg-red-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-white"></div>
              <div style={{ top: `${nomograma.pesoPos.y}%`, left: `${nomograma.pesoPos.x}%`, zIndex: 2 }} className="absolute w-3 h-3 bg-red-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-white"></div>
              <div style={{ top: `${nomograma.ptPos.y}%`, left: `${nomograma.ptPos.x}%`, zIndex: 2 }} className="absolute w-3 h-3 bg-red-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-white"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const CurvaIncremento = ({ logic }) => {
    const { isValid, curva } = logic;
    const CategoriaBadge = ({ letra, nombre, active }) => {
        const colorClasses = { A: 'border-red-500 bg-red-500', B: 'border-green-500 bg-green-500', C: 'border-yellow-400 bg-yellow-400', D: 'border-orange-500 bg-orange-500', default: 'border-gray-300 bg-gray-400' };
        const activeColor = colorClasses[letra] || colorClasses.default;
        return ( <div className={`p-3 rounded-lg border-4 ${active ? activeColor.replace('bg-', 'border-') : 'border-transparent bg-gray-100'}`}> <div className="flex items-center gap-3"> <div className={`w-10 h-10 flex items-center justify-center text-xl font-bold text-white rounded ${active ? activeColor : 'bg-gray-400'}`}>{letra}</div> <span className={`text-lg font-semibold ${active ? 'text-gray-900' : 'text-gray-500'}`}>{nombre}</span> </div> </div> );
    };
    return ( <div className="bg-white p-6 rounded-lg shadow-lg"> <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><AreaChart /> Diagnóstico según Curva de Incremento</h3> <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> <div className="relative w-full max-w-xl mx-auto"> <img src={curvaImage} alt="Curva de incremento" className="w-full h-auto" /> {isValid && ( <> <div style={{ top: `${curva.punto.y}%`, left: `${CURVA_VISUAL_MAP.semanas.xMin}%`, width: `${curva.punto.x - CURVA_VISUAL_MAP.semanas.xMin}%`, zIndex: 1 }} className="absolute h-0 border-t-2 border-dashed border-black"></div> <div style={{ left: `${curva.punto.x}%`, top: `${curva.punto.y}%`, height: `${CURVA_VISUAL_MAP.pt.yMin - curva.punto.y}%`, zIndex: 1 }} className="absolute w-0 border-l-2 border-dashed border-black"></div> <div style={{ top: `${curva.punto.y}%`, left: `${curva.punto.x}%`, zIndex: 2 }} className="absolute w-4 h-4 bg-white border-2 border-black rounded-full transform -translate-x-1/2 -translate-y-1/2"></div> </> )} </div> <div className="space-y-3 flex flex-col justify-center"> <div className="p-4 bg-blue-50 rounded-lg text-center mb-4"> <p className="text-md font-medium text-blue-800">Diagnóstico Nutricional:</p> <p className="text-3xl font-bold text-blue-600 my-1">{isValid ? curva.diagnostico.label : 'Datos insuficientes'}</p> </div> <h4 className="font-semibold text-center text-gray-700">Categorías del Estado Nutricional</h4> <CategoriaBadge letra="A" nombre="Bajo Peso" active={isValid && curva.diagnostico.cat === 'A'} /> <CategoriaBadge letra="B" nombre="Normal" active={isValid && curva.diagnostico.cat === 'B'} /> <CategoriaBadge letra="C" nombre="Sobrepeso" active={isValid && curva.diagnostico.cat === 'C'} /> <CategoriaBadge letra="D" nombre="Obesidad" active={isValid && curva.diagnostico.cat === 'D'} /> </div> </div> </div> );
};

const TablaIMC = ({ pesoPreGestacional, talla }) => {
    const imcPreGestacional = (talla > 0 && pesoPreGestacional > 0) ? (pesoPreGestacional / ((talla / 100) ** 2)) : 0;
    const getCategoriaIMC = (imc) => { if (imc < 18.5) return 'Subnormal'; if (imc >= 18.5 && imc < 25) return 'Normal'; if (imc >= 25 && imc < 30) return 'Sobrepeso'; if (imc >= 30) return 'Obesidad'; return null; };
    const categoriaActual = getCategoriaIMC(imcPreGestacional);
    const data = [ { categoria: 'Peso subnormal (<18,5)', total: '12,5 – 18 kg', primerTrim: '0,5 a 2 kg', semanal: '500 g (440-580)', key: 'Subnormal' }, { categoria: 'Peso normal (18,5-25)', total: '11,5 – 16 kg', primerTrim: '0,5 a 2 kg', semanal: '400 g (350-500g)', key: 'Normal' }, { categoria: 'Sobrepeso (>25 y 30)', total: '7 – 11,5 kg', primerTrim: '0,5 a 2 kg', semanal: '300 g (230-330g)', key: 'Sobrepeso' }, { categoria: 'Obesidad (>30)', total: '5 a 9 kg', primerTrim: '0,5 a 2 kg', semanal: '200 g (170-270g)', key: 'Obesidad' }, { categoria: 'Gemelar', total: '15,5 - 30 kg', primerTrim: 'N/A', semanal: 'N/A', key: 'Gemelar' }, ];
    return ( <div className="bg-white p-6 rounded-lg shadow-lg"> <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Table /> Ganancia de Peso Recomendada según IMC Pre-Gestacional</h3> <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"><p className="text-sm font-medium text-indigo-800">IMC Pre-Gestacional Calculado:</p><p className="text-2xl font-bold text-indigo-600">{imcPreGestacional > 0 ? imcPreGestacional.toFixed(2) : 'N/A'}</p></div> <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr className="bg-gray-200 dark:bg-gray-700"><th className="p-3 font-semibold text-sm border dark:border-gray-600 dark:text-gray-200">Categoría de peso basada en el IMC</th><th className="p-3 font-semibold text-sm border dark:border-gray-600 dark:text-gray-200">Aumento de peso total al termino</th><th className="p-3 font-semibold text-sm border dark:border-gray-600 dark:text-gray-200">Aumento durante el primer trimestre</th><th className="p-3 font-semibold text-sm border dark:border-gray-600 dark:text-gray-200">Aumento semanal durante el 2º y 3er trimestre</th></tr></thead><tbody>{data.map((row) => (<tr key={row.key} ><td className="p-3 border dark:border-gray-600 dark:text-gray-200">{row.categoria}</td><td className="p-3 border dark:border-gray-600 dark:text-gray-200">{row.total}</td><td className="p-3 border dark:border-gray-600 dark:text-gray-200">{row.primerTrim}</td><td className="p-3 border dark:border-gray-600 dark:text-gray-200">{row.semanal}</td></tr>))}</tbody></table><p className="text-xs text-gray-500 mt-2">Fuente: Kathleen M. Rasmussen and Ann L. Yaktine, Editors; Committee to Reexamine IOM Pregnancy Weight Guidelines; Institute of Medicine; National Research Council, 2009.</p></div> </div> );
};className={`text-sm ${row.key === categoriaActual ? 'bg-green-100 dark:bg-green-900/30 font-bold' : 'bg-white dark:bg-gray-800'}`}

const GyTTab = ({ patientData }) => {
  const [activeSubTab, setActiveSubTab] = useState('pt');
  const logic = useGyTLogic(patientData.height, patientData.weight, patientData.semanasGestacion);
  const SubTabButton = ({ tabId, label, icon }) => ( <button onClick={() => setActiveSubTab(tabId)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeSubTab === tabId ? 'bg-green-600 text-white shadow-md' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}> {icon} {label} </button> );
  return ( <div className="space-y-6"> <div className="flex flex-wrap gap-3 p-2 bg-gray-100 rounded-lg"> <SubTabButton tabId="pt" label="Calculadora %P/T" icon={<Ruler size={16}/>} /> <SubTabButton tabId="curva" label="Curva de Incremento" icon={<AreaChart size={16}/>} /> <SubTabButton tabId="imc" label="Ganancia de Peso por IMC" icon={<Table size={16}/>} /> </div> <div> {activeSubTab === 'pt' && <CalculadoraPT talla={patientData.height} peso={patientData.weight} logic={logic} />} {activeSubTab === 'curva' && <CurvaIncremento logic={logic} />} {activeSubTab === 'imc' && <TablaIMC pesoPreGestacional={patientData.pesoPreGestacional} talla={patientData.height} />} </div> </div> );
};

export default GyTTab;