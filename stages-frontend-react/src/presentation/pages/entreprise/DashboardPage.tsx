import { Link } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../../application/auth/useAuthStore';
import { useMesOffres } from '../../../application/offres/useOffres';

export function DashboardPage() {
  const { user } = useAuthStore();
  const { data } = useMesOffres({ size: 100 });
  const actives = (data?.content ?? []).filter(o => o.statut === 'ACTIVE').length;
  const initiales = user ? (user.prenom[0]+user.nom[0]).toUpperCase() : '?';

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-gray-50">
        <Navbar title="Tableau de bord" />
        <main className="p-6">

          <Card className="mb-6 bg-gradient-to-r from-green-700 to-green-500 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1">{user?.nomEntreprise ?? user?.nom}</h2>
                <p className="text-green-100 text-sm">{user?.secteurActivite ?? 'Entreprise'}</p>
                <p className="text-green-200 text-xs mt-1">{user?.email}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {initiales}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-500">Offres publiees</p>
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 text-xs font-bold">OF</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-primary-600">{data?.totalElements ?? 0}</p>
              <p className="text-xs text-success-600 mt-2">{actives} active(s)</p>
            </Card>
            <Card>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-500">Taux d occupation</p>
                <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                  <span className="text-success-600 text-xs font-bold">%</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-success-600">
                {data?.totalElements ? Math.round((actives/data.totalElements)*100) : 0}%
              </p>
              <p className="text-xs text-gray-400 mt-2">Offres actives / total</p>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { to:'/entreprise/offres', label:'Gerer mes offres', sub:'Publier et gerer vos offres', color:'border-primary-500', bg:'bg-primary-100', text:'text-primary-600', abbr:'OF' },
              { to:'/entreprise/candidatures', label:'Candidatures recues', sub:'Accepter ou refuser', color:'border-warning-500', bg:'bg-warning-100', text:'text-warning-600', abbr:'CA' },
              { to:'/messagerie', label:'Messagerie', sub:'Echanger avec les etudiants', color:'border-blue-500', bg:'bg-blue-100', text:'text-blue-600', abbr:'MS' },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className={'card flex items-center gap-4 hover:shadow-md transition-shadow border-l-4 '+item.color}>
                <div className={'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 '+item.bg}>
                  <span className={'font-bold text-sm '+item.text}>{item.abbr}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}