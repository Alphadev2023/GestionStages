import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ApiResponse, PageResponse } from "../models/api.model";
import { CandidatureResponse, StatutCandidature } from "../models/candidature.model";

@Injectable({ providedIn: "root" })
export class CandidatureService {
  private api = "/api/candidatures";
  constructor(private http: HttpClient) {}

  postuler(offreId: number, lettreMotivation: string, cv: File) {
    const form = new FormData();
    const data = new Blob([JSON.stringify({ offreId, lettreMotivation })], { type: "application/json" });
    form.append("data", data);
    form.append("cv", cv);
    return this.http.post<ApiResponse<CandidatureResponse>>(this.api, form);
  }

  mesCandidatures(page = 0, size = 10) {
    const params = new HttpParams().set("page", page).set("size", size);
    return this.http.get<ApiResponse<PageResponse<CandidatureResponse>>>(`${this.api}/mes-candidatures`, { params });
  }

  parOffre(offreId: number, page = 0, size = 50) {
    const params = new HttpParams().set("page", page).set("size", size);
    return this.http.get<ApiResponse<PageResponse<CandidatureResponse>>>(`${this.api}/offre/${offreId}`, { params });
  }

  traiter(id: number, statut: StatutCandidature, feedback?: string) {
    let params = new HttpParams().set("statut", statut);
    if (feedback) params = params.set("feedback", feedback);
    return this.http.patch<ApiResponse<CandidatureResponse>>(`${this.api}/${id}/traiter`, {}, { params });
  }
}
