import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'commandes',
        loadComponent: () =>
          import('./commandes/commandes.component').then(
            (m) => m.CommandesComponent,
          ),
      },
      {
        path: 'commandes/:id/depenses',
        loadComponent: () =>
          import('./depenses/depenses.component').then(
            (m) => m.DepensesComponent,
          ),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./clients/clients.component').then((m) => m.ClientsComponent),
      },
      {
        path: 'offres',
        loadComponent: () =>
          import('./offres/offres.component').then((m) => m.OffresComponent),
      },
      {
        path: 'ingredients',
        loadComponent: () =>
          import('./ingredients/ingredients.component').then(
            (m) => m.IngredientsComponent,
          ),
      },
      {
        path: 'recettes',
        loadComponent: () =>
          import('./recettes/recettes.component').then(
            (m) => m.RecettesComponent,
          ),
      },
      {
        path: 'recettes/new',
        loadComponent: () =>
          import('./recettes/recette-detail/recette-detail.component').then(
            (m) => m.RecetteDetailComponent,
          ),
      },
      {
        path: 'recettes/:id',
        loadComponent: () =>
          import('./recettes/recette-detail/recette-detail.component').then(
            (m) => m.RecetteDetailComponent,
          ),
      },
    ],
  },
];
