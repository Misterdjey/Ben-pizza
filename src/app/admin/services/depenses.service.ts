import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Depense, Ingredient } from '../models';

@Injectable({ providedIn: 'root' })
export class DepensesService {
  private db = inject(SupabaseService).client;

  async getByCommande(commandeId: string): Promise<Depense[]> {
    const { data, error } = await this.db
      .from('depenses')
      .select('*, ingredient:ingredients_catalogue(*)')
      .eq('commande_id', commandeId)
      .order('created_at');
    if (error) throw error;
    return data as Depense[];
  }

  async create(
    depense: Omit<Depense, 'id' | 'created_at' | 'prix_total' | 'ingredient'>,
  ): Promise<Depense> {
    const { data, error } = await this.db
      .from('depenses')
      .insert(depense)
      .select('*, ingredient:ingredients_catalogue(*)')
      .single();
    if (error) throw error;
    return data as Depense;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db.from('depenses').delete().eq('id', id);
    if (error) throw error;
  }

  async getIngredients(): Promise<Ingredient[]> {
    const { data, error } = await this.db
      .from('ingredients_catalogue')
      .select('*')
      .order('nom');
    if (error) throw error;
    return data as Ingredient[];
  }

  async createIngredient(
    ingredient: Omit<Ingredient, 'id' | 'created_at'>,
  ): Promise<Ingredient> {
    const { data, error } = await this.db
      .from('ingredients_catalogue')
      .insert(ingredient)
      .select()
      .single();
    if (error) throw error;
    return data as Ingredient;
  }

  async updateIngredient(
    id: string,
    ingredient: Partial<Ingredient>,
  ): Promise<Ingredient> {
    const { data, error } = await this.db
      .from('ingredients_catalogue')
      .update(ingredient)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Ingredient;
  }

  async deleteIngredient(id: string): Promise<void> {
    const { error } = await this.db
      .from('ingredients_catalogue')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}
