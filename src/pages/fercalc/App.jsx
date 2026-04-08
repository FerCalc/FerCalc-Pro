// mi-app-frontend/src/pages/fercalc/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import DatosPacienteTab from './DatosPacienteTab.jsx';
import CalculadoraTab from './CalculadoraTab.jsx';
import FraccionamientoTab from './FraccionamientoTab.jsx';
import GyTTab from './GyTTab.jsx';
import GrowthAndDevelopmentTab from './GrowthAndDevelopmentTab.jsx';
import ActionToolbar from './ActionToolbar.jsx';
import { User, Activity, PieChart, Baby, TrendingUp } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import logo from './logo.png';
import { useAuth } from '../../context/AuthContext.jsx';

const initialState = {
  patientData: { weight: 70, height: 175, age: 30, sex: 'Masculino', estaEmbarazada: 'No', semanasGestacion: 0, pesoPreGestacional: 70, headCircumference: '' },
  dietGoals: { calorias: 2000, hc: 275, proteina: 75, grasa: 67, na: 2300, k: 3500, p: 700, ca: 1000, fe: 8, colesterol: 300, purinas: 400, fibra: 30, agua: 2000, pavbPercentage: 70 },
  dietaActual: [],
  planIntercambio: {},
  annotations: '',
};

const initialChronologicalAge = { totalMonths: 0, totalYears: 30, text: '30 años' };

// ✅ Estados iniciales de fraccionamiento
const INITIAL_MEAL_SLOTS = ['Desayuno', 'Media manana', 'Almuerzo', 'Media tarde', 'Merienda', 'Cena'];

function App() {
  const { user } = useAuth();
  const storageKey = `savedDiets_${user?.id || 'guest'}`;

  const [activeTab, setActiveTab] = useState('paciente');
  const [patientData, setPatientData] = useState(initialState.patientData);
  const [dietGoals, setDietGoals] = useState(initialState.dietGoals);
  const [dietaActual, setDietaActual] = useState(initialState.dietaActual);
  const [planIntercambio, setPlanIntercambio] = useState(initialState.planIntercambio);
  const [annotations, setAnnotations] = useState(initialState.annotations);
  const [chronologicalAge, setChronologicalAge] = useState(initialChronologicalAge);
  const [distribucion, setDistribucion] = useState({});

  // ✅ Estados de fraccionamiento elevados para que ActionToolbar pueda acceder al PDF
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

  const [savedDiets, setSavedDiets] = useState(() => {
    try {
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(savedDiets)); }
    catch (error) { console.error("Error al guardar dietas:", error); }
  }, [savedDiets, storageKey]);

  useEffect(() => {
    const handleBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const getCurrentDietState = () => ({
    patientData, dietGoals, dietaActual, planIntercambio, annotations,
  });

  const loadDietState = (dietData) => {
    setPatientData({ ...initialState.patientData, ...dietData.patientData });
    setDietGoals(dietData.dietGoals || initialState.dietGoals);
    setDietaActual(dietData.dietaActual || initialState.dietaActual);
    setPlanIntercambio(dietData.planIntercambio || initialState.planIntercambio);
    setAnnotations(dietData.annotations || initialState.annotations);
    toast.success(`Dieta "${dietData.name}" cargada.`);
  };

  const handlePlanIntercambioUpdate = useCallback((nuevoPlan) => {
    setPlanIntercambio(nuevoPlan);
  }, []);

  const handleNewDiet = () => {
    setPatientData(initialState.patientData);
    setDietGoals(initialState.dietGoals);
    setDietaActual(initialState.dietaActual);
    setPlanIntercambio(initialState.planIntercambio);
    setAnnotations(initialState.annotations);
    setChronologicalAge(initialChronologicalAge);
    setDistribucion({});
    // ✅ Reset fraccionamiento
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
    toast.success('Se ha iniciado una nueva dieta.');
  };

  // ✅ allData ahora incluye fraccionamientoData completo para el PDF
  const getAllData = () => ({
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
  });

  const TabButton = ({ tabName, icon, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tabName ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
    >
      {icon} {label}
    </button>
  );

  const showGyTTab = patientData.sex === 'Femenino' && patientData.estaEmbarazada === 'Sí' && patientData.semanasGestacion >= 10;
  const showGrowthTab = chronologicalAge.totalYears >= 0 && chronologicalAge.totalYears <= 19;

  return (
    <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen font-sans">
      <Toaster position="top-center" reverseOrder={false} />

      <header className="bg-white rounded-lg shadow-lg p-6 mb-6 flex justify-between items-center flex-wrap">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <img src={logo} alt="Logo FerCalc" className="h-16 w-auto" />
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-gray-800">Fer</span><span className="text-green-600">Calc</span>
            </h1>
            <p className="text-gray-600">Calculadora Nutricional</p>
          </div>
        </div>
        {/* ✅ allData ahora usa getAllData() con fraccionamiento completo */}
        <ActionToolbar
          getCurrentDietState={getCurrentDietState}
          savedDiets={savedDiets}
          setSavedDiets={setSavedDiets}
          loadDietState={loadDietState}
          handleNewDiet={handleNewDiet}
          allData={getAllData()}
        />
      </header>

      <nav className="flex flex-wrap gap-2 mb-6 p-2 bg-gray-100 rounded-lg">
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
          <div>
            <GrowthAndDevelopmentTab patientData={patientData} chronologicalAge={chronologicalAge} />
          </div>
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
          {/* ✅ Todos los estados de fraccionamiento vienen de App.jsx */}
          <FraccionamientoTab
            dietaActual={dietaActual}
            planIntercambio={planIntercambio}
            // Estados elevados
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

      <footer className="mt-8 pt-4 text-center text-sm text-gray-500 border-t">
        Creado por Fernando Chavez
      </footer>
    </div>
  );
}

export default App;