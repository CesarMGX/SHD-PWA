import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'app-perfil',
  styleUrl: './perfil.css',
  templateUrl: './perfil.html',
})
export class Perfil {
  estudiante = {
    nombre: 'Juan Pérez García',
    matricula: '2023310056',
    carrera: 'Ingeniería en Sistemas Computacionales',
    semestre: '8vo Semestre',
    promedioGeneral: 9.3,
    creditosAprobados: 180,
    creditosTotales: 220,
    estatus: 'Regular',
    correo: 'juan.perez@universidad.edu.mx'
  };
}

