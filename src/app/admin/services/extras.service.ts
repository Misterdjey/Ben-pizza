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
      .order('ordre', { ascending: true })
      .order('nom', { ascending: true });
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

}
