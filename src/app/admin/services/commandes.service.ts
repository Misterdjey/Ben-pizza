import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Commande } from '../models';

@Injectable({ providedIn: 'root' })
export class CommandesService {
  private db = inject(SupabaseService).client;

  async getAll(): Promise<Commande[]> {
    const { data, error } = await this.db
      .from('commandes')
      .select('*, client:clients(*), offre:offres(*)')
      .order('date_presta', { ascending: false });
    if (error) throw error;
    return data as Commande[];
  }

  async getById(id: string): Promise<Commande> {
    const { data, error } = await this.db
      .from('commandes')
      .select('*, client:clients(*), offre:offres(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Commande;
  }

  async getByClient(clientId: string): Promise<Commande[]> {
    const { data, error } = await this.db
      .from('commandes')
      .select('*, offre:offres(*)')
      .eq('client_id', clientId)
      .order('date_presta', { ascending: false });
    if (error) throw error;
    return data as Commande[];
  }

  async create(
    commande: Omit<Commande, 'id' | 'created_at' | 'client' | 'offre'>,
  ): Promise<Commande> {
    const { data, error } = await this.db
      .from('commandes')
      .insert(commande)
      .select('*, client:clients(*), offre:offres(*)')
      .single();
    if (error) throw error;
    return data as Commande;
  }

  async update(
    id: string,
    commande: Partial<Commande>,
  ): Promise<Commande> {
    const { client: _c, offre: _o, ...payload } = commande as Commande;
    const { data, error } = await this.db
      .from('commandes')
      .update(payload)
      .eq('id', id)
      .select('*, client:clients(*), offre:offres(*)')
      .single();
    if (error) throw error;
    return data as Commande;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db.from('commandes').delete().eq('id', id);
    if (error) throw error;
  }
}
