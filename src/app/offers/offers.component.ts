import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OffreService } from '../services/offre.service';
import { OffreWithExtras, Extra } from '../admin/models';

interface CatEntry { nom: string; open: boolean; extras: Extra[] }

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.css',
})
export class OffersComponent implements OnInit {
  private offreService = inject(OffreService);

  offres = signal<OffreWithExtras[]>([]);
  loading = signal(true);

  extraCategories = computed<CatEntry[]>(() => {
    const allExtras: Extra[] = [];
    for (const o of this.offres()) {
      for (const e of o.extras) {
        if (!allExtras.find((x) => x.id === e.id)) allExtras.push(e);
      }
    }
    const map = new Map<string, CatEntry>();
    for (const e of allExtras) {
      if (!map.has(e.categorie)) map.set(e.categorie, { nom: e.categorie, open: false, extras: [] });
      map.get(e.categorie)!.extras.push(e);
    }
    return Array.from(map.values());
  });

  async ngOnInit() {
    this.offres.set(await this.offreService.getOffresWithExtras());
    this.loading.set(false);
  }

  prixAffichage(offre: OffreWithExtras): number {
    return this.offreService.getPrixParPersonne(offre, 8);
  }

  toggleCat(cat: CatEntry) {
    cat.open = !cat.open;
  }
}
