// src/context/TaskContext.jsx (ACTUALIZADO)

import { createContext, useContext, useState } from 'react';
// Importamos las nuevas funciones de la API
import {
    createTaskRequest,
    getTasksRequest,
    deleteTaskRequest,
    getTaskRequest,      // <-- NUEVO
    updateTaskRequest,   // <-- NUEVO
} from '../api/tasks';

const TaskContext = createContext();

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error("useTasks debe ser usado dentro de un TaskProvider");
    }
    return context;
};

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useState([]);

    const getTasks = async () => {
        try {
            const res = await getTasksRequest();
            setTasks(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const createTask = async (task) => {
        try {
            const res = await createTaskRequest(task);
            console.log(res);
        } catch (error) {
            console.error(error);
        }
    };

    const deleteTask = async (id) => {
        try {
            const res = await deleteTaskRequest(id);
            if (res.status === 204) {
                setTasks(tasks.filter(task => task._id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    // --- NUEVAS FUNCIONES ---

    const getTask = async (id) => {
        try {
            const res = await getTaskRequest(id);
            return res.data; // Devolvemos los datos de la tarea encontrada
        } catch (error) {
            console.error(error);
        }
    };

    const updateTask = async (id, task) => {
        try {
            await updateTaskRequest(id, task);
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <TaskContext.Provider value={{
            tasks,
            createTask,
            getTasks,
            deleteTask,
            getTask,      // <-- NUEVO
            updateTask,   // <-- NUEVO
        }}>
            {children}
        </TaskContext.Provider>
    );
}