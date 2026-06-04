import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../admin/services/supabase.service';
import { Extra } from '../admin/models';

interface CatGroup { nom: string; extras: Extra[] }

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent implements OnInit {
  private db = inject(SupabaseService).client;

  loading = signal(true);
  private extrasRaw = signal<Extra[]>([]);

  categories = computed<CatGroup[]>(() => {
    const map = new Map<string, Extra[]>();
    for (const e of this.extrasRaw()) {
      const list = map.get(e.categorie) ?? [];
      list.push(e);
      map.set(e.categorie, list);
    }
    return Array.from(map.entries()).map(([nom, extras]) => ({ nom, extras }));
  });

  async ngOnInit() {
    const { data, error } = await this.db
      .from('extras')
      .select('*')
      .eq('actif', true)
      .order('ordre', { ascending: true })
      .order('nom', { ascending: true });
    if (!error) this.extrasRaw.set(data as Extra[]);
    this.loading.set(false);
  }
}
