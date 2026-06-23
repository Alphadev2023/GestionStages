import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { catchError, throwError } from "rxjs";

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const token = auth.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401) auth.logout();
      return throwError(() => err);
    })
  );
};
