import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { CandidatureService } from "../../../core/services/candidature.service";
import { OffreService } from "../../../core/services/offre.service";
import { ToastService } from "../../../core/services/toast.service";
import { CandidatureResponse } from "../../../core/models/candidature.model";
import { OffreResponse } from "../../../core/models/offre.model";

@Component({
  selector: "app-candidatures-recues",
  standalone: true,
  imports: [FormsModule, SidebarComponent, NavbarComponent],
  templateUrl: "./candidatures-recues.component.html"
})
export class CandidaturesRecuesComponent implements OnInit {
  offres           = signal<OffreResponse[]>([]);
  candidatures     = signal<CandidatureResponse[]>([]);
  selectedOffreId: number | null = null;
  candidatureSelectionnee = signal<CandidatureResponse | null>(null);
  actionSelectionnee: "ACCEPTEE" | "REFUSEE" | null = null;
  feedback = "";

  constructor(
    private candidatureService: CandidatureService,
    private offreService: OffreService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.offreService.mesOffres().subscribe(res => this.offres.set(res.data.content));
  }

  get enAttente() { return this.candidatures().filter(c => c.statut === "EN_ATTENTE").length; }
  get acceptees() { return this.candidatures().filter(c => c.statut === "ACCEPTEE").length; }
  get refusees()  { return this.candidatures().filter(c => c.statut === "REFUSEE").length; }

  chargerCandidatures() {
    if (!this.selectedOffreId) return;
    this.candidatureService.parOffre(this.selectedOffreId).subscribe(
      res => this.candidatures.set(res.data.content));
  }

  ouvrirConfirmation(c: CandidatureResponse, action: "ACCEPTEE" | "REFUSEE") {
    this.candidatureSelectionnee.set(c);
    this.actionSelectionnee = action;
    this.feedback = "";
    document.body.style.overflow = "hidden";
  }

  fermerConfirmation() {
    this.candidatureSelectionnee.set(null);
    this.actionSelectionnee = null;
    this.feedback = "";
    document.body.style.overflow = "";
  }

  confirmer() {
    const c = this.candidatureSelectionnee();
    if (!c || !this.actionSelectionnee) return;
    const msg = this.actionSelectionnee === "ACCEPTEE" ? "Acceptation..." : "Refus...";
    const id = this.toast.loading(msg);
    this.candidatureService.traiter(c.id, this.actionSelectionnee, this.feedback).subscribe({
      next: () => {
        this.toast.dismiss(id);
        if (this.actionSelectionnee === "ACCEPTEE") {
          this.toast.success("Candidature acceptee — convention creee automatiquement !");
        } else {
          this.toast.success("Candidature refusee");
        }
        this.fermerConfirmation();
        this.chargerCandidatures();
      },
      error: () => { this.toast.dismiss(id); this.toast.error("Erreur lors du traitement"); }
    });
  }

  badgeClass(s: string): string {
    return s === "ACCEPTEE" ? "badge-accepte" : s === "REFUSEE" ? "badge-refuse" : "badge-attente";
  }
  statutLabel(s: string): string {
    return s === "ACCEPTEE" ? "Acceptee" : s === "REFUSEE" ? "Refusee" : "En attente";
  }
}