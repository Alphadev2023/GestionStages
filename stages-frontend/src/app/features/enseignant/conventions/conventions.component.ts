import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { ConventionService } from "../../../core/services/convention.service";
import { ToastService } from "../../../core/services/toast.service";
import { ConventionResponse, StatutConvention } from "../../../core/models/convention.model";

@Component({
  selector: "app-conventions",
  standalone: true,
  imports: [FormsModule, SidebarComponent, NavbarComponent],
  templateUrl: "./conventions.component.html"
})
export class ConventionsComponent implements OnInit {
  conventions             = signal<ConventionResponse[]>([]);
  conventionSelectionnee  = signal<ConventionResponse | null>(null);
  filtreStatut: StatutConvention | undefined = undefined;
  actionSelectionnee: "VALIDER" | "REJETER" | null = null;
  commentaire = "";
  page        = 0;
  size        = 6;

  constructor(private service: ConventionService, private toast: ToastService) {}

  ngOnInit() { this.charger(); }

  charger() {
    this.service.liste(this.filtreStatut).subscribe(res => {
      // Trier : EN_ATTENTE en premier
      const sorted = [...res.data.content].sort((a, b) => {
        if (a.statut === "EN_ATTENTE" && b.statut !== "EN_ATTENTE") return -1;
        if (a.statut !== "EN_ATTENTE" && b.statut === "EN_ATTENTE") return 1;
        return 0;
      });
      this.conventions.set(sorted);
      // Aller a la page ou il y a des EN_ATTENTE
      if (sorted.length > 0 && sorted[0].statut === "EN_ATTENTE") {
        this.page = 0;
      }
    });
  }

  get enAttente()  { return this.conventions().filter(c => c.statut === "EN_ATTENTE").length; }
  get validees()   { return this.conventions().filter(c => c.statut === "VALIDEE_ENSEIGNANT").length; }
  get totalPages() { return Math.ceil(this.conventions().length / this.size); }
  get pagesArray() { return Array.from({ length: this.totalPages }, (_, i) => i); }
  get listePage()  { return this.conventions().slice(this.page * this.size, (this.page + 1) * this.size); }

  setFiltre(v: StatutConvention | undefined) { this.filtreStatut = v; this.page = 0; this.charger(); }
  changerPage(p: number) { this.page = p; }
  changerSize(s: number) { this.size = s; this.page = 0; }

  ouvrirConfirmation(conv: ConventionResponse, action: "VALIDER" | "REJETER") {
    this.conventionSelectionnee.set(conv);
    this.actionSelectionnee = action;
    this.commentaire = "";
    document.body.style.overflow = "hidden";
  }

  fermerConfirmation() {
    this.conventionSelectionnee.set(null);
    this.actionSelectionnee = null;
    this.commentaire = "";
    document.body.style.overflow = "";
  }

  confirmer() {
    const conv = this.conventionSelectionnee();
    if (!conv || !this.actionSelectionnee) return;
    const id = this.toast.loading(this.actionSelectionnee === "VALIDER" ? "Validation..." : "Rejet...");
    const obs = this.actionSelectionnee === "VALIDER"
      ? this.service.validerEnseignant(conv.id, this.commentaire || undefined)
      : this.service.rejeter(conv.id, this.commentaire || undefined);
    obs.subscribe({
      next: () => {
        this.toast.dismiss(id);
        this.toast.success(this.actionSelectionnee === "VALIDER" ? "Convention validee !" : "Convention rejetee");
        this.fermerConfirmation();
        this.charger();
      },
      error: () => { this.toast.dismiss(id); this.toast.error("Erreur lors du traitement"); }
    });
  }

  badgeClass(s: string): string {
    if (s === "APPROUVEE_ADMIN")    return "badge-accepte";
    if (s === "REJETEE")            return "badge-refuse";
    if (s === "VALIDEE_ENSEIGNANT") return "badge-active";
    return "badge-attente";
  }

  stopProp(e: Event) { e.stopPropagation(); }

  statutLabel(s: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: "En attente", VALIDEE_ENSEIGNANT: "Validee",
      APPROUVEE_ADMIN: "Approuvee", REJETEE: "Rejetee"
    };
    return map[s] ?? s;
  }
}