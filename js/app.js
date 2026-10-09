// ===== Edu-Recorder App Logic =====

const VAPID_PUBLIC_KEY = 'BKsTf1wxQNiM0tlZUpgzbxoPP-C3phHxs4wEKs7MgK-XJ1vp37vl3YWUNewnNjvTS7I-pHIrGUna2TVpWXmCwpM';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

// Referencias a elementos del DOM
var taskList       = $('#task-list');
var emptyState     = $('#empty-state');
var taskModal      = $('#task-modal');
var addTaskBtn     = $('#add-task-btn');
var closeModalBtn  = $('#close-modal-btn');
var taskForm       = $('#task-form');
var notifBtn       = $('#notif-btn');
var networkStatus  = $('#network-status');
var filterBtns     = $('.filter-btn');

// Almacenamiento local de tareas
var tasks = JSON.parse(localStorage.getItem('edu_tasks')) || [
    {
        id: Date.now() - 2000,
        title: 'Proyecto Final PWA',
        subject: 'PWA',
        date: '2026-10-15',
        desc: 'Implementar Service Worker con caché offline, manifest e iconos, y notificaciones push.',
        completed: false
    },
    {
        id: Date.now() - 1000,
        title: 'Práctica de Bases de Datos',
        subject: 'Bases de Datos',
        date: '2026-10-12',
        desc: 'Crear procedimientos almacenados y consultas avanzadas.',
        completed: true
    }
];

var currentFilter = 'all';

