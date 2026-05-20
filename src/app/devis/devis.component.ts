import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OffreService } from '../services/offre.service';
import { SupabaseService } from '../admin/services/supabase.service';
import { OffreWithExtras, Extra } from '../admin/models';

interface SelectedOffreEntry {
  offre: OffreWithExtras;
  selectedExtras: Extra[];
}

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
  private route = inject(ActivatedRoute);
  private offreService = inject(OffreService);
  private db = inject(SupabaseService).client;

  offres = signal<OffreWithExtras[]>([]);
  loading = signal(true);
  submitting = signal(false);
  submitted = signal(false);
  errorMsg = signal<string | null>(null);

  guests = signal<number>(12);
  selectedOffres = signal<SelectedOffreEntry[]>([]);
  addOffreId = '';

  readonly genericIncludes = [
    'Matériel professionnel sur place',
    'Pâte fermentée 72h',
    'Service en flux continu',
    'Déplacement Île-de-France',
  ];

  form: DevisForm = { prenom: '', nom: '', email: '', ville: '', date: '', commentaire: '' };

  estimation = computed(() => {
    const nb = this.guests();
    if (!nb || !this.selectedOffres().length) return null;
    return this.selectedOffres().map(({ offre, selectedExtras }) => {
      const prixUnitaire = this.offreService.getPrixParPersonne(offre, nb);
      const base = prixUnitaire * nb;
      const extras = selectedExtras.reduce(
        (acc, e) => acc + (e.type === 'par_personne' ? e.prix * nb : e.prix), 0,
      );
      return { nom: offre.nom, base, extras, total: base + extras };
    });
  });

  estimationTotal = computed(() =>
    this.estimation()?.reduce((acc, o) => acc + o.total, 0) ?? 0,
  );

  async ngOnInit() {
    const offres = await this.offreService.getOffresWithExtras();
    this.offres.set(offres);
    if (offres.length > 0) this.addOffreId = offres[0].id;
    const offreId = this.route.snapshot.queryParamMap.get('offre');
    if (offreId) {
      const found = offres.find(o => o.id === offreId);
      if (found) this.selectedOffres.set([{ offre: found, selectedExtras: [] }]);
    }
    this.loading.set(false);
  }

  setGuests(nb: number) {
    this.guests.set(nb);
  }

  addOffre() {
    const offre = this.offres().find(o => o.id === this.addOffreId);
    if (!offre) return;
    if (this.selectedOffres().find(s => s.offre.id === offre.id)) return;
    this.selectedOffres.update(list => [...list, { offre, selectedExtras: [] }]);
  }

  removeOffre(offreId: string) {
    this.selectedOffres.update(list => list.filter(s => s.offre.id !== offreId));
  }

  toggleExtra(offreId: string, extra: Extra) {
    this.selectedOffres.update(list =>
      list.map(s => {
        if (s.offre.id !== offreId) return s;
        const has = s.selectedExtras.find(e => e.id === extra.id);
        return {
          ...s,
          selectedExtras: has
            ? s.selectedExtras.filter(e => e.id !== extra.id)
            : [...s.selectedExtras, extra],
        };
      }),
    );
  }

  isExtraSelected(offreId: string, extra: Extra): boolean {
    return !!this.selectedOffres().find(s => s.offre.id === offreId)
      ?.selectedExtras.find(e => e.id === extra.id);
  }

  extrasByCategorie(offre: OffreWithExtras) {
    const map = new Map<string, Extra[]>();
    for (const e of offre.extras) {
      const list = map.get(e.categorie) ?? [];
      list.push(e);
      map.set(e.categorie, list);
    }
    return Array.from(map.entries()).map(([nom, items]) => ({ nom, items }));
  }

  premierPrix(offre: OffreWithExtras): number {
    return offre.tranches[0]?.prix ?? 0;
  }

  async submit() {
    if (!this.form.prenom || !this.form.nom || !this.form.email || this.guests() < 1) {
      this.errorMsg.set('Merci de renseigner prénom, nom, email et nombre de convives.');
      return;
    }
    if (!this.selectedOffres().length) {
      this.errorMsg.set('Merci d\'ajouter au moins une offre.');
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

      const est = this.estimation() ?? [];
      for (const { offre, selectedExtras } of this.selectedOffres()) {
        const ligne = est.find(l => l.nom === offre.nom);
        const extrasNoms = selectedExtras.map(e => e.nom).join(', ');
        const notes = [
          this.form.date ? `Date souhaitée : ${this.form.date}` : null,
          extrasNoms ? `Extras : ${extrasNoms}` : null,
          this.form.commentaire || null,
        ].filter(Boolean).join('\n');

        const { error: cmdError } = await this.db.from('commandes').insert({
          client_id: clientData.id,
          offre_id: offre.id,
          nb_personnes: this.guests(),
          prix_total: ligne?.total ?? 0,
          statut: 'devis',
          notes: notes || null,
          date_presta: this.form.date || null,
        });
        if (cmdError) throw cmdError;
      }

      // TODO: notification email via Resend
      console.log('Devis soumis — notification email à implémenter');
      this.submitted.set(true);
    } catch (e: unknown) {
      this.errorMsg.set(e instanceof Error ? e.message : 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      this.submitting.set(false);
    }
  }
}
