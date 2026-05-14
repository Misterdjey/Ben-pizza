import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { DepensesService } from '../services/depenses.service';
import { Ingredient } from '../models';
import { ToastService } from '../shared/toast.service';

type IngredientForm = Omit<Ingredient, 'id' | 'created_at'>;

@Component({
  selector: 'app-ingredients',
  standalone: true,
  host: { class: 'flex flex-col overflow-hidden' },
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './ingredients.component.html',
})
export class IngredientsComponent implements OnInit {
  private depensesService = inject(DepensesService);
  private toastService = inject(ToastService);

  ingredients = signal<Ingredient[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);
  errorMsg = signal<string | null>(null);

  form: IngredientForm = this.emptyForm();

  async ngOnInit() {
    const data = await this.depensesService.getIngredients();
    this.ingredients.set(data);
    this.loading.set(false);
  }

  openCreate() {
    this.form = this.emptyForm();
    this.editingId.set(null);
    this.errorMsg.set(null);
    this.showModal.set(true);
  }

  openEdit(ing: Ingredient) {
    this.form = { nom: ing.nom, unite: ing.unite, poids_unitaire: ing.poids_unitaire, prix_reference: ing.prix_reference };
    this.editingId.set(ing.id);
    this.errorMsg.set(null);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  async save() {
    this.saving.set(true);
    this.errorMsg.set(null);
    try {
      const id = this.editingId();
      if (id) {
        const updated = await this.depensesService.updateIngredient(id, this.form);
        this.ingredients.update((list) => list.map((i) => (i.id === id ? updated : i)));
        this.toastService.success('Ingrédient mis à jour');
      } else {
        const created = await this.depensesService.createIngredient(this.form);
        this.ingredients.update((list) => [...list, created].sort((a, b) => a.nom.localeCompare(b.nom)));
        this.toastService.success('Ingrédient ajouté au catalogue');
      }
      this.showModal.set(false);
    } catch (e: unknown) {
      this.errorMsg.set(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteIngredient(ing: Ingredient) {
    const ok = await this.toastService.confirm(`Supprimer "${ing.nom}" du catalogue ?`);
    if (!ok) return;
    try {
      await this.depensesService.deleteIngredient(ing.id);
      this.ingredients.update((list) => list.filter((i) => i.id !== ing.id));
      this.toastService.success(`"${ing.nom}" supprimé du catalogue`);
    } catch (e: unknown) {
      this.toastService.error(e instanceof Error ? e.message : 'Erreur lors de la suppression');
    }
  }

  private emptyForm(): IngredientForm {
    return { nom: '', unite: '', poids_unitaire: null, prix_reference: 0 };
  }
}
