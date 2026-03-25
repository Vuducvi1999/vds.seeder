export interface PKCEConfig {
  authUrl: string;
  backendApiUrl: string;
  clientId: string;
  redirectUri: string;
  postLogoutRedirectUri?: string;
  scopes: string;
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
  scope?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

export interface UserInfo {
  sub?: string;
  email?: string;
  name?: string;
  surname?: string;
  username?: string;
  role?: string | string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  expiresAt: number | null;
  config: PKCEConfig | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}
