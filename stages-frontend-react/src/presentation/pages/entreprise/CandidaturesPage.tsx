import { useState } from "react";
import toast from "react-hot-toast";
import { Sidebar } from "../../components/Sidebar";
import { Navbar } from "../../components/Navbar";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { Modal } from "../../components/ui/Modal";
import { useMesOffres } from "../../../application/offres/useOffres";
import {
  useCandidaturesParOffre,
  useTraiterCandidature,
} from "../../../application/candidatures/useCandidatures";
import type { Candidature } from "../../../domain";

export function CandidaturesPage() {
  const [offreId, setOffreId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Candidature | null>(null);
  const [feedback, setFeedback] = useState("");
  const [action, setAction] = useState<"ACCEPTEE" | "REFUSEE" | null>(null);

  const { data: offres } = useMesOffres({ size: 50 });
  const { data, isLoading } = useCandidaturesParOffre(offreId);
  const traiter = useTraiterCandidature();
  const list = data?.content ?? [];

  const badge = (s: string) =>
    s === "ACCEPTEE"
      ? "badge-accepte"
      : s === "REFUSEE"
        ? "badge-refuse"
        : "badge-attente";
  const label = (s: string) =>
    s === "ACCEPTEE" ? "Acceptee" : s === "REFUSEE" ? "Refusee" : "En attente";

  function confirmerTraitement() {
    if (!selected || !action) return;
    const id = toast.loading(
      action === "ACCEPTEE" ? "Acceptation..." : "Refus...",
    );
    traiter.mutate(
      { id: selected.id, statut: action, feedback: feedback || undefined },
      {
        onSuccess: () => {
          toast.dismiss(id);
          toast.success(
            action === "ACCEPTEE"
              ? "Candidature acceptee — convention creee automatiquement !"
              : "Candidature refusee",
          );
          setSelected(null);
          setFeedback("");
          setAction(null);
        },
        onError: () => {
          toast.dismiss(id);
          toast.error("Erreur lors du traitement");
        },
      },
    );
  }

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-gray-50">
        <Navbar title="Candidatures recues" />
        <main className="p-6">
          <Card className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selectionner une offre pour voir ses candidatures
            </label>
            <select
              value={offreId ?? ""}
              onChange={(e) => setOffreId(Number(e.target.value) || null)}
              className="input-field w-full md:w-96"
            >
              <option value="">-- Choisissez une offre --</option>
              {offres?.content.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.titre} ({o.statut})
                </option>
              ))}
            </select>
            {!offreId && (
              <p className="text-xs text-gray-400 mt-2">
                Selectionnez une offre pour voir les candidatures recues
              </p>
            )}
          </Card>

          {offreId && list.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                {
                  label: "En attente",
                  count: list.filter((c) => c.statut === "EN_ATTENTE").length,
                  color: "text-warning-600",
                  border: "border-warning-500",
                },
                {
                  label: "Acceptees",
                  count: list.filter((c) => c.statut === "ACCEPTEE").length,
                  color: "text-success-600",
                  border: "border-success-500",
                },
                {
                  label: "Refusees",
                  count: list.filter((c) => c.statut === "REFUSEE").length,
                  color: "text-danger-600",
                  border: "border-danger-500",
                },
              ].map((s) => (
                <Card
                  key={s.label}
                  className={"text-center py-3 border-l-4 " + s.border}
                >
                  <p className={"text-2xl font-bold " + s.color}>{s.count}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </Card>
              ))}
            </div>
          )}

          {offreId &&
            (isLoading ? (
              <Spinner />
            ) : (
              <div className="grid gap-4">
                {list.map((c) => (
                  <Card
                    key={c.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {c.nomEtudiant.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {c.nomEtudiant}
                            </p>
                            <p className="text-xs text-gray-400">
                              Postule le {c.createdAt.slice(0, 10)}
                            </p>
                          </div>
                          <span className={badge(c.statut)}>
                            {label(c.statut)}
                          </span>
                        </div>
                        {c.lettreMotivation && (
                          <div className="ml-13 p-3 bg-gray-50 rounded-lg mt-2">
                            <p className="text-xs font-medium text-gray-500 mb-1">
                              Lettre de motivation :
                            </p>
                            <p className="text-sm text-gray-700 line-clamp-3">
                              {c.lettreMotivation}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4 shrink-0">
                        <a
                          href={c.cvUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary-600 hover:underline border border-primary-200 px-3 py-1.5 rounded-lg text-center"
                        >
                          Voir CV
                        </a>
                        {c.statut === "EN_ATTENTE" && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => {
                                setSelected(c);
                                setAction("ACCEPTEE");
                              }}
                            >
                              Accepter
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                setSelected(c);
                                setAction("REFUSEE");
                              }}
                            >
                              Refuser
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                {list.length === 0 && (
                  <Card className="text-center py-12 text-gray-400">
                    Aucune candidature pour cette offre
                  </Card>
                )}
              </div>
            ))}
        </main>
      </div>

      {/* Modal confirmation */}
      <Modal
        open={!!selected && !!action}
        onClose={() => {
          setSelected(null);
          setAction(null);
          setFeedback("");
        }}
        title={
          action === "ACCEPTEE"
            ? "Accepter cette candidature"
            : "Refuser cette candidature"
        }
        size="sm"
      >
        <div className="space-y-4">
          {selected && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                {selected.nomEtudiant.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {selected.nomEtudiant}
                </p>
                <p className="text-xs text-gray-500">{selected.titreOffre}</p>
              </div>
            </div>
          )}

          {action === "ACCEPTEE" && (
            <div className="p-3 bg-success-50 rounded-lg border border-success-200">
              <p className="text-sm text-success-700 font-medium">
                En acceptant, une convention sera creee automatiquement et
                assignee a un enseignant.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback pour l etudiant
              {action === "REFUSEE" && (
                <span className="text-danger-600 ml-1">*</span>
              )}
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder={
                action === "ACCEPTEE"
                  ? "Ex: Excellent profil, nous avons hate de vous accueillir !"
                  : "Ex: Votre profil ne correspond pas aux criteres requis pour ce poste..."
              }
            />
            {action === "REFUSEE" && !feedback && (
              <p className="text-xs text-gray-400 mt-1">
                Expliquez les raisons du refus pour aider l etudiant
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setSelected(null);
                setAction(null);
                setFeedback("");
              }}
            >
              Annuler
            </Button>
            <Button
              variant={action === "ACCEPTEE" ? "success" : "danger"}
              className="flex-1"
              onClick={confirmerTraitement}
              disabled={traiter.isPending}
            >
              {traiter.isPending
                ? "Traitement..."
                : action === "ACCEPTEE"
                  ? "Confirmer l acceptation"
                  : "Confirmer le refus"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
