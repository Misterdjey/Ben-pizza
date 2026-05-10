import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ClientsService } from '../services/clients.service';
import { CommandesService } from '../services/commandes.service';
import { Client, Commande } from '../models';
import { ToastService } from '../shared/toast.service';

type ClientForm = Omit<Client, 'id' | 'created_at'>;

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './clients.component.html',
})
export class ClientsComponent implements OnInit {
  private clientsService = inject(ClientsService);
  private commandesService = inject(CommandesService);
  private toastService = inject(ToastService);

  clients = signal<Client[]>([]);
  commandesByClient = signal<Record<string, Commande[]>>({});
  loading = signal(true);
  showModal = signal(false);
  editingId = signal<string | null>(null);
  detailClient = signal<Client | null>(null);
  saving = signal(false);
  errorMsg = signal<string | null>(null);

  form: ClientForm = this.emptyForm();

  caByClient = computed(() => {
    const map: Record<string, number> = {};
    for (const [id, cmds] of Object.entries(this.commandesByClient())) {
      map[id] = cmds
        .filter((c) => c.statut === 'terminee')
        .reduce((s, c) => s + Number(c.prix_total), 0);
    }
    return map;
  });

  async ngOnInit() {
    this.loading.set(true);
    const clients = await this.clientsService.getAll();
    this.clients.set(clients);
    const entries = await Promise.all(
      clients.map(async (cl) => {
        const cmds = await this.commandesService.getByClient(cl.id);
        return [cl.id, cmds] as [string, Commande[]];
      }),
    );
    this.commandesByClient.set(Object.fromEntries(entries));
    this.loading.set(false);
  }

  openCreate() {
    this.form = this.emptyForm();
    this.editingId.set(null);
    this.errorMsg.set(null);
    this.showModal.set(true);
  }

  openEdit(c: Client) {
    this.form = { ...c };
    this.editingId.set(c.id);
    this.errorMsg.set(null);
    this.showModal.set(true);
  }

  openDetail(c: Client) {
    this.detailClient.set(this.detailClient()?.id === c.id ? null : c);
  }

  closeModal() {
    this.showModal.set(false);
  }

  async save() {
    this.saving.set(true);
    this.errorMsg.set(null);
    try {
      const id = this.editingId();
      if (id) {
        const updated = await this.clientsService.update(id, this.form);
        this.clients.update((list) => list.map((c) => (c.id === id ? updated : c)));
        this.toastService.success('Client mis à jour');
      } else {
        const created = await this.clientsService.create(this.form);
        this.clients.update((list) => [...list, created]);
        this.commandesByClient.update((m) => ({ ...m, [created.id]: [] }));
        this.toastService.success('Client créé');
      }
      this.showModal.set(false);
    } catch (e: unknown) {
      this.errorMsg.set(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteClient(c: Client) {
    const cmds = this.commandesByClient()[c.id] ?? [];
    if (cmds.length > 0) {
      this.toastService.error(`Impossible de supprimer ${c.nom} : ${cmds.length} commande(s) existante(s).`);
      return;
    }
    const nom = c.prenom ? `${c.prenom} ${c.nom}` : c.nom;
    const ok = await this.toastService.confirm(`Supprimer le client ${nom} ?`);
    if (!ok) return;
    await this.clientsService.delete(c.id);
    this.clients.update((list) => list.filter((x) => x.id !== c.id));
    this.toastService.success(`${nom} supprimé`);
  }

  commandesOf(clientId: string): Commande[] {
    return this.commandesByClient()[clientId] ?? [];
  }

  private emptyForm(): ClientForm {
    return { nom: '', prenom: null, email: '', telephone: null, type: 'particulier', nom_entreprise: null, num_tva: null, notes: null };
  }
}
