import { Component, inject, signal, computed, HostListener } from '@angular/core';
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

  private readonly perPage = 5;
  protected pageIndex = signal(0);

  protected totalPages = computed(() => Math.ceil(this.imageSrcs.length / this.perPage));
  protected pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i));

  protected pageImages = computed(() => {
    const start = this.pageIndex() * this.perPage;
    const alts = this.t().gallery.alts;
    return this.imageSrcs.slice(start, start + this.perPage).map((src, i) => ({
      src,
      alt: alts[start + i] ?? '',
      globalIndex: start + i,
    }));
  });

  protected prevPage() { this.pageIndex.update(p => Math.max(0, p - 1)); }
  protected nextPage() { this.pageIndex.update(p => Math.min(this.totalPages() - 1, p + 1)); }
  protected goToPage(p: number) { this.pageIndex.set(p); }

  // Lightbox
  protected lightboxOpen = signal(false);
  protected lightboxIndex = signal(0);

  protected openLightbox(globalIndex: number) {
    this.lightboxIndex.set(globalIndex);
    this.lightboxOpen.set(true);
  }

  protected closeLightbox() { this.lightboxOpen.set(false); }

  protected lightboxPrev() {
    this.lightboxIndex.update(i => (i - 1 + this.imageSrcs.length) % this.imageSrcs.length);
  }

  protected lightboxNext() {
    this.lightboxIndex.update(i => (i + 1) % this.imageSrcs.length);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (!this.lightboxOpen()) return;
    if (e.key === 'Escape') this.closeLightbox();
    if (e.key === 'ArrowLeft') this.lightboxPrev();
    if (e.key === 'ArrowRight') this.lightboxNext();
  }
}
