const express = require('express');
const mongoose = require('mongoose'); // Importar Mongoose
const cors = require('cors'); // <-- ¡Esta línea!

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware: Usar CORS para permitir peticiones desde el frontend
app.use(cors()); // <-- ¡Y esta otra línea, antes de app.use(express.json());!

// Middleware para parsear JSON
app.use(express.json());



// Middleware para parsear JSON
app.use(express.json());

// --- Configuración y Conexión a MongoDB ---

// Reemplaza esta línea con la cadena de conexión que copiaste de MongoDB Atlas
// ¡Asegúrate de reemplazar <username> y <password> con tus credenciales reales!
// Es MEJOR práctica usar variables de entorno para esto (ej. process.env.MONGO_URI)
// Por ahora, para simplificar, puedes pegarla directamente aquí:
const MONGO_URI = 'mongodb+srv://agf009:MiClaveSencilla123@todoappcluster.07ohgcn.mongodb.net/?retryWrites=true&w=majority&appName=TodoAppCluster';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// --- Definir un Esquema y Modelo para Tareas ---
// Un esquema describe la forma de los documentos en nuestra colección
const taskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true // Elimina espacios en blanco al principio/final
  },
  completed: {
    type: Boolean,
    default: false // Por defecto, una tarea no está completada
  },
  createdAt: {
    type: Date,
    default: Date.now // Fecha de creación automática
  }
});

// Un modelo es una clase con la que construimos y consultamos documentos
const Task = mongoose.model('Task', taskSchema);

// --- Rutas de Nuestra API ---

// Ruta de ejemplo (GET a la raíz)
app.get('/', (req, res) => {
  res.send('¡Servidor de Lista de Tareas funcionando y conectado a DB!');
});

/// 1. OBTENER TODAS LAS TAREAS (READ - GET)
// Ruta: GET /api/tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find(); // Encuentra todos los documentos de tareas
    res.json(tasks); // Envía las tareas como respuesta JSON
  } catch (err) {
    res.status(500).json({ message: err.message }); // Manejo de errores
  }
});

// 2. CREAR UNA NUEVA TAREA (CREATE - POST)
// Ruta: POST /api/tasks
app.post('/api/tasks', async (req, res) => {
  // req.body contendrá el JSON enviado por el cliente (ej. { "text": "Hacer la compra" })
  const task = new Task({
    text: req.body.text
    // 'completed' y 'createdAt' se establecen por defecto en el esquema
  });

  try {
    const newTask = await task.save(); // Guarda la nueva tarea en la base de datos
    res.status(201).json(newTask); // Responde con la nueva tarea y un status 201 (Created)
  } catch (err) {
    res.status(400).json({ message: err.message }); // 400 Bad Request si hay un error de validación (ej. texto requerido)
  }
});

// 3. ACTUALIZAR UNA TAREA (UPDATE - PUT)
// Ruta: PUT /api/tasks/:id
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtiene el ID de la tarea de la URL
    // Busca la tarea por ID y la actualiza. 'new: true' devuelve el documento actualizado.
    // 'runValidators: true' asegura que se apliquen las validaciones del esquema (ej. 'required')
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      req.body, // El cuerpo de la petición puede contener { text: "nuevo texto", completed: true }
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Tarea no encontrada' }); // 404 Not Found
    }
    res.json(updatedTask); // Responde con la tarea actualizada
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. ELIMINAR UNA TAREA (DELETE - DELETE)
// Ruta: DELETE /api/tasks/:id
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params; // Obtiene el ID de la tarea de la URL
    const deletedTask = await Task.findByIdAndDelete(id); // Busca y elimina la tarea

    if (!deletedTask) {
      return res.status(404).json({ message: 'Tarea no encontrada' }); // 404 Not Found
    }
    res.json({ message: 'Tarea eliminada correctamente' }); // Confirma la eliminación
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Iniciar el Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Accede a: http://localhost:${PORT}`);
});