// src/pages/FerCalcPage.jsx
import FerCalcApp from './fercalc/App.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function FerCalcPage() {
  const { logout, user } = useAuth();

  return (
    <div className="relative">
      {/* Barra superior con usuario y cerrar sesión */}
      <div className="bg-white border-b px-6 py-2 flex justify-end items-center gap-4 text-sm">
        <span className="text-gray-600">
          👤 <span className="font-semibold">{user?.username}</span>
        </span>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition duration-300"
        >
          Cerrar Sesión
        </button>
      </div>
      <FerCalcApp />
    </div>
  );
}

export default FerCalcPage;