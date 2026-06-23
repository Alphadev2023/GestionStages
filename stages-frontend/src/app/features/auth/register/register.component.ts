import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink, Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { Role, RegisterRequest } from "../../../core/models/auth.model";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Creer un compte</h1>
          <p class="text-gray-500 mt-2">Rejoignez la plateforme de stages</p>
        </div>

        @if (error()) {
          <div class="bg-danger-100 text-danger-700 rounded-lg p-3 mb-4 text-sm">{{ error() }}</div>
        }

        <form (ngSubmit)="register()" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input [(ngModel)]="form.nom" name="nom" required class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prenom</label>
              <input [(ngModel)]="form.prenom" name="prenom" required class="input-field" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" [(ngModel)]="form.email" name="email" required class="input-field" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input type="password" [(ngModel)]="form.motDePasse" name="motDePasse" required class="input-field" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select [(ngModel)]="form.role" name="role" class="input-field">
              <option value="ETUDIANT">Etudiant</option>
              <option value="ENTREPRISE">Entreprise</option>
              <option value="ENSEIGNANT">Enseignant</option>
            </select>
          </div>

          @if (form.role === "ETUDIANT") {
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Filiere</label>
                <input [(ngModel)]="form.filiere" name="filiere" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Promotion</label>
                <input [(ngModel)]="form.promotion" name="promotion" class="input-field" />
              </div>
            </div>
          }

          @if (form.role === "ENTREPRISE") {
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom entreprise</label>
                <input [(ngModel)]="form.nomEntreprise" name="nomEntreprise" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
                <input [(ngModel)]="form.secteurActivite" name="secteurActivite" class="input-field" />
              </div>
            </div>
          }

          @if (form.role === "ENSEIGNANT") {
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Departement</label>
              <input [(ngModel)]="form.departement" name="departement" class="input-field" />
            </div>
          }

          <button type="submit" [disabled]="loading()" class="btn-primary w-full py-3 mt-2">
            {{ loading() ? "Creation..." : "Creer mon compte" }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Deja un compte ?
          <a routerLink="/auth/login" class="text-primary-600 font-medium hover:underline">Se connecter</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form: RegisterRequest = { nom: "", prenom: "", email: "", motDePasse: "", role: "ETUDIANT" };
  loading = signal(false);
  error   = signal("");

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    this.loading.set(true);
    this.error.set("");
    this.auth.register(this.form).subscribe({
      next: () => {
        const map: Record<Role, string> = {
          ETUDIANT: "/etudiant/dashboard", ENTREPRISE: "/entreprise/dashboard",
          ENSEIGNANT: "/enseignant/dashboard", ADMIN: "/admin/dashboard"
        };
        this.router.navigate([map[this.form.role]]);
      },
      error: err => { this.error.set(err.error?.message ?? "Erreur"); this.loading.set(false); }
    });
  }
}
