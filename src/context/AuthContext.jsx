import { createContext, useState, useContext, useEffect } from "react";
import { registerRequest, loginRequest, verifyTokenRequest, logoutRequest } from "../api/auth.js";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]                       = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors]                   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const navigate = useNavigate();

  const handleError = (error) => {
    if (!error.response) {
      return setErrors(['No se pudo conectar con el servidor. Intente más tarde.']);
    }
    const data = error.response.data;
    if (Array.isArray(data)) {
      setErrors(data);
    } else {
      setErrors([data?.message || 'Ocurrió un error inesperado.']);
    }
  };

  const signup = async (user) => {
    try {
      const res = await registerRequest(user);
      setUser(res.data);
      setIsAuthenticated(true);
      navigate('/app'); // ✅ Redirige a FerCalc
    } catch (error) {
      handleError(error);
    }
  };

  const signin = async (user) => {
    try {
      const res = await loginRequest(user);
      setUser(res.data);
      setIsAuthenticated(true);
      navigate('/app'); // ✅ Redirige a FerCalc
    } catch (error) {
      handleError(error);
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error("Fallo en la petición de logout al servidor:", error);
    } finally {
      Cookies.remove('token');
      setUser(null);
      setIsAuthenticated(false);
      navigate('/'); // ✅ Redirige al home al cerrar sesión
    }
  };

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => setErrors([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  useEffect(() => {
    async function checkLogin() {
      const cookies = Cookies.get();
      if (!cookies.token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
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
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkLogin();
  }, []);

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