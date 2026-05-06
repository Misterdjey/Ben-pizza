import { Component, OnInit, inject } from '@angular/core';
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
  pizzas: Pizza[] = [];
  categories = [
    'Base sauce tomate',
    'Base creme fraiche',
    'Spécialités du chef',
    'Sans fromage',
    'Desserts',
  ];
  selectedCategory = 'all';

  constructor(private pizzaService: PizzaService) {}

  ngOnInit() {
    this.pizzaService.getPizzas().subscribe({
      next: (response) => { this.pizzas = response.pizzas; },
      error: (error) => { console.error('Erreur lors du chargement des pizzas:', error); },
    });
  }

  get filteredPizzas() {
    if (this.selectedCategory === 'all') return this.pizzas;
    return this.pizzas.filter(pizza => pizza.category === this.selectedCategory);
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }
}
