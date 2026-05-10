import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastComponent } from '../shared/toast.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './layout.component.html',
})
export class AdminLayoutComponent {
  protected auth = inject(AuthService);
  protected sidebarOpen = signal(false);

  readonly navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊', exact: true },
    { path: '/admin/commandes', label: 'Commandes', icon: '📋', exact: false },
    { path: '/admin/clients', label: 'Clients', icon: '👥', exact: false },
    { path: '/admin/offres', label: 'Offres', icon: '💶', exact: false },
    { path: '/admin/ingredients', label: 'Ingrédients', icon: '🧄', exact: false },
  ];

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }
}
