// mi-app-frontend/src/context/FerCalcContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const INITIAL_MEAL_SLOTS = ['Desayuno', 'Media manana', 'Almuerzo', 'Media tarde', 'Merienda', 'Cena'];

const initialState = {
  patientData: { weight: 70, height: 175, age: 30, sex: 'Masculino', estaEmbarazada: 'No', semanasGestacion: 0, pesoPreGestacional: 70, headCircumference: '' },
  dietGoals: { calorias: 2000, hc: 275, proteina: 75, grasa: 67, na: 2300, k: 3500, p: 700, ca: 1000, fe: 8, colesterol: 300, purinas: 400, fibra: 30, agua: 2000, pavbPercentage: 70 },
  dietaActual: [],
  planIntercambio: {},
  annotations: '',
};

const initialChronologicalAge = { totalMonths: 0, totalYears: 30, text: '30 años' };

const FerCalcContext = createContext(null);

export const FerCalcProvider = ({ children }) => {
  const [patientData, setPatientData] = useState(initialState.patientData);
  const [dietGoals, setDietGoals] = useState(initialState.dietGoals);
  const [dietaActual, setDietaActual] = useState(initialState.dietaActual);
  const [planIntercambio, setPlanIntercambio] = useState(initialState.planIntercambio);
  const [annotations, setAnnotations] = useState(initialState.annotations);
  const [chronologicalAge, setChronologicalAge] = useState(initialChronologicalAge);
  const [distribucion, setDistribucion] = useState({});

  // Fraccionamiento
  const [fracMealSlots, setFracMealSlots] = useState(INITIAL_MEAL_SLOTS);
  const [fracMealTimes, setFracMealTimes] = useState({});
  const [fracMealTimesByDay, setFracMealTimesByDay] = useState({});
  const [fracNumberOfDays, setFracNumberOfDays] = useState(1);
  const [fracDistribucionDesarrollada, setFracDistribucionDesarrollada] = useState({});
  const [fracDistribucionIntercambio, setFracDistribucionIntercambio] = useState({});
  const [fracMealNamesByDayDes, setFracMealNamesByDayDes] = useState({});
  const [fracMealNamesByDayInt, setFracMealNamesByDayInt] = useState({});
  const [fracRecetariosDes, setFracRecetariosDes] = useState({});
  const [fracRecetariosInt, setFracRecetariosInt] = useState({});

  const resetAll = useCallback(() => {
    setPatientData(initialState.patientData);
    setDietGoals(initialState.dietGoals);
    setDietaActual(initialState.dietaActual);
    setPlanIntercambio(initialState.planIntercambio);
    setAnnotations(initialState.annotations);
    setChronologicalAge(initialChronologicalAge);
    setDistribucion({});
    setFracMealSlots(INITIAL_MEAL_SLOTS);
    setFracMealTimes({});
    setFracMealTimesByDay({});
    setFracNumberOfDays(1);
    setFracDistribucionDesarrollada({});
    setFracDistribucionIntercambio({});
    setFracMealNamesByDayDes({});
    setFracMealNamesByDayInt({});
    setFracRecetariosDes({});
    setFracRecetariosInt({});
  }, []);

  const getAllData = useCallback(() => ({
    patientData,
    dietGoals,
    dietaActual,
    planIntercambio,
    annotations,
    fraccionamientoData: {
      mealSlots: fracMealSlots,
      numberOfDays: fracNumberOfDays,
      distribucionDesarrollada: fracDistribucionDesarrollada,
      distribucionIntercambio: fracDistribucionIntercambio,
      mealNamesByDayDes: fracMealNamesByDayDes,
      mealNamesByDayInt: fracMealNamesByDayInt,
      recetariosDes: fracRecetariosDes,
      recetariosInt: fracRecetariosInt,
    },
  }), [
    patientData, dietGoals, dietaActual, planIntercambio, annotations,
    fracMealSlots, fracNumberOfDays, fracDistribucionDesarrollada,
    fracDistribucionIntercambio, fracMealNamesByDayDes, fracMealNamesByDayInt,
    fracRecetariosDes, fracRecetariosInt,
  ]);

  const loadDietState = useCallback((dietData) => {
    setPatientData({ ...initialState.patientData, ...dietData.patientData });
    setDietGoals(dietData.dietGoals || initialState.dietGoals);
    setDietaActual(dietData.dietaActual || initialState.dietaActual);
    setPlanIntercambio(dietData.planIntercambio || initialState.planIntercambio);
    setAnnotations(dietData.annotations || initialState.annotations);
  }, []);

  return (
    <FerCalcContext.Provider value={{
      // Estado
      patientData, setPatientData,
      dietGoals, setDietGoals,
      dietaActual, setDietaActual,
      planIntercambio, setPlanIntercambio,
      annotations, setAnnotations,
      chronologicalAge, setChronologicalAge,
      distribucion, setDistribucion,
      // Fraccionamiento
      fracMealSlots, setFracMealSlots,
      fracMealTimes, setFracMealTimes,
      fracMealTimesByDay, setFracMealTimesByDay,
      fracNumberOfDays, setFracNumberOfDays,
      fracDistribucionDesarrollada, setFracDistribucionDesarrollada,
      fracDistribucionIntercambio, setFracDistribucionIntercambio,
      fracMealNamesByDayDes, setFracMealNamesByDayDes,
      fracMealNamesByDayInt, setFracMealNamesByDayInt,
      fracRecetariosDes, setFracRecetariosDes,
      fracRecetariosInt, setFracRecetariosInt,
      // Funciones
      getAllData,
      loadDietState,
      resetAll,
    }}>
      {children}
    </FerCalcContext.Provider>
  );
};

export const useFerCalc = () => {
  const ctx = useContext(FerCalcContext);
  if (!ctx) throw new Error('useFerCalc debe usarse dentro de FerCalcProvider');
  return ctx;
};