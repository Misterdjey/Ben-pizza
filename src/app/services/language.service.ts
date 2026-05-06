import { Injectable, signal, computed } from '@angular/core';
import { translations, Lang } from '../i18n/translations';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  lang = signal<Lang>('fr');
  t = computed(() => translations[this.lang()]);

  toggle() {
    this.lang.update(l => (l === 'fr' ? 'en' : 'fr'));
  }
}
