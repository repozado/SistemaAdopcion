import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdministrarComponent } from './components/administrar/administrar.component';
import { EncuestaComponent } from './components/encuesta/encuesta.component';
import { FaqComponent } from './components/faq/faq.component';
import { ContactComponent } from './components/contact/contact.component';
import { MascotasComponent } from './components/mascotas/mascotas.component';
import { PetcardComponent } from './components/petcard/petcard.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { UsersComponent } from './components/users/users.component';
import { RegisterComponent } from './components/register/register.component';
import { CuestionarioComponent } from './components/cuestionario/cuestionario.component';
import { SesionexpiradaComponent } from './components/sesionexpirada/sesionexpirada.component';
import { AdopcionComponent } from './components/adopcion/adopcion.component';
import { SolicitudesComponent } from './components/solicitudes/solicitudes.component';
import { MisadopcionesComponent } from './components/misadopciones/misadopciones.component';
import { MissolicitudesComponent } from './components/missolicitudes/missolicitudes.component'; // ¡NUEVO! Importa el componente MisSolicitudes


const routes: Routes = [
  {path: 'sesionexpirada', component: SesionexpiradaComponent },
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'home', component:HomeComponent},
  {path: 'administrar', component:AdministrarComponent, canActivate: [AuthGuard, AdminGuard]},
  {path: 'mascotas', component:MascotasComponent},
  {path: 'faq', component:FaqComponent},
  {path: 'contacto', component:ContactComponent},
  {path: "usuarios", component:UsersComponent, canActivate: [AuthGuard, AdminGuard]},
  {path: 'mascota/:id', component:PetcardComponent},
  {path: 'cuestionario', component:CuestionarioComponent, canActivate: [AuthGuard]},
  {path: 'yo', component:EncuestaComponent},
  {path: 'adopciones', component: AdopcionComponent, canActivate: [AuthGuard, AdminGuard]},
  {path: 'perfilemocional', component:EncuestaComponent},
  {path: 'solicitudes', component: SolicitudesComponent, canActivate: [AuthGuard, AdminGuard]},
  {path: 'mis-adopciones', component: MisadopcionesComponent, canActivate: [AuthGuard]},
  // ¡NUEVA LÍNEA: Ruta para Mis Solicitudes, protegida solo por AuthGuard!
  {path: 'mis-solicitudes', component: MissolicitudesComponent, canActivate: [AuthGuard]},
  {path: '**', pathMatch: 'full', redirectTo: 'home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
