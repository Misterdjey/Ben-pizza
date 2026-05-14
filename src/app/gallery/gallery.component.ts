import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface GalleryImage { src: string; alt: string; }

@Component({
  selector: 'app-gallery',
  imports: [],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
})
export class GalleryComponent {
  private http = inject(HttpClient);
  protected images = signal<GalleryImage[]>([]);

  constructor() {
    this.http.get<GalleryImage[]>('/gallery.json').subscribe(data => this.images.set(data));
  }

  private readonly perPage = 5;
  protected pageIndex = signal(0);
  protected totalPages = computed(() => Math.ceil(this.images().length / this.perPage));
  protected pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i));

  protected pageImages = computed(() => {
    const start = this.pageIndex() * this.perPage;
    return this.images().slice(start, start + this.perPage).map((img, i) => ({
      ...img,
      globalIndex: start + i,
    }));
  });

  // Animation state
  protected gridAnim = signal('');
  protected lbAnim = signal('');
  private animating = false;

  private delay(ms: number) { return new Promise<void>(r => setTimeout(r, ms)); }

  private async animatePage(newIndex: number, dir: 'left' | 'right') {
    if (this.animating) return;
    this.animating = true;
    this.gridAnim.set(dir === 'left' ? 'out-left' : 'out-right');
    await this.delay(220);
    this.pageIndex.set(newIndex);
    this.gridAnim.set(dir === 'left' ? 'in-from-right' : 'in-from-left');
    await this.delay(220);
    this.gridAnim.set('');
    this.animating = false;
  }

  protected prevPage() {
    if (this.pageIndex() > 0) this.animatePage(this.pageIndex() - 1, 'right');
  }

  protected nextPage() {
    if (this.pageIndex() < this.totalPages() - 1) this.animatePage(this.pageIndex() + 1, 'left');
  }

  protected goToPage(p: number) {
    if (p === this.pageIndex()) return;
    this.animatePage(p, p > this.pageIndex() ? 'left' : 'right');
  }

  // Lightbox
  protected lightboxOpen = signal(false);
  protected lightboxIndex = signal(0);

  protected openLightbox(globalIndex: number) {
    this.lightboxIndex.set(globalIndex);
    this.lightboxOpen.set(true);
  }

  protected closeLightbox() { this.lightboxOpen.set(false); }

  private async animateLb(updateFn: () => void, dir: 'left' | 'right') {
    this.lbAnim.set(dir === 'left' ? 'out-left' : 'out-right');
    await this.delay(180);
    updateFn();
    this.lbAnim.set(dir === 'left' ? 'in-from-right' : 'in-from-left');
    await this.delay(180);
    this.lbAnim.set('');
  }

  protected lightboxPrev() {
    this.animateLb(
      () => this.lightboxIndex.update(i => (i - 1 + this.images().length) % this.images().length),
      'right'
    );
  }

  protected lightboxNext() {
    this.animateLb(
      () => this.lightboxIndex.update(i => (i + 1) % this.images().length),
      'left'
    );
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (!this.lightboxOpen()) return;
    if (e.key === 'Escape') this.closeLightbox();
    if (e.key === 'ArrowLeft') this.lightboxPrev();
    if (e.key === 'ArrowRight') this.lightboxNext();
  }
}
