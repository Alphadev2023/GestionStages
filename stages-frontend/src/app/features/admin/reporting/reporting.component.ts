import { Component, OnInit, signal } from "@angular/core";
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { ReportingService } from "../../../core/services/reporting.service";

@Component({
  selector: "app-reporting",
  standalone: true,
  imports: [SidebarComponent, NavbarComponent],
  template: `
    <app-sidebar />
    <div class="ml-64 min-h-screen bg-gray-50">
      <app-navbar title="Reporting et statistiques" />
      <main class="p-6">

        <!-- KPIs -->
        <div class="grid grid-cols-3 gap-6 mb-6">
          @for (stat of stats(); track stat.label) {
            <div class="card">
              <p class="text-sm font-medium text-gray-500 mb-2">{{ stat.label }}</p>
              <p class="text-4xl font-bold mb-1" [class]="stat.color">{{ stat.value }}</p>
              <div class="h-1 rounded-full mt-3" [class]="stat.barColor"></div>
            </div>
          }
        </div>

        <!-- Taux conversion -->
        <div class="card mb-6">
          <h3 class="font-semibold text-gray-900 mb-4">Taux de conversion</h3>
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center p-4 bg-gray-50 rounded-xl">
              <p class="text-2xl font-bold text-primary-600">{{ tauxCandidature() }}%</p>
              <p class="text-xs text-gray-500 mt-1">Candidatures / Offres</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-xl">
              <p class="text-2xl font-bold text-success-600">{{ tauxConvention() }}%</p>
              <p class="text-xs text-gray-500 mt-1">Conventions / Candidatures</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-xl">
              <p class="text-2xl font-bold text-warning-600">{{ tauxGlobal() }}%</p>
              <p class="text-xs text-gray-500 mt-1">Taux global de placement</p>
            </div>
          </div>
        </div>

        <!-- Export -->
        <div class="card">
          <h3 class="font-semibold text-gray-900 mb-2">Exports de donnees</h3>
          <p class="text-sm text-gray-500 mb-4">Telecharger les donnees au format Excel pour analyse</p>
          <div class="flex gap-3">
            <button (click)="exporterExcel()" [disabled]="exporting()"
              class="btn-primary flex items-center gap-2">
              @if (exporting()) {
                <span>Export en cours...</span>
              } @else {
                <span>Exporter les stages (Excel)</span>
              }
            </button>
          </div>
          @if (exportSuccess()) {
            <p class="text-sm text-success-600 mt-3">Fichier telecharge avec succes</p>
          }
        </div>

      </main>
    </div>
  `
})
export class ReportingComponent implements OnInit {
  stats         = signal<{ label: string; value: number; color: string; barColor: string }[]>([]);
  exporting     = signal(false);
  exportSuccess = signal(false);

  private rawStats: Record<string, number> = {};

  constructor(private service: ReportingService) {}

  ngOnInit() {
    this.service.getStatistiques().subscribe(res => {
      this.rawStats = res.data;
      this.stats.set([
        {
          label: "Offres publiees",
          value: res.data["totalOffres"] ?? 0,
          color: "text-primary-600",
          barColor: "bg-primary-600"
        },
        {
          label: "Candidatures deposees",
          value: res.data["totalCandidatures"] ?? 0,
          color: "text-warning-600",
          barColor: "bg-warning-600"
        },
        {
          label: "Conventions signees",
          value: res.data["totalConventions"] ?? 0,
          color: "text-success-600",
          barColor: "bg-success-600"
        },
      ]);
    });
  }

  tauxCandidature(): number {
    const offres = this.rawStats["totalOffres"] ?? 0;
    const cands  = this.rawStats["totalCandidatures"] ?? 0;
    if (offres === 0) return 0;
    return Math.round((cands / offres) * 100);
  }

  tauxConvention(): number {
    const cands = this.rawStats["totalCandidatures"] ?? 0;
    const convs = this.rawStats["totalConventions"] ?? 0;
    if (cands === 0) return 0;
    return Math.round((convs / cands) * 100);
  }

  tauxGlobal(): number {
    const offres = this.rawStats["totalOffres"] ?? 0;
    const convs  = this.rawStats["totalConventions"] ?? 0;
    if (offres === 0) return 0;
    return Math.round((convs / offres) * 100);
  }

  exporterExcel() {
    this.exporting.set(true);
    this.exportSuccess.set(false);
    this.service.exporterExcel().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "stages_" + new Date().toISOString().slice(0, 10) + ".xlsx";
        a.click();
        URL.revokeObjectURL(url);
        this.exporting.set(false);
        this.exportSuccess.set(true);
        setTimeout(() => this.exportSuccess.set(false), 3000);
      },
      error: () => this.exporting.set(false)
    });
  }
}
