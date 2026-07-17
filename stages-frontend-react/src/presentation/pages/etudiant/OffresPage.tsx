import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { Sidebar } from "../../components/Sidebar";
import { Navbar } from "../../components/Navbar";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { Modal } from "../../components/ui/Modal";
import { useOffres } from "../../../application/offres/useOffres";
import { usePostuler } from "../../../application/candidatures/useCandidatures";
import { useAuthStore } from "../../../application/auth/useAuthStore";
import type { Offre, Domaine } from "../../../domain";

const DOMAINES: Domaine[] = [
  "INFORMATIQUE",
  "FINANCE",
  "MARKETING",
  "RESSOURCES_HUMAINES",
  "GENIE_CIVIL",
  "ELECTRONIQUE",
  "SANTE",
  "DROIT",
  "COMMUNICATION",
  "AUTRE",
];

const DOMAINE_COLORS: Record<string, string> = {
  INFORMATIQUE: "bg-blue-100 text-blue-700",
  FINANCE: "bg-green-100 text-green-700",
  MARKETING: "bg-pink-100 text-pink-700",
  DROIT: "bg-purple-100 text-purple-700",
  SANTE: "bg-red-100 text-red-700",
  GENIE_CIVIL: "bg-orange-100 text-orange-700",
  ELECTRONIQUE: "bg-yellow-100 text-yellow-700",
  RESSOURCES_HUMAINES: "bg-teal-100 text-teal-700",
  COMMUNICATION: "bg-indigo-100 text-indigo-700",
  AUTRE: "bg-gray-100 text-gray-700",
};

const schema = Yup.object({
  lettreMotivation: Yup.string()
    .min(50, "Votre lettre doit contenir au moins 50 caracteres")
    .required("La lettre de motivation est obligatoire"),
  cv: Yup.mixed().required("Veuillez selectionner votre CV en format PDF"),
});

