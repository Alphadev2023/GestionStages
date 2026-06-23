export type Domaine = 'INFORMATIQUE'|'FINANCE'|'MARKETING'|'RESSOURCES_HUMAINES'|
  'GENIE_CIVIL'|'ELECTRONIQUE'|'SANTE'|'DROIT'|'COMMUNICATION'|'AUTRE';
export type StatutOffre = 'ACTIVE'|'EXPIREE'|'ARCHIVEE';

export interface Offre {
  id: number; titre: string; description: string; domaine: Domaine;
  localisation: string; dureeMois: number; dateDebut: string;
  dateFin?: string; dateExpiration: string; remuneration?: number;
  competencesRequises?: string; statut: StatutOffre;
  nombrePostes: number; entrepriseId: number; nomEntreprise: string; createdAt: string;
}

export interface OffreRequest {
  titre: string; description: string; domaine: Domaine; localisation: string;
  dureeMois: number; dateDebut: string; dateExpiration: string;
  remuneration?: number; competencesRequises?: string; nombrePostes?: number;
}