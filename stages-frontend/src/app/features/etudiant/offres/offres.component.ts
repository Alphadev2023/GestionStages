import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { OffreService } from "../../../core/services/offre.service";
import { CandidatureService } from "../../../core/services/candidature.service";
import { OffreResponse, Domaine } from "../../../core/models/offre.model";
import { PageResponse } from "../../../core/models/api.model";

@Component({
  selector: "app-offres",
  standalone: true,
  imports: [FormsModule, SidebarComponent, NavbarComponent],
  template: `
    <app-sidebar />
    <div class="ml-64 min-h-screen bg-gray-50">
      <app-navbar title="Offres de stage" />
      <main class="p-6">

        <div class="card mb-6 flex flex-wrap gap-4">
          <select [(ngModel)]="filtresDomaine" class="input-field w-48">
            <option value="">Tous les domaines</option>
            @for (d of domaines; track d) {
              <option [value]="d">{{ d }}</option>
            }
          </select>
          <input [(ngModel)]="filtresLocalisation" placeholder="Localisation..." class="input-field w-48" />
          <input type="number" [(ngModel)]="filtresDuree" placeholder="Duree (mois)" class="input-field w-40" />
          <button (click)="rechercher()" class="btn-primary">Rechercher</button>
          <button (click)="reinitialiser()" class="btn-secondary">Reinitialiser</button>
        </div>

        @if (loading()) {
          <div class="text-center py-12 text-gray-400">Chargement...</div>
        } @else {
          <div class="grid gap-4">
            @for (offre of page()?.content; track offre.id) {
              <div class="card hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="font-semibold text-gray-900 text-lg">{{ offre.titre }}</h3>
                      <span class="badge-active">{{ offre.domaine }}</span>
                    </div>
                    <p class="text-sm text-gray-600 mb-1">{{ offre.nomEntreprise }} — {{ offre.localisation }}</p>
                    <p class="text-sm text-gray-500 mb-3 line-clamp-2">{{ offre.description }}</p>
                    <div class="flex gap-4 text-xs text-gray-500">
                      <span>Duree : {{ offre.dureeMois }} mois</span>
                      @if (offre.remuneration) {
                        <span>Remuneration : {{ offre.remuneration }} F/mois</span>
                      }
                      <span>Expire le {{ offre.dateExpiration.slice(0, 10) }}</span>
                    </div>
                  </div>
                  <button (click)="ouvrirPostulation(offre)" class="btn-primary ml-4 shrink-0">Postuler</button>
                </div>
              </div>
            }
            @empty {
              <div class="text-center py-12 text-gray-400">Aucune offre trouvee</div>
            }
          </div>

          @if (page() && page()!.totalPages > 1) {
            <div class="flex justify-center gap-2 mt-6">
              <button (click)="changerPage(currentPage() - 1)" [disabled]="currentPage() === 0" class="btn-secondary px-3 py-1.5 text-sm">Precedent</button>
              <span class="px-4 py-1.5 text-sm text-gray-600">Page {{ currentPage() + 1 }} / {{ page()!.totalPages }}</span>
              <button (click)="changerPage(currentPage() + 1)" [disabled]="page()!.last" class="btn-secondary px-3 py-1.5 text-sm">Suivant</button>
            </div>
          }
        }
      </main>
    </div>

    @if (offreSelectionnee()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
          <h3 class="text-lg font-semibold mb-1">Postuler : {{ offreSelectionnee()!.titre }}</h3>
          <p class="text-sm text-gray-500 mb-4">{{ offreSelectionnee()!.nomEntreprise }}</p>

          @if (postulationError()) {
            <div class="bg-danger-100 text-danger-700 rounded-lg p-3 mb-4 text-sm">{{ postulationError() }}</div>
          }

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">CV (PDF)</label>
              <input type="file" accept=".pdf" (change)="onCvChange($event)" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Lettre de motivation</label>
              <textarea [(ngModel)]="lettreMotivation" rows="5" class="input-field resize-none"
                placeholder="Redigez votre lettre de motivation..."></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button (click)="offreSelectionnee.set(null)" class="btn-secondary">Annuler</button>
            <button (click)="postuler()" [disabled]="!cvFile() || postulationLoading()" class="btn-primary">
              {{ postulationLoading() ? "Envoi..." : "Envoyer ma candidature" }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class OffresComponent implements OnInit {
  page                = signal<PageResponse<OffreResponse> | null>(null);
  loading             = signal(false);
  currentPage         = signal(0);
  filtresDomaine      = "";
  filtresLocalisation = "";
  filtresDuree?: number;
  offreSelectionnee   = signal<OffreResponse | null>(null);
  cvFile              = signal<File | null>(null);
  lettreMotivation    = "";
  postulationLoading  = signal(false);
  postulationError    = signal("");

  domaines: Domaine[] = [
    "INFORMATIQUE","FINANCE","MARKETING","RESSOURCES_HUMAINES",
    "GENIE_CIVIL","ELECTRONIQUE","SANTE","DROIT","COMMUNICATION","AUTRE"
  ];

  constructor(private offreService: OffreService, private candidatureService: CandidatureService) {}

  ngOnInit() { this.rechercher(); }

  rechercher() {
    this.loading.set(true);
    const domaine = this.filtresDomaine as Domaine || undefined;
    this.offreService.rechercher(domaine, this.filtresLocalisation || undefined,
      this.filtresDuree, this.currentPage()).subscribe({
      next: res => { this.page.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  reinitialiser() {
    this.filtresDomaine = ""; this.filtresLocalisation = ""; this.filtresDuree = undefined;
    this.currentPage.set(0); this.rechercher();
  }

  changerPage(p: number) { this.currentPage.set(p); this.rechercher(); }

  ouvrirPostulation(offre: OffreResponse) {
    this.offreSelectionnee.set(offre);
    this.cvFile.set(null); this.lettreMotivation = ""; this.postulationError.set("");
  }

  onCvChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.cvFile.set(file);
  }

  postuler() {
    if (!this.cvFile() || !this.offreSelectionnee()) return;
    this.postulationLoading.set(true);
    this.candidatureService.postuler(this.offreSelectionnee()!.id, this.lettreMotivation, this.cvFile()!).subscribe({
      next: () => { this.offreSelectionnee.set(null); this.postulationLoading.set(false); },
      error: err => { this.postulationError.set(err.error?.message ?? "Erreur"); this.postulationLoading.set(false); }
    });
  }
}
