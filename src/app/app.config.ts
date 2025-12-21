import { APP_INITIALIZER, type ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from "@angular/core"
import { provideRouter } from "@angular/router"
import { KeycloakAngularModule, KeycloakService } from "keycloak-angular"
import { provideAnimations } from "@angular/platform-browser/animations"

import { routes } from "./app.routes"
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http"
import { AuthInterceptor } from "./auth/auth.interceptor"
import { initializeKeycloak } from "./auth/keycloak-init"

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(HttpClientModule, KeycloakAngularModule),

    // Make KeycloakService available for initialization:
    KeycloakService,

    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      deps: [KeycloakService],
      multi: true
    },

    // Your HTTP interceptor that uses Keycloak token:
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }

  ],
}
