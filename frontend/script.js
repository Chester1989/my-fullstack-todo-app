// Constantes para los elementos del DOM (Document Object Model)
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

// URL base de nuestro backend API
const API_URL = 'http://localhost:5000/api/tasks';

// --- Funciones de Interacción con la API ---

// Función para obtener y mostrar todas las tareas
async function fetchTasks() {
    try {
        const response = await fetch(API_URL); // Realiza una petición GET a la API
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tasks = await response.json(); // Parsea la respuesta JSON

        taskList.innerHTML = ''; // Limpia la lista actual antes de añadir las nuevas tareas

        // Itera sobre cada tarea y la añade al DOM
        tasks.forEach(task => {
            addTaskToDOM(task);
        });
    } catch (error) {
        console.error('Error al obtener las tareas:', error);
        alert('No se pudieron cargar las tareas. Revisa la consola para más detalles.');
    }
}

// Función para añadir una nueva tarea
async function addTask(text) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST', // Método POST
            headers: {
                'Content-Type': 'application/json' // Indicamos que enviamos JSON
            },
            body: JSON.stringify({ text: text }) // Convertimos el objeto JS a JSON string
        });

        if (!response.ok) {
            throw new new Error(`HTTP error! status: ${response.status}`);
        }
        const newTask = await response.json(); // La API devuelve la tarea creada
        addTaskToDOM(newTask); // Añade la nueva tarea al DOM
        taskInput.value = ''; // Limpia el input del formulario
    } catch (error) {
        console.error('Error al añadir la tarea:', error);
        alert('No se pudo añadir la tarea. Revisa la consola.');
    }
}

// Función para actualizar el estado de una tarea (completada/no completada)
async function updateTask(id, completed) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT', // Método PUT
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed: completed }) // Enviamos el nuevo estado
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // La API devuelve la tarea actualizada, pero fetchTasks refrescará todo
        // const updatedTask = await response.json();
        fetchTasks(); // Volver a cargar todas las tareas para reflejar el cambio
    } catch (error) {
        console.error('Error al actualizar la tarea:', error);
        alert('No se pudo actualizar la tarea. Revisa la consola.');
    }
}

// Función para eliminar una tarea
async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE' // Método DELETE
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // La API devuelve un mensaje de éxito, pero fetchTasks refrescará todo
        // const result = await response.json();
        fetchTasks(); // Volver a cargar todas las tareas para reflejar el cambio
    } catch (error) {
        console.error('Error al eliminar la tarea:', error);
        alert('No se pudo eliminar la tarea. Revisa la consola.');
    }
}

// --- NUEVA Función para actualizar el texto de una tarea ---
async function updateTaskText(id, newText) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: newText }) // Enviamos solo el nuevo texto
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // No necesitamos hacer nada con la respuesta aquí, solo refrescar
        fetchTasks(); // Refrescar la lista para asegurar que el cambio se muestre
    } catch (error) {
        console.error('Error al actualizar el texto de la tarea:', error);
        alert('No se pudo actualizar el texto de la tarea. Revisa la consola.');
    }
}


// --- Funciones de Manipulación del DOM ---

// Función auxiliar para añadir una tarea al HTML (DOM)
function addTaskToDOM(task) {
    const listItem = document.createElement('li');
    listItem.dataset.id = task._id; // Almacenamos el ID de MongoDB en el elemento HTML

    if (task.completed) {
        listItem.classList.add('completed');
    }

    listItem.innerHTML = `
        <span class="task-text">${task.text}</span>
        <div class="actions">
            <button class="toggle-complete">${task.completed ? 'Desmarcar' : 'Completar'}</button>
            <button class="delete-task">Eliminar</button>
            <button class="edit-task" style="background-color: #ffc107; margin-left: 5px;">Editar</button>
        </div>
    `;

    // Añadir Event Listeners a los botones y texto
    listItem.querySelector('.task-text').addEventListener('click', () => {
        updateTask(task._id, !task.completed); // Toggle (cambia el estado)
    });

    // --- NUEVO: Evento para el botón Editar ---
    listItem.querySelector('.edit-task').addEventListener('click', () => {
        enterEditMode(listItem, task.text, task._id);
    });

    listItem.querySelector('.toggle-complete').addEventListener('click', () => {
        updateTask(task._id, !task.completed);
    });

    listItem.querySelector('.delete-task').addEventListener('click', () => {
        deleteTask(task._id);
    });

    taskList.appendChild(listItem); // Añade el elemento a la lista
}

