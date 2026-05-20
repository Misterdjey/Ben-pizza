import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../admin/services/supabase.service';
import { OffreWithExtras, Offre } from '../admin/models';

@Injectable({ providedIn: 'root' })
export class OffreService {
  private db = inject(SupabaseService).client;

  async getOffresWithExtras(): Promise<OffreWithExtras[]> {
    const { data, error } = await this.db
      .from('offres')
      .select('*, offre_extras(extra:extras(*))')
      .order('nom');
    if (error) throw error;

    return (data as any[]).map((o) => ({
      ...o,
      extras: (o.offre_extras ?? [])
        .map((r: { extra: any }) => r.extra)
        .filter(Boolean),
    })) as OffreWithExtras[];
  }

  getPrixParPersonne(offre: Offre, nbPersonnes: number): number {
    const tranche = offre.tranches.find(
      (t) => nbPersonnes >= t.min && (t.max === null || nbPersonnes <= t.max),
    );
    if (tranche) return tranche.prix;
    // Si aucune tranche ne correspond, prendre la dernière (plus grand volume)
    return offre.tranches[offre.tranches.length - 1]?.prix ?? 0;
  }
}
