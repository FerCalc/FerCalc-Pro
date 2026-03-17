// src/pages/TaskFormPage.jsx (ACTUALIZADO)

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTasks } from '../context/TaskContext';
import { useNavigate, useParams } from 'react-router-dom';

function TaskFormPage() {
  const { register, handleSubmit, setValue } = useForm();
  const { createTask, getTask, updateTask } = useTasks();
  const navigate = useNavigate();
  const params = useParams(); // Hook para obtener los parámetros de la URL (como el :id)

  useEffect(() => {
    async function loadTask() {
      // Si hay un 'id' en la URL, significa que estamos editando
      if (params.id) {
        const task = await getTask(params.id);
        // Usamos setValue de react-hook-form para poblar los campos del formulario
        setValue('title', task.title);
        setValue('description', task.description);
        // El input de tipo 'date' espera el formato YYYY-MM-DD
        setValue('date', new Date(task.date).toISOString().substring(0, 10));
      }
    }
    loadTask();
  }, []); // El array vacío asegura que se ejecute solo una vez al cargar la página

  const onSubmit = handleSubmit(async (data) => {
    const dataValid = {
      ...data,
      // Si hay una fecha, la convertimos a un objeto Date
      ...(data.date && { date: new Date(data.date).toISOString() }),
    };

    if (params.id) {
      // Si estamos editando, llamamos a updateTask
      await updateTask(params.id, dataValid);
    } else {
      // Si no, llamamos a createTask
      await createTask(dataValid);
    }
    navigate('/tasks'); // Al finalizar, redirigimos a la página de tareas
  });

  return (
    <div className="flex items-center justify-center h-[calc(100vh-100px)]">
      <div className="bg-zinc-800 max-w-md w-full p-10 rounded-md">
        <h1 className="text-2xl font-bold text-white mb-4">
          {params.id ? "Editar Tarea" : "Nueva Tarea"}
        </h1>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Título"
            {...register('title', { required: true })}
            className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
            autoFocus
          />
          <textarea
            rows="3"
            placeholder="Descripción"
            {...register('description', { required: true })}
            className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
          ></textarea>
          <label className="text-white block">Fecha</label>
          <input
            type="date"
            {...register('date')}
            className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
          />
          <button
            type="submit"
            className="bg-indigo-500 px-4 py-2 rounded-md hover:bg-indigo-600 w-full mt-4"
          >
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
}

export default TaskFormPage;