import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ApiResponse } from "../models/api.model";

@Injectable({ providedIn: "root" })
export class ReportingService {
  private api = "/api/reporting";
  constructor(private http: HttpClient) {}

  getStatistiques() {
    return this.http.get<ApiResponse<Record<string, number>>>(`${this.api}/statistiques`);
  }

  exporterExcel() {
    return this.http.get(`${this.api}/export/stages`, { responseType: "blob" });
  }
}
