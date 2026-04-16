import axios from "axios";

export async function fetchCurrentUser(accessToken: string) {
  const res = await axios.get("http://localhost:9090/api/users/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
}
