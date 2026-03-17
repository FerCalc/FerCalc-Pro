// src/pages/LoginPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { signin, isAuthenticated, errors: loginErrors } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/tasks');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await signin({ email, password });
    };

    return (
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
            <div className="bg-zinc-800 max-w-md w-full p-10 rounded-md">
                <h1 className="text-2xl font-bold text-white mb-4">Login</h1>

                {loginErrors.length > 0 && (
                    <div className="bg-red-500 p-2 text-white text-center rounded-md mb-4">
                        {loginErrors.map((error, i) => (
                            <p key={i}>{error}</p>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <input type="email" name="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2" required />
                    <input type="password" name="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2" required />
                    <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md mt-4">
                        Iniciar Sesión
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;