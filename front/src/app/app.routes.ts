import { Routes } from '@angular/router';
import { CancelarTurnoComponent } from './components/cancelar-turno/cancelar-turno.component';
import { LoginComponent } from './components/login/login.component';
import { PanelAdminComponent } from './components/panel-admin/panel-admin.component';
import { PanelEmpleadoComponent } from './components/panel-empleado/panel-empleado.component';
import { ReservaTurnosComponent } from './components/reserva-turnos/reserva-turnos.component';
import { TurnoConfirmadoComponent } from './components/turno-confirmado/turno-confirmado.component';
import { TurnosDelDiaComponent } from './components/turnos-del-dia/turnos-del-dia.component';
import { adminGuard, authGuard, empleadoGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: ReservaTurnosComponent }, // Nueva página principal para clientes
  { path: 'reservar', component: ReservaTurnosComponent }, // Alias explícito
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: PanelAdminComponent, canActivate: [authGuard, adminGuard] },
  { path: 'empleado', component: PanelEmpleadoComponent, canActivate: [authGuard, empleadoGuard] },
  { path: 'turnos-del-dia', component: TurnosDelDiaComponent, canActivate: [authGuard] },
  { path: 'cancelar', component: CancelarTurnoComponent },
  { path: 'turno-confirmado/:id', component: TurnoConfirmadoComponent },
  { path: 'turno-confirmado', component: TurnoConfirmadoComponent }, // Sin parámetro también
  { path: '**', redirectTo: '' }
];
