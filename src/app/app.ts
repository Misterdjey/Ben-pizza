import { Component, inject } from '@angular/core';
import { HeroComponent } from './hero/hero.component';
import { MenuComponent } from './menu/menu.component';
import { OffersComponent } from './offers/offers.component';
import { HowItWorksComponent } from './how-it-works/how-it-works.component';
import { GalleryComponent } from './gallery/gallery.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { CtaComponent } from './cta/cta.component';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  imports: [
    HeroComponent,
    MenuComponent,
    OffersComponent,
    HowItWorksComponent,
    GalleryComponent,
    TestimonialsComponent,
    CtaComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'Benjamin Pizza Experience';
  protected langService = inject(LanguageService);
}
