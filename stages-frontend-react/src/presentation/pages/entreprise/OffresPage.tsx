import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { useMesOffres } from '../../../application/offres/useOffres';
import { usePublierOffre, useArchiverOffre } from '../../../application/offres/usePublierOffre';
import { getErrorMessage } from '../../../shared/errors';
import type { Domaine, Offre, OffreRequest } from '../../../domain';

const DOMAINES: Domaine[] = ['INFORMATIQUE','FINANCE','MARKETING','RESSOURCES_HUMAINES','GENIE_CIVIL','ELECTRONIQUE','SANTE','DROIT','COMMUNICATION','AUTRE'];

const today = new Date().toISOString().split('T')[0];

const schema = Yup.object({
  titre:          Yup.string().min(5, 'Minimum 5 caracteres').required('Titre obligatoire'),
  description:    Yup.string().min(20, 'Minimum 20 caracteres').required('Description obligatoire'),
  domaine:        Yup.string().required('Domaine obligatoire'),
  localisation:   Yup.string().required('Localisation obligatoire'),
  dureeMois:      Yup.number().min(1, 'Minimum 1 mois').required('Duree obligatoire'),
  dateDebut:      Yup.string().required('Date de debut obligatoire')
    .test('future', 'La date de debut doit etre aujourd hui ou dans le futur', v => !v || new Date(v) >= new Date(today)),
  dateExpiration: Yup.string().required('Date d expiration obligatoire')
    .test('after-debut', 'La date d expiration doit etre apres la date de debut', function(v) {
      const { dateDebut } = this.parent;
      return !v || !dateDebut || new Date(v) > new Date(dateDebut);
    })
    .test('match-duree', 'La duree ne correspond pas aux dates', function(v) {
      const { dateDebut, dureeMois } = this.parent;
      if (!v || !dateDebut || !dureeMois) return true;
      const diff = (new Date(v).getTime() - new Date(dateDebut).getTime()) / (1000 * 60 * 60 * 24 * 30.44);
      return Math.abs(diff - dureeMois) <= 0.5;
    }),
  nombrePostes: Yup.number().min(1).required(),
});

const initialValues: OffreRequest = {
  titre:'', description:'', domaine:'INFORMATIQUE', localisation:'',
  dureeMois:3, dateDebut:'', dateExpiration:'', nombrePostes:1,
  remuneration: undefined, competencesRequises:''
};

const DOMAINE_COLORS: Record<string, string> = {
  INFORMATIQUE:'bg-blue-100 text-blue-700', FINANCE:'bg-green-100 text-green-700',
  MARKETING:'bg-pink-100 text-pink-700', DROIT:'bg-purple-100 text-purple-700',
  SANTE:'bg-red-100 text-red-700', GENIE_CIVIL:'bg-orange-100 text-orange-700',
  ELECTRONIQUE:'bg-yellow-100 text-yellow-700', RESSOURCES_HUMAINES:'bg-teal-100 text-teal-700',
  COMMUNICATION:'bg-indigo-100 text-indigo-700', AUTRE:'bg-gray-100 text-gray-700',
};

