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

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},

  {path: 'home', component:HomeComponent},
  {path: 'administrar', component:AdministrarComponent, canActivate: [AuthGuard, AdminGuard]},
  {path: 'mascotas', component:MascotasComponent},
  {path: 'encuesta', component:EncuestaComponent},
  {path: 'faq', component:FaqComponent},
  {path: 'contacto', component:ContactComponent},
  {path: "usuarios", component:UsersComponent, canActivate: [AuthGuard, AdminGuard]},
  {path: 'mascota/:id', component:PetcardComponent},
  {path: '**', pathMatch: 'full', redirectTo: 'home'} 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
