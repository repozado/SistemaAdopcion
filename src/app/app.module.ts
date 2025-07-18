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
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, provideHttpClient } from '@angular/common/http';

import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guarrds/auth.guard';
import { AuthService } from './services/auth.service';
import { Token } from '@angular/compiler';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { UsersComponent } from './components/users/users.component';


@NgModule({
  declarations: [
    LoginComponent,
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
    ValuecardComponent,
    LoginComponent,
    UsersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [AuthGuard, AuthService, provideHttpClient(),
    {provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
