import { Link } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../../application/auth/useAuthStore';
import { useConventions } from '../../../application/conventions/useConventions';

export function DashboardPage() {
  const { user }   = useAuthStore();
  const { data }   = useConventions({ size:100 });
  const list       = data?.content ?? [];
  const enAttente  = list.filter(c => c.statut==='EN_ATTENTE').length;
  const validees   = list.filter(c => c.statut!=='EN_ATTENTE' && c.statut!=='REJETEE').length;
  const initiales  = user ? (user.prenom[0]+user.nom[0]).toUpperCase() : '?';

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-gray-50">
        <Navbar title="Tableau de bord" />
        <main className="p-6">

          <Card className="mb-6 bg-gradient-to-r from-purple-700 to-purple-500 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1">{user?.prenom} {user?.nom}</h2>
                <p className="text-purple-100 text-sm">Departement : {user?.departement ?? 'Non renseigne'}</p>
                <p className="text-purple-200 text-xs mt-1">{user?.email}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {initiales}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-6 mb-6">
            {[
              { label:'Total conventions', count:list.length,  color:'text-purple-600', bg:'bg-purple-100', tc:'text-purple-600', abbr:'CV', sub:'Conventions assignees' },
              { label:'En attente',        count:enAttente,    color:'text-warning-600', bg:'bg-warning-100', tc:'text-warning-600', abbr:'AT', sub:'A valider rapidement' },
              { label:'Validees',          count:validees,     color:'text-success-600', bg:'bg-success-100', tc:'text-success-600', abbr:'OK', sub:'Conventions approuvees' },
            ].map(s => (
              <Card key={s.label}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-500">{s.label}</p>
                  <div className={'w-8 h-8 rounded-lg flex items-center justify-center '+s.bg}>
                    <span className={'text-xs font-bold '+s.tc}>{s.abbr}</span>
                  </div>
                </div>
                <p className={'text-3xl font-bold '+s.color}>{s.count}</p>
                <p className="text-xs text-gray-400 mt-2">{s.sub}</p>
              </Card>
            ))}
          </div>

          {enAttente > 0 && (
            <Card className="mb-6 border-l-4 border-warning-500 bg-warning-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-warning-800">{enAttente} convention(s) en attente</p>
                  <p className="text-sm text-warning-600 mt-1">Des etudiants attendent votre validation</p>
                </div>
                <Link to="/enseignant/conventions"><Button>Valider maintenant</Button></Link>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Link to="/enseignant/conventions" className="card flex items-center gap-4 hover:shadow-md transition-shadow border-l-4 border-purple-500">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-purple-600 font-bold text-sm">CV</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Gerer les conventions</p>
                <p className="text-xs text-gray-500">{enAttente} en attente de validation</p>
              </div>
            </Link>
            <Link to="/messagerie" className="card flex items-center gap-4 hover:shadow-md transition-shadow border-l-4 border-blue-500">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-blue-600 font-bold text-sm">MS</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Messagerie</p>
                <p className="text-xs text-gray-500">Echanger avec les etudiants</p>
              </div>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}