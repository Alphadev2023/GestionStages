import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { ConventionService } from "../../../core/services/convention.service";
import { ConventionResponse, StatutConvention } from "../../../core/models/convention.model";

@Component({
  selector: "app-admin-conventions",
  standalone: true,
  imports: [FormsModule, SidebarComponent, NavbarComponent],
  templateUrl: "./conventions.component.html"
})
export class AdminConventionsComponent implements OnInit {
  conventions  = signal<ConventionResponse[]>([]);
  filtreStatut: StatutConvention | undefined = undefined;
  commentaire  = "";
  showComment: number | null = null;

  readonly btnActif   = "btn-primary text-sm";
  readonly btnInactif = "btn-secondary text-sm";
  readonly btnApprouver = "bg-success-600 hover:bg-success-700 text-white text-xs px-4 py-2 rounded-lg transition-colors";
  readonly btnRejeter   = "bg-danger-600 hover:bg-danger-700 text-white text-xs px-4 py-2 rounded-lg transition-colors";

  statuts = [
    { value: undefined as StatutConvention | undefined, label: "Toutes" },
    { value: "EN_ATTENTE" as StatutConvention,          label: "En attente" },
    { value: "VALIDEE_ENSEIGNANT" as StatutConvention,  label: "Validees enseignant" },
    { value: "APPROUVEE_ADMIN" as StatutConvention,     label: "Approuvees" },
    { value: "REJETEE" as StatutConvention,             label: "Rejetees" },
  ];

  constructor(private service: ConventionService) {}

  ngOnInit() { this.charger(); }

  charger() {
    this.service.liste(this.filtreStatut).subscribe(
      res => this.conventions.set(res.data.content));
  }

  setFiltre(v: StatutConvention | undefined) { this.filtreStatut = v; this.charger(); }

  approuver(id: number) {
    const c = this.showComment === id ? this.commentaire : undefined;
    this.service.approuverAdmin(id, c).subscribe(() => {
      this.showComment = null; this.commentaire = ""; this.charger();
    });
  }

  rejeter(id: number) {
    this.service.rejeter(id, this.commentaire).subscribe(() => {
      this.showComment = null; this.commentaire = ""; this.charger();
    });
  }

  toggleComment(id: number) {
    this.showComment = this.showComment === id ? null : id;
    this.commentaire = "";
  }

  get enAttente()         { return this.conventions().filter(c => c.statut === "EN_ATTENTE").length; }
  get valideeEnseignant() { return this.conventions().filter(c => c.statut === "VALIDEE_ENSEIGNANT").length; }
  get approuvees()        { return this.conventions().filter(c => c.statut === "APPROUVEE_ADMIN").length; }
  get rejetees()          { return this.conventions().filter(c => c.statut === "REJETEE").length; }

  badgeClass(s: string): string {
    if (s === "APPROUVEE_ADMIN")    return "badge-accepte";
    if (s === "REJETEE")            return "badge-refuse";
    if (s === "VALIDEE_ENSEIGNANT") return "badge-active";
    return "badge-attente";
  }
  statutLabel(s: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: "En attente", VALIDEE_ENSEIGNANT: "Validee enseignant",
      APPROUVEE_ADMIN: "Approuvee", REJETEE: "Rejetee"
    };
    return map[s] ?? s;
  }
}