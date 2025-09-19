import { describe, it, expect, beforeEach, vi } from 'vitest';
import { YotoSdk } from '../src/index.js';

// Mock axios to avoid actual HTTP requests
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    })),
    post: vi.fn()
  }
}));

describe('YotoSdk JWT Authentication', () => {
  const mockJwt = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.EkN-DOsnsuRjRO6BxXemmJDm3HbxrbRzXglbN2S4sOkopdU4IsDxTI8jO19W_A4K8ZPJijNLis4EZsHeY559a4DFOd50_OqgH58ERTqYZyhtFJh3w9H-6GvtBoQ_KT5JZ73qkmL7giOSjVtESNo0V2z44Wz_4omtFvWo';

  beforeEach(() => {
    // Clear any existing sessionStorage
    vi.clearAllMocks();
  });

  describe('JWT Configuration', () => {
    it('should accept JWT in configuration', () => {
      const sdk = new YotoSdk({
        jwt: mockJwt,
        stage: 'test'
      });

      expect(sdk.getAccessToken()).toBe(mockJwt);
    });

    it('should prioritize JWT over sessionStorage', () => {
      // Mock sessionStorage
      const mockSessionStorage = {
        getItem: vi.fn(() => 'session-token'),
        setItem: vi.fn(),
        removeItem: vi.fn()
      };
      
      Object.defineProperty(globalThis, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true
      });

      const sdk = new YotoSdk({
        jwt: mockJwt,
        stage: 'test'
      });

      expect(sdk.getAccessToken()).toBe(mockJwt);
      expect(mockSessionStorage.getItem).not.toHaveBeenCalled();
    });

    it('should not require clientId and authDomain when JWT is provided', () => {
      const sdk = new YotoSdk({
        jwt: mockJwt,
        stage: 'test'
      });

      // These should not throw errors
      expect(() => sdk.getClientId()).not.toThrow();
      expect(() => sdk.getAuthDomain()).not.toThrow();
    });
  });

  describe('Authentication Methods with JWT', () => {
    it('should throw error when trying to login with JWT', async () => {
      const sdk = new YotoSdk({
        jwt: mockJwt,
        stage: 'test'
      });

      await expect(sdk.login()).rejects.toThrow(
        'Login is not available when using JWT authentication. The JWT token is already provided in the configuration.'
      );
    });

    it('should throw error when trying to handle callback with JWT', async () => {
      const sdk = new YotoSdk({
        jwt: mockJwt,
        stage: 'test'
      });

      await expect(sdk.handleCallback()).rejects.toThrow(
        'Callback handling is not available when using JWT authentication. The JWT token is already provided in the configuration.'
      );
    });

    it('should throw error when trying to logout with JWT', async () => {
      const sdk = new YotoSdk({
        jwt: mockJwt,
        stage: 'test'
      });

      await expect(sdk.logout()).rejects.toThrow(
        'Logout is not available when using JWT authentication. The JWT token is provided externally and cannot be cleared by the SDK.'
      );
    });
  });

  describe('Server-side Usage', () => {
    it('should work in server environment with JWT', () => {
      // Simulate server environment (no window object)
      const originalWindow = globalThis.window;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).window;

      const sdk = new YotoSdk({
        jwt: mockJwt,
        stage: 'test'
      });

      expect(sdk.getAccessToken()).toBe(mockJwt);

      // Restore window
      globalThis.window = originalWindow;
    });

    it('should return null for access token in server environment without JWT', () => {
      // Simulate server environment (no window object)
      const originalWindow = globalThis.window;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).window;

      const sdk = new YotoSdk({
        stage: 'test'
      });

      expect(sdk.getAccessToken()).toBeNull();

      // Restore window
      globalThis.window = originalWindow;
    });
  });

  describe('Configuration Validation', () => {
    it('should require clientId and authDomain when JWT is not provided', () => {
      const sdk = new YotoSdk({
        stage: 'test'
      });

      expect(() => sdk.getClientId()).toThrow(
        'clientId is required when not using JWT authentication. Please provide it in the SDK configuration.'
      );

      expect(() => sdk.getAuthDomain()).toThrow(
        'authDomain is required when not using JWT authentication. Please provide it in the SDK configuration.'
      );
    });
  });
});
