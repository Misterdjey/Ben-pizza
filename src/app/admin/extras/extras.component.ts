import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExtrasService } from '../services/extras.service';
import { Extra } from '../models';
import { ToastService } from '../shared/toast.service';

type ExtraForm = Omit<Extra, 'id' | 'created_at'>;

@Component({
  selector: 'app-extras',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './extras.component.html',
})
export class ExtrasComponent implements OnInit {
  private extrasService = inject(ExtrasService);
  private toastService = inject(ToastService);

  extras = signal<Extra[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);
  errorMsg = signal<string | null>(null);

  form: ExtraForm = this.emptyForm();

  async ngOnInit() {
    this.extras.set(await this.extrasService.getAll());
    this.loading.set(false);
  }

  openCreate() {
    this.form = this.emptyForm();
    this.editingId.set(null);
    this.errorMsg.set(null);
    this.showModal.set(true);
  }

  openEdit(e: Extra) {
    this.form = {
      nom: e.nom,
      description: e.description ?? '',
      categorie: e.categorie,
      type: e.type,
      prix: e.prix,
      unite_description: e.unite_description ?? '',
      actif: e.actif ?? true,
    };
    this.editingId.set(e.id);
    this.errorMsg.set(null);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  async save() {
    if (!this.form.nom.trim() || !this.form.categorie.trim()) {
      this.errorMsg.set('Nom et catégorie sont obligatoires.');
      return;
    }
    this.saving.set(true);
    this.errorMsg.set(null);
    try {
      const payload: ExtraForm = {
        ...this.form,
        nom: this.form.nom.trim(),
        categorie: this.form.categorie.trim(),
        description: this.form.description?.trim() || undefined,
        unite_description: this.form.unite_description?.trim() || undefined,
      };
      const id = this.editingId();
      if (id) {
        const updated = await this.extrasService.update(id, payload);
        this.extras.update((list) => list.map((x) => (x.id === id ? updated : x)));
        this.toastService.success('Extra mis à jour');
      } else {
        const created = await this.extrasService.create(payload);
        this.extras.update((list) => [...list, created]);
        this.toastService.success('Extra créé');
      }
      this.showModal.set(false);
    } catch (e: unknown) {
      this.errorMsg.set(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteExtra(e: Extra) {
    const ok = await this.toastService.confirm(`Supprimer l'extra "${e.nom}" ?`);
    if (!ok) return;
    await this.extrasService.delete(e.id);
    this.extras.update((list) => list.filter((x) => x.id !== e.id));
    this.toastService.success(`Extra "${e.nom}" supprimé`);
  }

  async toggleActif(e: Extra) {
    const updated = await this.extrasService.update(e.id, { actif: !e.actif });
    this.extras.update((list) => list.map((x) => (x.id === e.id ? updated : x)));
  }

  private emptyForm(): ExtraForm {
    return { nom: '', description: '', categorie: '', type: 'par_personne', prix: 0, unite_description: '', actif: true };
  }
}
