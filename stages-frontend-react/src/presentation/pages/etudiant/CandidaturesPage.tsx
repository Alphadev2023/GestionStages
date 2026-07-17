import { useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { Navbar } from "../../components/Navbar";
import { Spinner } from "../../components/ui/Spinner";
import { useMesCandidatures } from "../../../application/candidatures/useCandidatures";
import type { Candidature } from "../../../domain";

const STATUT_COLORS: Record<string, string> = {
  EN_ATTENTE: "badge-attente",
  ACCEPTEE: "badge-accepte",
  REFUSEE: "badge-refuse",
};
const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  ACCEPTEE: "Acceptee",
  REFUSEE: "Refusee",
};

export function CandidaturesPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(6);
  const [filtre, setFiltre] = useState<string>("TOUS");

  const { data, isLoading } = useMesCandidatures({ size: 100 });
  const list = data?.content ?? [];

  const enAttente = list.filter((c) => c.statut === "EN_ATTENTE").length;
  const acceptees = list.filter((c) => c.statut === "ACCEPTEE").length;
  const refusees = list.filter((c) => c.statut === "REFUSEE").length;

  const listFiltree =
    filtre === "TOUS" ? list : list.filter((c) => c.statut === filtre);
  const totalPages = Math.ceil(listFiltree.length / size);
  const listPage = listFiltree.slice(page * size, (page + 1) * size);

  function changerFiltre(f: string) {
    setFiltre(f);
    setPage(0);
  }

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-gray-50">
        <Navbar title="Mes candidatures" />
        <main className="p-6">
          {/* Stats cliquables */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Toutes",
                count: list.length,
                color: "text-gray-700",
                border: "border-gray-400",
                key: "TOUS",
              },
              {
                label: "En attente",
                count: enAttente,
                color: "text-warning-600",
                border: "border-warning-500",
                key: "EN_ATTENTE",
              },
              {
                label: "Acceptees",
                count: acceptees,
                color: "text-success-600",
                border: "border-success-500",
                key: "ACCEPTEE",
              },
              {
                label: "Refusees",
                count: refusees,
                color: "text-danger-600",
                border: "border-danger-500",
                key: "REFUSEE",
              },
            ].map((s) => (
              <div
                key={s.key}
                onClick={() => changerFiltre(s.key)}
                className={
                  "card text-center py-4 border-l-4 cursor-pointer transition-all " +
                  s.border +
                  (filtre === s.key
                    ? " shadow-md ring-2 ring-offset-1 ring-primary-400"
                    : " hover:shadow-md")
                }
              >
                <p className={"text-2xl font-bold " + s.color}>{s.count}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500 font-medium">
              {listFiltree.length} candidature(s)
              {filtre !== "TOUS" && (
                <span className="ml-1 text-primary-600">
                  — {STATUT_LABELS[filtre]}
                </span>
              )}
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

          {isLoading ? (
            <Spinner text="Chargement des candidatures..." />
          ) : (
            <>
              {/* Grille 3 colonnes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listPage.map((c: Candidature) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 flex-1">
                          {c.titreOffre}
                        </h3>
                        <span
                          className={
                            STATUT_COLORS[c.statut] + " shrink-0 text-xs"
                          }
                        >
                          {STATUT_LABELS[c.statut]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        {c.nomEntreprise}
                      </p>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex-1">
                      <p className="text-xs text-gray-400 mb-3">
                        Postule le {c.createdAt.slice(0, 10)}
                      </p>

                      {c.feedbackEntreprise && (
                        <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            Feedback :
                          </p>
                          <p className="text-xs text-gray-700 line-clamp-3">
                            {c.feedbackEntreprise}
                          </p>
                        </div>
                      )}

                      {c.statut === "ACCEPTEE" && (
                        <div className="p-2.5 bg-success-50 rounded-lg border border-success-200 mt-2">
                          <p className="text-xs text-success-700 font-medium">
                            Felicitations ! Votre candidature a ete acceptee.
                          </p>
                        </div>
                      )}

                      {c.statut === "REFUSEE" && (
                        <div className="p-2.5 bg-danger-50 rounded-lg border border-danger-200 mt-2">
                          <p className="text-xs text-danger-700">
                            Votre candidature n a pas ete retenue cette fois.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-100 flex gap-2">
                      <a
                        href={c.cvUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-xs text-center text-primary-600 hover:text-primary-800 border border-primary-200 hover:bg-primary-50 py-1.5 rounded-lg transition-colors"
                      >
                        Voir mon CV
                      </a>
                      {c.statut === "ACCEPTEE" && (
                        <Link
                          to="/messagerie"
                          className="flex-1 text-xs text-center text-success-600 hover:text-success-800 border border-success-200 hover:bg-success-50 py-1.5 rounded-lg transition-colors"
                        >
                          Contacter
                        </Link>
                      )}
                    </div>
                  </div>
                ))}

                {listPage.length === 0 && (
                  <div className="col-span-3 text-center py-16 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-400 text-lg font-medium mb-2">
                      Aucune candidature
                    </p>
                    {filtre !== "TOUS" ? (
                      <button
                        onClick={() => changerFiltre("TOUS")}
                        className="text-sm text-primary-600 hover:underline"
                      >
                        Voir toutes les candidatures
                      </button>
                    ) : (
                      <Link to="/etudiant/offres" className="btn-primary">
                        Voir les offres disponibles
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-1">
                  <p className="text-sm text-gray-500">
                    Page {page + 1} sur {totalPages} — {listFiltree.length}{" "}
                    candidatures
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
    </>
  );
}
