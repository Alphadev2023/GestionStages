import { Component, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { RouterLink, Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";
import { Role } from "../../../core/models/auth.model";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8">

        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-white text-2xl font-bold">GS</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Creer un compte</h1>
          <p class="text-gray-500 mt-1 text-sm">Rejoignez la plateforme GestionStages</p>
        </div>

        <!-- Selection du role -->
        <div class="grid grid-cols-3 gap-3 mb-6">
          @for (r of roles; track r.value) {
            <button type="button" (click)="setRole(r.value)"
              class="p-3 rounded-xl border-2 text-center transition-all"
              [class.border-primary-600]="selectedRole() === r.value"
              [class.bg-primary-50]="selectedRole() === r.value"
              [class.text-primary-700]="selectedRole() === r.value"
              [class.border-gray-200]="selectedRole() !== r.value"
              [class.text-gray-600]="selectedRole() !== r.value">
              <p class="text-sm font-semibold">{{ r.label }}</p>
              <p class="text-xs mt-0.5 opacity-70">{{ r.desc }}</p>
            </button>
          }
        </div>

        <form [formGroup]="form" (ngSubmit)="register()" class="space-y-4">

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nom <span class="text-danger-600">*</span>
              </label>
              <input formControlName="nom" placeholder="Ex: Diallo"
                class="input-field"
                [class.border-danger-400]="isInvalid('nom')"
                [class.bg-danger-50]="isInvalid('nom')" />
              @if (isInvalid("nom")) {
                <p class="text-xs text-danger-600 mt-1">
                  @if (form.get("nom")?.errors?.["required"]) { Nom obligatoire }
                  @if (form.get("nom")?.errors?.["minlength"]) { Minimum 2 caracteres }
                </p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Prenom <span class="text-danger-600">*</span>
              </label>
              <input formControlName="prenom" placeholder="Ex: Mamadou"
                class="input-field"
                [class.border-danger-400]="isInvalid('prenom')"
                [class.bg-danger-50]="isInvalid('prenom')" />
              @if (isInvalid("prenom")) {
                <p class="text-xs text-danger-600 mt-1">
                  @if (form.get("prenom")?.errors?.["required"]) { Prenom obligatoire }
                  @if (form.get("prenom")?.errors?.["minlength"]) { Minimum 2 caracteres }
                </p>
              }
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Adresse email <span class="text-danger-600">*</span>
            </label>
            <input type="email" formControlName="email"
              placeholder="Ex: mamadou@universite.com"
              class="input-field"
              [class.border-danger-400]="isInvalid('email')"
              [class.bg-danger-50]="isInvalid('email')" />
            @if (isInvalid("email")) {
              <p class="text-xs text-danger-600 mt-1">
                @if (form.get("email")?.errors?.["required"]) { Email obligatoire }
                @if (form.get("email")?.errors?.["email"]) { Adresse email invalide }
              </p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe <span class="text-danger-600">*</span>
            </label>
            <div class="relative">
              <input [type]="showPassword() ? 'text' : 'password'" formControlName="motDePasse"
                placeholder="Minimum 6 caracteres"
                class="input-field pr-10"
                [class.border-danger-400]="isInvalid('motDePasse')"
                [class.bg-danger-50]="isInvalid('motDePasse')" />
              <button type="button" (click)="showPassword.set(!showPassword())"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                {{ showPassword() ? "Masquer" : "Afficher" }}
              </button>
            </div>
            @if (isInvalid("motDePasse")) {
              <p class="text-xs text-danger-600 mt-1">
                @if (form.get("motDePasse")?.errors?.["required"]) { Mot de passe obligatoire }
                @if (form.get("motDePasse")?.errors?.["minlength"]) { Minimum 6 caracteres requis }
              </p>
            }
            <p class="text-xs text-gray-400 mt-1">Utilisez au moins 6 caracteres avec des chiffres</p>
          </div>

          <!-- Champs specifiques ETUDIANT -->
          @if (selectedRole() === "ETUDIANT") {
            <div class="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Filiere</label>
                <input formControlName="filiere"
                  placeholder="Ex: Informatique, Droit..."
                  class="input-field" />
                <p class="text-xs text-gray-400 mt-1">Votre domaine d etudes</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Promotion</label>
                <input formControlName="promotion"
                  placeholder="Ex: 2024-2026"
                  class="input-field" />
                <p class="text-xs text-gray-400 mt-1">Annee de promotion</p>
              </div>
            </div>
          }

          <!-- Champs specifiques ENTREPRISE -->
          @if (selectedRole() === "ENTREPRISE") {
            <div class="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom de l entreprise</label>
                <input formControlName="nomEntreprise"
                  placeholder="Ex: TechCorp Guinee"
                  class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Secteur d activite</label>
                <input formControlName="secteurActivite"
                  placeholder="Ex: Informatique, Finance..."
                  class="input-field" />
              </div>
            </div>
          }

          <!-- Champs specifiques ENSEIGNANT -->
          @if (selectedRole() === "ENSEIGNANT") {
            <div class="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <label class="block text-sm font-medium text-gray-700 mb-1">Departement</label>
              <input formControlName="departement"
                placeholder="Ex: Informatique, Droit, Finance..."
                class="input-field" />
              <p class="text-xs text-gray-400 mt-1">Votre departement d enseignement</p>
            </div>
          }

          <button type="submit" [disabled]="loading()"
            class="btn-primary w-full py-3 text-base font-semibold">
            @if (loading()) {
              <span class="flex items-center justify-center gap-2">
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Creation du compte...
              </span>
            } @else {
              Creer mon compte
            }
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Deja un compte ?
          <a routerLink="/auth/login" class="text-primary-600 font-semibold hover:underline ml-1">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form: FormGroup;
  loading      = signal(false);
  showPassword = signal(false);
  selectedRole = signal<Role>("ETUDIANT");

  roles = [
    { value: "ETUDIANT"   as Role, label: "Etudiant",   desc: "Je cherche un stage" },
    { value: "ENTREPRISE" as Role, label: "Entreprise",  desc: "Je publie des offres" },
    { value: "ENSEIGNANT" as Role, label: "Enseignant",  desc: "Je valide les conventions" },
  ];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      nom:            ["", [Validators.required, Validators.minLength(2)]],
      prenom:         ["", [Validators.required, Validators.minLength(2)]],
      email:          ["", [Validators.required, Validators.email]],
      motDePasse:     ["", [Validators.required, Validators.minLength(6)]],
      filiere:        [""],
      promotion:      [""],
      nomEntreprise:  [""],
      secteurActivite:[""],
      departement:    [""],
    });
  }

  setRole(role: Role) { this.selectedRole.set(role); }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  register() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }
    this.loading.set(true);
    const id = this.toast.loading("Creation du compte...");
    const data = { ...this.form.value, role: this.selectedRole() };
    this.auth.register(data).subscribe({
      next: () => {
        this.toast.dismiss(id);
        this.toast.success("Compte cree avec succes !");
        const map: Record<Role, string> = {
          ETUDIANT:   "/etudiant/dashboard",
          ENTREPRISE: "/entreprise/dashboard",
          ENSEIGNANT: "/enseignant/dashboard",
          ADMIN:      "/admin/dashboard",
        };
        this.router.navigate([map[this.selectedRole()]]);
      },
      error: err => {
        this.toast.dismiss(id);
        this.toast.error(err.error?.message ?? "Erreur lors de la creation");
        this.loading.set(false);
      }
    });
  }
}