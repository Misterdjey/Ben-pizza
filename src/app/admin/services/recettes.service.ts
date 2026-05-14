import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Recette, RecetteIngredientView, RecetteType, RecetteWithStats } from '../models/recette.model';

@Injectable({ providedIn: 'root' })
export class RecettesService {
  private db = inject(SupabaseService).client;

  async getAll(): Promise<RecetteWithStats[]> {
    const { data, error } = await this.db
      .from('recettes')
      .select('*, recette_ingredients(*, ingredient:ingredients_catalogue(*))')
      .order('nom');
    if (error) throw error;

    // Premier passage : stats de base
    const list = (data as any[]).map(r => this.toStats(r));
    const statsMap = new Map(list.map(r => [r.id!, r]));

    // Deuxième passage : grand totals pour les pizzas (pâte + base dans le même lot)
    for (const recette of list) {
      this.computeGrandTotals(recette, statsMap);
    }

    return list;
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

  async getByType(type: RecetteType): Promise<RecetteWithStats[]> {
    const { data, error } = await this.db
      .from('recettes')
      .select('*, recette_ingredients(*, ingredient:ingredients_catalogue(*))')
      .eq('type', type)
      .order('nom');
    if (error) throw error;
    return (data as any[]).map(r => this.toStats(r));
  }

  async create(payload: Pick<Recette, 'nom' | 'type' | 'notes' | 'pate_id' | 'pate_poids' | 'base_id' | 'base_poids'>): Promise<Recette> {
    const { data, error } = await this.db
      .from('recettes')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Recette;
  }

  async update(id: string, payload: Partial<Pick<Recette, 'nom' | 'type' | 'notes' | 'pate_id' | 'pate_poids' | 'base_id' | 'base_poids'>>): Promise<Recette> {
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

    // Mettre à jour les lignes modifiées
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
    const cout_total = views.reduce((s, v) => s + v.cout, 0);
    const poids_total = views.reduce((s, v) => s + v.poids, 0);
    return {
      id: r.id,
      nom: r.nom,
      type: r.type,
      notes: r.notes,
      pate_id: r.pate_id ?? null,
      pate_poids: r.pate_poids != null ? Number(r.pate_poids) : null,
      base_id: r.base_id ?? null,
      base_poids: r.base_poids != null ? Number(r.base_poids) : null,
      created_at: r.created_at,
      updated_at: r.updated_at,
      recette_ingredients: views,
      cout_total,
      poids_total,
      nb_ingredients: views.length,
      cout_grand_total: cout_total,
      poids_grand_total: poids_total,
    };
  }

  private computeGrandTotals(recette: RecetteWithStats, map: Map<string, RecetteWithStats>) {
    let coutExtra = 0;
    let poidsExtra = 0;

    if (recette.pate_id && recette.pate_poids) {
      const pate = map.get(recette.pate_id);
      if (pate && pate.poids_total > 0) {
        recette.cout_pate = (recette.pate_poids / pate.poids_total) * pate.cout_total;
        recette.poids_pate = recette.pate_poids;
        coutExtra += recette.cout_pate;
        poidsExtra += recette.poids_pate;
      }
    }

    if (recette.base_id && recette.base_poids) {
      const base = map.get(recette.base_id);
      if (base && base.poids_total > 0) {
        recette.cout_base = (recette.base_poids / base.poids_total) * base.cout_total;
        recette.poids_base = recette.base_poids;
        coutExtra += recette.cout_base;
        poidsExtra += recette.poids_base;
      }
    }

    recette.cout_grand_total = recette.cout_total + coutExtra;
    recette.poids_grand_total = recette.poids_total + poidsExtra;
  }
}
