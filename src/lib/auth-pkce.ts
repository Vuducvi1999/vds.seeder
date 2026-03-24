import axios from 'axios';
import { PKCEConfig, TokenResponse, UserInfo, AuthState, AuthTokens } from '@/types/auth-pkce';
import { generateCodeVerifier, generateCodeChallenge, generateState, storeCodeVerifier, getCodeVerifier, clearCodeVerifier, storeState, getState, clearState } from './pkce';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_pkce_access_token',
  REFRESH_TOKEN: 'auth_pkce_refresh_token',
  EXPIRES_AT: 'auth_pkce_expires_at',
  USER: 'auth_pkce_user',
  CONFIG: 'auth_pkce_config',
  LAST_REFRESH: 'auth_pkce_last_refresh',
};

const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000;

class PKCEAuthService {
  private config: PKCEConfig | null = null;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  setConfig(config: PKCEConfig): void {
    this.config = config;
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }

  getConfig(): PKCEConfig | null {
    if (this.config) return this.config;
    
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (saved) {
      this.config = JSON.parse(saved);
      return this.config;
    }
    return null;
  }

  async login(): Promise<void> {
    const config = this.getConfig();
    if (!config) {
      console.error('PKCE config not set');
      throw new Error('PKCE config not set');
    }

    console.log('Login config:', config);

    const codeVerifier = generateCodeVerifier();
    console.log('codeVerifier:', codeVerifier);
    
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    console.log('codeChallenge:', codeChallenge);
    
    const state = generateState();
    console.log('state:', state);

    storeCodeVerifier(codeVerifier);
    storeState(state);

    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      redirect_uri: config.redirectUri,
      scope: config.scopes,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
    });

    const authUrl = `${config.rootUrl}/connect/authorize?${params.toString()}`;
    console.log('authUrl:', authUrl);
    
    window.location.href = authUrl;
  }

  async handleCallback(code: string, state: string): Promise<boolean> {
    const savedState = getState();
    const codeVerifier = getCodeVerifier();

    clearCodeVerifier();
    clearState();

    if (!savedState || savedState !== state) {
      throw new Error('Hacker mặt l đang tấn công CSRF');
    }

    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    const config = this.getConfig();
    if (!config) {
      throw new Error('PKCE config not set');
    }

    return this.exchangeCodeForToken(code, codeVerifier, config);
  }

  private async exchangeCodeForToken(code: string, codeVerifier: string, config: PKCEConfig): Promise<boolean> {
    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.clientId,
        code,
        redirect_uri: config.redirectUri,
        code_verifier: codeVerifier,
      });

      const response = await axios.post<TokenResponse>(
        `${config.rootUrl}/connect/token`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error_description || response.data.error);
      }

      this.storeTokens(response.data);
      this.startRefreshTimer();
      return true;
    } catch (error) {
      console.error('Token exchange failed:', error);
      return false;
    }
  }

  private storeTokens(data: TokenResponse): void {
    const expiresAt = Date.now() + data.expires_in * 1000;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());

    if (data.refresh_token) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
    }

    this.fetchUserInfo(data.access_token);
  }

  private async fetchUserInfo(accessToken: string): Promise<void> {
    const config = this.getConfig();
    if (!config) return;

    try {
      const response = await axios.get<UserInfo>(
        `${config.rootUrl}/connect/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  }

  private startRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(async () => {
      const needsRefresh = this.shouldRefreshToken();
      if (needsRefresh) {
        await this.refreshAccessToken();
      }
    }, TOKEN_REFRESH_INTERVAL);

    localStorage.setItem(STORAGE_KEYS.LAST_REFRESH, Date.now().toString());
  }

  private shouldRefreshToken(): boolean {
    const expiresAtStr = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
    if (!expiresAtStr) return true;

    const expiresAt = parseInt(expiresAtStr);
    const timeUntilExpiry = expiresAt - Date.now();

    return timeUntilExpiry < 10 * 60 * 1000;
  }

  async refreshAccessToken(): Promise<boolean> {
    const config = this.getConfig();
    if (!config) return false;

    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      this.clearAuth();
      return false;
    }

    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: config.clientId,
        refresh_token: refreshToken,
      });

      const response = await axios.post<TokenResponse>(
        `${config.rootUrl}/connect/token`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.error) {
        console.error('Token refresh failed:', response.data.error);
        this.clearAuth();
        return false;
      }

      this.storeTokens(response.data);
      localStorage.setItem(STORAGE_KEYS.LAST_REFRESH, Date.now().toString());
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuth();
      return false;
    }
  }

  async silentLogin(): Promise<boolean> {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      return false;
    }

    const success = await this.refreshAccessToken();
    if (success) {
      this.startRefreshTimer();
    }
    return success;
  }

  getAccessToken(): string | null {
    const expiresAtStr = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
    if (!expiresAtStr) return null;

    const expiresAt = parseInt(expiresAtStr);
    if (Date.now() >= expiresAt) {
      return null;
    }

    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  getUser(): UserInfo | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;
    return JSON.parse(userStr);
  }

  getAuthState(): AuthState {
    const config = this.getConfig();
    const expiresAtStr = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
    const expiresAt = expiresAtStr ? parseInt(expiresAtStr) : null;
    const isAuthenticated = !!this.getAccessToken();

    return {
      isAuthenticated,
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken(),
      user: this.getUser(),
      expiresAt,
      config,
    };
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getLogoutUrl(): string {
    const config = this.getConfig();
    if (!config) return '/';

    const params = new URLSearchParams();
    params.append('client_id', config.clientId);
    if (config.postLogoutRedirectUri) {
      params.append('post_logout_redirect_uri', config.postLogoutRedirectUri);
    }

    return `${config.rootUrl}/connect/endsession?${params.toString()}`;
  }

  logout(): void {
    this.clearAuth();
  }

  private clearAuth(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.LAST_REFRESH);

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  init(): void {
    const config = this.getConfig();
    if (config && this.isAuthenticated()) {
      this.startRefreshTimer();
    }
  }
}

export const pkceAuthService = new PKCEAuthService();
