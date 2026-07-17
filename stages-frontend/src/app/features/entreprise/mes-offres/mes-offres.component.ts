import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DecimalPipe } from "@angular/common";
import { SidebarComponent } from "../../../shared/components/sidebar/sidebar.component";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { OffreService } from "../../../core/services/offre.service";
import { ToastService } from "../../../core/services/toast.service";
import { OffreResponse, OffreRequest, Domaine } from "../../../core/models/offre.model";

@Component({
  selector: "app-mes-offres",
  standalone: true,
  imports: [FormsModule, DecimalPipe, SidebarComponent, NavbarComponent],
  templateUrl: "./mes-offres.component.html"
})
export class MesOffresComponent implements OnInit {
  offres      = signal<OffreResponse[]>([]);
  showForm    = signal(false);

  ouvrirForm() {
    this.showForm.set(true);
    document.body.style.overflow = "hidden";
  }

  fermerForm() {
    this.showForm.set(false);
    document.body.style.overflow = "";
  }
  formLoading = signal(false);
  formErrors: Record<string, string> = {};
  detailId:   number | null = null;
  page        = 0;
  size        = 6;
  today       = new Date().toISOString().split("T")[0];

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

  constructor(private service: OffreService, private toast: ToastService) {}

  ngOnInit() { this.charger(); }

  get offresPage() {
    return this.offres().slice(this.page * this.size, (this.page + 1) * this.size);
  }
  get totalPages() { return Math.ceil(this.offres().length / this.size); }
  get actives()    { return this.offres().filter(o => o.statut === "ACTIVE").length; }
  get archivees()  { return this.offres().filter(o => o.statut === "ARCHIVEE").length; }
  get pagesArray() { return Array.from({ length: this.totalPages }, (_, i) => i); }

  charger() {
    this.service.mesOffres(0, 100).subscribe(res => {
      // Trier : ACTIVE en premier, puis par date creation decroissante
      const sorted = [...res.data.content].sort((a, b) => {
        if (a.statut === "ACTIVE" && b.statut !== "ACTIVE") return -1;
        if (a.statut !== "ACTIVE" && b.statut === "ACTIVE") return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      this.offres.set(sorted);
      this.page = 0;
    });
  }

  toggleDetail(id: number) {
    this.detailId = this.detailId === id ? null : id;
  }

  competences(offre: OffreResponse): string[] {
    if (!offre.competencesRequises) return [];
    return offre.competencesRequises.split(",").map(c => c.trim()).filter(Boolean);
  }

  onDateDebutChange() {
    if (this.form.dateDebut && this.form.dureeMois) {
      const debut = new Date(this.form.dateDebut);
      debut.setMonth(debut.getMonth() + Number(this.form.dureeMois));
      this.form.dateExpiration = debut.toISOString().split("T")[0];
    }
  }

  onDureeChange() {
    if (this.form.dateDebut && this.form.dureeMois) {
      const debut = new Date(this.form.dateDebut);
      debut.setMonth(debut.getMonth() + Number(this.form.dureeMois));
      this.form.dateExpiration = debut.toISOString().split("T")[0];
    }
  }

  validerFormulaire(): boolean {
    this.formErrors = {};
    if (!this.form.titre || this.form.titre.length < 5)
      this.formErrors["titre"] = "Le titre doit contenir au moins 5 caracteres";
    if (!this.form.description || this.form.description.length < 20)
      this.formErrors["description"] = "La description doit contenir au moins 20 caracteres";
    if (!this.form.localisation)
      this.formErrors["localisation"] = "La localisation est obligatoire";
    if (!this.form.dateDebut)
      this.formErrors["dateDebut"] = "La date de debut est obligatoire";
    if (this.form.dateDebut && this.form.dateDebut < this.today)
      this.formErrors["dateDebut"] = "La date de debut ne peut pas etre dans le passe";
    if (!this.form.dateExpiration)
      this.formErrors["dateExpiration"] = "La date d expiration est obligatoire";
    if (this.form.dateDebut && this.form.dateExpiration && this.form.dateExpiration <= this.form.dateDebut)
      this.formErrors["dateExpiration"] = "La date d expiration doit etre apres la date de debut";
    if (this.form.dateDebut && this.form.dateExpiration && this.form.dureeMois) {
      const debut  = new Date(this.form.dateDebut);
      const fin    = new Date(this.form.dateExpiration);
      const diffMs = fin.getTime() - debut.getTime();
      const diffMois = diffMs / (1000 * 60 * 60 * 24 * 30.44);
      if (Math.abs(diffMois - this.form.dureeMois) > 0.2)
        this.formErrors["dateExpiration"] = "La duree entre debut et expiration doit correspondre aux " + this.form.dureeMois + " mois saisis";
    }
    return Object.keys(this.formErrors).length === 0;
  }

  publier() {
    if (!this.validerFormulaire()) return;
    this.formLoading.set(true);
    const id = this.toast.loading("Publication en cours...");
    this.service.publier(this.form).subscribe({
      next: () => {
        this.toast.dismiss(id);
        this.toast.success("Offre publiee avec succes !");
        this.showForm.set(false);
        this.charger();
        this.formLoading.set(false);
        this.form = { titre:"",description:"",domaine:"INFORMATIQUE",localisation:"",dureeMois:3,dateDebut:"",dateExpiration:"",nombrePostes:1 };
      },
      error: err => {
        this.toast.dismiss(id);
        this.toast.error(err.error?.message ?? "Erreur lors de la publication");
        this.formLoading.set(false);
      }
    });
  }

  archiver(id: number) {
    const toastId = this.toast.loading("Archivage...");
    this.service.archiver(id).subscribe({
      next: () => {
        this.toast.dismiss(toastId);
        this.toast.success("Offre archivee");
        this.charger();
      },
      error: () => {
        this.toast.dismiss(toastId);
        this.toast.error("Erreur lors de l archivage");
      }
    });
  }

  changerPage(p: number) { this.page = p; }
  changerSize(s: number) { this.size = s; this.page = 0; }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.showForm.set(false);
    }
  }
}