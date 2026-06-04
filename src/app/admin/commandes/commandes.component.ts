import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CommandesService } from '../services/commandes.service';
import { ClientsService } from '../services/clients.service';
import { ExtrasService } from '../services/extras.service';
import { Commande, Client, Extra, StatutCommande } from '../models';
import { generateFacturePdf } from '../utils/facture-pdf';
import { ToastService } from '../shared/toast.service';

const PRIX_PAR_PERSONNE = 26;

interface CatGroup { nom: string; extras: Extra[] }

type CommandeForm = {
  client_id: string;
  date_presta: string;
  nb_personnes: number;
  pizzas_prevues: number | null;
  pizzas_realisees: number | null;
  statut: StatutCommande;
  notes: string;
};

@Component({
  selector: 'app-commandes',
  standalone: true,
  host: { class: 'flex flex-col overflow-hidden' },
  imports: [FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './commandes.component.html',
})
export class CommandesComponent implements OnInit {
  private commandesService = inject(CommandesService);
  private clientsService = inject(ClientsService);
  private extrasService = inject(ExtrasService);
  private toastService = inject(ToastService);

  commandes = signal<Commande[]>([]);
  clients = signal<Client[]>([]);
  extras = signal<Extra[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);
  errorMsg = signal<string | null>(null);

  private checkedIds = signal<Set<string>>(new Set());
  reduction = signal<number>(0);

  form: CommandeForm = this.emptyForm();

  categories = computed<CatGroup[]>(() => {
    const map = new Map<string, Extra[]>();
    for (const e of this.extras()) {
      const list = map.get(e.categorie) ?? [];
      list.push(e);
      map.set(e.categorie, list);
    }
    return Array.from(map.entries()).map(([nom, extras]) => ({ nom, extras }));
  });

  extrasCoches = computed(() =>
    this.extras().filter(e => this.checkedIds().has(e.id))
  );

  soustotalPizzas = computed(() => this.form.nb_personnes * PRIX_PAR_PERSONNE);

  soustotalExtras = computed(() => {
    const nb = this.form.nb_personnes;
    return this.extrasCoches().reduce(
      (acc, e) => acc + (e.type === 'par_personne' ? e.prix * nb : e.prix), 0
    );
  });

  soustotalBrut = computed(() => this.soustotalPizzas() + this.soustotalExtras());

  remise = computed(() => Math.round(this.soustotalBrut() * this.reduction() / 100));

  prixCalcule = computed(() => this.soustotalBrut() - this.remise());

  async ngOnInit() {
    await this.loadAll();
  }

  private async loadAll() {
    this.loading.set(true);
    const [commandes, clients, extras] = await Promise.all([
      this.commandesService.getAll(),
      this.clientsService.getAll(),
      this.extrasService.getAll(),
    ]);
    this.commandes.set(commandes);
    this.clients.set(clients);
    this.extras.set(extras);
    this.loading.set(false);
  }

  openCreate() {
    this.form = this.emptyForm();
    this.checkedIds.set(new Set());
    this.reduction.set(0);
    this.editingId.set(null);
    this.errorMsg.set(null);
    this.showModal.set(true);
  }

  openEdit(c: Commande) {
    this.form = {
      client_id: c.client_id,
      date_presta: c.date_presta,
      nb_personnes: c.nb_personnes,
      pizzas_prevues: c.pizzas_prevues,
      pizzas_realisees: c.pizzas_realisees,
      statut: c.statut,
      notes: c.notes ?? '',
    };
    this.checkedIds.set(new Set());
    this.reduction.set(0);
    this.editingId.set(c.id);
    this.errorMsg.set(null);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  toggleExtra(id: string) {
    this.checkedIds.update(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  isChecked(id: string): boolean {
    return this.checkedIds().has(id);
  }

  setReduction(val: number) {
    this.reduction.set(Math.min(100, Math.max(0, val || 0)));
  }

  async save() {
    this.saving.set(true);
    this.errorMsg.set(null);
    try {
      const extrasNoms = this.extrasCoches().map(e => e.nom).join(', ');
      const notesExtras = extrasNoms ? `Extras : ${extrasNoms}` : '';
      const notes = [notesExtras, this.form.notes].filter(Boolean).join('\n') || null;

      const payload = {
        ...this.form,
        prix_total: this.prixCalcule(),
        notes,
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

  prixExtraForNb(e: Extra): number {
    return e.type === 'par_personne' ? e.prix * this.form.nb_personnes : e.prix;
  }

  statutLabel(s: StatutCommande): string {
    const labels: Record<StatutCommande, string> = { devis: 'Devis', en_cours: 'En cours', confirmee: 'Confirmée', terminee: 'Terminée' };
    return labels[s];
  }

  statutClass(s: StatutCommande): string {
    const classes: Record<StatutCommande, string> = {
      devis: 'bg-stone-mid text-stone-deep',
      en_cours: 'bg-yellow-100 text-yellow-700',
      confirmee: 'bg-blue-100 text-blue-700',
      terminee: 'bg-green-100 text-green-700',
    };
    return classes[s];
  }

  private emptyForm(): CommandeForm {
    return {
      client_id: '',
      date_presta: '',
      nb_personnes: 12,
      pizzas_prevues: null,
      pizzas_realisees: null,
      statut: 'devis',
      notes: '',
    };
  }
}
