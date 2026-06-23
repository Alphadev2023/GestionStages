export interface MessageRequest {
  destinataireId: number;
  contenu: string;
  candidatureId?: number;
}

export interface MessageResponse {
  id: number;
  expediteurId: number;
  nomExpediteur: string;
  destinataireId: number;
  nomDestinataire: string;
  contenu: string;
  lu: boolean;
  candidatureId?: number;
  createdAt: string;
}
