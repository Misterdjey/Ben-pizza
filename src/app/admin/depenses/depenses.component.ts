import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { DepensesService } from '../services/depenses.service';
import { CommandesService } from '../services/commandes.service';
import { Commande, Depense, Ingredient } from '../models';

type DepenseForm = {
  mode: 'catalogue' | 'libre';
  ingredient_id: string;
  libelle: string;
  quantite: number;
  prix_unitaire: number;
};

@Component({
  selector: 'app-depenses',
  standalone: true,
  imports: [FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './depenses.component.html',
})
export class DepensesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private depensesService = inject(DepensesService);
  private commandesService = inject(CommandesService);

  commandeId = '';
  commande = signal<Commande | null>(null);
  depenses = signal<Depense[]>([]);
  ingredients = signal<Ingredient[]>([]);
  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  errorMsg = signal<string | null>(null);

  form: DepenseForm = this.emptyForm();

  get totalDepenses(): number {
    return this.depenses().reduce((s, d) => s + Number(d.prix_total), 0);
  }

  get marge(): number {
    return Number(this.commande()?.prix_total ?? 0) - this.totalDepenses;
  }

  get prixLigne(): number {
    return this.form.quantite * this.form.prix_unitaire;
  }

  async ngOnInit() {
    this.commandeId = this.route.snapshot.paramMap.get('id') ?? '';
    const [commande, depenses, ingredients] = await Promise.all([
      this.commandesService.getById(this.commandeId),
      this.depensesService.getByCommande(this.commandeId),
      this.depensesService.getIngredients(),
    ]);
    this.commande.set(commande);
    this.depenses.set(depenses);
    this.ingredients.set(ingredients);
    this.loading.set(false);
  }

  onIngredientChange() {
    const ing = this.ingredients().find((i) => i.id === this.form.ingredient_id);
    if (ing) {
      this.form.prix_unitaire = ing.prix_reference;
    }
  }

  async save() {
    this.saving.set(true);
    this.errorMsg.set(null);
    try {
      const payload =
        this.form.mode === 'catalogue'
          ? {
              commande_id: this.commandeId,
              ingredient_id: this.form.ingredient_id,
              libelle: null,
              quantite: this.form.quantite,
              prix_unitaire: this.form.prix_unitaire,
            }
          : {
              commande_id: this.commandeId,
              ingredient_id: null,
              libelle: this.form.libelle,
              quantite: this.form.quantite,
              prix_unitaire: this.form.prix_unitaire,
            };

      const created = await this.depensesService.create(payload);
      this.depenses.update((list) => [...list, created]);
      this.form = this.emptyForm();
      this.showForm.set(false);
    } catch (e: unknown) {
      this.errorMsg.set(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteDepense(d: Depense) {
    if (!confirm('Supprimer cette dépense ?')) return;
    await this.depensesService.delete(d.id);
    this.depenses.update((list) => list.filter((x) => x.id !== d.id));
  }

  labelDepense(d: Depense): string {
    if (d.ingredient) return `${d.ingredient.nom} (${d.ingredient.unite})`;
    return d.libelle ?? '—';
  }

  private emptyForm(): DepenseForm {
    return { mode: 'catalogue', ingredient_id: '', libelle: '', quantite: 1, prix_unitaire: 0 };
  }
}
