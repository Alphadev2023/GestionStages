export type Role = 'ETUDIANT' | 'ENTREPRISE' | 'ENSEIGNANT' | 'ADMIN';

export interface User {
  userId: number;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
  nomEntreprise?: string;
  secteurActivite?: string;
  filiere?: string;
  promotion?: string;
  departement?: string;
}

export interface LoginRequest  { email: string; motDePasse: string; }
export interface RegisterRequest {
  nom: string; prenom: string; email: string; motDePasse: string;
  role: Role; filiere?: string; promotion?: string;
  nomEntreprise?: string; secteurActivite?: string; departement?: string;
}
export interface AuthResponse extends User { token: string; }