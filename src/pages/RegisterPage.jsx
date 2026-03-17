// src/pages/RegisterPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // Importamos nuestro hook

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Usamos el contexto para acceder a la función de registro y al estado de autenticación
    const { signup, isAuthenticated, errors: registerErrors } = useAuth();
    const navigate = useNavigate();

    // Si el usuario ya está autenticado, lo redirigimos a las tareas
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/tasks');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Ahora solo llamamos a la función signup del contexto
        await signup({ username, email, password });
    };

    return (
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
            <div className="bg-zinc-800 max-w-md w-full p-10 rounded-md">
                <h1 className="text-2xl font-bold text-white mb-4">Registro</h1>

                {registerErrors.length > 0 && (
                    <div className="bg-red-500 p-2 text-white text-center rounded-md mb-4">
                        {registerErrors.map((error, i) => (
                            <p key={i}>{error}</p>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* ... los inputs del formulario siguen igual que antes ... */}
                    <input type="text" name="username" placeholder="Nombre de usuario" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2" required />
                    <input type="email" name="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2" required />
                    <input type="password" name="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2" required />
                    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md mt-4">
                        Registrar
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RegisterPage;