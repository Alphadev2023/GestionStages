import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../application/auth/useAuthStore';
import type { Role } from '../../domain';

interface NavItem { label: string; path: string; }

const NAV: Record<Role, NavItem[]> = {
  ETUDIANT: [
    { label:'Tableau de bord',  path:'/etudiant/dashboard' },
    { label:'Offres de stage',  path:'/etudiant/offres' },
    { label:'Mes candidatures', path:'/etudiant/candidatures' },
    { label:'Messagerie',       path:'/messagerie' },
  ],
  ENTREPRISE: [
    { label:'Tableau de bord', path:'/entreprise/dashboard' },
    { label:'Mes offres',       path:'/entreprise/offres' },
    { label:'Candidatures',     path:'/entreprise/candidatures' },
    { label:'Messagerie',       path:'/messagerie' },
  ],
  ENSEIGNANT: [
    { label:'Tableau de bord', path:'/enseignant/dashboard' },
    { label:'Conventions',      path:'/enseignant/conventions' },
    { label:'Messagerie',       path:'/messagerie' },
  ],
  ADMIN: [
    { label:'Tableau de bord', path:'/admin/dashboard' },
    { label:'Utilisateurs',    path:'/admin/utilisateurs' },
    { label:'Reporting',       path:'/admin/reporting' },
  ],
};

export function Sidebar() {
  const { user, role, clearSession } = useAuthStore();
  const items = role ? NAV[role] : [];
  const initiales = user ? (user.prenom[0]+user.nom[0]).toUpperCase() : '?';

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-sidebar text-white flex flex-col z-50">
      <div className="px-6 py-5 border-b border-white/10">
        <h1 className="text-lg font-bold tracking-tight">GestionStages</h1>
        <p className="text-xs text-white/50 mt-0.5">{role}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ' +
              (isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/10')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold">
            {initiales}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.prenom} {user?.nom}</p>
            <p className="text-xs text-white/50 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={clearSession}
          className="w-full text-left px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          Deconnexion
        </button>
      </div>
    </aside>
  );
}