import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RecettesService } from '../services/recettes.service';
import { RecetteWithStats, RecetteType } from '../models/recette.model';
import { ToastService } from '../shared/toast.service';

const TYPE_LABELS: Record<RecetteType, string> = {
  pizza: 'Pizza',
  pate: 'Pâte',
  sauce_base: 'Sauce de base',
  autre: 'Autre',
};

@Component({
  selector: 'app-recettes',
  standalone: true,
  host: { class: 'flex flex-col overflow-hidden' },
  imports: [RouterLink, CurrencyPipe, DecimalPipe],
  templateUrl: './recettes.component.html',
})
export class RecettesComponent implements OnInit {
  private service = inject(RecettesService);
  private toast = inject(ToastService);

  recettes = signal<RecetteWithStats[]>([]);
  loading = signal(true);

  async ngOnInit() {
    const data = await this.service.getAll();
    this.recettes.set(data);
    this.loading.set(false);
  }

  typeLabel(t: string) {
    return TYPE_LABELS[t as RecetteType] ?? t;
  }

  async deleteRecette(r: RecetteWithStats) {
    const ok = await this.toast.confirm(`Supprimer la recette "${r.nom}" ?`);
    if (!ok) return;
    try {
      await this.service.delete(r.id!);
      this.recettes.update(list => list.filter(x => x.id !== r.id));
      this.toast.success(`"${r.nom}" supprimée`);
    } catch (e: unknown) {
      this.toast.error(e instanceof Error ? e.message : 'Erreur lors de la suppression');
    }
  }
}
