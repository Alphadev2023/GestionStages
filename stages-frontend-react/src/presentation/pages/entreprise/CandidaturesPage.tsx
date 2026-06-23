import { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useMesOffres } from '../../../application/offres/useOffres';
import { useCandidaturesParOffre, useTraiterCandidature } from '../../../application/candidatures/useCandidatures';

export function CandidaturesPage() {
  const [offreId, setOffreId] = useState<number|null>(null);
  const { data: offres }      = useMesOffres({ size:50 });
  const { data, isLoading }   = useCandidaturesParOffre(offreId);
  const traiter               = useTraiterCandidature();
  const list = data?.content ?? [];

  const badge = (s:string) => s==='ACCEPTEE'?'badge-accepte':s==='REFUSEE'?'badge-refuse':'badge-attente';
  const label = (s:string) => s==='ACCEPTEE'?'Acceptee':s==='REFUSEE'?'Refusee':'En attente';

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-gray-50">
        <Navbar title="Candidatures recues" />
        <main className="p-6">

          <Card className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Selectionner une offre</label>
            <select value={offreId??''} onChange={e=>setOffreId(Number(e.target.value)||null)} className="input-field w-96">
              <option value="">-- Choisir une offre --</option>
              {offres?.content.map(o=><option key={o.id} value={o.id}>{o.titre}</option>)}
            </select>
          </Card>

          {offreId && list.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label:'En attente', count:list.filter(c=>c.statut==='EN_ATTENTE').length, color:'text-warning-600', border:'border-warning-500' },
                { label:'Acceptees',  count:list.filter(c=>c.statut==='ACCEPTEE').length,   color:'text-success-600', border:'border-success-500' },
                { label:'Refusees',   count:list.filter(c=>c.statut==='REFUSEE').length,    color:'text-danger-600',  border:'border-danger-500'  },
              ].map(s=>(
                <Card key={s.label} className={'text-center py-3 border-l-4 '+s.border}>
                  <p className={'text-2xl font-bold '+s.color}>{s.count}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </Card>
              ))}
            </div>
          )}

          {offreId && (
            isLoading ? <Spinner /> : (
              <div className="grid gap-4">
                {list.map(c => (
                  <Card key={c.id} className="hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                            {c.nomEtudiant.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{c.nomEtudiant}</p>
                            <p className="text-xs text-gray-400">Postule le {c.createdAt.slice(0,10)}</p>
                          </div>
                          <span className={badge(c.statut)}>{label(c.statut)}</span>
                        </div>
                        {c.lettreMotivation && (
                          <div className="ml-12 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 mb-1">Lettre de motivation :</p>
                            <p className="text-sm text-gray-700 line-clamp-3">{c.lettreMotivation}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4 shrink-0">
                        <a href={c.cvUrl} target="_blank" rel="noreferrer"
                          className="text-xs text-primary-600 hover:underline border border-primary-200 px-3 py-1.5 rounded-lg">
                          Voir CV
                        </a>
                        {c.statut==='EN_ATTENTE' && (
                          <>
                            <Button size="sm" variant="success" onClick={()=>traiter.mutate({id:c.id,statut:'ACCEPTEE'})}>Accepter</Button>
                            <Button size="sm" variant="danger"  onClick={()=>traiter.mutate({id:c.id,statut:'REFUSEE'})}>Refuser</Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                {list.length===0 && <Card className="text-center py-12 text-gray-400">Aucune candidature</Card>}
              </div>
            )
          )}
        </main>
      </div>
    </>
  );
}