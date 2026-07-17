import { Component, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { RouterLink, Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";
import { Role } from "../../../core/models/auth.model";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-white text-2xl font-bold">GS</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Bienvenue</h1>
          <p class="text-gray-500 mt-1 text-sm">Connectez-vous a votre espace GestionStages</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="login()" class="space-y-5">

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
                @if (form.get("email")?.errors?.["required"]) { L adresse email est obligatoire }
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
                placeholder="Votre mot de passe (min. 6 caracteres)"
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
                @if (form.get("motDePasse")?.errors?.["required"]) { Le mot de passe est obligatoire }
                @if (form.get("motDePasse")?.errors?.["minlength"]) { Minimum 6 caracteres requis }
              </p>
            }
          </div>

          <button type="submit" [disabled]="loading()"
            class="btn-primary w-full py-3 text-base font-semibold">
            @if (loading()) {
              <span class="flex items-center justify-center gap-2">
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Connexion en cours...
              </span>
            } @else {
              Se connecter
            }
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?
          <a routerLink="/auth/register" class="text-primary-600 font-semibold hover:underline ml-1">
            Creer un compte gratuitement
          </a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  form: FormGroup;
  loading      = signal(false);
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      email:      ["", [Validators.required, Validators.email]],
      motDePasse: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }
    this.loading.set(true);
    const id = this.toast.loading("Connexion en cours...");
    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.toast.dismiss(id);
        this.toast.success("Connexion reussie !");
        this.redirectByRole();
      },
      error: err => {
        this.toast.dismiss(id);
        this.toast.error(err.error?.message ?? "Email ou mot de passe incorrect");
        this.loading.set(false);
      }
    });
  }

  private redirectByRole() {
    const map: Record<Role, string> = {
      ETUDIANT:   "/etudiant/dashboard",
      ENTREPRISE: "/entreprise/dashboard",
      ENSEIGNANT: "/enseignant/dashboard",
      ADMIN:      "/admin/dashboard",
    };
    this.router.navigate([map[this.auth.role()!]]);
  }
}