// typescript
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class RolesGuard implements CanActivate {
  constructor(private kc: KeycloakService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const required = route.data['roles'] as string[] | undefined;
    if (!required || required.length === 0) return true;
    const has = await this.kc.isLoggedIn() && required.every(r => this.kc.getUserRoles(true).includes(r));
    if (!has) this.router.navigate(['/access-denied']);
    return has;
  }
}
