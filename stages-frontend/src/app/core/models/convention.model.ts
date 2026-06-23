export type StatutConvention =
  | "EN_ATTENTE" | "VALIDEE_ENSEIGNANT" | "APPROUVEE_ADMIN" | "REJETEE";

export interface ConventionResponse {
  id: number;
  candidatureId: number;
  nomEtudiant: string;
  titreOffre: string;
  nomEntreprise: string;
  enseignantId?: number;
  nomEnseignant?: string;
  statut: StatutConvention;
  conventionUrl?: string;
  dateDebutStage: string;
  dateFinStage: string;
  dateValidationEnseignant?: string;
  dateApprouveAdmin?: string;
  commentaireEnseignant?: string;
  commentaireAdmin?: string;
  createdAt: string;
}
