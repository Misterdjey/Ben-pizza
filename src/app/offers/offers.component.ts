import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OffreService } from '../services/offre.service';
import { OffreWithExtras, Extra } from '../admin/models';

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

  extrasByCategorie = computed(() => {
    const allExtras: Extra[] = [];
    for (const o of this.offres()) {
      for (const e of o.extras) {
        if (!allExtras.find((x) => x.id === e.id)) {
          allExtras.push(e);
        }
      }
    }
    const map = new Map<string, Extra[]>();
    for (const e of allExtras) {
      const list = map.get(e.categorie) ?? [];
      list.push(e);
      map.set(e.categorie, list);
    }
    return Array.from(map.entries()).map(([categorie, items]) => ({ categorie, items }));
  });

  async ngOnInit() {
    this.offres.set(await this.offreService.getOffresWithExtras());
    this.loading.set(false);
  }

  prixAffichage(offre: OffreWithExtras): number {
    return this.offreService.getPrixParPersonne(offre, 8);
  }

  formatPrix(e: Extra): string {
    if (e.type === 'fixe') return `${e.prix} €`;
    return `${e.prix} €/pers.`;
  }
}
