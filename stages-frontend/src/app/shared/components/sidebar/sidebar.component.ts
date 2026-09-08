import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MessagerieService } from '../../../core/services/messagerie.service';

interface NavItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  auth = inject(AuthService);
  messagerie = inject(MessagerieService);

  ngOnInit() {
    if (this.auth.getToken()) {
      this.messagerie.connect();
    }
  }

  deconnexion() {
    this.messagerie.disconnect();
    this.auth.logout();
  }

  initiales = computed(() => {
    const u = this.auth.user();
    return u ? (u.prenom[0] + u.nom[0]).toUpperCase() : '';
  });

  navItems = computed<NavItem[]>(() => {
    const role = this.auth.role();
    const map: Record<string, NavItem[]> = {
      ETUDIANT: [
        { label: 'Tableau de bord', path: '/etudiant/dashboard' },
        { label: 'Offres de stage', path: '/etudiant/offres' },
        { label: 'Mes candidatures', path: '/etudiant/candidatures' },
        { label: 'Messagerie', path: '/messagerie' },
      ],
      ENTREPRISE: [
        { label: 'Tableau de bord', path: '/entreprise/dashboard' },
        { label: 'Mes offres', path: '/entreprise/offres' },
        { label: 'Candidatures', path: '/entreprise/candidatures' },
        { label: 'Messagerie', path: '/messagerie' },
      ],
      ENSEIGNANT: [
        { label: 'Tableau de bord', path: '/enseignant/dashboard' },
        { label: 'Conventions', path: '/enseignant/conventions' },
        { label: 'Messagerie', path: '/messagerie' },
      ],
      ADMIN: [
        { label: 'Tableau de bord', path: '/admin/dashboard' },
        { label: 'Utilisateurs', path: '/admin/utilisateurs' },
        { label: 'Conventions', path: '/admin/conventions' },
        { label: 'Reporting', path: '/admin/reporting' },
      ],
    };
    return role ? (map[role] ?? []) : [];
  });
}
