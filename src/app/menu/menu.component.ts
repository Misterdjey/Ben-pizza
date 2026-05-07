import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { PizzaService, Pizza } from '../services/pizza.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent implements OnInit {
  protected t = inject(LanguageService).t;
  private pizzaService = inject(PizzaService);

  pizzas = signal<Pizza[]>([]);
  selectedCategory = signal('all');

  categories = [
    'Base sauce tomate',
    'Base creme fraiche',
    'Spécialités du chef',
    'Sans fromage',
    'Desserts',
  ];

  filteredPizzas = computed(() => {
    if (this.selectedCategory() === 'all') return this.pizzas();
    return this.pizzas().filter(p => p.category === this.selectedCategory());
  });

  ngOnInit() {
    this.pizzaService.getPizzas().subscribe({
      next: (response) => { this.pizzas.set(response.pizzas); },
      error: (error) => { console.error('Erreur lors du chargement des pizzas:', error); },
    });
  }

  selectCategory(category: string) {
    this.selectedCategory.set(category);
  }
}
