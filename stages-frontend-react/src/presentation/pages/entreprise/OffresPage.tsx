import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { useMesOffres } from '../../../application/offres/useOffres';
import { usePublierOffre, useArchiverOffre } from '../../../application/offres/usePublierOffre';
import type { Domaine, Offre } from '../../../domain';

const DOMAINES: Domaine[] = ['INFORMATIQUE','FINANCE','MARKETING','RESSOURCES_HUMAINES','GENIE_CIVIL','ELECTRONIQUE','SANTE','DROIT','COMMUNICATION','AUTRE'];

const schema = z.object({
  titre: z.string().min(1), description: z.string().min(1),
  domaine: z.enum(['INFORMATIQUE','FINANCE','MARKETING','RESSOURCES_HUMAINES','GENIE_CIVIL','ELECTRONIQUE','SANTE','DROIT','COMMUNICATION','AUTRE']),
  localisation: z.string().min(1), dureeMois: z.coerce.number().min(1),
  dateDebut: z.string().min(1), dateExpiration: z.string().min(1),
  remuneration: z.coerce.number().optional(), nombrePostes: z.coerce.number().min(1).default(1),
  competencesRequises: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export function OffresPage() {
  const [showForm, setShowForm]   = useState(false);
  const [detail, setDetail]       = useState<Offre|null>(null);
  const { data, isLoading }       = useMesOffres({ size:50 });
  const publier  = usePublierOffre();
  const archiver = useArchiverOffre();

  const actives  = (data?.content??[]).filter(o=>o.statut==='ACTIVE').length;
  const archivees= (data?.content??[]).filter(o=>o.statut==='ARCHIVEE').length;

  const { register, handleSubmit, formState:{errors}, reset } = useForm<Form>({
    resolver: zodResolver(schema), defaultValues:{ domaine:'INFORMATIQUE', dureeMois:3, nombrePostes:1 }
  });

  function onSubmit(d: Form) {
    publier.mutate(d, { onSuccess:()=>{ setShowForm(false); reset(); } });
  }

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-gray-50">
        <Navbar title="Mes offres de stage" />
        <main className="p-6">

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="text-center py-4 border-l-4 border-primary-500">
              <p className="text-2xl font-bold text-primary-600">{data?.totalElements??0}</p>
              <p className="text-xs text-gray-500 mt-1">Total publiees</p>
            </Card>
            <Card className="text-center py-4 border-l-4 border-success-500">
              <p className="text-2xl font-bold text-success-600">{actives}</p>
              <p className="text-xs text-gray-500 mt-1">Actives</p>
            </Card>
            <Card className="text-center py-4 border-l-4 border-gray-400">
              <p className="text-2xl font-bold text-gray-500">{archivees}</p>
              <p className="text-xs text-gray-500 mt-1">Archivees</p>
            </Card>
          </div>

          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600 text-sm">{data?.totalElements??0} offre(s) publiee(s)</p>
            <Button onClick={()=>setShowForm(true)}>Publier une offre</Button>
          </div>

          {isLoading ? <Spinner /> : (
            <div className="grid gap-4">
              {data?.content.map(o => (
                <Card key={o.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={()=>setDetail(detail?.id===o.id?null:o)}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">{o.titre}</h3>
                        <Badge variant={o.statut==='ACTIVE'?'accepte':'refuse'}>{o.statut}</Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-500 mb-2">
                        <span className="text-primary-600 font-medium">{o.domaine}</span>
                        <span>{o.localisation}</span>
                        <span>{o.dureeMois} mois</span>
                        {o.remuneration && <span>{o.remuneration.toLocaleString()} F/mois</span>}
                      </div>
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span>Debut : {o.dateDebut.slice(0,10)}</span>
                        <span>Expire : {o.dateExpiration.slice(0,10)}</span>
                        <span>{o.nombrePostes} poste(s)</span>
                      </div>

                      {detail?.id===o.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-700 mb-3">{o.description}</p>
                          {o.competencesRequises && (
                            <div className="flex flex-wrap gap-2">
                              {o.competencesRequises.split(',').map((c,i) => (
                                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                  {c.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4 shrink-0" onClick={e=>e.stopPropagation()}>
                      {o.statut==='ACTIVE' && (
                        <Button variant="secondary" size="sm" onClick={()=>archiver.mutate(o.id)}>
                          Archiver
                        </Button>
                      )}
                      <span className="text-xs text-gray-400 text-center">
                        {detail?.id===o.id?'Masquer':'Details'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
              {data?.content.length===0 && (
                <Card className="text-center py-16">
                  <p className="text-gray-400 text-lg font-medium mb-2">Aucune offre publiee</p>
                  <p className="text-gray-400 text-sm mb-6">Publiez votre premiere offre de stage</p>
                  <Button onClick={()=>setShowForm(true)}>Publier une offre</Button>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal publication */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl my-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Publier une offre de stage</h3>
                <button onClick={()=>{setShowForm(false);reset();}}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                  x
                </button>
              </div>

              {publier.isError && (
                <div className="bg-danger-100 text-danger-700 rounded-lg p-3 mb-4 text-sm">
                  {(publier.error as any)?.response?.data?.message ?? 'Erreur'}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Titre du poste" error={errors.titre?.message} {...register('titre')} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea {...register('description')} rows={3} className="input-field resize-none" />
                  {errors.description && <p className="text-xs text-danger-600 mt-1">{errors.description.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Domaine</label>
                    <select {...register('domaine')} className="input-field">
                      {DOMAINES.map(d=><option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <Input label="Localisation" {...register('localisation')} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input label="Duree (mois)" type="number" {...register('dureeMois')} />
                  <Input label="Date debut" type="date" {...register('dateDebut')} />
                  <Input label="Date expiration" type="date" {...register('dateExpiration')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Remuneration (F/mois)" type="number" {...register('remuneration')} />
                  <Input label="Nombre de postes" type="number" {...register('nombrePostes')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Competences requises <span className="text-xs text-gray-400">(separees par des virgules)</span>
                  </label>
                  <textarea {...register('competencesRequises')} rows={2} className="input-field resize-none"
                    placeholder="Java, Spring Boot, Angular..." />
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  <Button variant="secondary" type="button" onClick={()=>{setShowForm(false);reset();}}>Annuler</Button>
                  <Button type="submit" disabled={publier.isPending}>
                    {publier.isPending?'Publication...':'Publier'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}