import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RecettesService } from '../../services/recettes.service';
import { DepensesService } from '../../services/depenses.service';
import { Ingredient } from '../../models';
import { RecetteIngredientView, RecetteType, RecetteWithStats } from '../../models/recette.model';
import { ToastService } from '../../shared/toast.service';
import { HasUnsavedChanges } from '../../guards/unsaved-changes.guard';

interface RecetteForm {
  nom: string;
  type: RecetteType;
  notes: string;
}

@Component({
  selector: 'app-recette-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe, DecimalPipe],
  templateUrl: './recette-detail.component.html',
})
export class RecetteDetailComponent implements OnInit, HasUnsavedChanges {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(RecettesService);
  private depensesService = inject(DepensesService);
  private toast = inject(ToastService);

  readonly typeOptions: { value: RecetteType; label: string }[] = [
    { value: 'pizza', label: 'Pizza' },
    { value: 'pate', label: 'Pâte' },
    { value: 'sauce_base', label: 'Sauce de base' },
    { value: 'autre', label: 'Autre' },
  ];

  isNew = signal(true);
  recetteId = signal<string | null>(null);
  loading = signal(true);
  saving = signal(false);
  errorMsg = signal<string | null>(null);

  form: RecetteForm = { nom: '', type: 'pizza', notes: '' };
  private originalForm: RecetteForm = { nom: '', type: 'pizza', notes: '' };
  private saved = false;

  catalogue = signal<Ingredient[]>([]);
  lines = signal<RecetteIngredientView[]>([]);
  private originalLines: RecetteIngredientView[] = [];

  // Pâte
  pateRecettes = signal<RecetteWithStats[]>([]);
  pateId = signal<string | null>(null);
  patePoids = signal<number>(0);
  pateRecette = signal<RecetteWithStats | null>(null);
  private originalPateId: string | null = null;
  private originalPatePoids: number = 0;

  // Sauce de base
  baseRecettes = signal<RecetteWithStats[]>([]);
  baseId = signal<string | null>(null);
  basePoids = signal<number>(0);
  baseRecette = signal<RecetteWithStats | null>(null);
  private originalBaseId: string | null = null;
  private originalBasePoids: number = 0;

  // Sous-total ingrédients
  coutIngredients = computed(() => this.lines().reduce((s, l) => s + l.cout, 0));
  poidsIngredients = computed(() => this.lines().reduce((s, l) => s + l.poids, 0));

  // Prorata pâte
  coutPate = computed(() => {
    const pr = this.pateRecette();
    const poids = this.patePoids();
    if (!this.pateId() || !pr || !poids || !pr.poids_total) return 0;
    return (poids / pr.poids_total) * pr.cout_total;
  });
  poidsPate = computed(() => (this.pateId() ? this.patePoids() : 0));

  // Prorata sauce de base
  coutBase = computed(() => {
    const br = this.baseRecette();
    const poids = this.basePoids();
    if (!this.baseId() || !br || !poids || !br.poids_total) return 0;
    return (poids / br.poids_total) * br.cout_total;
  });
  poidsBase = computed(() => (this.baseId() ? this.basePoids() : 0));

  // Totaux globaux (ingrédients + pâte + base)
  coutTotal = computed(() => this.coutIngredients() + this.coutPate() + this.coutBase());
  poidsTotal = computed(() => this.poidsIngredients() + this.poidsPate() + this.poidsBase());

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isNew.set(!id);
    this.recetteId.set(id);

    const [catalogue, pateRecettes, baseRecettes] = await Promise.all([
      this.depensesService.getIngredients(),
      this.service.getByType('pate'),
      this.service.getByType('sauce_base'),
    ]);
    this.catalogue.set(catalogue);
    this.pateRecettes.set(pateRecettes);
    this.baseRecettes.set(baseRecettes);

    if (id) {
      const recette = await this.service.getById(id);
      this.form = { nom: recette.nom, type: recette.type, notes: recette.notes ?? '' };
      const views = recette.recette_ingredients ?? [];
      this.lines.set([...views]);
      this.originalLines = [...views];

      this.pateId.set(recette.pate_id ?? null);
      this.patePoids.set(recette.pate_poids ?? 0);
      this.originalPateId = recette.pate_id ?? null;
      this.originalPatePoids = recette.pate_poids ?? 0;

      this.baseId.set(recette.base_id ?? null);
      this.basePoids.set(recette.base_poids ?? 0);
      this.originalBaseId = recette.base_id ?? null;
      this.originalBasePoids = recette.base_poids ?? 0;

      const [pate, base] = await Promise.all([
        recette.pate_id ? this.service.getById(recette.pate_id) : Promise.resolve(null),
        recette.base_id ? this.service.getById(recette.base_id) : Promise.resolve(null),
      ]);
      if (pate) this.pateRecette.set(pate);
      if (base) this.baseRecette.set(base);
    }

