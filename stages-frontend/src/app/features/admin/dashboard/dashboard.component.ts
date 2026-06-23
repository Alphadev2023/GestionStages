import { Component, OnInit, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { ReportingService } from "../../../core/services/reporting.service";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, RouterLink],
  template: `
    <app-sidebar />
    <div class="ml-64 min-h-screen bg-gray-50">
      <app-navbar title="Administration" />
      <main class="p-6">

        <!-- KPI -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <p class="text-sm font-medium text-gray-500">Total offres</p>
              <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <span class="text-primary-600 font-bold text-sm">OF</span>
              </div>
            </div>
            <p class="text-3xl font-bold text-gray-900">{{ stats()["totalOffres"] ?? 0 }}</p>
            <p class="text-xs text-gray-400 mt-1">Offres publiees sur la plateforme</p>
          </div>

          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <p class="text-sm font-medium text-gray-500">Candidatures</p>
              <div class="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                <span class="text-warning-600 font-bold text-sm">CA</span>
              </div>
            </div>
            <p class="text-3xl font-bold text-gray-900">{{ stats()["totalCandidatures"] ?? 0 }}</p>
            <p class="text-xs text-gray-400 mt-1">Candidatures deposees</p>
          </div>

          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <p class="text-sm font-medium text-gray-500">Conventions</p>
              <div class="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <span class="text-success-600 font-bold text-sm">CV</span>
              </div>
            </div>
            <p class="text-3xl font-bold text-gray-900">{{ stats()["totalConventions"] ?? 0 }}</p>
            <p class="text-xs text-gray-400 mt-1">Conventions en cours</p>
          </div>
        </div>

        <!-- Utilisateurs par role -->
        <div class="grid grid-cols-2 gap-6 mb-6">
          <div class="card">
            <h3 class="font-semibold text-gray-900 mb-4">Utilisateurs par role</h3>
            <div class="space-y-3">
              @for (r of rolesStats(); track r.role) {
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-600">{{ r.role }}</span>
                    <span class="font-medium text-gray-900">{{ r.count }}</span>
                  </div>
                  <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500"
                      [class]="r.color"
                      [style.width]="getBarWidth(r.count)">
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="card">
            <h3 class="font-semibold text-gray-900 mb-4">Acces rapides</h3>
            <div class="space-y-3">
              <a routerLink="/admin/utilisateurs"
                class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span class="text-blue-600 text-xs font-bold">US</span>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">Gerer les utilisateurs</p>
                  <p class="text-xs text-gray-500">{{ totalUsers() }} comptes enregistres</p>
                </div>
              </a>
              <a routerLink="/admin/reporting"
                class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span class="text-green-600 text-xs font-bold">RP</span>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">Reporting et exports</p>
                  <p class="text-xs text-gray-500">Statistiques et fichiers Excel</p>
                </div>
              </a>
            </div>
          </div>
        </div>

      </main>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  stats      = signal<Record<string, number>>({});
  rolesStats = signal<{ role: string; count: number; color: string }[]>([]);
  totalUsers = signal(0);

  constructor(
    private reportingService: ReportingService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.reportingService.getStatistiques().subscribe(res => {
      this.stats.set(res.data);
    });

    this.http.get<any>("http://localhost:8082/api/users/contacts").subscribe({
      next: res => {
        const users = res.data || [];
        this.totalUsers.set(users.length);
        const roles = [
          { role: "ETUDIANT",   color: "bg-blue-500"   },
          { role: "ENTREPRISE", color: "bg-green-600"  },
          { role: "ENSEIGNANT", color: "bg-purple-600" },
          { role: "ADMIN",      color: "bg-red-600"    },
        ];
        this.rolesStats.set(roles.map(r => ({
          ...r,
          count: users.filter((u: any) => u.role === r.role).length
        })));
      }
    });
  }

  getBarWidth(count: number): string {
    const max = Math.max(...this.rolesStats().map(r => r.count), 1);
    return Math.round((count / max) * 100) + "%";
  }
}
