import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { GalleryImage } from '../models';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private db = inject(SupabaseService).client;

  async getAll(): Promise<GalleryImage[]> {
    const { data, error } = await this.db
      .from('gallery_images')
      .select('*')
      .order('position');
    if (error) throw error;
    return data as GalleryImage[];
  }

  async getVisible(): Promise<Pick<GalleryImage, 'id' | 'url' | 'alt' | 'position'>[]> {
    const { data, error } = await this.db
      .from('gallery_images')
      .select('id, url, alt, position')
      .eq('visible', true)
      .order('position');
    if (error) throw error;
    return data as Pick<GalleryImage, 'id' | 'url' | 'alt' | 'position'>[];
  }

  async update(id: string, patch: Partial<GalleryImage>): Promise<void> {
    const { error } = await this.db
      .from('gallery_images')
      .update(patch)
      .eq('id', id);
    if (error) throw error;
  }

  async delete(id: string, url: string): Promise<void> {
    const { error } = await this.db.from('gallery_images').delete().eq('id', id);
    if (error) throw error;
    const marker = '/storage/v1/object/public/gallery/';
    if (url.includes(marker)) {
      const filename = url.split(marker).pop()!;
      await this.db.storage.from('gallery').remove([filename]);
    }
  }

  async upload(file: File, ext: string): Promise<GalleryImage> {
    const filename = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await this.db.storage
      .from('gallery')
      .upload(filename, file, { contentType: file.type });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = this.db.storage.from('gallery').getPublicUrl(filename);

    const { data: maxData } = await this.db
      .from('gallery_images')
      .select('position')
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextPosition = maxData ? (maxData.position as number) + 1 : 0;

    const { data, error } = await this.db
      .from('gallery_images')
      .insert({ url: publicUrl, alt: '', visible: true, position: nextPosition })
      .select()
      .single();
    if (error) throw error;
    return data as GalleryImage;
  }

  async reorder(items: { id: string; position: number }[]): Promise<void> {
    const results = await Promise.all(
      items.map(({ id, position }) =>
        this.db.from('gallery_images').update({ position }).eq('id', id)
      )
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;
  }
}
