import { Component, inject, signal, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import imageCompression from 'browser-image-compression';
import { GalleryService } from '../services/gallery.service';
import { GalleryImage } from '../models';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-galerie',
  standalone: true,
  imports: [DragDropModule],
  templateUrl: './galerie.component.html',
})
export class GalerieComponent implements OnInit {
  private galleryService = inject(GalleryService);
  private toast = inject(ToastService);

  images = signal<GalleryImage[]>([]);
  loading = signal(true);
  uploading = signal(false);
  editingAltId = signal<string | null>(null);
  altDraft = signal('');

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  async ngOnInit() {
    try {
      this.images.set(await this.galleryService.getAll());
    } finally {
      this.loading.set(false);
    }
  }

  openFilePicker() {
    this.fileInputRef.nativeElement.click();
  }

  async onFilesSelected(event: Event) {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    (event.target as HTMLInputElement).value = '';
    for (const file of files) {
      await this.processAndUpload(file);
    }
  }

  private async processAndUpload(file: File) {
    if (!['image/jpeg', 'image/webp'].includes(file.type)) {
      this.toast.error(`${file.name} : format non supporté (JPG ou WebP uniquement)`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toast.error(`${file.name} : fichier trop lourd (max 5 Mo)`);
      return;
    }
    const dims = await this.imageDimensions(file);
    if (Math.max(dims.width, dims.height) < 1200) {
      this.toast.error(`${file.name} : résolution insuffisante (min 1200px sur le grand côté)`);
      return;
    }
    this.uploading.set(true);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1.5, initialQuality: 0.85, useWebWorker: true });
      const ext = file.type === 'image/webp' ? 'webp' : 'jpg';
      const newImage = await this.galleryService.upload(compressed, ext);
      this.images.update((list) => [...list, newImage]);
      this.toast.success('Photo ajoutée');
    } catch {
      this.toast.error("Erreur lors de l'upload");
    } finally {
      this.uploading.set(false);
    }
  }

  private imageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = reject;
        img.src = e.target!.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async toggleVisible(img: GalleryImage) {
    const prev = img.visible;
    this.images.update((list) => list.map((i) => (i.id === img.id ? { ...i, visible: !prev } : i)));
    try {
      await this.galleryService.update(img.id, { visible: !prev });
    } catch {
      this.images.update((list) => list.map((i) => (i.id === img.id ? { ...i, visible: prev } : i)));
      this.toast.error('Erreur lors de la mise à jour');
    }
  }

  async deleteImage(img: GalleryImage) {
    const confirmed = await this.toast.confirm(`Supprimer "${img.alt || 'cette image'}" ?`);
    if (!confirmed) return;
    try {
      await this.galleryService.delete(img.id, img.url);
      this.images.update((list) => list.filter((i) => i.id !== img.id));
      this.toast.success('Image supprimée');
    } catch {
      this.toast.error('Erreur lors de la suppression');
    }
  }

  startEditAlt(img: GalleryImage) {
    this.editingAltId.set(img.id);
    this.altDraft.set(img.alt);
  }

  async saveAlt(img: GalleryImage) {
    if (this.editingAltId() !== img.id) return;
    const newAlt = this.altDraft().trim();
    this.editingAltId.set(null);
    if (newAlt === img.alt) return;
    try {
      await this.galleryService.update(img.id, { alt: newAlt });
      this.images.update((list) => list.map((i) => (i.id === img.id ? { ...i, alt: newAlt } : i)));
    } catch {
      this.toast.error('Erreur lors de la mise à jour');
    }
  }

  cancelEditAlt() {
    this.editingAltId.set(null);
  }

  async onDrop(event: CdkDragDrop<GalleryImage[]>) {
    const list = [...this.images()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.images.set(list);
    try {
      await this.galleryService.reorder(list.map((img, i) => ({ id: img.id, position: i })));
    } catch {
      this.toast.error("Erreur lors de la sauvegarde de l'ordre");
    }
  }
}
