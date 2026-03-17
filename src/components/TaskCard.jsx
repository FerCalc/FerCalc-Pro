// src/components/TaskCard.jsx

import React from 'react';
import { useTasks } from '../context/TaskContext';
import { Link } from 'react-router-dom';
import { Trash2, Pencil } from 'lucide-react'; // Íconos

function TaskCard({ task }) {
  const { deleteTask } = useTasks();

  return (
    <div className="bg-zinc-800 max-w-md w-full p-6 rounded-md text-white flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold">{task.title}</h1>
        <p className="text-slate-300 mt-2">{task.description}</p>
      </div>
      <div className="mt-4">
        <p className="text-sm text-slate-400">
          {new Date(task.date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <div className="flex gap-x-2 items-center mt-4">
          <Link
            to={`/tasks/${task._id}`}
            className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md flex items-center gap-x-1"
          >
            <Pencil size={18} /> Editar
          </Link>
          <button
            onClick={() => deleteTask(task._id)}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md flex items-center gap-x-1"
          >
            <Trash2 size={18} /> Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;