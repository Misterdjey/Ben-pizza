import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OffreService } from '../services/offre.service';
import { SupabaseService } from '../admin/services/supabase.service';
import { OffreWithExtras, Extra } from '../admin/models';
import { CurrencyPipe } from '@angular/common';

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
  imports: [FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './devis.component.html',
  styleUrl: './devis.component.css',
})
export class DevisComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private offreService = inject(OffreService);
  private db = inject(SupabaseService).client;

  offres = signal<OffreWithExtras[]>([]);
  offre = signal<OffreWithExtras | null>(null);
  loading = signal(true);
  submitting = signal(false);
  submitted = signal(false);
  errorMsg = signal<string | null>(null);

  guests = signal<number>(0);
  selectedExtras = signal<Extra[]>([]);

  readonly guestOptions = [4, 6, 8, 10, 12, 15];

  form: DevisForm = {
    prenom: '',
    nom: '',
    email: '',
    ville: '',
    date: '',
    commentaire: '',
  };

  extrasByCategorie = computed(() => {
    const o = this.offre();
    if (!o) return [];
    const map = new Map<string, Extra[]>();
    for (const e of o.extras) {
      const list = map.get(e.categorie) ?? [];
      list.push(e);
      map.set(e.categorie, list);
    }
    return Array.from(map.entries()).map(([categorie, items]) => ({ categorie, items }));
  });

  estimation = computed(() => {
    const nb = this.guests();
    const o = this.offre();
    if (!nb || !o) return null;
    const prixUnitaire = this.offreService.getPrixParPersonne(o, nb);
    const base = prixUnitaire * nb;
    const extrasTotal = this.selectedExtras().reduce((acc, e) => {
      return acc + (e.type === 'par_personne' ? e.prix * nb : e.prix);
    }, 0);
    return { base, extras: extrasTotal, total: base + extrasTotal, prixUnitaire };
  });

  async ngOnInit() {
    const offres = await this.offreService.getOffresWithExtras();
    this.offres.set(offres);
    const offreId = this.route.snapshot.queryParamMap.get('offre');
    const found = offreId ? offres.find((o) => o.id === offreId) : offres[0];
    this.offre.set(found ?? offres[0] ?? null);
    this.loading.set(false);
  }

  setGuests(nb: number) {
    this.guests.set(nb);
  }

  toggleExtra(extra: Extra) {
    const current = this.selectedExtras();
    if (current.find((e) => e.id === extra.id)) {
      this.selectedExtras.set(current.filter((e) => e.id !== extra.id));
    } else {
      this.selectedExtras.set([...current, extra]);
    }
  }

  isExtraSelected(extra: Extra): boolean {
    return !!this.selectedExtras().find((e) => e.id === extra.id);
  }

  formatEstimationDetail(): string {
    const est = this.estimation();
    const nb = this.guests();
    if (!est) return '';
    let detail = `${nb} pers. · offre ${est.base} €`;
    if (est.extras > 0) detail += ` + extras ${est.extras} €`;
    return detail;
  }

  async submit() {
    if (!this.form.prenom || !this.form.nom || !this.form.email || !this.guests()) {
      this.errorMsg.set('Merci de renseigner prénom, nom, email et nombre de convives.');
      return;
    }
    this.submitting.set(true);
    this.errorMsg.set(null);
    try {
      const offre = this.offre()!;
      const est = this.estimation();

      // Upsert client
      const { data: clientData, error: clientError } = await this.db
        .from('clients')
        .upsert(
          {
            email: this.form.email,
            prenom: this.form.prenom,
            nom: this.form.nom,
            type: 'particulier',
          },
          { onConflict: 'email', ignoreDuplicates: false },
        )
        .select()
        .single();
      if (clientError) throw clientError;

      // Construire les notes
      const extrasNoms = this.selectedExtras().map((e) => e.nom).join(', ');
      const notes = [
        this.form.date ? `Date souhaitée : ${this.form.date}` : null,
        extrasNoms ? `Extras : ${extrasNoms}` : null,
        this.form.commentaire || null,
      ]
        .filter(Boolean)
        .join('\n');

      // Créer la commande
      const { error: cmdError } = await this.db.from('commandes').insert({
        client_id: clientData.id,
        offre_id: offre.id,
        nb_personnes: this.guests(),
        prix_total: est?.total ?? 0,
        statut: 'devis',
        notes: notes || null,
        date_presta: this.form.date || null,
      });
      if (cmdError) throw cmdError;

      // TODO: envoyer notification email via Supabase Edge Function ou Resend
      console.log('Devis soumis — notification email à implémenter');

      this.submitted.set(true);
    } catch (e: unknown) {
      this.errorMsg.set(e instanceof Error ? e.message : 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      this.submitting.set(false);
    }
  }
}
