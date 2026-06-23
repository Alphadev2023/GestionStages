export interface Message {
  id: number; expediteurId: number; nomExpediteur: string;
  destinataireId: number; nomDestinataire: string;
  contenu: string; lu: boolean; candidatureId?: number; createdAt: string;
}
export interface MessageRequest { destinataireId: number; contenu: string; candidatureId?: number; }