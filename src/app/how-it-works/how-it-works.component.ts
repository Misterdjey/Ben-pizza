import { Component, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-how-it-works',
  imports: [],
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.css',
})
export class HowItWorksComponent {
  protected t = inject(LanguageService).t;
  protected stepIcons = ['📞', '📋', '👨‍🍳', '🎉'];
}
