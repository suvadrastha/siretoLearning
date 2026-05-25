const TOKEN_STORAGE_KEY = "invoice_access_token";

export function setAccessToken(token: string) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    return;
  }
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}
