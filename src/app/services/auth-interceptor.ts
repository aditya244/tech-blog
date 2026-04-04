import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const authToken = this.authService.getToken();
        const userDetailsStr = sessionStorage.getItem('userDetails');
        let isAdmin = 'false';

        if (userDetailsStr) {
            try {
                const parsed = JSON.parse(userDetailsStr);
                isAdmin = parsed?.isAdmin ? 'true' : 'false';
            } catch (err) {
                isAdmin = 'false';
            }
        }

        const authRequest = req.clone({
            headers: req.headers
                .set('Authorization', 'Bearer ' + authToken)
                .set('isAdmin', isAdmin),
        });
        return next.handle(authRequest);
    }
}