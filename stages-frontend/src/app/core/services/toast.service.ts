import { Injectable, signal } from "@angular/core";

export interface Toast {
  id: number;
  type: "success" | "error" | "loading" | "info";
  message: string;
}

@Injectable({ providedIn: "root" })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private counter = 0;

  success(message: string, duration = 4000): number {
    return this.add({ type: "success", message }, duration);
  }

  error(message: string, duration = 5000): number {
    return this.add({ type: "error", message }, duration);
  }

  loading(message: string): number {
    return this.add({ type: "loading", message }, 0);
  }

  dismiss(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private add(toast: Omit<Toast, "id">, duration: number): number {
    const id = ++this.counter;
    this.toasts.update(list => [...list, { ...toast, id }]);
    if (duration > 0) setTimeout(() => this.dismiss(id), duration);
    return id;
  }
}