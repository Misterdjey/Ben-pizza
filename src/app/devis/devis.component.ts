import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../admin/services/supabase.service';
import { Extra } from '../admin/models';

const PRIX_PAR_PERSONNE = 26;
const MIN_PERSONNES = 12;

interface CatGroup { nom: string; extras: Extra[] }

interface DevisForm {
  prenom: string;
  nom: string;
  email: string;
  ville: string;
  date: string;
  commentaire: string;
}

@Component({
  selector: 'app-devis',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './devis.component.html',
  styleUrl: './devis.component.css',
})
export class DevisComponent implements OnInit {
  private db = inject(SupabaseService).client;

  readonly prixParPersonne = PRIX_PAR_PERSONNE;
  readonly minPersonnes = MIN_PERSONNES;

  loading = signal(true);
  submitting = signal(false);
  submitted = signal(false);
  errorMsg = signal<string | null>(null);

  guests = signal<number>(MIN_PERSONNES);
  private checkedIds = signal<Set<string>>(new Set());
  private extrasAll = signal<Extra[]>([]);

  categories = computed<CatGroup[]>(() => {
    const map = new Map<string, Extra[]>();
    for (const e of this.extrasAll()) {
      const list = map.get(e.categorie) ?? [];
      list.push(e);
      map.set(e.categorie, list);
    }
    return Array.from(map.entries()).map(([nom, extras]) => ({ nom, extras }));
  });

  extrasCoches = computed(() =>
    this.extrasAll().filter(e => this.checkedIds().has(e.id))
  );

  soustotalExtras = computed(() => {
    const nb = this.guests();
    return this.extrasCoches().reduce(
      (acc, e) => acc + (e.type === 'par_personne' ? e.prix * nb : e.prix),
      0,
    );
  });

  totalPizzas = computed(() => this.guests() * PRIX_PAR_PERSONNE);

  totalGeneral = computed(() => this.totalPizzas() + this.soustotalExtras());

  form: DevisForm = { prenom: '', nom: '', email: '', ville: '', date: '', commentaire: '' };

  async ngOnInit() {
    const { data, error } = await this.db
      .from('extras')
      .select('*')
      .eq('actif', true)
      .order('ordre', { ascending: true })
      .order('nom', { ascending: true });
    if (!error) this.extrasAll.set(data as Extra[]);
    this.loading.set(false);
  }

  setGuests(val: number) {
    this.guests.set(Math.max(MIN_PERSONNES, val || MIN_PERSONNES));
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

  prixExtra(extra: Extra): number {
    return extra.type === 'par_personne' ? extra.prix * this.guests() : extra.prix;
  }

  async submit() {
    if (!this.form.prenom || !this.form.nom || !this.form.email) {
      this.errorMsg.set('Merci de renseigner prénom, nom et email.');
      return;
    }
    this.submitting.set(true);
    this.errorMsg.set(null);
    try {
      const { data: clientData, error: clientError } = await this.db
        .from('clients')
        .upsert(
          { email: this.form.email, prenom: this.form.prenom, nom: this.form.nom, type: 'particulier' },
          { onConflict: 'email', ignoreDuplicates: false },
        )
        .select()
        .single();
      if (clientError) throw clientError;

      const extrasNoms = this.extrasCoches().map(e => e.nom).join(', ');
      const notes = [
        this.form.date ? `Date souhaitée : ${this.form.date}` : null,
        extrasNoms ? `Extras : ${extrasNoms}` : null,
        this.form.commentaire || null,
      ].filter(Boolean).join('\n');

      const { error: cmdError } = await this.db.from('commandes').insert({
        client_id: clientData.id,
        nb_personnes: this.guests(),
        prix_total: this.totalGeneral(),
        statut: 'devis',
        notes: notes || null,
        date_presta: this.form.date || null,
      });
      if (cmdError) throw cmdError;

      this.submitted.set(true);
    } catch (e: unknown) {
      this.errorMsg.set(e instanceof Error ? e.message : 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      this.submitting.set(false);
    }
  }
}
