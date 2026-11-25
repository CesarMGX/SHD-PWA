import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SesionHorario {
  hora: string;
  lunes: string;
  martes: string;
  miercoles: string;
  jueves: string;
  viernes: string;
}

@Component({
  imports: [CommonModule],
  selector: 'app-horario',
  styleUrl: './horario.css',
  templateUrl: './horario.html',
})
export class Horario {
  horario: SesionHorario[] = [
    { hora: '07:00 - 09:00', lunes: 'Programación Web', martes: 'Libre', miercoles: 'Programación Web', jueves: 'Libre', viernes: 'Programación Web' },
    { hora: '09:00 - 11:00', lunes: 'Bases de Datos', martes: 'Redes', miercoles: 'Bases de Datos', jueves: 'Redes', viernes: 'Bases de Datos' },
    { hora: '11:00 - 13:00', lunes: 'Arquitectura Soft.', martes: 'Arquitectura Soft.', miercoles: 'Libre', jueves: 'Arquitectura Soft.', viernes: 'Tutoría' },
  ];
}
