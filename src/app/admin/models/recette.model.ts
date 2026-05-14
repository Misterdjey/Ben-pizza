export type RecetteType = 'pizza' | 'pate' | 'sauce_base' | 'autre';

export interface RecetteIngredientRow {
  id?: string;
  recette_id?: string;
  ingredient_id: string;
  quantite: number;
}

export interface RecetteIngredientView extends RecetteIngredientRow {
  nom: string;
  unite: string;
  prix_reference: number;
  poids_unitaire: number | null;
  cout: number;   // quantite * prix_reference — calculé front
  poids: number;  // quantite * poids_unitaire — calculé front
}

export interface Recette {
  id?: string;
  nom: string;
  type: RecetteType;
  notes?: string | null;
  pate_id?: string | null;
  pate_poids?: number | null;
  base_id?: string | null;
  base_poids?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface RecetteWithStats extends Recette {
  recette_ingredients?: RecetteIngredientView[];
  // Sous-total ingrédients seuls
  cout_total: number;
  poids_total: number;
  nb_ingredients: number;
  // Pâte (pizza uniquement)
  pate?: RecetteWithStats;
  cout_pate?: number;   // prorata : (pate_poids / poids_total_pate) * cout_total_pate
  poids_pate?: number;  // = pate_poids
  // Sauce de base (pizza uniquement)
  base?: RecetteWithStats;
  cout_base?: number;   // prorata : (base_poids / poids_total_base) * cout_total_base
  poids_base?: number;  // = base_poids
  // Totaux globaux (ingrédients + pâte + base)
  cout_grand_total: number;
  poids_grand_total: number;
}