    this.originalForm = { ...this.form };
    this.loading.set(false);
  }

  addLine() {
    const cat = this.catalogue();
    if (cat.length === 0) return;
    const first = cat[0];
    this.lines.update(list => [...list, {
      ingredient_id: first.id,
      quantite: 0,
      nom: first.nom,
      unite: first.unite,
      prix_reference: first.prix_reference,
      poids_unitaire: first.poids_unitaire,
      cout: 0,
      poids: 0,
    }]);
  }

  removeLine(index: number) {
    this.lines.update(list => list.filter((_, i) => i !== index));
  }

  onIngredientChange(index: number, ingredientId: string) {
    const ing = this.catalogue().find(c => c.id === ingredientId);
    if (!ing) return;
    this.lines.update(list => list.map((l, i) => {
      if (i !== index) return l;
      return {
        ...l,
        ingredient_id: ingredientId,
        nom: ing.nom,
        unite: ing.unite,
        prix_reference: ing.prix_reference,
        poids_unitaire: ing.poids_unitaire,
        cout: l.quantite * ing.prix_reference,
        poids: l.quantite * (ing.poids_unitaire ?? 0),
      };
    }));
  }

  onQuantiteChange(index: number, quantite: number) {
    this.lines.update(list => list.map((l, i) => {
      if (i !== index) return l;
      return {
        ...l,
        quantite,
        cout: quantite * l.prix_reference,
        poids: quantite * (l.poids_unitaire ?? 0),
      };
    }));
  }

  async onPateChange(id: string) {
    const pateId = id || null;
    this.pateId.set(pateId);
    if (pateId) {
      const pate = await this.service.getById(pateId);
      this.pateRecette.set(pate);
    } else {
      this.pateRecette.set(null);
      this.patePoids.set(0);
    }
  }

  onPatePoidsChange(val: number) {
    this.patePoids.set(val);
  }

  async onBaseChange(id: string) {
    const baseId = id || null;
    this.baseId.set(baseId);
    if (baseId) {
      const base = await this.service.getById(baseId);
      this.baseRecette.set(base);
    } else {
      this.baseRecette.set(null);
      this.basePoids.set(0);
    }
  }

  onBasePoidsChange(val: number) {
    this.basePoids.set(val);
  }

  async save() {
    if (!this.form.nom.trim()) {
      this.errorMsg.set('Le nom est obligatoire.');
      return;
    }
    this.saving.set(true);
    this.errorMsg.set(null);
    try {
      const isPizza = this.form.type === 'pizza';
      const payload = {
        nom: this.form.nom.trim(),
        type: this.form.type,
        notes: this.form.notes.trim() || null,
        pate_id: isPizza ? this.pateId() : null,
        pate_poids: isPizza && this.pateId() ? (this.patePoids() || null) : null,
        base_id: isPizza ? this.baseId() : null,
        base_poids: isPizza && this.baseId() ? (this.basePoids() || null) : null,
      };
      let id = this.recetteId();
      if (this.isNew()) {
        const created = await this.service.create(payload);
        id = created.id!;
      } else {
        await this.service.update(id!, payload);
      }
      await this.service.diffSaveIngredients(id!, this.lines(), this.originalLines);
      this.toast.success(this.isNew() ? 'Recette créée' : 'Recette mise à jour');
      this.saved = true;
      this.router.navigate(['/admin/recettes']);
    } catch (e: unknown) {
      this.errorMsg.set(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      this.saving.set(false);
    }
  }

  hasUnsavedChanges(): boolean {
    if (this.saved || this.loading()) return false;
    if (
      this.form.nom !== this.originalForm.nom ||
      this.form.type !== this.originalForm.type ||
      this.form.notes !== this.originalForm.notes
    ) return true;
    if (this.pateId() !== this.originalPateId) return true;
    if (this.patePoids() !== this.originalPatePoids) return true;
    if (this.baseId() !== this.originalBaseId) return true;
    if (this.basePoids() !== this.originalBasePoids) return true;
    const current = this.lines();
    if (current.length !== this.originalLines.length) return true;
    return current.some((l, i) => {
      const o = this.originalLines[i];
      return l.ingredient_id !== o.ingredient_id || l.quantite !== o.quantite;
    });
  }

  async deleteRecette() {
    const ok = await this.toast.confirm(`Supprimer la recette "${this.form.nom}" ?`);
    if (!ok) return;
    try {
      await this.service.delete(this.recetteId()!);
      this.toast.success('Recette supprimée');
      this.router.navigate(['/admin/recettes']);
    } catch (e: unknown) {
      this.toast.error(e instanceof Error ? e.message : 'Erreur lors de la suppression');
    }
  }
}
