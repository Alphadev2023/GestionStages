import { Component, OnInit, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { OffreService } from "../../../core/services/offre.service";
import { CandidatureService } from "../../../core/services/candidature.service";
import { AuthService } from "../../../core/services/auth.service";
import { CandidatureResponse } from "../../../core/models/candidature.model";

@Component({
  selector: "app-etudiant-dashboard",
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, RouterLink],
  templateUrl: "./dashboard.component.html"
})
export class EtudiantDashboardComponent implements OnInit {
  totalOffres           = signal(0);
  totalCandidatures     = signal(0);
  candidaturesAcceptees = signal(0);
  candidaturesRefusees  = signal(0);
  candidaturesAttente   = signal(0);
  dernieresCandidatures = signal<CandidatureResponse[]>([]);

  constructor(public auth: AuthService, private offreService: OffreService,
              private candidatureService: CandidatureService) {}

  ngOnInit() {
    this.offreService.rechercher(undefined, undefined, undefined, 0, 1)
      .subscribe(res => this.totalOffres.set(res.data.totalElements));

    this.candidatureService.mesCandidatures(0, 100).subscribe(res => {
      const list = res.data.content;
      this.totalCandidatures.set(res.data.totalElements);
      this.candidaturesAcceptees.set(list.filter(c => c.statut === "ACCEPTEE").length);
      this.candidaturesRefusees.set(list.filter(c => c.statut === "REFUSEE").length);
      this.candidaturesAttente.set(list.filter(c => c.statut === "EN_ATTENTE").length);
      this.dernieresCandidatures.set(list.slice(0, 3));
    });
  }

  initiales(): string {
    const u = this.auth.user();
    return u ? (u.prenom[0] + u.nom[0]).toUpperCase() : "?";
  }

  tauxReussite(): number {
    const total = this.totalCandidatures();
    if (total === 0) return 0;
    return Math.round((this.candidaturesAcceptees() / total) * 100);
  }

  barreWidth(): string {
    return this.tauxReussite() + "%";
  }

  getBadge(s: string): string {
    if (s === "ACCEPTEE") return "badge-accepte";
    if (s === "REFUSEE")  return "badge-refuse";
    return "badge-attente";
  }

  getStatutLabel(s: string): string {
    if (s === "ACCEPTEE") return "Acceptee";
    if (s === "REFUSEE")  return "Refusee";
    return "En attente";
  }
}