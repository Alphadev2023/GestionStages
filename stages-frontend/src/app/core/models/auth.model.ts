export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
  role: Role;
  filiere?: string;
  promotion?: string;
  nomEntreprise?: string;
  secteurActivite?: string;
  departement?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
  userId: number;
  nomEntreprise?: string;
  secteurActivite?: string;
  filiere?: string;
  promotion?: string;
  departement?: string;
}

export type Role = "ETUDIANT" | "ENTREPRISE" | "ENSEIGNANT" | "ADMIN";
