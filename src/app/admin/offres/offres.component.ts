import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OffresService } from '../services/offres.service';
import { CommandesService } from '../services/commandes.service';
import { Offre, Tranche } from '../models';
import { ToastService } from '../shared/toast.service';

type OffreForm = { nom: string; tranches: Tranche[] };

@Component({
  selector: 'app-offres',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './offres.component.html',
})
export class OffresComponent implements OnInit {
  private offresService = inject(OffresService);
  private commandesService = inject(CommandesService);
  private toastService = inject(ToastService);

  offres = signal<Offre[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);
  errorMsg = signal<string | null>(null);

  form: OffreForm = this.emptyForm();

  async ngOnInit() {
    const offres = await this.offresService.getAll();
    this.offres.set(offres);
    this.loading.set(false);
  }

  openCreate() {
    this.form = this.emptyForm();
    this.editingId.set(null);
    this.errorMsg.set(null);
    this.showModal.set(true);
  }

  openEdit(o: Offre) {
    this.form = { nom: o.nom, tranches: o.tranches.map((t) => ({ ...t })) };
    this.editingId.set(o.id);
    this.errorMsg.set(null);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  addTranche() {
    this.form.tranches.push({ min: 0, max: null, prix: 0 });
  }

  removeTranche(i: number) {
    this.form.tranches.splice(i, 1);
  }

  async save() {
    this.saving.set(true);
    this.errorMsg.set(null);
    try {
      const id = this.editingId();
      if (id) {
        const updated = await this.offresService.update(id, this.form);
        this.offres.update((list) => list.map((o) => (o.id === id ? updated : o)));
        this.toastService.success('Offre mise à jour');
      } else {
        const created = await this.offresService.create(this.form);
        this.offres.update((list) => [...list, created]);
        this.toastService.success('Offre créée');
      }
      this.showModal.set(false);
    } catch (e: unknown) {
      this.errorMsg.set(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteOffre(o: Offre) {
    const commandes = await this.commandesService.getAll();
    const linked = commandes.filter((c) => c.offre_id === o.id);
    if (linked.length > 0) {
      this.toastService.error(`Impossible de supprimer "${o.nom}" : ${linked.length} commande(s) liée(s).`);
      return;
    }
    const ok = await this.toastService.confirm(`Supprimer l'offre "${o.nom}" ?`);
    if (!ok) return;
    await this.offresService.delete(o.id);
    this.offres.update((list) => list.filter((x) => x.id !== o.id));
    this.toastService.success(`Offre "${o.nom}" supprimée`);
  }

  trancheLabel(t: Tranche): string {
    if (t.max === null) return `> ${t.min - 1} pers.`;
    return `${t.min}–${t.max} pers.`;
  }

  private emptyForm(): OffreForm {
    return { nom: '', tranches: [{ min: 0, max: 9, prix: 0 }] };
  }
}
