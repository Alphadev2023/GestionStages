import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink, Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { Role } from "../../../core/models/auth.model";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">GestionStages</h1>
          <p class="text-gray-500 mt-2">Connectez-vous a votre espace</p>
        </div>

        @if (error()) {
          <div class="bg-danger-100 text-danger-700 rounded-lg p-3 mb-4 text-sm">{{ error() }}</div>
        }

        <form (ngSubmit)="login()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" [(ngModel)]="email" name="email" required
              class="input-field" placeholder="vous@exemple.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input type="password" [(ngModel)]="password" name="password" required
              class="input-field" placeholder="••••••••" />
          </div>
          <button type="submit" [disabled]="loading()" class="btn-primary w-full py-3 mt-2">
            {{ loading() ? "Connexion..." : "Se connecter" }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?
          <a routerLink="/auth/register" class="text-primary-600 font-medium hover:underline">S inscrire</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  email    = "";
  password = "";
  loading  = signal(false);
  error    = signal("");

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.loading.set(true);
    this.error.set("");
    this.auth.login({ email: this.email, motDePasse: this.password }).subscribe({
      next: () => this.redirectByRole(),
      error: err => {
        this.error.set(err.error?.message ?? "Email ou mot de passe incorrect");
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
