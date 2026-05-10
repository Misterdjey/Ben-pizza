import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Offre } from '../models';

@Injectable({ providedIn: 'root' })
export class OffresService {
  private db = inject(SupabaseService).client;

  async getAll(): Promise<Offre[]> {
    const { data, error } = await this.db
      .from('offres')
      .select('*')
      .order('nom');
    if (error) throw error;
    return data as Offre[];
  }

  async create(offre: Omit<Offre, 'id' | 'created_at'>): Promise<Offre> {
    const { data, error } = await this.db
      .from('offres')
      .insert(offre)
      .select()
      .single();
    if (error) throw error;
    return data as Offre;
  }

  async update(id: string, offre: Partial<Offre>): Promise<Offre> {
    const { data, error } = await this.db
      .from('offres')
      .update(offre)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Offre;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db.from('offres').delete().eq('id', id);
    if (error) throw error;
  }

  calculerPrix(offre: Offre, nbPersonnes: number): number {
    const tranche = offre.tranches.find(
      (t) =>
        nbPersonnes >= t.min && (t.max === null || nbPersonnes <= t.max),
    );
    return tranche ? tranche.prix * nbPersonnes : 0;
  }
}
