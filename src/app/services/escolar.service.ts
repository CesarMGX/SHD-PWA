import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface OpenLibraryAuthor {
  key: string;
  name: string;
}

export interface OpenLibraryWork {
  key: string;
  title: string;
  edition_count?: number;
  first_publish_year?: number;
  authors?: OpenLibraryAuthor[];
}

export interface OpenLibrarySubjectResponse {
  key: string;
  name: string;
  work_count: number;
  works: OpenLibraryWork[];
}

export interface Clase {
  id: number;
  nombre: string;
  profesor: string;
  aula: string;
  creditos: number;
  promedio: number;
}

export interface Entrega {
  id: number;
  titulo: string;
  materia: string;
  fechaEntrega: string;
  urgente: boolean;
  completada: boolean;
}

export interface HorarioSesion {
  hora: string;
  lunes: string;
  martes: string;
  miercoles: string;
  jueves: string;
  viernes: string;
}

@Injectable({
  providedIn: 'root',
})
export class EscolarService {
  private readonly http = inject(HttpClient);
  private readonly publicApiUrl = 'https://openlibrary.org/subjects/computer_science.json?limit=6';

  getClases(): Observable<Clase[]> {
    return this.http.get<OpenLibrarySubjectResponse>(this.publicApiUrl).pipe(
      map((res) => {
        if (!res || !res.works || res.works.length === 0) {
          return this.getClasesFallback();
        }
        const aulas = ['Lab 4', 'Aula 202', 'Lab 2', 'Aula 105', 'Lab 1', 'Aula 304'];
        const promedios = [95, 88, 92, 90, 89, 94];

        return res.works.slice(0, 6).map((work, idx) => ({
          id: idx + 1,
          nombre: work.title,
          profesor:
            work.authors && work.authors.length > 0
              ? work.authors[0].name
              : 'Profesor Titular',
          aula: aulas[idx % aulas.length],
          creditos: work.edition_count
            ? Math.min(Math.max(work.edition_count, 4), 9)
            : 8,
          promedio: promedios[idx % promedios.length],
        }));
      }),
      catchError((err) => {
        console.warn('Error al consumir API externa de Open Library, cargando respaldo offline:', err);
        return of(this.getClasesFallback());
      }),
    );
  }

  getClasesFallback(): Clase[] {
    return [
      { id: 1, nombre: 'Desarrollo de Aplicaciones Web', profesor: 'Ing. Carlos Mendoza', aula: 'Lab 4', creditos: 8, promedio: 95 },
      { id: 2, nombre: 'Bases de Datos Avanzadas', profesor: 'Dra. Elena Ramos', aula: 'Aula 202', creditos: 7, promedio: 88 },
      { id: 3, nombre: 'Arquitectura de Software', profesor: 'Mtro. Roberto Silva', aula: 'Lab 2', creditos: 8, promedio: 92 },
      { id: 4, nombre: 'Redes y Comunicaciones', profesor: 'Ing. Laura Gomez', aula: 'Aula 105', creditos: 6, promedio: 90 },
    ];
  }

  getEntregas(): Observable<Entrega[]> {
    return of([
      { id: 1, titulo: 'Practica de Interfaces y Navegacion', materia: 'Desarrollo de Aplicaciones Web', fechaEntrega: 'Hoy, 23:59', urgente: true, completada: false },
      { id: 2, titulo: 'Diagrama Entidad-Relacion Tienda', materia: 'Bases de Datos Avanzadas', fechaEntrega: 'Mañana, 14:00', urgente: true, completada: false },
      { id: 3, titulo: 'Documento de Especificacion de Requisitos', materia: 'Arquitectura de Software', fechaEntrega: 'Viernes, 18:00', urgente: false, completada: false },
      { id: 4, titulo: 'Configuracion de VLANs en Packet Tracer', materia: 'Redes y Comunicaciones', fechaEntrega: 'Prox. Lunes', urgente: false, completada: true },
    ]);
  }
}
