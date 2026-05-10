import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { CommandesService } from '../services/commandes.service';
import { ClientsService } from '../services/clients.service';
import { OffresService } from '../services/offres.service';
import { Commande, Client, Offre, StatutCommande } from '../models';
import { generateFacturePdf } from '../utils/facture-pdf';
import { ToastService } from '../shared/toast.service';

type CommandeForm = {
  client_id: string;
  date_presta: string;
  nb_personnes: number;
  offre_id: string;
  pizzas_prevues: number | null;
  pizzas_realisees: number | null;
  statut: StatutCommande;
  notes: string;
};

@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [FormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './commandes.component.html',
})
export class CommandesComponent implements OnInit {
  private commandesService = inject(CommandesService);
  private clientsService = inject(ClientsService);
  private offresService = inject(OffresService);
  private toastService = inject(ToastService);

  commandes = signal<Commande[]>([]);
  clients = signal<Client[]>([]);
  offres = signal<Offre[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);
  errorMsg = signal<string | null>(null);

  form: CommandeForm = this.emptyForm();

  get prixCalcule(): number {
    const offre = this.offres().find((o) => o.id === this.form.offre_id);
    if (!offre || !this.form.nb_personnes) return 0;
    return this.offresService.calculerPrix(offre, this.form.nb_personnes);
  }

  async ngOnInit() {
    await this.loadAll();
  }

  private async loadAll() {
    this.loading.set(true);
    const [commandes, clients, offres] = await Promise.all([
      this.commandesService.getAll(),
      this.clientsService.getAll(),
      this.offresService.getAll(),
    ]);
    this.commandes.set(commandes);
    this.clients.set(clients);
    this.offres.set(offres);
    this.loading.set(false);
  }

  openCreate() {
    this.form = this.emptyForm();
    this.editingId.set(null);
    this.errorMsg.set(null);
    this.showModal.set(true);
  }

  openEdit(c: Commande) {
    this.form = {
      client_id: c.client_id,
      date_presta: c.date_presta,
      nb_personnes: c.nb_personnes,
      offre_id: c.offre_id,
      pizzas_prevues: c.pizzas_prevues,
      pizzas_realisees: c.pizzas_realisees,
      statut: c.statut,
      notes: c.notes ?? '',
    };
    this.editingId.set(c.id);
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
      const payload = {
        ...this.form,
        prix_total: this.prixCalcule,
        notes: this.form.notes || null,
        pizzas_prevues: this.form.pizzas_prevues || null,
        pizzas_realisees: this.form.pizzas_realisees || null,
      };
      const id = this.editingId();
      if (id) {
        await this.commandesService.update(id, payload);
        this.toastService.success('Commande mise à jour');
      } else {
        await this.commandesService.create(payload);
        this.toastService.success('Commande créée');
      }
      this.showModal.set(false);
      await this.loadAll();
    } catch (e: unknown) {
      this.errorMsg.set(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteCommande(c: Commande) {
    const nom = c.client?.prenom ? `${c.client.prenom} ${c.client.nom}` : (c.client?.nom ?? '');
    const ok = await this.toastService.confirm(`Supprimer la commande de ${nom} du ${c.date_presta} ?`);
    if (!ok) return;
    await this.commandesService.delete(c.id);
    this.commandes.update((list) => list.filter((x) => x.id !== c.id));
    this.toastService.success(`Commande du ${c.date_presta} supprimée`);
  }

  downloadPdf(c: Commande) {
    generateFacturePdf(c);
  }

  statutLabel(s: StatutCommande): string {
    return { en_cours: 'En cours', confirmee: 'Confirmée', terminee: 'Terminée' }[s];
  }

  statutClass(s: StatutCommande): string {
    return {
      en_cours: 'bg-yellow-100 text-yellow-700',
      confirmee: 'bg-blue-100 text-blue-700',
      terminee: 'bg-green-100 text-green-700',
    }[s];
  }

  private emptyForm(): CommandeForm {
    return {
      client_id: '',
      date_presta: '',
      nb_personnes: 10,
      offre_id: '',
      pizzas_prevues: null,
      pizzas_realisees: null,
      statut: 'en_cours',
      notes: '',
    };
  }
}
