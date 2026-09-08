import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ApiResponse, PageResponse } from "../models/api.model";
import { ConventionResponse, StatutConvention } from "../models/convention.model";

@Injectable({ providedIn: "root" })
export class ConventionService {
  private api = "/api/conventions";
  constructor(private http: HttpClient) {}

  liste(statut?: StatutConvention, page = 0, size = 20) {
    let params = new HttpParams().set("page", page).set("size", size);
    if (statut) params = params.set("statut", statut);
    return this.http.get<ApiResponse<PageResponse<ConventionResponse>>>(this.api, { params });
  }

  validerEnseignant(id: number, commentaire?: string) {
    let params = new HttpParams();
    if (commentaire) params = params.set("commentaire", commentaire);
    return this.http.patch<ApiResponse<ConventionResponse>>(`${this.api}/valider/${id}/enseignant`, {}, { params });
  }

  approuverAdmin(id: number, commentaire?: string) {
    let params = new HttpParams();
    if (commentaire) params = params.set("commentaire", commentaire);
    return this.http.patch<ApiResponse<ConventionResponse>>(`${this.api}/valider/${id}/admin`, {}, { params });
  }

  rejeter(id: number, commentaire?: string) {
    let params = new HttpParams();
    if (commentaire) params = params.set("commentaire", commentaire);
    return this.http.patch<ApiResponse<ConventionResponse>>(`${this.api}/${id}/rejeter`, {}, { params });
  }
}
