import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PushNotificationService } from '../../services/push-notification.service';

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: string;
  tipo: 'vencimiento' | 'finalizada' | 'recordatorio';
  leida: boolean;
}

@Component({
  imports: [CommonModule],
  selector: 'app-notificaciones',
  styleUrl: './notificaciones.css',
  templateUrl: './notificaciones.html',
})
export class Notificaciones {
  readonly pushService = inject(PushNotificationService);

  notificaciones: Notificacion[] = [
    {
      id: 1,
      titulo: 'Tarea proxima a caducar',
      mensaje: 'La entrega de "Practica de Interfaces y Navegacion" vence hoy a las 23:59 hrs.',
      fecha: 'Hace 30 minutos',
      tipo: 'vencimiento',
      leida: false,
    },
    {
      id: 2,
      titulo: 'Tarea proxima a caducar',
      mensaje: 'La entrega de "Diagrama Entidad-Relacion Tienda" vence mañana a las 14:00 hrs.',
      fecha: 'Hace 2 horas',
      tipo: 'vencimiento',
      leida: false,
    },
    {
      id: 3,
      titulo: 'Tarea completada',
      mensaje: 'Has marcado como finalizada la tarea "Configuracion de VLANs en Packet Tracer".',
      fecha: 'Ayer',
      tipo: 'finalizada',
      leida: true,
    },
    {
      id: 4,
      titulo: 'Recordatorio de entrega',
      mensaje: 'Se ha programado un aviso para "Documento de Especificacion de Requisitos" antes de su fecha limite.',
      fecha: 'Hace 2 dias',
      tipo: 'recordatorio',
      leida: true,
    },
  ];

  marcarTodasComoLeidas() {
    this.notificaciones.forEach(n => n.leida = true);
  }

  async toggleSuscripcion() {
    try {
      if (this.pushService.enabled()) {
        await this.pushService.unsubscribe();
      } else {
        await this.pushService.subscribe();
      }
    } catch (err) {
      console.error('Error al cambiar suscripcion:', err);
    }
  }

  async enviarNotificacion(item: Notificacion) {
    if (!this.pushService.enabled()) {
      try {
        await this.pushService.subscribe();
      } catch (err) {
        console.error('Error al suscribir notificaciones:', err);
      }
    }
    await this.pushService.notify(item.titulo, item.mensaje);
  }
}
