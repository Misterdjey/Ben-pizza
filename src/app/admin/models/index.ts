export interface Client {
  id: string;
  nom: string;
  prenom: string | null;
  email: string;
  telephone: string | null;
  type: 'particulier' | 'entreprise';
  nom_entreprise: string | null;
  num_tva: string | null;
  notes: string | null;
  created_at: string;
}

export interface Tranche {
  min: number;
  max: number | null;
  prix: number;
}

export interface Offre {
  id: string;
  nom: string;
  tranches: Tranche[];
  created_at: string;
}

export type StatutCommande = 'en_cours' | 'confirmee' | 'terminee';

export interface Commande {
  id: string;
  client_id: string;
  date_presta: string;
  nb_personnes: number;
  offre_id: string;
  prix_total: number;
  pizzas_prevues: number | null;
  pizzas_realisees: number | null;
  statut: StatutCommande;
  notes: string | null;
  created_at: string;
  client?: Client;
  offre?: Offre;
}

export interface Ingredient {
  id: string;
  nom: string;
  unite: string;
  prix_reference: number;
  created_at: string;
}

export interface Depense {
  id: string;
  commande_id: string;
  ingredient_id: string | null;
  libelle: string | null;
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
  created_at: string;
  ingredient?: Ingredient;
}