export function OffresPage() {
  const [showForm, setShowForm] = useState(false);
  const [detail,   setDetail]   = useState<Offre|null>(null);
  const [page,     setPage]     = useState(0);
  const [size,     setSize]     = useState(6);

  const { data, isLoading } = useMesOffres({ size: 100, page: 0 });
  const publier  = usePublierOffre();
  const archiver = useArchiverOffre();

  const offresTriees = [...(data?.content ?? [])].sort((a, b) => {
    if (a.statut === 'ACTIVE' && b.statut !== 'ACTIVE') return -1;
    if (a.statut !== 'ACTIVE' && b.statut === 'ACTIVE') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const actives        = offresTriees.filter(o => o.statut === 'ACTIVE').length;
  const archivees      = offresTriees.filter(o => o.statut === 'ARCHIVEE').length;
  const totalPages     = Math.ceil(offresTriees.length / size);
  const offresPage     = offresTriees.slice(page * size, (page + 1) * size);

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-gray-50">
        <Navbar title="Mes offres de stage" />
        <main className="p-6">

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="text-center py-4 border-l-4 border-primary-500">
              <p className="text-3xl font-bold text-primary-600">{data?.totalElements ?? 0}</p>
              <p className="text-xs text-gray-500 mt-1">Total publiees</p>
            </Card>
            <Card className="text-center py-4 border-l-4 border-success-500">
              <p className="text-3xl font-bold text-success-600">{actives}</p>
              <p className="text-xs text-gray-500 mt-1">Actives</p>
            </Card>
            <Card className="text-center py-4 border-l-4 border-gray-400">
              <p className="text-3xl font-bold text-gray-500">{archivees}</p>
              <p className="text-xs text-gray-500 mt-1">Archivees</p>
            </Card>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <p className="text-gray-600 text-sm font-medium">{offresTriees.length} offre(s)</p>
              <select value={size} onChange={e => { setSize(Number(e.target.value)); setPage(0); }}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value={3}>3 par page</option>
                <option value={6}>6 par page</option>
                <option value={9}>9 par page</option>
                <option value={12}>12 par page</option>
              </select>
            </div>
            <Button onClick={() => setShowForm(true)}>+ Publier une offre</Button>
          </div>

          {isLoading ? <Spinner text="Chargement des offres..." /> : (
            <>
              {/* Grille */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offresPage.map(o => (
                  <div key={o.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 flex-1">{o.titre}</h3>
                        <Badge variant={o.statut === 'ACTIVE' ? 'accepte' : 'refuse'} className="shrink-0 text-xs">{o.statut}</Badge>
                      </div>
                      <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (DOMAINE_COLORS[o.domaine] ?? 'bg-gray-100 text-gray-700')}>
                        {o.domaine}
                      </span>
                    </div>
                    <div className="p-4 flex-1 space-y-1.5 text-xs text-gray-600">
                      <div className="flex justify-between"><span className="text-gray-400">Localisation</span><span className="font-medium">{o.localisation}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Duree</span><span className="font-medium">{o.dureeMois} mois</span></div>
                      {o.remuneration && <div className="flex justify-between"><span className="text-gray-400">Remuneration</span><span className="font-medium text-success-600">{o.remuneration.toLocaleString()} F</span></div>}
                      <div className="flex justify-between"><span className="text-gray-400">Postes</span><span className="font-medium">{o.nombrePostes}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Expire</span><span className="font-medium">{o.dateExpiration.slice(0,10)}</span></div>
                      {detail?.id === o.id && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-700 mb-2">{o.description}</p>
                          {o.competencesRequises && (
                            <div className="flex flex-wrap gap-1">
                              {o.competencesRequises.split(',').map((c,i) => (
                                <span key={i} className="text-xs bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded border border-primary-100">{c.trim()}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-100 flex gap-2">
                      <button onClick={() => setDetail(detail?.id === o.id ? null : o)}
                        className="flex-1 text-xs text-gray-500 hover:text-primary-600 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                        {detail?.id === o.id ? 'Masquer' : 'Voir details'}
                      </button>
                      {o.statut === 'ACTIVE' && (
                        <button onClick={() => archiver.mutate(o.id, {
                          onSuccess: () => toast.success('Offre archivee'),
                          onError: () => toast.error('Erreur')
                        })}
                          className="flex-1 text-xs text-danger-600 hover:bg-danger-50 py-1.5 rounded-lg border border-danger-200 transition-colors">
                          Archiver
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {offresPage.length === 0 && (
                  <div className="col-span-3 text-center py-16 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-400 text-lg font-medium mb-2">Aucune offre publiee</p>
                    <Button onClick={() => setShowForm(true)}>Publier ma premiere offre</Button>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-1">
                  <p className="text-sm text-gray-500">Page {page+1} sur {totalPages} — {offresTriees.length} offres</p>
                  <div className="flex items-center gap-2">
                    <button disabled={page === 0} onClick={() => setPage(p => p-1)}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      Precedent
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_,i) => (
                        <button key={i} onClick={() => setPage(i)}
                          className={`w-8 h-8 text-sm rounded-lg transition-colors font-medium ${i === page ? 'bg-primary-600 text-white' : 'border border-gray-300 hover:bg-gray-50 text-gray-600'}`}>
                          {i+1}
                        </button>
                      ))}
                    </div>
                    <button disabled={page >= totalPages-1} onClick={() => setPage(p => p+1)}
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

      {/* Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Publier une offre de stage" size="lg">
        <Formik
          initialValues={initialValues}
          validationSchema={schema}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            const id = toast.loading('Publication en cours...');
            publier.mutate(values, {
              onSuccess: () => {
                toast.dismiss(id); toast.success('Offre publiee avec succes !');
                setShowForm(false); resetForm(); setPage(0);
              },
              onError: (e) => {
                toast.dismiss(id); toast.error(getErrorMessage(e, 'Erreur lors de la publication'));
                setSubmitting(false);
              },
            });
          }}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre du poste <span className="text-danger-600">*</span></label>
                <Field name="titre" placeholder="Ex: Developpeur Full Stack Java/Angular" className="input-field" />
                <ErrorMessage name="titre" component="p" className="text-xs text-danger-600 mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-danger-600">*</span></label>
                <Field as="textarea" name="description" rows={3} placeholder="Decrivez les missions..." className="input-field resize-none" />
                <ErrorMessage name="description" component="p" className="text-xs text-danger-600 mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domaine <span className="text-danger-600">*</span></label>
                  <Field as="select" name="domaine" className="input-field">
                    {DOMAINES.map(d => <option key={d} value={d}>{d}</option>)}
                  </Field>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localisation <span className="text-danger-600">*</span></label>
                  <Field name="localisation" placeholder="Ex: Conakry, Guinee" className="input-field" />
                  <ErrorMessage name="localisation" component="p" className="text-xs text-danger-600 mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duree (mois) <span className="text-danger-600">*</span></label>
                  <Field name="dureeMois" type="number" min={1} placeholder="Ex: 3" className="input-field"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const duree = Number(e.target.value);
                      setFieldValue('dureeMois', duree);
                      if (values.dateDebut && duree) {
                        const debut = new Date(values.dateDebut);
                        debut.setMonth(debut.getMonth() + duree);
                        setFieldValue('dateExpiration', debut.toISOString().split('T')[0]);
                      }
                    }} />
                  <ErrorMessage name="dureeMois" component="p" className="text-xs text-danger-600 mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date debut <span className="text-danger-600">*</span></label>
                  <Field name="dateDebut" type="date" min={today} className="input-field"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue('dateDebut', e.target.value);
                      if (e.target.value && values.dureeMois) {
                        const debut = new Date(e.target.value);
                        debut.setMonth(debut.getMonth() + Number(values.dureeMois));
                        setFieldValue('dateExpiration', debut.toISOString().split('T')[0]);
                      }
                    }} />
                  <ErrorMessage name="dateDebut" component="p" className="text-xs text-danger-600 mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date expiration <span className="text-danger-600">*</span></label>
                  <Field name="dateExpiration" type="date" min={today} className="input-field" />
                  <ErrorMessage name="dateExpiration" component="p" className="text-xs text-danger-600 mt-1" />
                  <p className="text-xs text-gray-400 mt-1">Calculee automatiquement</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remuneration (F/mois)</label>
                  <Field name="remuneration" type="number" placeholder="Ex: 500000 (optionnel)" className="input-field" />
                  <p className="text-xs text-gray-400 mt-1">Laissez vide si non remunere</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de postes <span className="text-danger-600">*</span></label>
                  <Field name="nombrePostes" type="number" min={1} placeholder="Ex: 2" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Competences requises</label>
                <Field as="textarea" name="competencesRequises" rows={2}
                  placeholder="Ex: Java, Spring Boot, Angular (separees par des virgules)" className="input-field resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Annuler</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Publication...</span> : 'Publier l offre'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
}