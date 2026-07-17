import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DecimalPipe } from "@angular/common";
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { OffreService } from "../../../core/services/offre.service";
import { CandidatureService } from "../../../core/services/candidature.service";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";
import { OffreResponse, Domaine } from "../../../core/models/offre.model";
import { PageResponse } from "../../../core/models/api.model";

@Component({
  selector: "app-offres",
  standalone: true,
  imports: [FormsModule, DecimalPipe, SidebarComponent, NavbarComponent],
  templateUrl: "./offres.component.html"
})
export class OffresComponent implements OnInit {
  rawOffres           = signal<OffreResponse[]>([]);
  loading             = signal(false);
  filtresDomaine      = "";
  filtresLocalisation = "";
  filtresDuree?: number;
  afficherTout        = false;
  page                = 0;
  size                = 6;

  // Modal postulation
  offreSelectionnee   = signal<OffreResponse | null>(null);
  cvFile              = signal<File | null>(null);
  lettreMotivation    = "";
  lettreError         = "";
  cvError             = "";
  postulationLoading  = signal(false);

  domaines: Domaine[] = [
    "INFORMATIQUE","FINANCE","MARKETING","RESSOURCES_HUMAINES",
    "GENIE_CIVIL","ELECTRONIQUE","SANTE","DROIT","COMMUNICATION","AUTRE"
  ];

  readonly DOMAINE_COLORS: Record<string, string> = {
    INFORMATIQUE:"bg-blue-100 text-blue-700", FINANCE:"bg-green-100 text-green-700",
    MARKETING:"bg-pink-100 text-pink-700", DROIT:"bg-purple-100 text-purple-700",
    SANTE:"bg-red-100 text-red-700", GENIE_CIVIL:"bg-orange-100 text-orange-700",
    ELECTRONIQUE:"bg-yellow-100 text-yellow-700", RESSOURCES_HUMAINES:"bg-teal-100 text-teal-700",
    COMMUNICATION:"bg-indigo-100 text-indigo-700", AUTRE:"bg-gray-100 text-gray-700",
  };

  constructor(
    private offreService: OffreService,
    private candidatureService: CandidatureService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() { this.rechercher(); }

  get filiereEtudiant(): string { return this.auth.user()?.filiere ?? ""; }

  isRecommandee(domaine: string): boolean {
    if (!this.filiereEtudiant) return false;
    const f = this.filiereEtudiant.toLowerCase();
    const d = domaine.toLowerCase();
    return f.includes(d) || d.includes(f);
  }

  get offresAffichees(): OffreResponse[] {
    const list = this.rawOffres();
    if (!this.filiereEtudiant || this.afficherTout) return list;
    const filtrees = list.filter(o => this.isRecommandee(o.domaine));
    return filtrees.length > 0 ? filtrees : list;
  }

  get offresPage(): OffreResponse[] {
    return this.offresAffichees.slice(this.page * this.size, (this.page + 1) * this.size);
  }

  get totalPages(): number { return Math.ceil(this.offresAffichees.length / this.size); }
  get pagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i); }

  domaineClass(d: string): string { return this.DOMAINE_COLORS[d] ?? "bg-gray-100 text-gray-700"; }

  rechercher() {
    this.loading.set(true);
    const domaine = this.filtresDomaine as Domaine || undefined;
    this.offreService.rechercher(domaine, this.filtresLocalisation || undefined,
      this.filtresDuree, 0, 100).subscribe({
      next: res => { this.rawOffres.set(res.data.content); this.page = 0; this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  reinitialiser() {
    this.filtresDomaine = ""; this.filtresLocalisation = "";
    this.filtresDuree = undefined; this.afficherTout = false;
    this.page = 0; this.rechercher();
  }

  changerPage(p: number) { this.page = p; }
  changerSize(s: number) { this.size = s; this.page = 0; }

  ouvrirPostulation(offre: OffreResponse) {
    this.offreSelectionnee.set(offre);
    this.cvFile.set(null); this.lettreMotivation = "";
    this.lettreError = ""; this.cvError = "";
    document.body.style.overflow = "hidden";
  }

  fermerPostulation() {
    this.offreSelectionnee.set(null);
    document.body.style.overflow = "";
  }

  onCvChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) { this.cvFile.set(file); this.cvError = ""; }
  }

  validerPostulation(): boolean {
    this.cvError = ""; this.lettreError = "";
    if (!this.cvFile()) this.cvError = "Veuillez selectionner votre CV en format PDF";
    if (!this.lettreMotivation || this.lettreMotivation.length < 50)
      this.lettreError = "La lettre doit contenir au moins 50 caracteres";
    return !this.cvError && !this.lettreError;
  }

  postuler() {
    if (!this.validerPostulation() || !this.offreSelectionnee()) return;
    this.postulationLoading.set(true);
    const id = this.toast.loading("Envoi de votre candidature...");
    this.candidatureService.postuler(
      this.offreSelectionnee()!.id, this.lettreMotivation, this.cvFile()!
    ).subscribe({
      next: () => {
        this.toast.dismiss(id);
        this.toast.success("Candidature envoyee ! Bonne chance !");
        this.fermerPostulation();
        this.postulationLoading.set(false);
      },
      error: err => {
        this.toast.dismiss(id);
        this.toast.error(err.error?.message ?? "Erreur lors de l envoi");
        this.postulationLoading.set(false);
      }
    });
  }
}