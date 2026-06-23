import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { roleGuard } from "./core/guards/role.guard";

export const routes: Routes = [
  { path: "", redirectTo: "/auth/login", pathMatch: "full" },
  {
    path: "auth",
    children: [
      { path: "login",    loadComponent: () => import("./features/auth/login/login.component").then(m => m.LoginComponent) },
      { path: "register", loadComponent: () => import("./features/auth/register/register.component").then(m => m.RegisterComponent) },
    ]
  },
  {
    path: "etudiant",
    canActivate: [authGuard, roleGuard(["ETUDIANT"])],
    children: [
      { path: "",             redirectTo: "dashboard", pathMatch: "full" },
      { path: "dashboard",    loadComponent: () => import("./features/etudiant/dashboard/dashboard.component").then(m => m.EtudiantDashboardComponent) },
      { path: "offres",       loadComponent: () => import("./features/etudiant/offres/offres.component").then(m => m.OffresComponent) },
      { path: "candidatures", loadComponent: () => import("./features/etudiant/mes-candidatures/mes-candidatures.component").then(m => m.MesCandidaturesComponent) },
    ]
  },
  {
    path: "entreprise",
    canActivate: [authGuard, roleGuard(["ENTREPRISE"])],
    children: [
      { path: "",              redirectTo: "dashboard", pathMatch: "full" },
      { path: "dashboard",     loadComponent: () => import("./features/entreprise/dashboard/dashboard.component").then(m => m.EntrepriseDashboardComponent) },
      { path: "offres",        loadComponent: () => import("./features/entreprise/mes-offres/mes-offres.component").then(m => m.MesOffresComponent) },
      { path: "candidatures",  loadComponent: () => import("./features/entreprise/candidatures-recues/candidatures-recues.component").then(m => m.CandidaturesRecuesComponent) },
    ]
  },
  {
    path: "enseignant",
    canActivate: [authGuard, roleGuard(["ENSEIGNANT"])],
    children: [
      { path: "",            redirectTo: "dashboard", pathMatch: "full" },
      { path: "dashboard",   loadComponent: () => import("./features/enseignant/dashboard/dashboard.component").then(m => m.EnseignantDashboardComponent) },
      { path: "conventions", loadComponent: () => import("./features/enseignant/conventions/conventions.component").then(m => m.ConventionsComponent) },
    ]
  },
  {
    path: "admin",
    canActivate: [authGuard, roleGuard(["ADMIN"])],
    children: [
      { path: "",             redirectTo: "dashboard", pathMatch: "full" },
      { path: "dashboard",    loadComponent: () => import("./features/admin/dashboard/dashboard.component").then(m => m.AdminDashboardComponent) },
      { path: "utilisateurs", loadComponent: () => import("./features/admin/utilisateurs/utilisateurs.component").then(m => m.UtilisateursComponent) },
      { path: "reporting",    loadComponent: () => import("./features/admin/reporting/reporting.component").then(m => m.ReportingComponent) },
    ]
  },
  {
    path: "messagerie",
    canActivate: [authGuard],
    loadComponent: () => import("./features/messagerie/messagerie.component").then(m => m.MessagerieComponent)
  },
];
