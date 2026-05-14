export type RecetteType = 'pizza' | 'pate' | 'sauce' | 'autre';

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
  created_at?: string;
  updated_at?: string;
}

export interface RecetteWithStats extends Recette {
  recette_ingredients?: RecetteIngredientView[];
  cout_total: number;
  poids_total: number;
  nb_ingredients: number;
}
