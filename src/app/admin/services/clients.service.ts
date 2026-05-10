import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Client } from '../models';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private db = inject(SupabaseService).client;

  async getAll(): Promise<Client[]> {
    const { data, error } = await this.db
      .from('clients')
      .select('*')
      .order('nom');
    if (error) throw error;
    return data as Client[];
  }

  async getById(id: string): Promise<Client> {
    const { data, error } = await this.db
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Client;
  }

  async create(client: Omit<Client, 'id' | 'created_at'>): Promise<Client> {
    const { data, error } = await this.db
      .from('clients')
      .insert(client)
      .select()
      .single();
    if (error) throw error;
    return data as Client;
  }

  async update(id: string, client: Partial<Client>): Promise<Client> {
    const { data, error } = await this.db
      .from('clients')
      .update(client)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Client;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db.from('clients').delete().eq('id', id);
    if (error) throw error;
  }
}
