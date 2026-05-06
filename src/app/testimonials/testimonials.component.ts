import { Component, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-testimonials',
  imports: [],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.css',
})
export class TestimonialsComponent {
  protected t = inject(LanguageService).t;
  protected avatarClasses = [
    'bg-pizza-orange',
    'bg-pizza-red',
    'bg-gradient-to-r from-pizza-orange to-pizza-red',
    'bg-pizza-orange',
    'bg-pizza-red',
    'bg-gradient-to-r from-pizza-orange to-pizza-red',
  ];

  protected initials(name: string): string {
    return name.split(' ').map(w => w[0]).join('');
  }
}
