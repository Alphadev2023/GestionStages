import { Component, computed, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { Role } from "../../../core/models/auth.model";

interface NavItem { label: string; path: string; }

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="fixed inset-y-0 left-0 w-64 bg-sidebar text-white flex flex-col z-50">
      <div class="px-6 py-5 border-b border-white/10">
        <h1 class="text-lg font-bold tracking-tight">GestionStages</h1>
        <p class="text-xs text-white/50 mt-0.5">{{ auth.user()?.role }}</p>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        @for (item of navItems(); track item.path) {
          <a [routerLink]="item.path" routerLinkActive="bg-white/10"
             class="flex items-center px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium">
            {{ item.label }}
          </a>
        }
      </nav>

      <div class="px-3 py-4 border-t border-white/10">
        <div class="flex items-center gap-3 px-3 py-2 mb-2">
          <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold">
            {{ initiales() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ auth.user()?.prenom }} {{ auth.user()?.nom }}</p>
            <p class="text-xs text-white/50 truncate">{{ auth.user()?.email }}</p>
          </div>
        </div>
        <button (click)="auth.logout()"
          class="w-full text-left px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
          Deconnexion
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  auth = inject(AuthService);

  initiales = computed(() => {
    const u = this.auth.user();
    return u ? (u.prenom[0] + u.nom[0]).toUpperCase() : "";
  });

  navItems = computed<NavItem[]>(() => {
    const role = this.auth.role();
    const map: Record<string, NavItem[]> = {
      ETUDIANT: [
        { label: "Tableau de bord",  path: "/etudiant/dashboard" },
        { label: "Offres de stage",  path: "/etudiant/offres" },
        { label: "Mes candidatures", path: "/etudiant/candidatures" },
        { label: "Messagerie",       path: "/messagerie" },
      ],
      ENTREPRISE: [
        { label: "Tableau de bord", path: "/entreprise/dashboard" },
        { label: "Mes offres",       path: "/entreprise/offres" },
        { label: "Candidatures",     path: "/entreprise/candidatures" },
        { label: "Messagerie",       path: "/messagerie" },
      ],
      ENSEIGNANT: [
        { label: "Tableau de bord", path: "/enseignant/dashboard" },
        { label: "Conventions",      path: "/enseignant/conventions" },
      ],
      ADMIN: [
        { label: "Tableau de bord", path: "/admin/dashboard" },
        { label: "Utilisateurs",    path: "/admin/utilisateurs" },
        { label: "Conventions",     path: "/admin/conventions" },
        { label: "Reporting",       path: "/admin/reporting" },
      ],
    };
    return role ? (map[role] ?? []) : [];
  });
}
