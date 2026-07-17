import { Component, inject } from "@angular/core";
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: "app-toast",
  standalone: true,
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all"
          [class]="getClass(toast.type)">
          @if (toast.type === "success") { <span class="text-lg">✓</span> }
          @if (toast.type === "error")   { <span class="text-lg">✕</span> }
          @if (toast.type === "loading") {
            <span class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"></span>
          }
          @if (toast.type === "info") { <span class="text-lg">ℹ</span> }
          <span class="flex-1">{{ toast.message }}</span>
          @if (toast.type !== "loading") {
            <button (click)="toastService.dismiss(toast.id)" class="opacity-60 hover:opacity-100 text-lg leading-none">×</button>
          }
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);

  getClass(type: string): string {
    const map: Record<string, string> = {
      success: "bg-success-50 border-success-200 text-success-800",
      error:   "bg-danger-50 border-danger-200 text-danger-800",
      loading: "bg-blue-50 border-blue-200 text-blue-800",
      info:    "bg-gray-50 border-gray-200 text-gray-800",
    };
    return map[type] ?? map["info"];
  }
}