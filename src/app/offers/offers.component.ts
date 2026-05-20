import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OffreService } from '../services/offre.service';
import { OffreWithExtras, Extra } from '../admin/models';

interface CatEntry  { nom: string; extras: Extra[] }
interface OffreCard { offre: OffreWithExtras; open: boolean; categories: CatEntry[] }

function groupByCategorie(extras: Extra[]): CatEntry[] {
  const map = new Map<string, Extra[]>();
  for (const e of extras) {
    const list = map.get(e.categorie) ?? [];
    list.push(e);
    map.set(e.categorie, list);
  }
  return Array.from(map.entries()).map(([nom, items]) => ({ nom, extras: items }));
}

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.css',
})
export class OffersComponent implements OnInit {
  private offreService = inject(OffreService);

  loading = signal(true);

  // State open/closed par offre et par catégorie
  private openOffres = signal<Set<string>>(new Set());
  private openCats   = signal<Set<string>>(new Set());
  private offresRaw  = signal<OffreWithExtras[]>([]);

  offreCards = computed<OffreCard[]>(() =>
    this.offresRaw().map(o => ({
      offre: o,
      open: this.openOffres().has(o.id),
      categories: groupByCategorie(o.extras),
    }))
  );

  async ngOnInit() {
    this.offresRaw.set(await this.offreService.getOffresWithExtras());
    this.loading.set(false);
  }

  toggleOffre(id: string) {
    this.openOffres.update(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    // fermer les cats de cette offre si on ferme l'offre
    if (!this.openOffres().has(id)) {
      const prefix = `${id}_`;
      this.openCats.update(s => {
        const next = new Set(s);
        for (const k of next) if (k.startsWith(prefix)) next.delete(k);
        return next;
      });
    }
  }

  toggleCat(offreId: string, catNom: string) {
    const key = `${offreId}_${catNom}`;
    this.openCats.update(s => {
      const next = new Set(s);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  isCatOpen(offreId: string, catNom: string): boolean {
    return this.openCats().has(`${offreId}_${catNom}`);
  }

  premierPrix(offre: OffreWithExtras): number {
    return offre.tranches[0]?.prix ?? 0;
  }
}
