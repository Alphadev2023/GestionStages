import { Injectable, signal, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { tap } from "rxjs/operators";
import { LoginRequest, RegisterRequest, AuthResponse, Role } from "../models/auth.model";
import { ApiResponse } from "../models/api.model";

const TOKEN_KEY = "stages_token";
const USER_KEY  = "stages_user";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly api = "/api/auth";

  private _user = signal<AuthResponse | null>(this.loadUser());
  readonly user   = this._user.asReadonly();
  readonly isAuth = computed(() => !!this._user());
  readonly role   = computed<Role | null>(() => this._user()?.role ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  login(req: LoginRequest) {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.api}/login`, req).pipe(
      tap(res => this.saveSession(res.data))
    );
  }

  register(req: RegisterRequest) {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.api}/register`, req).pipe(
      tap(res => this.saveSession(res.data))
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
    this.router.navigate(["/auth/login"]);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private saveSession(data: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    this._user.set(data);
  }

  private loadUser(): AuthResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
