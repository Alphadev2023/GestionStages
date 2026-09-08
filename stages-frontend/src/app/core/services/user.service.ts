import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ApiResponse, PageResponse } from "../models/api.model";

export interface UserSummary {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  nomEntreprise?: string;
}

@Injectable({ providedIn: "root" })
export class UserService {
  private api = "/api/admin/users";
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<ApiResponse<PageResponse<UserSummary>>>(`${this.api}?size=100`);
  }
}
