// typescript
import { KeycloakService } from 'keycloak-angular';

export function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:9098/', // adapter selon votre Keycloak
        realm: 'micro-service',
        clientId: 'micro-service-api'
      },
      initOptions: {
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false
      },
      enableBearerInterceptor: false // on gère via notre interceptor personnalisé
    });
}