// --- NUEVAS Funciones para el modo edición ---
function enterEditMode(listItem, currentText, taskId) {
    const taskTextSpan = listItem.querySelector('.task-text');
    const originalText = taskTextSpan.textContent; // Guardamos el texto original
    taskTextSpan.contentEditable = true; // Hace el span editable
    taskTextSpan.focus(); // Pone el foco en el span para que el usuario pueda escribir
    taskTextSpan.classList.add('editing'); // Opcional: añade una clase para estilos visuales de edición

    // Deshabilitar los otros botones mientras se edita para evitar conflictos
    const toggleButton = listItem.querySelector('.toggle-complete');
    const deleteButton = listItem.querySelector('.delete-task');
    const editButton = listItem.querySelector('.edit-task');

    toggleButton.disabled = true;
    deleteButton.disabled = true;
    editButton.style.display = 'none'; // Ocultar el botón editar

    // Crear botón "Guardar" y "Cancelar"
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Guardar';
    saveButton.style.backgroundColor = '#28a745';
    saveButton.style.marginLeft = '5px';
    saveButton.classList.add('save-edit');

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancelar';
    cancelButton.style.backgroundColor = '#6c757d';
    cancelButton.style.marginLeft = '5px';
    cancelButton.classList.add('cancel-edit');

    const actionsDiv = listItem.querySelector('.actions');
    actionsDiv.appendChild(saveButton);
    actionsDiv.appendChild(cancelButton);

    // Event listener para guardar
    saveButton.addEventListener('click', () => {
        const newText = taskTextSpan.textContent.trim();
        if (newText && newText !== originalText) { // Solo actualiza si hay texto y cambió
            updateTaskText(taskId, newText);
        }
        exitEditMode(listItem, originalText, toggleButton, deleteButton, editButton, saveButton, cancelButton);
    });

    // Event listener para cancelar
    cancelButton.addEventListener('click', () => {
        taskTextSpan.textContent = originalText; // Restaura el texto original
        exitEditMode(listItem, originalText, toggleButton, deleteButton, editButton, saveButton, cancelButton);
    });

    // Escuchar la tecla 'Enter' para guardar y 'Escape' para cancelar
    taskTextSpan.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita un salto de línea en el editable
            saveButton.click(); // Simula clic en guardar
        }
    });
    taskTextSpan.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cancelButton.click(); // Simula clic en cancelar
        }
    });
}

function exitEditMode(listItem, originalText, toggleButton, deleteButton, editButton, saveButton, cancelButton) {
    const taskTextSpan = listItem.querySelector('.task-text');
    taskTextSpan.contentEditable = false;
    taskTextSpan.classList.remove('editing');

    toggleButton.disabled = false;
    deleteButton.disabled = false;
    editButton.style.display = 'inline-block'; // Mostrar de nuevo el botón editar

    // Eliminar los botones de Guardar/Cancelar
    if (saveButton.parentNode) saveButton.parentNode.removeChild(saveButton);
    if (cancelButton.parentNode) cancelButton.parentNode.removeChild(cancelButton);
}

// --- Event Listeners del Formulario ---

// Cuando se envía el formulario para añadir una tarea
taskForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Previene el envío por defecto del formulario (recarga la página)
    const text = taskInput.value.trim(); // Obtiene el texto y quita espacios en blanco
    if (text) { // Si el texto no está vacío
        addTask(text); // Llama a la función para añadir la tarea
    }
});

// --- Inicialización ---

// Cargar las tareas cuando la página se carga
document.addEventListener('DOMContentLoaded', fetchTasks);