// Constantes y dependencias
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Carga las variables de entorno

// Inicializar la aplicación de Express
const app = express();

// Configuración de CORS
const corsOptions = {
    origin: process.env.FRONTEND_URL, // Usamos la variable de entorno
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Middlewares
app.use(express.json()); // Permite que Express lea JSON en el cuerpo de las peticiones

// Conexión a MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log('Conexión exitosa a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// Esquema y Modelo de Tarea
const taskSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Task = mongoose.model('Task', taskSchema);

// RUTAS DE LA API

// 1. OBTENER TODAS LAS TAREAS (READ - GET)
app.get('/api/tasks', async (req, res) => {
    try {
        const { completed } = req.query;
        let filter = {};
        if (completed !== undefined) {
            filter.completed = (completed === 'true');
        }
        const tasks = await Task.find(filter).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. AGREGAR UNA NUEVA TAREA (CREATE - POST)
app.post('/api/tasks', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ message: 'El texto de la tarea es requerido' });
    }

    const newTask = new Task({ text });
    try {
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. ACTUALIZAR UNA TAREA (UPDATE - PUT)
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }
        res.json(updatedTask);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. ELIMINAR UNA TAREA (DELETE - DELETE)
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }
        res.json({ message: 'Tarea eliminada' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Manejador de errores 404 para rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ message: 'Ruta no encontrada. Por favor, revisa la URL de la API.' });
});

// Inicio del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
