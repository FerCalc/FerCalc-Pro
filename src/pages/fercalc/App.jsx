// mi-app-frontend/src/pages/fercalc/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import DatosPacienteTab from './DatosPacienteTab.jsx';
import CalculadoraTab from './CalculadoraTab.jsx';
import FraccionamientoTab from './FraccionamientoTab.jsx';
import GyTTab from './GyTTab.jsx';
import GrowthAndDevelopmentTab from './GrowthAndDevelopmentTab.jsx';
import ActionToolbar from './ActionToolbar.jsx';
import { User, Activity, PieChart, Baby, TrendingUp, Users } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import logo from './logo.png';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFerCalc } from '../../context/FerCalcContext.jsx';
import { useNavigate } from 'react-router-dom';

function App() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const storageKey = `savedDiets_${user?.id || 'guest'}`;

  // ✅ Todo el estado viene del contexto global
  const {
    patientData, setPatientData,
    dietGoals, setDietGoals,
    dietaActual, setDietaActual,
    planIntercambio, setPlanIntercambio,
    annotations, setAnnotations,
    chronologicalAge, setChronologicalAge,
    distribucion, setDistribucion,
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
    getAllData,
    loadDietState,
    resetAll,
  } = useFerCalc();

  const [activeTab, setActiveTab] = useState('paciente');
  const [savedDiets, setSavedDiets] = useState(() => {
    try {
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(savedDiets)); }
    catch (error) { console.error('Error al guardar dietas:', error); }
  }, [savedDiets, storageKey]);

  useEffect(() => {
    const handleBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const getCurrentDietState = () => ({
    patientData, dietGoals, dietaActual, planIntercambio, annotations,
  });

  const handleLoadDietState = useCallback((dietData) => {
    loadDietState(dietData);
    toast.success(`Dieta "${dietData.name}" cargada.`);
  }, [loadDietState]);

  const handlePlanIntercambioUpdate = useCallback((nuevoPlan) => {
    setPlanIntercambio(nuevoPlan);
  }, [setPlanIntercambio]);

  const handleNewDiet = () => {
    resetAll();
    toast.success('Se ha iniciado una nueva dieta.');
  };

  const TabButton = ({ tabName, icon, label }) => (
  <button
    onClick={() => setActiveTab(tabName)}
    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      activeTab === tabName
        ? 'bg-green-600 text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
    }`}
  >
    {icon} {label}
  </button>
);

  const showGyTTab = patientData.sex === 'Femenino' && patientData.estaEmbarazada === 'Sí' && patientData.semanasGestacion >= 10;
  const showGrowthTab = chronologicalAge.totalYears >= 0 && chronologicalAge.totalYears <= 19;

  return (
    <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen font-sans transition-colors duration-200">
      <Toaster position="top-center" reverseOrder={false} />

      <header className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-lg shadow-lg p-6 mb-6 flex justify-between items-center flex-wrap gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo FerCalc" className="h-16 w-auto" />
          <div>
            <h1 className="text-2xl font-bold">
  <span className="text-gray-800 dark:text-white">Fer</span>
  <span className="text-green-600">Calc</span>
</h1>
<p className="text-gray-600 dark:text-gray-400">Calculadora Nutricional</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* ✅ Botón acceso directo a pacientes */}
          <button
            onClick={() => navigate('/pacientes')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Users size={18} /> Mis Pacientes
          </button>
          <ActionToolbar
            getCurrentDietState={getCurrentDietState}
            savedDiets={savedDiets}
            setSavedDiets={setSavedDiets}
            loadDietState={handleLoadDietState}
            handleNewDiet={handleNewDiet}
            allData={getAllData()}
          />
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 mb-6 p-2 bg-gray-100 dark:bg-gray-900 rounded-lg transition-colors">
        <TabButton tabName="paciente" icon={<User size={16} />} label="Datos y Objetivos" />
        {showGrowthTab && <TabButton tabName="crecimiento" icon={<TrendingUp size={16} />} label="Crecimiento y Desarrollo" />}
        {showGyTTab && <TabButton tabName="gyt" icon={<Baby size={16} />} label="G y T" />}
        <TabButton tabName="calculadora" icon={<Activity size={16} />} label="Calculadora Nutricional" />
        <TabButton tabName="fraccionamiento" icon={<PieChart size={16} />} label="Fraccionamiento" />
      </nav>

      <main className="mt-6">
        <div style={{ display: activeTab === 'paciente' ? 'block' : 'none' }}>
          <DatosPacienteTab
            patientData={patientData}
            setPatientData={setPatientData}
            dietGoals={dietGoals}
            setDietGoals={setDietGoals}
            dietaActual={dietaActual}
            annotations={annotations}
            setAnnotations={setAnnotations}
            chronologicalAge={chronologicalAge}
            setChronologicalAge={setChronologicalAge}
          />
        </div>

        {showGrowthTab && activeTab === 'crecimiento' && (
          <GrowthAndDevelopmentTab patientData={patientData} chronologicalAge={chronologicalAge} />
        )}

        {showGyTTab && (
          <div style={{ display: activeTab === 'gyt' ? 'block' : 'none' }}>
            <GyTTab patientData={patientData} />
          </div>
        )}

        <div style={{ display: activeTab === 'calculadora' ? 'block' : 'none' }}>
          <CalculadoraTab
            dietaActual={dietaActual}
            setDietaActual={setDietaActual}
            setDistribucion={setDistribucion}
            patientData={patientData}
            dietGoals={dietGoals}
            onPlanIntercambioUpdate={handlePlanIntercambioUpdate}
          />
        </div>

        <div style={{ display: activeTab === 'fraccionamiento' ? 'block' : 'none' }}>
          <FraccionamientoTab
            dietaActual={dietaActual}
            planIntercambio={planIntercambio}
            mealSlots={fracMealSlots}
            setMealSlots={setFracMealSlots}
            mealTimes={fracMealTimes}
            setMealTimes={setFracMealTimes}
            mealTimesByDay={fracMealTimesByDay}
            setMealTimesByDay={setFracMealTimesByDay}
            numberOfDays={fracNumberOfDays}
            setNumberOfDays={setFracNumberOfDays}
            distribucionDesarrollada={fracDistribucionDesarrollada}
            setDistribucionDesarrollada={setFracDistribucionDesarrollada}
            distribucionIntercambio={fracDistribucionIntercambio}
            setDistribucionIntercambio={setFracDistribucionIntercambio}
            mealNamesByDayDes={fracMealNamesByDayDes}
            setMealNamesByDayDes={setFracMealNamesByDayDes}
            mealNamesByDayInt={fracMealNamesByDayInt}
            setMealNamesByDayInt={setFracMealNamesByDayInt}
            recetariosDes={fracRecetariosDes}
            setRecetariosDes={setFracRecetariosDes}
            recetariosInt={fracRecetariosInt}
            setRecetariosInt={setFracRecetariosInt}
          />
        </div>
      </main>

      <footer className="mt-8 pt-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-800">
  Creado por Fernando Chavez
</footer>
    </div>
  );
}

export default App;