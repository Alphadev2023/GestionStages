import { Component, OnInit, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { ConventionService } from "../../../core/services/convention.service";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-enseignant-dashboard",
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, RouterLink],
  templateUrl: "./dashboard.component.html"
})
export class EnseignantDashboardComponent implements OnInit {
  totalConventions   = signal(0);
  enAttente          = signal(0);
  validees           = signal(0);

  constructor(public auth: AuthService, private conventionService: ConventionService) {}

  ngOnInit() {
    this.conventionService.liste(undefined, 0, 100).subscribe(res => {
      const list = res.data.content;
      this.totalConventions.set(res.data.totalElements);
      this.enAttente.set(list.filter(c => c.statut === "EN_ATTENTE").length);
      this.validees.set(list.filter(c => c.statut === "VALIDEE_ENSEIGNANT" || c.statut === "APPROUVEE_ADMIN").length);
    });
  }

  initiales(): string {
    const u = this.auth.user();
    return u ? (u.prenom[0] + u.nom[0]).toUpperCase() : "?";
  }
}