import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroComponent } from '../hero/hero.component';
import { MenuComponent } from '../menu/menu.component';
import { OffersComponent } from '../offers/offers.component';
import { HowItWorksComponent } from '../how-it-works/how-it-works.component';
import { GalleryComponent } from '../gallery/gallery.component';
import { TestimonialsComponent } from '../testimonials/testimonials.component';
import { CtaComponent } from '../cta/cta.component';
import { FloatingToolbarComponent } from '../floating-toolbar/floating-toolbar.component';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-vitrine',
  standalone: true,
  imports: [
    RouterLink,
    HeroComponent,
    MenuComponent,
    OffersComponent,
    HowItWorksComponent,
    GalleryComponent,
    TestimonialsComponent,
    CtaComponent,
    FloatingToolbarComponent,
  ],
  templateUrl: './vitrine.component.html',
})
export class VitrinneComponent {
  protected langService = inject(LanguageService);
}
