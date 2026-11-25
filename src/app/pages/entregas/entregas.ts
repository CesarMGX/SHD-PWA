import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Tarea {
  titulo: string;
  materia: string;
  fechaEntrega: string;
  urgente: boolean;
  completada: boolean;
}

@Component({
  imports: [CommonModule],
  selector: 'app-entregas',
  styleUrl: './entregas.css',
  templateUrl: './entregas.html',
})
export class Entregas {
  tareas: Tarea[] = [
    { titulo: 'Práctica de Interfaces y Navegación', materia: 'Desarrollo de Aplicaciones Web', fechaEntrega: 'Hoy, 23:59', urgente: true, completada: false },
    { titulo: 'Diagrama Entidad-Relación Tienda', materia: 'Bases de Datos Avanzadas', fechaEntrega: 'Mañana, 14:00', urgente: true, completada: false },
    { titulo: 'Documento de Especificación de Requisitos', materia: 'Arquitectura de Software', fechaEntrega: 'Viernes, 18:00', urgente: false, completada: false },
    { titulo: 'Configuración de VLANs en Packet Tracer', materia: 'Redes y Comunicaciones', fechaEntrega: 'Próx. Lunes', urgente: false, completada: true },
  ];

  toggleTarea(tarea: Tarea) {
    tarea.completada = !tarea.completada;
  }
}
