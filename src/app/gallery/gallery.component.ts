import { Component, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-gallery',
  imports: [],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
})
export class GalleryComponent {
  protected t = inject(LanguageService).t;
  protected imageSrcs = [
    '/images/gallery/live-cooking-demonstration.png',
    '/images/gallery/freshly-baked-pizzas.png',
    '/images/gallery/happy-guests-enjoying-pizza.png',
    '/images/gallery/pizza-dough-preparation.png',
    '/images/gallery/family-enjoying-pizza-night.png',
    '/images/gallery/sweet-pizza-desserts.png',
  ];
}
