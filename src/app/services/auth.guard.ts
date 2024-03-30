import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable()
// to inject a service inside a service it is used.
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService,
        private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
        const isAuthenticated = this.authService.getIsAuthenticated();
        if (!isAuthenticated) {
            this.router.navigate(['/login']);
        }
        return true;
    }
}
