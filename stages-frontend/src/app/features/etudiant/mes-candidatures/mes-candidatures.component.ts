import { Component, OnInit, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { CandidatureService } from "../../../core/services/candidature.service";
import { CandidatureResponse } from "../../../core/models/candidature.model";

@Component({
  selector: "app-mes-candidatures",
  standalone: true,
  imports: [RouterLink, FormsModule, SidebarComponent, NavbarComponent],
  templateUrl: "./mes-candidatures.component.html"
})
export class MesCandidaturesComponent implements OnInit {
  candidatures = signal<CandidatureResponse[]>([]);
  loading      = signal(true);
  filtre       = "TOUS";
  page         = 0;
  size         = 6;

  constructor(private service: CandidatureService) {}

  ngOnInit() {
    this.service.mesCandidatures(0, 100).subscribe({
      next: res => { this.candidatures.set(res.data.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  get enAttente()  { return this.candidatures().filter(c => c.statut === "EN_ATTENTE").length; }
  get acceptees()  { return this.candidatures().filter(c => c.statut === "ACCEPTEE").length; }
  get refusees()   { return this.candidatures().filter(c => c.statut === "REFUSEE").length; }

  get listeFiltree(): CandidatureResponse[] {
    if (this.filtre === "TOUS") return this.candidatures();
    return this.candidatures().filter(c => c.statut === this.filtre);
  }

  get totalPages(): number { return Math.ceil(this.listeFiltree.length / this.size); }
  get pagesArray(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i); }

  get listePage(): CandidatureResponse[] {
    return this.listeFiltree.slice(this.page * this.size, (this.page + 1) * this.size);
  }

  changerFiltre(f: string) { this.filtre = f; this.page = 0; }
  changerPage(p: number)   { this.page = p; }
  changerSize(s: number)   { this.size = s; this.page = 0; }

  badgeClass(s: string): string {
    if (s === "ACCEPTEE") return "badge-accepte";
    if (s === "REFUSEE")  return "badge-refuse";
    return "badge-attente";
  }

  statutLabel(s: string): string {
    if (s === "ACCEPTEE") return "Acceptee";
    if (s === "REFUSEE")  return "Refusee";
    return "En attente";
  }
}
