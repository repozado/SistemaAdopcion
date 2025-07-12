import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { EncuestaComponent } from './components/encuesta/encuesta.component';
import { MascotasComponent } from './components/mascotas/mascotas.component';
import { AdministrarComponent } from './components/administrar/administrar.component';
import { FaqComponent } from './components/faq/faq.component';
import { ContactComponent } from './components/contact/contact.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { PetcardComponent } from './components/petcard/petcard.component';
import { ValuecardComponent } from './components/valuecard/valuecard.component';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    EncuestaComponent,
    MascotasComponent,
    AdministrarComponent,
    FaqComponent,
    ContactComponent,
    NavbarComponent,
    FooterComponent,
    PetcardComponent,
    ValuecardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent]
})
export class AppModule { }
