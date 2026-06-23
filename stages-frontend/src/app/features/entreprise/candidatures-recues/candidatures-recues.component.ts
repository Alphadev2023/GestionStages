import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { CandidatureService } from "../../../core/services/candidature.service";
import { OffreService } from "../../../core/services/offre.service";
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
  enAttente  = signal(0);
  acceptees  = signal(0);
  refusees   = signal(0);
  readonly acceptee = "ACCEPTEE" as const;
  readonly refusee  = "REFUSEE" as const;
  readonly btnAccepter = "bg-success-600 hover:bg-success-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors";
  readonly btnRefuser  = "bg-danger-600 hover:bg-danger-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors";

  constructor(private candidatureService: CandidatureService, private offreService: OffreService) {}

  ngOnInit() {
    this.offreService.mesOffres().subscribe(res => this.offres.set(res.data.content));
  }

  chargerCandidatures() {
    if (!this.selectedOffreId) return;
    this.candidatureService.parOffre(this.selectedOffreId).subscribe(res => {
      const list = res.data.content;
      this.candidatures.set(list);
      this.enAttente.set(list.filter(c => c.statut === "EN_ATTENTE").length);
      this.acceptees.set(list.filter(c => c.statut === "ACCEPTEE").length);
      this.refusees.set(list.filter(c => c.statut === "REFUSEE").length);
    });
  }

  traiter(id: number, statut: "ACCEPTEE" | "REFUSEE") {
    this.candidatureService.traiter(id, statut).subscribe(() => this.chargerCandidatures());
  }

  badgeClass(s: string) {
    return s === "ACCEPTEE" ? "badge-accepte" : s === "REFUSEE" ? "badge-refuse" : "badge-attente";
  }
  statutLabel(s: string) {
    return s === "ACCEPTEE" ? "Acceptee" : s === "REFUSEE" ? "Refusee" : "En attente";
  }
}