import { createContext, useState, useContext, useEffect } from "react";
import { registerRequest, loginRequest, verifyTokenRequest, logoutRequest } from "../api/auth.js"; 
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

// 1. Creación del Contexto
export const AuthContext = createContext();

// 2. Hook personalizado para usar el contexto más fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// 3. Componente Proveedor que envuelve la aplicación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true); // Estado para saber si aún se está verificando el token
  const navigate = useNavigate();

  // --- Funciones de Autenticación ---

  const signup = async (user) => {
    try {
        const res = await registerRequest(user);
        setUser(res.data);
        setIsAuthenticated(true);
        navigate('/tasks'); // Redirige al usuario después del registro exitoso
    } catch (error) {
        // **MEJORA CLAVE**: Manejo de errores robusto.
        // Asegura que 'errors' siempre sea un array para evitar que .map() falle.
        if (Array.isArray(error.response.data)) {
            setErrors(error.response.data);
        } else {
            setErrors([error.response.data.message || 'Error en el registro, intente de nuevo.']);
        }
    }
  };

  const signin = async (user) => {
    try {
        const res = await loginRequest(user);
        setUser(res.data);
        setIsAuthenticated(true);
        navigate('/tasks'); // Redirige al usuario después del login exitoso
    } catch (error) {
        // Esta lógica ya era correcta, la mantenemos.
        if (Array.isArray(error.response.data)) {
            return setErrors(error.response.data);
        }
        setErrors([error.response.data.message]);
    }
  };

  const logout = async () => {
    // Esta función limpia el estado local y las cookies, asegurando el cierre de sesión
    // incluso si la petición al servidor falla.
    try {
      await logoutRequest();
    } catch (error) {
      console.error("Fallo en la petición de logout al servidor:", error);
    } finally {
      Cookies.remove('token');
      setUser(null);
      setIsAuthenticated(false);
      navigate('/');
    }
  };

  // --- Efectos Secundarios (useEffect) ---

  // Efecto para limpiar los mensajes de error después de 5 segundos
  useEffect(() => {
    if (errors.length > 0) {
        const timer = setTimeout(() => {
            setErrors([]);
        }, 5000);
        // Limpia el temporizador si el componente se desmonta o los errores cambian
        return () => clearTimeout(timer);
    }
  }, [errors]);

  // Efecto para verificar si el usuario ya está logueado al cargar la página
  useEffect(() => {
    async function checkLogin() {
        const cookies = Cookies.get();
        if (!cookies.token) {
            setIsAuthenticated(false);
            setLoading(false);
            return setUser(null);
        }

        try {
            const res = await verifyTokenRequest(cookies.token);
            if (!res.data) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            setIsAuthenticated(true);
            setUser(res.data);
            setLoading(false);
        } catch (error) {
            // Si el token no es válido (o hay otro error), limpiamos todo.
            setIsAuthenticated(false);
            setUser(null);
            setLoading(false);
        }
    }
    checkLogin();
  }, []);

  // 4. Retorno del Proveedor con los valores que se compartirán
  return (
    <AuthContext.Provider value={{
      signup,
      signin,
      logout,
      loading,
      user,
      isAuthenticated,
      errors
    }}>
      {children}
    </AuthContext.Provider>
  );
};