import { useState } from 'react';
import toast from 'react-hot-toast';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { useConventions, useValiderConvention, useRejeterConvention } from '../../../application/conventions/useConventions';
import type { Convention, StatutConvention } from '../../../domain';

const STATUT_COLORS: Record<string, string> = {
  EN_ATTENTE:         'badge-attente',
  VALIDEE_ENSEIGNANT: 'badge-active',
  APPROUVEE_ADMIN:    'badge-accepte',
  REJETEE:            'badge-refuse',
};
const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE:         'En attente',
  VALIDEE_ENSEIGNANT: 'Validee',
  APPROUVEE_ADMIN:    'Approuvee',
  REJETEE:            'Rejetee',
};

export function ConventionsPage() {
  const [filtre,      setFiltre]      = useState<StatutConvention|undefined>(undefined);
  const [page,        setPage]        = useState(0);
  const [size,        setSize]        = useState(6);
  const [selected,    setSelected]    = useState<Convention|null>(null);
  const [action,      setAction]      = useState<'VALIDER'|'REJETER'|null>(null);
  const [commentaire, setCommentaire] = useState('');

  const { data, isLoading } = useConventions(
    filtre ? { statut: filtre, size: 100 } : { size: 100 }
  );
  const valider = useValiderConvention();
  const rejeter = useRejeterConvention();

  // Trier : EN_ATTENTE en premier
  const list = [...(data?.content ?? [])].sort((a, b) => {
    if (a.statut === 'EN_ATTENTE' && b.statut !== 'EN_ATTENTE') return -1;
    if (a.statut !== 'EN_ATTENTE' && b.statut === 'EN_ATTENTE') return 1;
    return 0;
  });

  const enAttente = list.filter(c => c.statut === 'EN_ATTENTE').length;
  const validees  = list.filter(c => c.statut === 'VALIDEE_ENSEIGNANT').length;

  const totalPages = Math.ceil(list.length / size);
  const listPage   = list.slice(page * size, (page + 1) * size);

  function changerFiltre(f: StatutConvention|undefined) { setFiltre(f); setPage(0); }

  function confirmer() {
    if (!selected || !action) return;
    const id = toast.loading(action === 'VALIDER' ? 'Validation...' : 'Rejet...');
    const mutation = action === 'VALIDER' ? valider : rejeter;
    mutation.mutate({ id: selected.id, commentaire: commentaire || undefined }, {
      onSuccess: () => {
        toast.dismiss(id);
        toast.success(action === 'VALIDER' ? 'Convention validee !' : 'Convention rejetee');
        setSelected(null); setAction(null); setCommentaire('');
        setPage(0); // Revenir a la premiere page
      },
      onError: () => { toast.dismiss(id); toast.error('Erreur lors du traitement'); },
    });
  }

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-gray-50">
        <Navbar title="Conventions a valider" />
        <main className="p-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div onClick={()=>changerFiltre(undefined)}
              className={'card text-center py-4 border-l-4 border-gray-400 cursor-pointer hover:shadow-md transition-all ' + (!filtre ? 'shadow-md ring-2 ring-offset-1 ring-primary-400' : '')}>
              <p className="text-2xl font-bold text-gray-700">{list.length}</p>
              <p className="text-xs text-gray-500 mt-1">Toutes</p>
            </div>
            <div onClick={()=>changerFiltre('EN_ATTENTE' as StatutConvention)}
              className={'card text-center py-4 border-l-4 border-warning-500 cursor-pointer hover:shadow-md transition-all ' + (filtre==='EN_ATTENTE' ? 'shadow-md ring-2 ring-offset-1 ring-primary-400' : '')}>
              <p className="text-2xl font-bold text-warning-600">{enAttente}</p>
              <p className="text-xs text-gray-500 mt-1">En attente</p>
            </div>
            <div onClick={()=>changerFiltre('VALIDEE_ENSEIGNANT' as StatutConvention)}
              className={'card text-center py-4 border-l-4 border-success-500 cursor-pointer hover:shadow-md transition-all ' + (filtre==='VALIDEE_ENSEIGNANT' ? 'shadow-md ring-2 ring-offset-1 ring-primary-400' : '')}>
              <p className="text-2xl font-bold text-success-600">{validees}</p>
              <p className="text-xs text-gray-500 mt-1">Validees</p>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500 font-medium">{list.length} convention(s)</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Afficher</span>
              <select value={size} onChange={e=>{setSize(Number(e.target.value));setPage(0);}}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value={3}>3 par page</option>
                <option value={6}>6 par page</option>
                <option value={9}>9 par page</option>
              </select>
            </div>
          </div>

          {isLoading ? <Spinner text="Chargement des conventions..." /> : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listPage.map((c: Convention) => (
                  <div key={c.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">

                    {/* Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {c.nomEtudiant.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{c.nomEtudiant}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{c.titreOffre}</p>
                          </div>
                        </div>
                        <span className={STATUT_COLORS[c.statut] + ' shrink-0 text-xs'}>
                          {STATUT_LABELS[c.statut]}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex-1 space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Entreprise</span>
                        <span className="font-medium">{c.nomEntreprise}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Debut</span>
                        <span className="font-medium">{c.dateDebutStage.slice(0,10)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fin</span>
                        <span className="font-medium">{c.dateFinStage.slice(0,10)}</span>
                      </div>
                      {c.commentaireEnseignant && (
                        <div className="p-2 bg-blue-50 rounded-lg mt-2">
                          <p className="text-xs text-blue-700 line-clamp-2">{c.commentaireEnseignant}</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {c.statut === 'EN_ATTENTE' && (
                      <div className="p-3 border-t border-gray-100 flex gap-2">
                        <button
                          onClick={()=>{ setSelected(c); setAction('VALIDER'); setCommentaire(''); }}
                          className="flex-1 text-xs py-1.5 rounded-lg bg-success-600 hover:bg-success-700 text-white font-medium transition-colors">
                          Valider
                        </button>
                        <button
                          onClick={()=>{ setSelected(c); setAction('REJETER'); setCommentaire(''); }}
                          className="flex-1 text-xs py-1.5 rounded-lg bg-danger-600 hover:bg-danger-700 text-white font-medium transition-colors">
                          Rejeter
                        </button>
                      </div>
                    )}
                    {c.statut !== 'EN_ATTENTE' && (
                      <div className="p-3 border-t border-gray-100">
                        <p className="text-xs text-center text-gray-400">
                          {c.statut === 'VALIDEE_ENSEIGNANT' ? 'Validee par vous' : STATUT_LABELS[c.statut]}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {listPage.length === 0 && (
                  <div className="col-span-3 text-center py-16 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-400 text-lg font-medium">Aucune convention</p>
                    <p className="text-gray-400 text-sm mt-1">Les conventions vous seront assignees automatiquement</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-1">
                  <p className="text-sm text-gray-500">Page {page+1} sur {totalPages} â€” {list.length} conventions</p>
                  <div className="flex items-center gap-2">
                    <button disabled={page===0} onClick={()=>setPage(p=>p-1)}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      Precedent
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_,i) => (
                        <button key={i} onClick={()=>setPage(i)}
                          className={'w-8 h-8 text-sm rounded-lg transition-colors font-medium ' +
                            (i===page ? 'bg-primary-600 text-white' : 'border border-gray-300 hover:bg-gray-50 text-gray-600')}>
                          {i+1}
                        </button>
                      ))}
                    </div>
                    <button disabled={page>=totalPages-1} onClick={()=>setPage(p=>p+1)}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal confirmation */}
      <Modal
        open={!!selected && !!action}
        onClose={()=>{ setSelected(null); setAction(null); setCommentaire(''); }}
        title={action === 'VALIDER' ? 'Valider cette convention' : 'Rejeter cette convention'}
        size="sm">
        {selected && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  {selected.nomEtudiant.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{selected.nomEtudiant}</p>
                  <p className="text-xs text-gray-500">{selected.titreOffre}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-2">
                <span>Entreprise : <strong>{selected.nomEntreprise}</strong></span>
                <span>Debut : <strong>{selected.dateDebutStage.slice(0,10)}</strong></span>
              </div>
            </div>

            {action === 'VALIDER' && (
              <div className="p-3 bg-success-50 rounded-lg border border-success-200">
                <p className="text-sm text-success-700 font-medium">
                  Vous confirmez que cette convention est conforme aux exigences academiques.
                </p>
              </div>
            )}
            {action === 'REJETER' && (
              <div className="p-3 bg-danger-50 rounded-lg border border-danger-200">
                <p className="text-sm text-danger-700 font-medium">
                  Cette convention sera rejetee. Precisez les raisons ci-dessous.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commentaire
                {action === 'REJETER' && <span className="text-danger-600 ml-1">*</span>}
                {action === 'VALIDER' && <span className="text-gray-400 text-xs ml-1">(optionnel)</span>}
              </label>
              <textarea value={commentaire} onChange={e=>setCommentaire(e.target.value)} rows={3}
                className="input-field resize-none"
                placeholder={action === 'VALIDER'
                  ? 'Ex: Convention conforme aux exigences academiques...'
                  : 'Ex: Dossier incomplet, veuillez fournir les pieces manquantes...'} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1"
                onClick={()=>{ setSelected(null); setAction(null); setCommentaire(''); }}>
                Annuler
              </Button>
              <Button variant={action==='VALIDER'?'success':'danger'} className="flex-1"
                onClick={confirmer} disabled={valider.isPending || rejeter.isPending}>
                {valider.isPending || rejeter.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Traitement...
                  </span>
                ) : action === 'VALIDER' ? 'Confirmer la validation' : 'Confirmer le rejet'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
