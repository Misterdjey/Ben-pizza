import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Extra } from '../models';

@Injectable({ providedIn: 'root' })
export class ExtrasService {
  private db = inject(SupabaseService).client;

  async getAll(): Promise<Extra[]> {
    const { data, error } = await this.db
      .from('extras')
      .select('*')
      .order('categorie')
      .order('nom');
    if (error) throw error;
    return data as Extra[];
  }

  async create(extra: Omit<Extra, 'id' | 'created_at'>): Promise<Extra> {
    const { data, error } = await this.db
      .from('extras')
      .insert(extra)
      .select()
      .single();
    if (error) throw error;
    return data as Extra;
  }

  async update(id: string, extra: Partial<Extra>): Promise<Extra> {
    const { data, error } = await this.db
      .from('extras')
      .update(extra)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Extra;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db.from('extras').delete().eq('id', id);
    if (error) throw error;
  }

  async getByOffre(offreId: string): Promise<Extra[]> {
    const { data, error } = await this.db
      .from('offre_extras')
      .select('extra:extras(*)')
      .eq('offre_id', offreId);
    if (error) throw error;
    return (data as { extra: unknown }[]).map((r) => r.extra as Extra);
  }

  async diffSaveExtras(offreId: string, newIds: string[], oldIds: string[]): Promise<void> {
    const toAdd = newIds.filter((id) => !oldIds.includes(id));
    const toRemove = oldIds.filter((id) => !newIds.includes(id));
    if (toAdd.length > 0) {
      const { error } = await this.db.from('offre_extras').insert(
        toAdd.map((extra_id) => ({ offre_id: offreId, extra_id })),
      );
      if (error) throw error;
    }
    if (toRemove.length > 0) {
      const { error } = await this.db
        .from('offre_extras')
        .delete()
        .eq('offre_id', offreId)
        .in('extra_id', toRemove);
      if (error) throw error;
    }
  }
}
