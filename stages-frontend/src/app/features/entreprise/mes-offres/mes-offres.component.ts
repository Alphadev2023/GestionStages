import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DecimalPipe } from "@angular/common";
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { OffreService } from "../../../core/services/offre.service";
import { OffreResponse, OffreRequest, Domaine } from "../../../core/models/offre.model";

@Component({
  selector: "app-mes-offres",
  standalone: true,
  imports: [FormsModule, SidebarComponent, NavbarComponent, DecimalPipe],
  templateUrl: "./mes-offres.component.html"
})
export class MesOffresComponent implements OnInit {
  offres      = signal<OffreResponse[]>([]);
  showForm    = signal(false);
  formLoading = signal(false);
  formError   = signal("");
  detailId:   number | null = null;

  readonly activeStatut = "ACTIVE";
  readonly badgeActive  = "badge-active";
  readonly badgeRefuse  = "badge-refuse";

  form: OffreRequest = {
    titre: "", description: "", domaine: "INFORMATIQUE", localisation: "",
    dureeMois: 3, dateDebut: "", dateExpiration: "", nombrePostes: 1
  };

  domaines: Domaine[] = [
    "INFORMATIQUE","FINANCE","MARKETING","RESSOURCES_HUMAINES",
    "GENIE_CIVIL","ELECTRONIQUE","SANTE","DROIT","COMMUNICATION","AUTRE"
  ];

  constructor(private service: OffreService) {}

  ngOnInit() { this.charger(); }

  get actives()   { return this.offres().filter(o => o.statut === "ACTIVE").length; }
  get archivees() { return this.offres().filter(o => o.statut === "ARCHIVEE").length; }

  charger() {
    this.service.mesOffres().subscribe(res => this.offres.set(res.data.content));
  }

  toggleDetail(id: number) {
    this.detailId = this.detailId === id ? null : id;
  }

  competences(offre: OffreResponse): string[] {
    if (!offre.competencesRequises) return [];
    return offre.competencesRequises.split(",").map(c => c.trim()).filter(Boolean);
  }

  publier() {
    this.formLoading.set(true); this.formError.set("");
    this.service.publier(this.form).subscribe({
      next: () => {
        this.showForm.set(false);
        this.charger();
        this.formLoading.set(false);
        this.form = { titre:"",description:"",domaine:"INFORMATIQUE",localisation:"",dureeMois:3,dateDebut:"",dateExpiration:"",nombrePostes:1 };
      },
      error: err => { this.formError.set(err.error?.message ?? "Erreur"); this.formLoading.set(false); }
    });
  }

  archiver(id: number) {
    this.service.archiver(id).subscribe(() => this.charger());
  }
}