// ===== Renderizado de Tarjetas Formales =====
function renderTasks() {
    taskList.empty();

    var filteredTasks = tasks.filter(function(task) {
        if (currentFilter === 'pending') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        emptyState.show();
    } else {
        emptyState.hide();
        filteredTasks.forEach(function(task) {
            var cardHTML = `
                <div class="task-card ${task.completed ? 'completed' : ''} animated fadeIn" data-id="${task.id}">
                    <div class="task-header">
                        <span class="task-title ${task.completed ? 'completed-text' : ''}">
                            <i class="fas ${task.completed ? 'fa-check-circle' : 'fa-clock'}" style="color: ${task.completed ? '#16a34a' : '#ea580c'}; margin-right: 6px;"></i>
                            ${task.title}
                        </span>
                        <span class="subject-badge">${task.subject}</span>
                    </div>
                    <p class="task-desc">${task.desc}</p>
                    <div class="task-footer">
                        <div class="task-date">
                            <i class="far fa-calendar-alt"></i> Entrega: ${task.date}
                            <span class="status-badge ${task.completed ? 'done' : 'pending'}">
                                ${task.completed ? 'Entregada' : 'Pendiente'}
                            </span>
                        </div>
                        <div class="task-actions">
                            <button class="btn-small btn-small-orange btn-trigger-notif" title="Enviar Notificación de Recordatorio">
                                <i class="fas fa-bell"></i> Notificar
                            </button>
                            <button class="btn-small btn-small-green btn-toggle" title="Cambiar Estado">
                                <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i> ${task.completed ? 'Reabrir' : 'Completar'}
                            </button>
                            <button class="btn-small btn-small-danger btn-remove" title="Eliminar Tarea">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            taskList.append(cardHTML);
        });
    }
}

// ===== Guardar en LocalStorage =====
function saveTasks() {
    localStorage.setItem('edu_tasks', JSON.stringify(tasks));
    renderTasks();
}

// ===== Eventos de Interfaz =====

addTaskBtn.on('click', function() {
    taskModal.addClass('active');
    $('#task-title').focus();
});

closeModalBtn.on('click', function() {
    taskModal.removeClass('active');
    taskForm[0].reset();
});

taskForm.on('submit', function(e) {
    e.preventDefault();

    var title   = $('#task-title').val().trim();
    var subject = $('#task-subject').val();
    var date    = $('#task-date').val();
    var desc    = $('#task-desc').val().trim();

    if (!title || !date) return;

    var newTask = {
        id: Date.now(),
        title: title,
        subject: subject,
        date: date,
        desc: desc || 'Sin descripción adicional.',
        completed: false
    };

    tasks.unshift(newTask);
    saveTasks();
    taskModal.removeClass('active');
    taskForm[0].reset();

    // Notificar al servidor backend y localmente
    enviarNotificacionPush('¡Nueva Tarea Creada!', 'Se registró "' + title + '" (' + subject + ') para el ' + date + '.');
});

taskList.on('click', '.btn-toggle', function() {
    var cardId = $(this).closest('.task-card').data('id');
    tasks = tasks.map(function(t) {
        if (t.id === cardId) t.completed = !t.completed;
        return t;
    });
    saveTasks();
});

taskList.on('click', '.btn-remove', function() {
    var cardId = $(this).closest('.task-card').data('id');
    tasks = tasks.filter(function(t) { return t.id !== cardId; });
    saveTasks();
});

taskList.on('click', '.btn-trigger-notif', function() {
    var cardId = $(this).closest('.task-card').data('id');
    var task = tasks.find(function(t) { return t.id === cardId; });
    if (task) {
        enviarNotificacionPush('Recordatorio: ' + task.title, 'Materia: ' + task.subject + ' | Fecha de entrega: ' + task.date);
    }
});

filterBtns.on('click', function() {
    filterBtns.removeClass('active');
    $(this).addClass('active');
    currentFilter = $(this).data('filter');
    renderTasks();
});

// ===== Detección Online / Offline =====
function updateNetworkStatus() {
    if (navigator.onLine) {
        networkStatus.removeClass('offline').addClass('online').html('<i class="fas fa-wifi"></i> Online');
    } else {
        networkStatus.removeClass('online').addClass('offline').html('<i class="fas fa-ban"></i> Offline');
    }
}

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);
updateNetworkStatus();

// ===== Enviar Notificaciones al Servidor Backend Push o Local =====
async function enviarNotificacionPush(titulo, mensaje) {
    // 1. Intentar enviar petición al servidor backend Express (http://localhost:3000/api/push)
    try {
        await fetch('http://localhost:3000/api/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: titulo, body: mensaje })
        });
    } catch (err) {
        console.log('Servidor backend no disponible, usando notificación local:', err);
    }

    // 2. Notificación local como respaldo mediante el Service Worker
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
        var reg = await navigator.serviceWorker.ready;
        reg.showNotification(titulo, {
            body: mensaje,
            icon: './img/icons/icon-192x192.png',
            badge: './img/icons/icon-72x72.png',
            vibrate: [100, 50, 100]
        });
    }
}

// ===== Botón Campana: Solicitar Permisos y Suscribir al Servidor Backend (VAPID) =====
notifBtn.on('click', async function() {
    if (!('Notification' in window) || !('PushManager' in window)) {
        alert('Este navegador no soporta notificaciones Push.');
        return;
    }

    // 1. Solicitar permisos de notificación al usuario
    var permiso = await Notification.requestPermission();
    if (permiso !== 'granted') {
        alert('Debes conceder permiso de notificaciones en el navegador.');
        return;
    }

    try {
        // 2. Obtener el Service Worker listo y suscribir con la VAPID Key
        var registro = await navigator.serviceWorker.ready;
        var suscripcion = await registro.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        console.log('Suscripción generada:', suscripcion);

        // 3. Enviar la suscripción al Servidor Backend Node.js
        const respuesta = await fetch('http://localhost:3000/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(suscripcion)
        });

        if (respuesta.ok) {
            alert('¡Notificaciones Push activadas y conectadas al Servidor backend!');
            enviarNotificacionPush('Edu-Recorder Notificaciones', '¡Suscripción registrada con éxito en el servidor!');
        } else {
            alert('Permiso concedido. (Asegúrate de tener corriendo el servidor con `npm start` en la carpeta server)');
        }
    } catch (err) {
        console.log('Error al suscribir en el servidor:', err);
        enviarNotificacionPush('Edu-Recorder', '¡Notificaciones activadas localmente!');
    }
});

// Registra SW
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./sw.js')
            .catch(function(err) {
                console.log('Error al registrar el SW:', err);
            });
    });
}

renderTasks();
