export type StatutCandidature = "EN_ATTENTE" | "ACCEPTEE" | "REFUSEE";

export interface CandidatureResponse {
  id: number;
  offreId: number;
  titreOffre: string;
  nomEntreprise: string;
  etudiantId: number;
  nomEtudiant: string;
  cvUrl: string;
  lettreMotivation?: string;
  statut: StatutCandidature;
  feedbackEntreprise?: string;
  createdAt: string;
}
