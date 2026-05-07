import { Component, HostListener, inject, signal } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-floating-toolbar',
  standalone: true,
  imports: [],
  templateUrl: './floating-toolbar.component.html',
  styleUrl: './floating-toolbar.component.css',
})
export class FloatingToolbarComponent {
  protected themeService = inject(ThemeService);
  protected showScrollTop = signal(false);

  protected sections = [
    { id: 'section-hero',         icon: '🏠', label: 'Accueil' },
    { id: 'section-menu',         icon: '🍕', label: 'Menu' },
    { id: 'section-offers',       icon: '💰', label: 'Formules' },
    { id: 'section-how-it-works', icon: '👨‍🍳', label: 'Process' },
    { id: 'section-gallery',      icon: '📸', label: 'Galerie' },
    { id: 'section-testimonials', icon: '⭐', label: 'Avis' },
    { id: 'section-contact',      icon: '📞', label: 'Contact' },
  ];

  @HostListener('window:scroll')
  onScroll() {
    this.showScrollTop.set(window.scrollY > 400);
  }

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
