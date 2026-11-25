import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EscolarService, Clase } from '../../services/escolar.service';

@Component({
  imports: [CommonModule],
  selector: 'app-clases',
  styleUrl: './clases.css',
  templateUrl: './clases.html',
})
export class Clases implements OnInit {
  private readonly escolarService = inject(EscolarService);

  readonly clases = signal<Clase[]>([]);
  readonly cargando = signal<boolean>(true);

  ngOnInit() {
    this.cargarClases();
  }

  cargarClases() {
    this.cargando.set(true);
    this.escolarService.getClases().subscribe({
      next: (data) => {
        this.clases.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.clases.set(this.escolarService.getClasesFallback());
        this.cargando.set(false);
      },
    });
  }
}
