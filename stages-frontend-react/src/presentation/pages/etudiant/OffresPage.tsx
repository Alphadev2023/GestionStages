import { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { useOffres } from '../../../application/offres/useOffres';
import { usePostuler } from '../../../application/candidatures/useCandidatures';
import type { Offre, Domaine } from '../../../domain';

const DOMAINES: Domaine[] = ['INFORMATIQUE','FINANCE','MARKETING','RESSOURCES_HUMAINES','GENIE_CIVIL','ELECTRONIQUE','SANTE','DROIT','COMMUNICATION','AUTRE'];

export function OffresPage() {
  const [domaine, setDomaine]           = useState('');
  const [localisation, setLocalisation] = useState('');
  const [page, setPage]                 = useState(0);
  const [offre, setOffre]               = useState<Offre|null>(null);
  const [cv, setCv]                     = useState<File|null>(null);
  const [lettre, setLettre]             = useState('');
  const [erreur, setErreur]             = useState('');

  const { data, isLoading } = useOffres({ domaine: domaine||undefined, localisation: localisation||undefined, page, size:10 });
  const postuler = usePostuler();

  function handlePostuler() {
    if (!cv || !offre) return;
    setErreur('');
    postuler.mutate(
      { offreId: offre.id, lettreMotivation: lettre, cv },
      {
        onSuccess: () => { setOffre(null); setCv(null); setLettre(''); },
        onError: (e:any) => setErreur(e.response?.data?.message ?? 'Erreur'),
      }
    );
  }

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-gray-50">
        <Navbar title="Offres de stage" />
        <main className="p-6">

          <Card className="mb-6 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Domaine</label>
              <select value={domaine} onChange={e=>setDomaine(e.target.value)} className="input-field w-48">
                <option value="">Tous les domaines</option>
                {DOMAINES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Localisation</label>
              <input value={localisation} onChange={e=>setLocalisation(e.target.value)}
                placeholder="Ex: Conakry..." className="input-field w-48" />
            </div>
            <Button onClick={()=>setPage(0)}>Rechercher</Button>
            <Button variant="secondary" onClick={()=>{setDomaine('');setLocalisation('');setPage(0);}}>Reinitialiser</Button>
          </Card>

          {isLoading ? <Spinner /> : (
            <>
              <p className="text-sm text-gray-500 mb-3">{data?.totalElements ?? 0} offre(s) trouvee(s)</p>
              <div className="grid gap-4">
                {data?.content.map(o => (
                  <Card key={o.id} className="hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">{o.titre}</h3>
                          <Badge variant="active">{o.domaine}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{o.nomEntreprise} — {o.localisation}</p>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{o.description}</p>
                        <div className="flex gap-6 text-xs text-gray-500">
                          <span>Duree : {o.dureeMois} mois</span>
                          {o.remuneration && <span>Remuneration : {o.remuneration.toLocaleString()} F/mois</span>}
                          <span>Expire le {o.dateExpiration.slice(0,10)}</span>
                        </div>
                      </div>
                      <Button onClick={()=>{setOffre(o);setCv(null);setLettre('');setErreur('');}} className="ml-6 shrink-0">
                        Postuler
                      </Button>
                    </div>
                  </Card>
                ))}
                {data?.content.length === 0 && (
                  <Card className="text-center py-16 text-gray-400">Aucune offre trouvee</Card>
                )}
              </div>

              {data && data.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button variant="secondary" size="sm" disabled={page===0} onClick={()=>setPage(p=>p-1)}>Precedent</Button>
                  <span className="px-4 py-1.5 text-sm text-gray-600">Page {page+1} / {data.totalPages}</span>
                  <Button variant="secondary" size="sm" disabled={data.last} onClick={()=>setPage(p=>p+1)}>Suivant</Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {offre && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-1">Postuler : {offre.titre}</h3>
            <p className="text-sm text-gray-500 mb-4">{offre.nomEntreprise}</p>
            {erreur && <div className="bg-danger-100 text-danger-700 rounded-lg p-3 mb-4 text-sm">{erreur}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CV (PDF obligatoire)</label>
                <input type="file" accept=".pdf" onChange={e=>setCv(e.target.files?.[0]??null)} className="input-field" />
                {cv && <p className="text-xs text-success-600 mt-1">{cv.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lettre de motivation</label>
                <textarea value={lettre} onChange={e=>setLettre(e.target.value)} rows={5}
                  className="input-field resize-none" placeholder="Redigez votre lettre..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={()=>setOffre(null)}>Annuler</Button>
              <Button onClick={handlePostuler} disabled={!cv||postuler.isPending}>
                {postuler.isPending ? 'Envoi...' : 'Envoyer ma candidature'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}