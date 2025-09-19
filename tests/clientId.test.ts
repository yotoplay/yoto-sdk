import { describe, it, expect } from 'vitest';
import { createYotoSdk } from '../src/index.js';

describe('SDK ClientId Configuration', () => {
  it('should use custom clientId when provided', () => {
    const customConfig = {
      clientId: 'custom-client-id',
      authDomain: 'custom.auth0.com',
      audience: 'https://custom.api.com'
    };

    const sdk = createYotoSdk(customConfig);
    
    expect(sdk.getClientId()).toBe('custom-client-id');
    expect(sdk.getAuthDomain()).toBe('custom.auth0.com');
    expect(sdk.getAudience()).toBe('https://custom.api.com');
  });

  it('should throw error when clientId is not provided', () => {
    const sdk = createYotoSdk({ stage: 'test' });
    
    expect(() => sdk.getClientId()).toThrow('clientId is required when not using JWT authentication. Please provide it in the SDK configuration.');
  });

  it('should throw error when authDomain is not provided', () => {
    const sdk = createYotoSdk({ stage: 'test' });
    
    expect(() => sdk.getAuthDomain()).toThrow('authDomain is required when not using JWT authentication. Please provide it in the SDK configuration.');
  });


  it('should handle mixed configuration (some custom, some default)', () => {
    const mixedConfig = {
      clientId: 'custom-client-id',
      authDomain: 'custom.auth0.com',
      // audience will use stage default
      stage: 'prod' as const
    };

    const sdk = createYotoSdk(mixedConfig);
    
    expect(sdk.getClientId()).toBe('custom-client-id');
    expect(sdk.getAuthDomain()).toBe('custom.auth0.com');
    expect(sdk.getAudience()).toBe('https://api.yotoplay.com'); // prod default
  });
});
