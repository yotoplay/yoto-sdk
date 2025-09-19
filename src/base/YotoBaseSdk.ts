import axios, { type AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import stages from '../utils/stages.js';
import type { YotoSdkConfig } from '../types.js';

export class YotoSdkError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string,
    public response?: unknown
  ) {
    super(message);
    this.name = 'YotoSdkError';
  }
}

export abstract class YotoBaseSdk {
  protected mainApiClient: AxiosInstance;
  protected config: YotoSdkConfig;

  constructor(config: YotoSdkConfig = {}) {
    this.config = {
      stage: config.stage || this.detectStage(),
      retries: config.retries ?? 5,
      retryDelay: config.retryDelay || axiosRetry.exponentialDelay,
      timeout: config.timeout ?? 30000,
      clientId: config.clientId,
      authDomain: config.authDomain,
      audience: config.audience,
      jwt: config.jwt,
    };

    this.mainApiClient = this.createClient(this.getMainApiUrl());
  }

  protected detectStage(): 'test' | 'prod' {
    if (typeof window === 'undefined') return 'prod';
    
    const hostname = window.location.hostname;
    const stage = stages.CLIENT_URLS[hostname as keyof typeof stages.CLIENT_URLS];
    return stage === 'test' ? 'test' : 'prod';
  }

  protected getMainApiUrl(): string {
    const stage = this.config.stage || this.detectStage();
    return stages.API_DOMAINS[stage];
  }

  protected createClient(baseURL: string): AxiosInstance {
    const client = axios.create({
      baseURL,
      timeout: this.config.timeout,
    });

    // Add retry logic
    axiosRetry(client, {
      retries: this.config.retries,
      retryDelay: this.config.retryDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
               Boolean(error.response?.status && error.response.status >= 500 && error.response.status < 600);
      },
    });

    // Add request interceptor for authentication
    client.interceptors.request.use(async (config) => {
      const accessToken = this.getAccessToken();
      if (!accessToken) {
        throw new YotoSdkError('No access token available');
      }
      config.headers.Authorization = `Bearer ${accessToken}`;
      return config;
    });

    // Add response interceptor for error handling
    client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new YotoSdkError(
            error.response.data?.message || error.message,
            error.response.status,
            error.response.statusText,
            error.response.data
          );
        }
        throw new YotoSdkError(error.message);
      }
    );

    return client;
  }

  // Utility methods
  extractMediaId(trackUrl: string): string | null {
    if (!trackUrl) return null;
    const match = trackUrl.match(/yoto:#(.+)/);
    return match ? match[1] : null;
  }

  // Configuration getters
  getConfig(): YotoSdkConfig {
    return { ...this.config };
  }

  // Authentication configuration getters
  getClientId(): string {
    if (!this.config.clientId && !this.config.jwt) {
      throw new YotoSdkError('clientId is required when not using JWT authentication. Please provide it in the SDK configuration.');
    }
    return this.config.clientId || '';
  }

  getAuthDomain(): string {
    if (!this.config.authDomain && !this.config.jwt) {
      throw new YotoSdkError('authDomain is required when not using JWT authentication. Please provide it in the SDK configuration.');
    }
    return this.config.authDomain || '';
  }

  getAudience(): string {
    if (this.config.audience) {
      return this.config.audience;
    }
    
    // Fallback to stage-based audience
    const stage = this.config.stage || this.detectStage();
    return stages.API_DOMAINS[stage];
  }

  public getAccessToken(): string | null {
    // If JWT is provided in config, use it (for server-side usage)
    if (this.config.jwt) {
      return this.config.jwt;
    }
    
    // Otherwise, fall back to sessionStorage (browser usage)
    if (typeof window === 'undefined') {
      return null;
    }
    
    try {
      return sessionStorage.getItem('yoto_access_token');
    } catch {
      return null;
    }
  }

  // Authentication methods
  async login(options?: Record<string, string>): Promise<void> {
    if (this.config.jwt) {
      throw new YotoSdkError('Login is not available when using JWT authentication. The JWT token is already provided in the configuration.');
    }
    
    if (typeof window === 'undefined') {
      throw new YotoSdkError('Login is only available in browser environments');
    }

    const clientId = this.getClientId();
    const domain = this.getAuthDomain();
    const audience = this.getAudience();
    
    if (!clientId || !domain) {
      throw new YotoSdkError('Missing clientId or authDomain configuration');
    }

    const authUrl = `https://${domain}/authorize`;
    
    const params = new URLSearchParams();
    params.append('response_type', 'code');
    params.append('client_id', clientId);
    params.append('redirect_uri', `${window.location.origin}/callback`);
    params.append('scope', 'openid profile email');
    params.append('audience', audience);
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        params.append(key, value);
      });
    }
    
    const finalUrl = `${authUrl}?${params.toString()}`;
    window.location.href = finalUrl;
  }

  async handleCallback(): Promise<void> {
    if (this.config.jwt) {
      throw new YotoSdkError('Callback handling is not available when using JWT authentication. The JWT token is already provided in the configuration.');
    }
    
    if (typeof window === 'undefined') {
      throw new YotoSdkError('Callback handling is only available in browser environments');
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (error) {
      throw new YotoSdkError(`Authentication failed: ${errorDescription || error}`);
    }

    if (!code) {
      throw new YotoSdkError('No authorization code received');
    }

    const clientId = this.getClientId();
    const domain = this.getAuthDomain();
    
    const tokenUrl = `https://${domain}/oauth/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', clientId);
    params.append('code', code);
    params.append('redirect_uri', `${window.location.origin}/callback`);

    try {
      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      if (access_token) {
        sessionStorage.setItem('yoto_access_token', access_token);
      }
    } catch (error) {
      throw new YotoSdkError(`Failed to exchange code for token: ${error}`);
    }
  }

  async logout(): Promise<void> {
    if (this.config.jwt) {
      throw new YotoSdkError('Logout is not available when using JWT authentication. The JWT token is provided externally and cannot be cleared by the SDK.');
    }
    
    if (typeof window === 'undefined') {
      throw new YotoSdkError('Logout is only available in browser environments');
    }

    // Clear local tokens first
    sessionStorage.removeItem('yoto_access_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
    
    // Redirect to logout URL
    const domain = this.getAuthDomain();
    const clientId = this.getClientId();
    const logoutUrl = `https://${domain}/v2/logout?client_id=${clientId}&returnTo=${encodeURIComponent(window.location.origin)}`;
    window.location.href = logoutUrl;
  }
}
