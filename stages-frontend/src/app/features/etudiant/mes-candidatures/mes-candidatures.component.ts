import { Component, OnInit, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { CandidatureService } from "../../../core/services/candidature.service";
import { CandidatureResponse } from "../../../core/models/candidature.model";

@Component({
  selector: "app-mes-candidatures",
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, RouterLink],
  templateUrl: "./mes-candidatures.component.html"
})
export class MesCandidaturesComponent implements OnInit {
  candidatures = signal<CandidatureResponse[]>([]);
  loading      = signal(true);
  enAttente    = signal(0);
  acceptees    = signal(0);
  refusees     = signal(0);

  constructor(private service: CandidatureService) {}

  ngOnInit() {
    this.service.mesCandidatures(0, 100).subscribe({
      next: res => {
        const list = res.data.content;
        this.candidatures.set(list);
        this.enAttente.set(list.filter(c => c.statut === "EN_ATTENTE").length);
        this.acceptees.set(list.filter(c => c.statut === "ACCEPTEE").length);
        this.refusees.set(list.filter(c => c.statut === "REFUSEE").length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
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