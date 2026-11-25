import { Routes } from '@angular/router';
import { Clases } from './pages/clases/clases';
import { Entregas } from './pages/entregas/entregas';
import { Horario } from './pages/horario/horario';
import { Perfil } from './pages/perfil/perfil';
import { Acerca } from './pages/acerca/acerca';
import { Notificaciones } from './pages/notificaciones/notificaciones';

export const routes: Routes = [
  {
    path: 'clases',
    component: Clases,
  },
  {
    path: 'entregas',
    component: Entregas,
  },
  {
    path: 'horario',
    component: Horario,
  },
  {
    path: 'perfil',
    component: Perfil,
  },
  {
    path: 'notificaciones',
    component: Notificaciones,
  },
  {
    path: 'acerca',
    component: Acerca,
  },
  {
    path: '',
    redirectTo: 'clases',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'clases',
  },
];
