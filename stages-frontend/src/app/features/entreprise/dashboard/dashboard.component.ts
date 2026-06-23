import { Component, OnInit, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { OffreService } from "../../../core/services/offre.service";
import { CandidatureService } from "../../../core/services/candidature.service";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-entreprise-dashboard",
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, RouterLink],
  templateUrl: "./dashboard.component.html"
})
export class EntrepriseDashboardComponent implements OnInit {
  totalOffres      = signal(0);
  offresActives    = signal(0);
  totalCandidatures = signal(0);
  candidaturesAttente = signal(0);

  constructor(public auth: AuthService, private offreService: OffreService) {}

  ngOnInit() {
    this.offreService.mesOffres(0, 100).subscribe(res => {
      this.totalOffres.set(res.data.totalElements);
      this.offresActives.set(res.data.content.filter(o => o.statut === "ACTIVE").length);
    });
  }

  initiales(): string {
    const u = this.auth.user();
    return u ? (u.prenom[0] + u.nom[0]).toUpperCase() : "?";
  }
}