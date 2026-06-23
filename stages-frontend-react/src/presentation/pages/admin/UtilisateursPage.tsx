import { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { useAllUsers, useToggleActif } from '../../../application/users/useUsers';
import { clsx } from 'clsx';

const ROLE_COLORS: Record<string,string> = {
  ETUDIANT:'bg-blue-500', ENTREPRISE:'bg-green-600', ENSEIGNANT:'bg-purple-600', ADMIN:'bg-red-600'
};
const ROLE_BADGES: Record<string,string> = {
  ETUDIANT:'inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700',
  ENTREPRISE:'inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700',
  ENSEIGNANT:'inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700',
  ADMIN:'inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700',
};

export function UtilisateursPage() {
  const { data: users, isLoading } = useAllUsers();
  const toggleActif = useToggleActif();
  const [recherche,  setRecherche]  = useState('');
  const [filtreRole, setFiltreRole] = useState('');
  const [toast, setToast] = useState('');

  const tous = users ?? [];
  const filtres = tous.filter(u =>
    (!filtreRole || u.role===filtreRole) &&
    (!recherche || u.nomComplet.toLowerCase().includes(recherche.toLowerCase()) || u.email.toLowerCase().includes(recherche.toLowerCase()))
  );

  const ROLES = ['ETUDIANT','ENTREPRISE','ENSEIGNANT','ADMIN'];

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(()=>setToast(''), 3000);
  }

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-gray-50">
        <Navbar title="Gestion des utilisateurs" />
        <main className="p-6">

          <div className="grid grid-cols-4 gap-4 mb-6">
            {ROLES.map(r => (
              <Card key={r} className="text-center py-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={()=>setFiltreRole(filtreRole===r?'':r)}>
                <div className={'w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg '+ROLE_COLORS[r]}>
                  {tous.filter(u=>u.role===r).length}
                </div>
                <p className="text-sm font-medium text-gray-700">{r}</p>
              </Card>
            ))}
          </div>

          <Card className="mb-4 flex gap-4 items-center">
            <input value={recherche} onChange={e=>setRecherche(e.target.value)}
              placeholder="Rechercher par nom ou email..." className="input-field flex-1" />
            <select value={filtreRole} onChange={e=>setFiltreRole(e.target.value)} className="input-field w-44">
              <option value="">Tous les roles</option>
              {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
            <span className="text-sm text-gray-500 shrink-0">{filtres.length} / {tous.length}</span>
          </Card>

          {isLoading ? <Spinner /> : (
            <Card className="overflow-hidden p-0">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Utilisateur','Email','Role','Detail','Statut','Actions'].map(h=>(
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtres.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 '+(ROLE_COLORS[u.role]??'bg-gray-500')}>
                            {u.nomComplet.charAt(0).toUpperCase()}
                          </div>
                          <span className={clsx('text-sm font-medium', u.actif?'text-gray-900':'text-gray-400 line-through')}>
                            {u.nomComplet}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                      <td className="px-6 py-4"><span className={ROLE_BADGES[u.role]??''}>{u.role}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-500">{u.nomEntreprise??'—'}</td>
                      <td className="px-6 py-4">
                        {u.actif
                          ? <span className="badge-accepte">Actif</span>
                          : <span className="badge-refuse">Inactif</span>
                        }
                      </td>
                      <td className="px-6 py-4">
                        {u.role!=='ADMIN' && (
                          <button
                            onClick={()=>toggleActif.mutate(u.id, { onSuccess: r=>showToast(r.data.data) })}
                            className={clsx('text-xs px-3 py-1.5 rounded-lg border transition-colors',
                              u.actif
                                ? 'border-danger-300 text-danger-600 hover:bg-danger-50'
                                : 'border-success-300 text-success-600 hover:bg-success-50'
                            )}>
                            {u.actif?'Desactiver':'Activer'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </>
  );
}