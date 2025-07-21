import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  showFooter = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showFooter = ['/', '/home'].includes(event.url);
      });
  }

  footerLinks = {
    about: [
      { text: 'Nuestra historia', url: '/about' },
      { text: 'Equipo', url: '/team' },
      { text: 'Aliados', url: '/partners' },
    ],
    help: [
      { text: 'Centro de ayuda', url: '/help' },
      { text: 'Política de privacidad', url: '/privacy' },
      { text: 'Términos de servicio', url: '/terms' },
    ],
    contact: [
      {
        text: 'soulpetadopcion@gmail.com',
        url: 'mailto:soulpetadopcion@gmail.com',
      },
      { text: '+593 98 765 4321', url: 'tel:+593987654321' },
      { text: 'Machala, Ecuador', url: 'https://maps.app.goo.gl/' },
    ],
  };

  socialIcons = [
    { icon: 'fab fa-facebook-f', url: 'https://facebook.com/soulpet' },
    { icon: 'fab fa-instagram', url: 'https://instagram.com/soulpet' },
    { icon: 'fab fa-twitter', url: 'https://twitter.com/soulpet' },
    { icon: 'fab fa-youtube', url: 'https://youtube.com/soulpet' },
  ];

  getFooterSections() {
    return [
      { title: 'Sobre Nosotros', links: this.footerLinks.about },
      { title: 'Ayuda', links: this.footerLinks.help },
      { title: 'Contacto', links: this.footerLinks.contact },
    ];
  }
}
