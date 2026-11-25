import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly title = signal('Portal Escolar');
  private readonly http = inject(HttpClient);

  ngOnInit() {
    this.limpiarCacheAnterior();
    this.almacenarInfoEnCache();

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setTimeout(() => this.almacenarInfoEnCache(), 300);
      });
    }
  }

  async limpiarCacheAnterior() {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    try {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        if (name.includes('posts')) {
          await caches.delete(name);
        } else {
          const cache = await caches.open(name);
          await cache.delete('https://jsonplaceholder.typicode.com/posts');
          await cache.delete('/posts');
        }
      }
    } catch (e) {
      console.warn('Error al depurar cache anterior:', e);
    }
  }

  async almacenarInfoEnCache() {
    const clasesInfo = [
      {
        id: 1,
        nombre: 'Desarrollo de Aplicaciones Web',
        profesor: 'Ing. Carlos Mendoza',
        aula: 'Lab 4',
        creditos: 8,
        promedio: 95,
      },
      {
        id: 2,
        nombre: 'Bases de Datos Avanzadas',
        profesor: 'Dra. Elena Ramos',
        aula: 'Aula 202',
        creditos: 7,
        promedio: 88,
      },
      {
        id: 3,
        nombre: 'Arquitectura de Software',
        profesor: 'Mtro. Roberto Silva',
        aula: 'Lab 2',
        creditos: 8,
        promedio: 92,
      },
      {
        id: 4,
        nombre: 'Redes y Comunicaciones',
        profesor: 'Ing. Laura Gómez',
        aula: 'Aula 105',
        creditos: 6,
        promedio: 90,
      },
    ];

    const entregasInfo = [
      {
        id: 1,
        titulo: 'Practica de Interfaces y Navegacion',
        materia: 'Desarrollo de Aplicaciones Web',
        fechaEntrega: 'Hoy, 23:59',
        urgente: true,
        completada: false,
      },
      {
        id: 2,
        titulo: 'Diagrama Entidad-Relacion Tienda',
        materia: 'Bases de Datos Avanzadas',
        fechaEntrega: 'Mañana, 14:00',
        urgente: true,
        completada: false,
      },
      {
        id: 3,
        titulo: 'Documento de Especificacion de Requisitos',
        materia: 'Arquitectura de Software',
        fechaEntrega: 'Viernes, 18:00',
        urgente: false,
        completada: false,
      },
      {
        id: 4,
        titulo: 'Configuracion de VLANs en Packet Tracer',
        materia: 'Redes y Comunicaciones',
        fechaEntrega: 'Prox. Lunes',
        urgente: false,
        completada: true,
      },
    ];

    try {
      this.http.get('http://localhost:3000/api/clases').subscribe({
        next: (data) => this.guardarEnCache('/api/clases', data),
        error: () => this.guardarEnCache('/api/clases', clasesInfo),
      });
      this.http.get('http://localhost:3000/api/entregas').subscribe({
        next: (data) => this.guardarEnCache('/api/entregas', data),
        error: () => this.guardarEnCache('/api/entregas', entregasInfo),
      });
    } catch {
      this.guardarEnCache('/api/clases', clasesInfo);
      this.guardarEnCache('/api/entregas', entregasInfo);
    }
  }

  private async guardarEnCache(url: string, data: any) {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    try {
      const cacheNames = await caches.keys();
      const targetCacheName =
        cacheNames.find((name) => name.includes('api-portal-escolar')) ||
        cacheNames.find((name) => name.includes('data')) ||
        'ngsw:/:1:data:api-portal-escolar:cache';

      const cache = await caches.open(targetCacheName);
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      });
      await cache.put(url, response);
    } catch (e) {
      console.error('Error al guardar datos de la pagina en Cache Storage:', e);
    }
  }
}