export function OffresPage() {
  const { user } = useAuthStore();
  const [domaine, setDomaine] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(6);
  const [offre, setOffre] = useState<Offre | null>(null);
  const [afficherTout, setAfficherTout] = useState(false);

  const filiereEtudiant = user?.filiere ?? "";

  function isRecommandee(dom: string): boolean {
    if (!filiereEtudiant) return false;
    const f = filiereEtudiant.toLowerCase();
    const d = dom.toLowerCase();
    return f.includes(d) || d.includes(f);
  }

  const { data: rawData, isLoading } = useOffres({
    domaine: domaine || undefined,
    localisation: localisation || undefined,
    page,
    size: 50,
  });

  const postuler = usePostuler();

  const offresAffichees = (() => {
    if (!rawData) return [];
    if (!filiereEtudiant || afficherTout) return rawData.content;
    const filtrees = rawData.content.filter((o) => isRecommandee(o.domaine));
    return filtrees.length > 0 ? filtrees : rawData.content;
  })();

  // Pagination locale
  const totalPages = Math.ceil(offresAffichees.length / size);
  const offresPage = offresAffichees.slice(page * size, (page + 1) * size);

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-gray-50">
        <Navbar title="Offres de stage" />
        <main className="p-6">
          {/* Filtres */}
          <Card className="mb-6 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Domaine
              </label>
              <select
                value={domaine}
                onChange={(e) => {
                  setDomaine(e.target.value);
                  setPage(0);
                }}
                className="input-field w-48"
              >
                <option value="">Tous les domaines</option>
                {DOMAINES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Localisation
              </label>
              <input
                value={localisation}
                onChange={(e) => {
                  setLocalisation(e.target.value);
                  setPage(0);
                }}
                placeholder="Ex: Conakry, Guinee..."
                className="input-field w-48"
              />
            </div>
            <Button onClick={() => setPage(0)}>Rechercher</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setDomaine("");
                setLocalisation("");
                setPage(0);
              }}
            >
              Reinitialiser
            </Button>
            {filiereEtudiant && (
              <button
                onClick={() => {
                  setAfficherTout((t) => !t);
                  setPage(0);
                }}
                className="text-sm text-primary-600 hover:underline"
              >
                {afficherTout
                  ? "Voir seulement mon domaine (" + filiereEtudiant + ")"
                  : "Voir toutes les offres"}
              </button>
            )}
          </Card>

          {isLoading ? (
            <Spinner text="Recherche des offres..." />
          ) : (
            <>
              {/* Header resultat */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500 font-medium">
                  {offresAffichees.length} offre(s) trouvee(s)
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Afficher</span>
                  <select
                    value={size}
                    onChange={(e) => {
                      setSize(Number(e.target.value));
                      setPage(0);
                    }}
                    className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={3}>3 par page</option>
                    <option value={6}>6 par page</option>
                    <option value={9}>9 par page</option>
                    <option value={12}>12 par page</option>
                  </select>
                </div>
              </div>

              {/* Grille 3 colonnes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offresPage.map((o) => (
                  <div
                    key={o.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 flex-1">
                          {o.titre}
                        </h3>
                        {isRecommandee(o.domaine) && (
                          <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300 font-medium">
                            Pour vous
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={
                            "text-xs px-2 py-0.5 rounded-full font-medium " +
                            (DOMAINE_COLORS[o.domaine] ??
                              "bg-gray-100 text-gray-700")
                          }
                        >
                          {o.domaine}
                        </span>
                        <span className="text-xs text-gray-500">
                          {o.nomEntreprise}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex-1 space-y-2">
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {o.description}
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mt-2">
                        <span>{o.localisation}</span>
                        <span>{o.dureeMois} mois</span>
                        {o.remuneration && (
                          <span className="text-success-600 font-medium">
                            {o.remuneration.toLocaleString()} F
                          </span>
                        )}
                        <span>{o.nombrePostes} poste(s)</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Expire le {o.dateExpiration.slice(0, 10)}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-100">
                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => setOffre(o)}
                      >
                        Postuler a cette offre
                      </Button>
                    </div>
                  </div>
                ))}

                {offresPage.length === 0 && (
                  <div className="col-span-3 text-center py-16 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-400 text-lg font-medium mb-1">
                      Aucune offre trouvee
                    </p>
                    <p className="text-sm text-gray-400">
                      Essayez de modifier vos filtres
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-1">
                  <p className="text-sm text-gray-500">
                    Page {page + 1} sur {totalPages} — {offresAffichees.length}{" "}
                    offres
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Precedent
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i)}
                          className={
                            "w-8 h-8 text-sm rounded-lg transition-colors font-medium " +
                            (i === page
                              ? "bg-primary-600 text-white"
                              : "border border-gray-300 hover:bg-gray-50 text-gray-600")
                          }
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal postulation */}
      <Modal
        open={!!offre}
        onClose={() => setOffre(null)}
        title={"Postuler : " + (offre?.titre ?? "")}
        size="md"
      >
        {offre && (
          <div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-5 border border-gray-100">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-primary-600 font-bold">
                  {offre.nomEntreprise.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {offre.nomEntreprise}
                </p>
                <p className="text-xs text-gray-500">
                  {offre.localisation} — {offre.dureeMois} mois
                </p>
              </div>
              <span
                className={
                  "ml-auto text-xs px-2 py-0.5 rounded-full font-medium " +
                  (DOMAINE_COLORS[offre.domaine] ?? "bg-gray-100 text-gray-700")
                }
              >
                {offre.domaine}
              </span>
            </div>

            <Formik
              initialValues={{ lettreMotivation: "", cv: null as File | null }}
              validationSchema={schema}
              onSubmit={(values, { setSubmitting, resetForm }) => {
                if (!values.cv) return;
                const id = toast.loading("Envoi de votre candidature...");
                postuler.mutate(
                  {
                    offreId: offre.id,
                    lettreMotivation: values.lettreMotivation,
                    cv: values.cv,
                  },
                  {
                    onSuccess: () => {
                      toast.dismiss(id);
                      toast.success("Candidature envoyee ! Bonne chance !");
                      setOffre(null);
                      resetForm();
                    },
                    onError: (e: unknown) => {
                      toast.dismiss(id);
                      toast.error(
                        e.response?.data?.message ?? "Erreur lors de l envoi",
                      );
                      setSubmitting(false);
                    },
                  },
                );
              }}
            >
              {({ isSubmitting, setFieldValue, values, errors, touched }) => (
                <Form className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CV en format PDF{" "}
                      <span className="text-danger-600">*</span>
                    </label>
                    <div
                      className={
                        "border-2 border-dashed rounded-xl p-4 text-center transition-colors " +
                        (values.cv
                          ? "border-success-400 bg-success-50"
                          : touched.cv && errors.cv
                            ? "border-danger-400 bg-danger-50"
                            : "border-gray-300 hover:border-primary-400 hover:bg-primary-50")
                      }
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        id="cv-upload"
                        className="hidden"
                        onChange={(e) =>
                          setFieldValue("cv", e.target.files?.[0] ?? null)
                        }
                      />
                      <label
                        htmlFor="cv-upload"
                        className="cursor-pointer block"
                      >
                        {values.cv ? (
                          <>
                            <p className="text-success-600 font-medium text-sm">
                              {(values.cv as File).name}
                            </p>
                            <p className="text-xs text-success-500 mt-1">
                              Cliquez pour changer le fichier
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-gray-500 text-sm font-medium">
                              Cliquez pour selectionner votre CV
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Format PDF uniquement — max 10MB
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                    <ErrorMessage
                      name="cv"
                      component="p"
                      className="text-xs text-danger-600 mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lettre de motivation{" "}
                      <span className="text-danger-600">*</span>
                    </label>
                    <Field
                      as="textarea"
                      name="lettreMotivation"
                      rows={6}
                      placeholder="Bonjour,&#10;&#10;Je me permets de vous contacter afin de postuler au poste de...&#10;&#10;Fort(e) de mes competences en [domaine], je suis convaincu(e) de pouvoir..."
                      className={
                        "input-field resize-none " +
                        (touched.lettreMotivation && errors.lettreMotivation
                          ? "border-danger-400 bg-danger-50"
                          : "")
                      }
                    />
                    <div className="flex justify-between mt-1">
                      <ErrorMessage
                        name="lettreMotivation"
                        component="p"
                        className="text-xs text-danger-600"
                      />
                      <Field name="lettreMotivation">
                        {({ field }: { field: { value: string } }) => (
                          <span
                            className={
                              "text-xs " +
                              (field.value.length < 50
                                ? "text-danger-500"
                                : "text-gray-400")
                            }
                          >
                            {field.value.length} / 50 min
                          </span>
                        )}
                      </Field>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <Button
                      variant="secondary"
                      type="button"
                      className="flex-1"
                      onClick={() => setOffre(null)}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Envoi...
                        </span>
                      ) : (
                        "Envoyer ma candidature"
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
      </Modal>
    </>
  );
}
