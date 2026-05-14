import { Component, inject } from '@angular/core';
import { HeroComponent } from '../hero/hero.component';
import { OffersComponent } from '../offers/offers.component';
import { HowItWorksComponent } from '../how-it-works/how-it-works.component';
import { GalleryComponent } from '../gallery/gallery.component';
import { TestimonialsComponent } from '../testimonials/testimonials.component';
import { CtaComponent } from '../cta/cta.component';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-vitrine',
  standalone: true,
  imports: [
    HeroComponent,
    OffersComponent,
    HowItWorksComponent,
    GalleryComponent,
    TestimonialsComponent,
    CtaComponent,
  ],
  templateUrl: './vitrine.component.html',
})
export class VitrinneComponent {
  protected langService = inject(LanguageService);
}
