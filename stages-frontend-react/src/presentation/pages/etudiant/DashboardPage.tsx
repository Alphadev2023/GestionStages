import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../application/auth/useAuthStore';
import { useOffres } from '../../../application/offres/useOffres';
import { useMesCandidatures } from '../../../application/candidatures/useCandidatures';

export function DashboardPage() {
  const { user } = useAuthStore();
  const { data: offres } = useOffres({ size: 1 });
  const { data: candidatures } = useMesCandidatures({ size: 100 });

  const list      = candidatures?.content ?? [];
  const acceptees = list.filter(c => c.statut === 'ACCEPTEE').length;
  const taux      = list.length ? Math.round((acceptees / list.length) * 100) : 0;

  const initiales = user ? (user.prenom[0] + user.nom[0]).toUpperCase() : '?';

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-gray-50">
        <Navbar title="Tableau de bord" />
        <main className="p-6">

          <Card className="mb-6 bg-gradient-to-r from-primary-600 to-primary-800 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1">Bonjour, {user?.prenom} {user?.nom}</h2>
                <p className="text-primary-100 text-sm">{user?.filiere ?? 'Etudiant'} — {user?.promotion ?? ''}</p>
                <p className="text-primary-200 text-xs mt-1">{user?.email}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {initiales}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-500">Offres disponibles</p>
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 text-xs font-bold">OF</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-primary-600">{offres?.totalElements ?? 0}</p>
              <Link to="/etudiant/offres" className="text-xs text-primary-500 hover:underline mt-2 block">
                Voir toutes les offres
              </Link>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-500">Mes candidatures</p>
                <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                  <span className="text-warning-600 text-xs font-bold">CA</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-warning-600">{candidatures?.totalElements ?? 0}</p>
              <div className="flex gap-3 mt-2">
                <span className="text-xs text-success-600">{acceptees} acceptee(s)</span>
                <span className="text-xs text-gray-400">{list.filter(c=>c.statut==='EN_ATTENTE').length} en attente</span>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-500">Taux de reussite</p>
                <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                  <span className="text-success-600 text-xs font-bold">%</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-success-600">{taux}%</p>
              <div className="h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: taux+'%', backgroundColor:'#16a34a' }} />
              </div>
            </Card>
          </div>

          {list.length > 0 && (
            <Card className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Dernieres candidatures</h3>
                <Link to="/etudiant/candidatures" className="text-xs text-primary-600 hover:underline">Voir tout</Link>
              </div>
              <div className="space-y-3">
                {list.slice(0,3).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.titreOffre}</p>
                      <p className="text-xs text-gray-500">{c.nomEntreprise} — {c.createdAt.slice(0,10)}</p>
                    </div>
                    <span className={c.statut==='ACCEPTEE'?'badge-accepte':c.statut==='REFUSEE'?'badge-refuse':'badge-attente'}>
                      {c.statut==='ACCEPTEE'?'Acceptee':c.statut==='REFUSEE'?'Refusee':'En attente'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Link to="/etudiant/offres" className="card flex items-center gap-4 hover:shadow-md transition-shadow border-l-4 border-primary-500">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-primary-600 font-bold text-sm">OF</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Chercher un stage</p>
                <p className="text-xs text-gray-500">{offres?.totalElements ?? 0} offre(s) disponible(s)</p>
              </div>
            </Link>
            <Link to="/messagerie" className="card flex items-center gap-4 hover:shadow-md transition-shadow border-l-4 border-green-500">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-green-600 font-bold text-sm">MS</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Messagerie</p>
                <p className="text-xs text-gray-500">Contacter les entreprises</p>
              </div>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}