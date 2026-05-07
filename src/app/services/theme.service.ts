import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'classic' | 'artisan';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme = signal<Theme>('artisan');

  constructor() {
    effect(() => {
      document.documentElement.classList.toggle('theme-artisan', this.theme() === 'artisan');
    });
  }

  toggle() {
    this.theme.update(t => (t === 'classic' ? 'artisan' : 'classic'));
  }
}
