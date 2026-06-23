import { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useConventions, useValiderConvention, useRejeterConvention } from '../../../application/conventions/useConventions';
import type { StatutConvention } from '../../../domain';

const STATUTS = [
  { value: undefined,               label: 'Toutes' },
  { value: 'EN_ATTENTE' as StatutConvention,         label: 'En attente' },
  { value: 'VALIDEE_ENSEIGNANT' as StatutConvention, label: 'Validees' },
];

export function ConventionsPage() {
  const [filtre, setFiltre]   = useState<StatutConvention|undefined>(undefined);
  const [commentaires, setCommentaires] = useState<Record<number,string>>({});
  const [showComment, setShowComment]   = useState<number|null>(null);

  const params = filtre ? { statut: filtre, size:50 } : { size:50 };
  const { data, isLoading } = useConventions(params);
  const valider  = useValiderConvention();
  const rejeter  = useRejeterConvention();
  const list     = data?.content ?? [];

  const badge = (s:string) => {
    if(s==='APPROUVEE_ADMIN') return 'badge-accepte';
    if(s==='REJETEE')         return 'badge-refuse';
    if(s==='VALIDEE_ENSEIGNANT') return 'badge-active';
    return 'badge-attente';
  };
  const labelS = (s:string) => ({
    EN_ATTENTE:'En attente', VALIDEE_ENSEIGNANT:'Validee',
    APPROUVEE_ADMIN:'Approuvee', REJETEE:'Rejetee'
  }[s] ?? s);

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-gray-50">
        <Navbar title="Conventions a valider" />
        <main className="p-6">

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="text-center py-4 border-l-4 border-warning-500">
              <p className="text-2xl font-bold text-warning-600">{list.filter(c=>c.statut==='EN_ATTENTE').length}</p>
              <p className="text-xs text-gray-500 mt-1">En attente</p>
            </Card>
            <Card className="text-center py-4 border-l-4 border-success-500">
              <p className="text-2xl font-bold text-success-600">{list.filter(c=>c.statut!=='EN_ATTENTE'&&c.statut!=='REJETEE').length}</p>
              <p className="text-xs text-gray-500 mt-1">Validees</p>
            </Card>
          </div>

          <Card className="mb-6 flex gap-3">
            {STATUTS.map(s => (
              <Button key={s.label} variant={filtre===s.value?'primary':'secondary'} size="sm"
                onClick={()=>setFiltre(s.value)}>
                {s.label}
              </Button>
            ))}
          </Card>

          {isLoading ? <Spinner /> : (
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
                          <p className="text-xs text-gray-500">{c.titreOffre}</p>
                        </div>
                        <span className={badge(c.statut)}>{labelS(c.statut)}</span>
                      </div>
                      <div className="ml-12 grid grid-cols-2 gap-4 text-xs text-gray-500">
                        <span>Entreprise : {c.nomEntreprise}</span>
                        <span>Stage : {c.dateDebutStage.slice(0,10)} - {c.dateFinStage.slice(0,10)}</span>
                      </div>
                      {showComment===c.id && (
                        <div className="ml-12 mt-3">
                          <textarea
                            value={commentaires[c.id]??''}
                            onChange={e=>setCommentaires(prev=>({...prev,[c.id]:e.target.value}))}
                            rows={2} className="input-field resize-none text-sm"
                            placeholder="Commentaire (optionnel)..." />
                        </div>
                      )}
                    </div>
                    {c.statut==='EN_ATTENTE' && (
                      <div className="flex flex-col gap-2 ml-4 shrink-0">
                        <Button size="sm" variant="success"
                          onClick={()=>valider.mutate({id:c.id,commentaire:commentaires[c.id]})}>
                          Valider
                        </Button>
                        <Button size="sm" variant="danger"
                          onClick={()=>rejeter.mutate({id:c.id,commentaire:commentaires[c.id]})}>
                          Rejeter
                        </Button>
                        <button onClick={()=>setShowComment(showComment===c.id?null:c.id)}
                          className="text-xs text-gray-500 hover:text-gray-700 underline">
                          {showComment===c.id?'Masquer':'Commentaire'}
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              {list.length===0 && (
                <Card className="text-center py-16">
                  <p className="text-gray-400 text-lg font-medium">Aucune convention</p>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}