// src/pages/TasksPage.jsx (ACTUALIZADO)

import React, { useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskCard from '../components/TaskCard'; // Crearemos este componente ahora
import { Link } from 'react-router-dom';

function TasksPage() {
  const { getTasks, tasks } = useTasks();

  useEffect(() => {
    getTasks();
  }, []);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <h1 className="text-2xl font-bold text-white mb-4">No hay tareas aún</h1>
        <Link to="/add-task" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded">
          Crear mi primera tarea
        </Link>
      </div>
    );
  }

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Mis Tareas</h1>
        <Link to="/add-task" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded">
          Añadir Tarea
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <TaskCard task={task} key={task._id} />
        ))}
      </div>
    </div>
  );
}

export default TasksPage;