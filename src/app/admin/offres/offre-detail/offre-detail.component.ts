import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OffresService } from '../../services/offres.service';
import { ExtrasService } from '../../services/extras.service';
import { Offre, Tranche, Extra } from '../../models';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-offre-detail',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './offre-detail.component.html',
})
export class OffreDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private offresService = inject(OffresService);
  private extrasService = inject(ExtrasService);
  private toast = inject(ToastService);

  offreId = signal<string | null>(null);
  loading = signal(true);
  saving = signal(false);
  errorMsg = signal<string | null>(null);

  form: { nom: string; description: string; includes: string; tranches: Tranche[] } = {
    nom: '',
    description: '',
    includes: '',
    tranches: [{ min: 0, max: 9, prix: 0 }],
  };

  allExtras = signal<Extra[]>([]);
  linkedExtraIds = signal<string[]>([]);
  private originalLinkedIds: string[] = [];

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.offreId.set(id);

    const [offre, allExtras, linked] = await Promise.all([
      this.offresService.getAll().then((list) => list.find((o) => o.id === id)),
      this.extrasService.getAll(),
      this.extrasService.getByOffre(id),
    ]);

    if (!offre) {
      this.router.navigate(['/admin/offres']);
      return;
    }

    this.form = {
      nom: offre.nom,
      description: offre.description ?? '',
      includes: (offre.includes ?? []).join('\n'),
      tranches: offre.tranches.map((t) => ({ ...t })),
    };
    this.allExtras.set(allExtras);
    const ids = linked.map((e) => e.id);
    this.linkedExtraIds.set(ids);
    this.originalLinkedIds = [...ids];
    this.loading.set(false);
  }

  addTranche() {
    this.form.tranches.push({ min: 0, max: null, prix: 0 });
  }

  removeTranche(i: number) {
    this.form.tranches.splice(i, 1);
  }

  trancheLabel(t: Tranche): string {
    if (t.max === null) return `> ${t.min - 1} pers.`;
    return `${t.min}–${t.max} pers.`;
  }

  isLinked(extra: Extra): boolean {
    return this.linkedExtraIds().includes(extra.id);
  }

  toggleExtra(extra: Extra) {
    const ids = this.linkedExtraIds();
    if (ids.includes(extra.id)) {
      this.linkedExtraIds.set(ids.filter((id) => id !== extra.id));
    } else {
      this.linkedExtraIds.set([...ids, extra.id]);
    }
  }

  extrasByCategorie() {
    const map = new Map<string, Extra[]>();
    for (const e of this.allExtras()) {
      const list = map.get(e.categorie) ?? [];
      list.push(e);
      map.set(e.categorie, list);
    }
    return Array.from(map.entries()).map(([categorie, items]) => ({ categorie, items }));
  }

  async save() {
    if (!this.form.nom.trim()) {
      this.errorMsg.set('Le nom est obligatoire.');
      return;
    }
    this.saving.set(true);
    this.errorMsg.set(null);
    try {
      const id = this.offreId()!;
      const includesArr = this.form.includes
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: Partial<Offre> = {
        nom: this.form.nom.trim(),
        description: this.form.description.trim() || undefined,
        includes: includesArr.length > 0 ? includesArr : [],
        tranches: this.form.tranches,
      };

      await this.offresService.update(id, payload);
      await this.extrasService.diffSaveExtras(id, this.linkedExtraIds(), this.originalLinkedIds);
      this.originalLinkedIds = [...this.linkedExtraIds()];
      this.toast.success('Offre mise à jour');
    } catch (e: unknown) {
      this.errorMsg.set(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      this.saving.set(false);
    }
  }
}
