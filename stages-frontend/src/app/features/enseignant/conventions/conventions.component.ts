import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { ConventionService } from "../../../core/services/convention.service";
import { ConventionResponse, StatutConvention } from "../../../core/models/convention.model";

@Component({
  selector: "app-conventions",
  standalone: true,
  imports: [FormsModule, SidebarComponent, NavbarComponent],
  templateUrl: "./conventions.component.html"
})
export class ConventionsComponent implements OnInit {
  conventions  = signal<ConventionResponse[]>([]);
  enAttente    = signal(0);
  validees     = signal(0);
  rejetees     = signal(0);
  commentaire  = "";
  filtreStatut: StatutConvention | undefined = undefined;

  readonly buttonActif   = "btn-primary text-sm";
  readonly buttonInactif = "btn-secondary text-sm";

  statuts = [
    { value: undefined as StatutConvention | undefined, label: "Toutes" },
    { value: "EN_ATTENTE" as StatutConvention,          label: "En attente" },
    { value: "VALIDEE_ENSEIGNANT" as StatutConvention,  label: "Validees" },
    { value: "REJETEE" as StatutConvention,             label: "Rejetees" },
  ];

  constructor(private service: ConventionService) {}

  ngOnInit() { this.charger(); }

  setFiltre(v: StatutConvention | undefined) { this.filtreStatut = v; this.charger(); }

  charger() {
    this.service.liste(this.filtreStatut, 0, 100).subscribe(res => {
      const list = res.data.content;
      this.conventions.set(list);
      this.enAttente.set(list.filter(c => c.statut === "EN_ATTENTE").length);
      this.validees.set(list.filter(c => c.statut === "VALIDEE_ENSEIGNANT").length);
      this.rejetees.set(list.filter(c => c.statut === "REJETEE").length);
    });
  }

  valider(id: number) {
    this.service.validerEnseignant(id, this.commentaire || undefined).subscribe(() => {
      this.commentaire = "";
      this.charger();
    });
  }

  rejeter(id: number) {
    this.service.rejeter(id, this.commentaire || undefined).subscribe(() => {
      this.commentaire = "";
      this.charger();
    });
  }

  badgeClass(s: string): string {
    if (s === "APPROUVEE_ADMIN")    return "badge-accepte";
    if (s === "REJETEE")            return "badge-refuse";
    if (s === "VALIDEE_ENSEIGNANT") return "badge-active";
    return "badge-attente";
  }

  statutLabel(s: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: "En attente", VALIDEE_ENSEIGNANT: "Validee",
      APPROUVEE_ADMIN: "Approuvee admin", REJETEE: "Rejetee"
    };
    return map[s] ?? s;
  }
}