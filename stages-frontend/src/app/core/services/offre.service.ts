import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ApiResponse, PageResponse } from "../models/api.model";
import { OffreRequest, OffreResponse, Domaine } from "../models/offre.model";

@Injectable({ providedIn: "root" })
export class OffreService {
  private api = "http://localhost:8082/api/offres";
  constructor(private http: HttpClient) {}

  rechercher(domaine?: Domaine, localisation?: string, dureeMois?: number, page = 0, size = 10) {
    let params = new HttpParams().set("page", page).set("size", size);
    if (domaine)      params = params.set("domaine", domaine);
    if (localisation) params = params.set("localisation", localisation);
    if (dureeMois)    params = params.set("dureeMois", dureeMois);
    return this.http.get<ApiResponse<PageResponse<OffreResponse>>>(this.api, { params });
  }

  findById(id: number) {
    return this.http.get<ApiResponse<OffreResponse>>(`${this.api}/${id}`);
  }

  publier(req: OffreRequest) {
    return this.http.post<ApiResponse<OffreResponse>>(this.api, req);
  }

  mesOffres(page = 0, size = 50) {
    const params = new HttpParams().set("page", page).set("size", size);
    return this.http.get<ApiResponse<PageResponse<OffreResponse>>>(`${this.api}/mes-offres`, { params });
  }

  archiver(id: number) {
    return this.http.patch<ApiResponse<OffreResponse>>(`${this.api}/${id}/archiver`, {});
  }
}
