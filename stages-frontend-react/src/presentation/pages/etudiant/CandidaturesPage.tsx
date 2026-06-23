import { Link } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { useMesCandidatures } from '../../../application/candidatures/useCandidatures';

export function CandidaturesPage() {
  const { data, isLoading } = useMesCandidatures({ size: 100 });
  const list = data?.content ?? [];

  const badge = (s:string) => s==='ACCEPTEE'?'badge-accepte':s==='REFUSEE'?'badge-refuse':'badge-attente';
  const label = (s:string) => s==='ACCEPTEE'?'Acceptee':s==='REFUSEE'?'Refusee':'En attente';

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-gray-50">
        <Navbar title="Mes candidatures" />
        <main className="p-6">

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label:'En attente', count:list.filter(c=>c.statut==='EN_ATTENTE').length, color:'text-warning-600', border:'border-warning-500' },
              { label:'Acceptees',  count:list.filter(c=>c.statut==='ACCEPTEE').length,   color:'text-success-600', border:'border-success-500' },
              { label:'Refusees',   count:list.filter(c=>c.statut==='REFUSEE').length,    color:'text-danger-600',  border:'border-danger-500'  },
            ].map(s => (
              <Card key={s.label} className={'text-center py-4 border-l-4 '+s.border}>
                <p className={'text-2xl font-bold '+s.color}>{s.count}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </Card>
            ))}
          </div>

          {isLoading ? <Spinner /> : list.length === 0 ? (
            <Card className="text-center py-16">
              <p className="text-gray-400 text-lg font-medium mb-2">Aucune candidature</p>
              <Link to="/etudiant/offres" className="btn-primary">Voir les offres</Link>
            </Card>
          ) : (
            <div className="grid gap-4">
              {list.map(c => (
                <Card key={c.id} className="hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{c.titreOffre}</h3>
                        <span className={badge(c.statut)}>{label(c.statut)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{c.nomEntreprise}</p>
                      <p className="text-xs text-gray-400">Postule le {c.createdAt.slice(0,10)}</p>
                      {c.feedbackEntreprise && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs font-medium text-gray-600 mb-1">Feedback :</p>
                          <p className="text-sm text-gray-700">{c.feedbackEntreprise}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4 shrink-0">
                      <a href={c.cvUrl} target="_blank" rel="noreferrer"
                        className="text-xs text-primary-600 hover:underline border border-primary-200 px-3 py-1.5 rounded-lg">
                        Voir CV
                      </a>
                      {c.statut==='ACCEPTEE' && (
                        <Link to="/messagerie"
                          className="text-xs text-success-600 hover:underline border border-success-200 px-3 py-1.5 rounded-lg">
                          Contacter
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}