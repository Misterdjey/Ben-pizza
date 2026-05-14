import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ToastService } from '../shared/toast.service';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges()) return true;
  const toast = inject(ToastService);
  return toast.confirm('Des modifications non enregistrées seront perdues. Quitter quand même ?');
};
