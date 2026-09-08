import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";

interface Utilisateur {
  id: number;
  nomComplet: string;
  email: string;
  role: string;
  nomEntreprise?: string;
  actif: boolean;
}

@Component({
  selector: "app-utilisateurs",
  standalone: true,
  imports: [FormsModule, SidebarComponent, NavbarComponent],
  template: `
    <app-sidebar />
    <div class="ml-64 min-h-screen bg-gray-50">
      <app-navbar title="Gestion des utilisateurs" />
      <main class="p-6">

        <div class="grid grid-cols-4 gap-4 mb-6">
          @for (r of rolesStats(); track r.role) {
            <div class="card text-center py-4 cursor-pointer hover:shadow-md transition-shadow"
              (click)="setFiltreRole(r.role)">
              <div class="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg"
                [class]="getRoleColor(r.role)">
                {{ r.count }}
              </div>
              <p class="text-sm font-medium text-gray-700">{{ r.role }}</p>
            </div>
          }
        </div>

        <div class="card mb-4 flex gap-4 items-center">
          <input [(ngModel)]="recherche" (ngModelChange)="filtrer()"
            placeholder="Rechercher par nom ou email..."
            class="input-field flex-1" />
          <select [(ngModel)]="filtreRole" (ngModelChange)="filtrer()" class="input-field w-44">
            <option value="">Tous les roles</option>
            <option value="ETUDIANT">Etudiant</option>
            <option value="ENTREPRISE">Entreprise</option>
            <option value="ENSEIGNANT">Enseignant</option>
            <option value="ADMIN">Admin</option>
          </select>
          <span class="text-sm text-gray-500 shrink-0">
            {{ utilisateursFiltres().length }} / {{ tous().length }} utilisateur(s)
          </span>
        </div>

        <div class="card overflow-hidden p-0">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Detail</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (u of utilisateursFiltres(); track u.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        [class]="getRoleColor(u.role)">
                        {{ u.nomComplet.charAt(0).toUpperCase() }}
                      </div>
                      <span class="text-sm font-medium" [class]="u.actif ? activeText : inactiveText">
                        {{ u.nomComplet }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ u.email }}</td>
                  <td class="px-6 py-4">
                    <span [class]="getRoleBadge(u.role)">{{ u.role }}</span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ u.nomEntreprise ?? "—" }}</td>
                  <td class="px-6 py-4">
                    @if (u.actif) {
                      <span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success-700">
                        Actif
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-danger-100 text-danger-700">
                        Inactif
                      </span>
                    }
                  </td>
                  <td class="px-6 py-4">
                    @if (u.role !== "ADMIN") {
                      <button (click)="toggleActif(u)"
                        [class]="u.actif ? btnDesactiver : btnActiver">
                        {{ u.actif ? "Desactiver" : "Activer" }}
                      </button>
                    } @else {
                      <span class="text-xs text-gray-400">—</span>
                    }
                  </td>
                </tr>
              }
              @empty {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-gray-400">Aucun utilisateur</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (message()) {
          <div class="fixed bottom-4 right-4 bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-lg z-50">
            {{ message() }}
          </div>
        }
      </main>
    </div>
  `
})
export class UtilisateursComponent implements OnInit {
  tous                = signal<Utilisateur[]>([]);
  utilisateursFiltres = signal<Utilisateur[]>([]);
  rolesStats          = signal<{ role: string; count: number }[]>([]);
  message             = signal("");
  recherche  = "";
  filtreRole = "";

  readonly btnDesactiver = "text-xs px-3 py-1.5 rounded-lg border border-danger-300 text-danger-600 hover:bg-danger-50 transition-colors";
  readonly btnActiver    = "text-xs px-3 py-1.5 rounded-lg border border-success-300 text-success-600 hover:bg-success-50 transition-colors";
  readonly activeText    = "text-gray-900";
  readonly inactiveText  = "text-gray-400 line-through";

  constructor(private http: HttpClient) {}

  ngOnInit() { this.charger(); }

  charger() {
    this.http.get<any>("/api/users/all").subscribe({
      next: res => {
        const users: Utilisateur[] = res.data || [];
        this.tous.set(users);
        this.filtrer();
        this.calculerStats(users);
      }
    });
  }

  calculerStats(users: Utilisateur[]) {
    const roles = ["ETUDIANT", "ENTREPRISE", "ENSEIGNANT", "ADMIN"];
    this.rolesStats.set(roles.map(r => ({
      role: r,
      count: users.filter(u => u.role === r).length
    })));
  }

  setFiltreRole(role: string) {
    this.filtreRole = this.filtreRole === role ? "" : role;
    this.filtrer();
  }

  filtrer() {
    const r = this.recherche.toLowerCase();
    this.utilisateursFiltres.set(
      this.tous().filter(u =>
        (!this.filtreRole || u.role === this.filtreRole) &&
        (!r || u.nomComplet.toLowerCase().includes(r) || u.email.toLowerCase().includes(r))
      )
    );
  }

  toggleActif(u: Utilisateur) {
    this.http.patch<any>(`/api/users/${u.id}/toggle-actif`, {}).subscribe({
      next: res => {
        u.actif = !u.actif;
        this.tous.update(list => [...list]);
        this.filtrer();
        this.calculerStats(this.tous());
        this.showMessage(res.data);
      },
      error: () => this.showMessage("Erreur lors de la modification")
    });
  }

  showMessage(msg: string) {
    this.message.set(msg);
    setTimeout(() => this.message.set(""), 3000);
  }

  getRoleColor(role: string): string {
    const map: Record<string, string> = {
      ETUDIANT: "bg-blue-500", ENTREPRISE: "bg-green-600",
      ENSEIGNANT: "bg-purple-600", ADMIN: "bg-red-600"
    };
    return map[role] ?? "bg-gray-500";
  }

  getRoleBadge(role: string): string {
    const map: Record<string, string> = {
      ETUDIANT:   "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700",
      ENTREPRISE: "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700",
      ENSEIGNANT: "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700",
      ADMIN:      "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700",
    };
    return map[role] ?? "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700";
  }
}
