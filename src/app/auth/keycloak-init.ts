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
        // disable login iframe / 3rd-party cookie check to avoid timeout in dev
        // Browsers may block 3rd-party cookies which causes the step1.html timeout.
        // For production you may prefer to enable it or implement the silent-check-sso flow.
        checkLoginIframe: false
      },
      enableBearerInterceptor: false // on gère via notre interceptor personnalisé
    });
}
