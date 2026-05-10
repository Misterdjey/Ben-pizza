import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

export interface ConfirmState {
  message: string;
  resolve: (confirmed: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  confirmState = signal<ConfirmState | null>(null);

  private counter = 0;

  success(message: string) {
    this.add('success', message);
  }

  error(message: string) {
    this.add('error', message);
  }

  confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmState.set({ message, resolve });
    });
  }

  resolveConfirm(value: boolean) {
    this.confirmState()?.resolve(value);
    this.confirmState.set(null);
  }

  dismiss(id: number) {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private add(type: ToastType, message: string) {
    const id = ++this.counter;
    this.toasts.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 3500);
  }
}
