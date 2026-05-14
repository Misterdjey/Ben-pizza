import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Recette, RecetteIngredientView, RecetteWithStats } from '../models/recette.model';

@Injectable({ providedIn: 'root' })
export class RecettesService {
  private db = inject(SupabaseService).client;

  async getAll(): Promise<RecetteWithStats[]> {
    const { data, error } = await this.db
      .from('recettes')
      .select('*, recette_ingredients(*, ingredient:ingredients_catalogue(*))')
      .order('nom');
    if (error) throw error;
    return (data as any[]).map(r => this.toStats(r));
  }

  async getById(id: string): Promise<RecetteWithStats> {
    const { data, error } = await this.db
      .from('recettes')
      .select('*, recette_ingredients(*, ingredient:ingredients_catalogue(*))')
      .eq('id', id)
      .single();
    if (error) throw error;
    return this.toStats(data as any);
  }

  async create(payload: Pick<Recette, 'nom' | 'type' | 'notes'>): Promise<Recette> {
    const { data, error } = await this.db
      .from('recettes')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Recette;
  }

  async update(id: string, payload: Partial<Pick<Recette, 'nom' | 'type' | 'notes'>>): Promise<Recette> {
    const { data, error } = await this.db
      .from('recettes')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Recette;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db.from('recettes').delete().eq('id', id);
    if (error) throw error;
  }

  async diffSaveIngredients(
    recetteId: string,
    current: RecetteIngredientView[],
    original: RecetteIngredientView[],
  ): Promise<void> {
    const originalById = new Map(original.filter(i => i.id).map(i => [i.id!, i]));
    const currentIds = new Set(current.filter(i => i.id).map(i => i.id!));

    // Supprimer les lignes retirées
    for (const orig of original) {
      if (orig.id && !currentIds.has(orig.id)) {
        const { error } = await this.db.from('recette_ingredients').delete().eq('id', orig.id);
        if (error) throw error;
      }
    }

    // Insérer les nouvelles lignes (sans id)
    const toInsert = current
      .filter(i => !i.id)
      .map(i => ({ recette_id: recetteId, ingredient_id: i.ingredient_id, quantite: i.quantite }));
    if (toInsert.length > 0) {
      const { error } = await this.db.from('recette_ingredients').insert(toInsert);
      if (error) throw error;
    }

    // Mettre à jour les lignes modifiées (ingredient ou quantite changés)
    for (const curr of current) {
      if (!curr.id) continue;
      const orig = originalById.get(curr.id);
      if (orig && (orig.quantite !== curr.quantite || orig.ingredient_id !== curr.ingredient_id)) {
        const { error } = await this.db
          .from('recette_ingredients')
          .update({ quantite: curr.quantite, ingredient_id: curr.ingredient_id })
          .eq('id', curr.id);
        if (error) throw error;
      }
    }
  }

  private toStats(r: any): RecetteWithStats {
    const views: RecetteIngredientView[] = (r.recette_ingredients ?? []).map((ri: any) => {
      const ing = ri.ingredient ?? {};
      const cout = Number(ri.quantite) * Number(ing.prix_reference ?? 0);
      const poids = Number(ri.quantite) * Number(ing.poids_unitaire ?? 0);
      return {
        id: ri.id,
        recette_id: ri.recette_id,
        ingredient_id: ri.ingredient_id,
        quantite: Number(ri.quantite),
        nom: ing.nom ?? '',
        unite: ing.unite ?? '',
        prix_reference: Number(ing.prix_reference ?? 0),
        poids_unitaire: ing.poids_unitaire != null ? Number(ing.poids_unitaire) : null,
        cout,
        poids,
      };
    });
    return {
      id: r.id,
      nom: r.nom,
      type: r.type,
      notes: r.notes,
      created_at: r.created_at,
      updated_at: r.updated_at,
      recette_ingredients: views,
      cout_total: views.reduce((s, v) => s + v.cout, 0),
      poids_total: views.reduce((s, v) => s + v.poids, 0),
      nb_ingredients: views.length,
    };
  }
}
