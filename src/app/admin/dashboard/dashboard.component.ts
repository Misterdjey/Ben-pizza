import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CommandesService } from '../services/commandes.service';
import { DepensesService } from '../services/depenses.service';
import { Commande, Depense } from '../models';

interface Stats {
  caTotal: number;
  caMois: number;
  margeGlobale: number;
  parStatut: Record<string, number>;
  commandesAvecMarge: { commande: Commande; depensesTotal: number; marge: number }[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private commandesService = inject(CommandesService);
  private depensesService = inject(DepensesService);

  loading = signal(true);
  stats = signal<Stats | null>(null);

  async ngOnInit() {
    const commandes = await this.commandesService.getAll();
    const termineeIds = commandes
      .filter((c) => c.statut === 'terminee')
      .map((c) => c.id);

    const allDepenses: Record<string, Depense[]> = {};
    await Promise.all(
      termineeIds.map(async (id) => {
        allDepenses[id] = await this.depensesService.getByCommande(id);
      }),
    );

    const now = new Date();
    const caTotal = commandes
      .filter((c) => c.statut === 'terminee')
      .reduce((s, c) => s + Number(c.prix_total), 0);

    const caMois = commandes
      .filter(
        (c) =>
          c.statut === 'terminee' &&
          new Date(c.date_presta).getMonth() === now.getMonth() &&
          new Date(c.date_presta).getFullYear() === now.getFullYear(),
      )
      .reduce((s, c) => s + Number(c.prix_total), 0);

    const totalDepenses = Object.values(allDepenses)
      .flat()
      .reduce((s, d) => s + Number(d.prix_total), 0);

    const parStatut = { en_cours: 0, confirmee: 0, terminee: 0 };
    commandes.forEach((c) => parStatut[c.statut]++);

    const commandesAvecMarge = commandes
      .filter((c) => c.statut === 'terminee')
      .map((commande) => {
        const depensesTotal = (allDepenses[commande.id] ?? []).reduce(
          (s, d) => s + Number(d.prix_total),
          0,
        );
        return { commande, depensesTotal, marge: Number(commande.prix_total) - depensesTotal };
      });

    this.stats.set({
      caTotal,
      caMois,
      margeGlobale: caTotal - totalDepenses,
      parStatut,
      commandesAvecMarge,
    });
    this.loading.set(false);
  }
}
