import Keycloak, { KeycloakConfig } from "keycloak-js";

const keycloakConfig: KeycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080",
  realm: import.meta.env.VITE_KEYCLOAK_REALM || "ecommerce-rta",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "frontend-client",
};

const keycloak = new Keycloak(keycloakConfig);

export const getAccessToken = async (): Promise<string | undefined> => {
  if (!keycloak.authenticated) return undefined;
  if (keycloak.isTokenExpired(30)) {
    try {
      await keycloak.updateToken(30);
    } catch {
      await keycloak.login();
      return undefined;
    }
  }
  return keycloak.token;
};

export default keycloak;
