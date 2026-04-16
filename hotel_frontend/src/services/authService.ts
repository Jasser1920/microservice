import axios from "axios";

const KEYCLOAK_TOKEN_URL = "http://localhost:8080/realms/ecommerce-rta/protocol/openid-connect/token";
const CLIENT_ID = "backend-client";
const CLIENT_SECRET = "backend-secret";

export async function loginWithKeycloak(username: string, password: string) {
  const params = new URLSearchParams();
  params.append("grant_type", "password");
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("username", username);
  params.append("password", password);

  const response = await axios.post(KEYCLOAK_TOKEN_URL, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
}
