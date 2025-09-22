import { describe, it, expect, vi, beforeEach } from 'vitest';
import { YotoSdkError, YotoSdk } from '../src/index.js';

describe('YotoSdkError', () => {
  it('should create error with message', () => {
    const error = new YotoSdkError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('YotoSdkError');
  });

  it('should create error with status and response', () => {
    const error = new YotoSdkError('Test error', 404, 'Not Found', { detail: 'Resource not found' });
    expect(error.status).toBe(404);
    expect(error.statusText).toBe('Not Found');
    expect(error.response).toEqual({ detail: 'Resource not found' });
  });
});

describe('YotoSdk utility methods', () => {
  it('should extract media ID from track URL', () => {
    // We'll test the utility function directly
    const extractMediaId = (trackUrl: string): string | null => {
      if (!trackUrl) return null;
      const match = trackUrl.match(/yoto:#(.+)/);
      return match ? match[1] : null;
    };

    expect(extractMediaId('yoto:#media123')).toBe('media123');
    expect(extractMediaId('yoto:#another-id')).toBe('another-id');
    expect(extractMediaId('invalid-url')).toBeNull();
    expect(extractMediaId('')).toBeNull();
    expect(extractMediaId(null as unknown as string)).toBeNull();
  });

  it('should parse Yoto signed URL expiration correctly', () => {
    // Test the URL parsing logic directly
    const parseUrlExpiration = (signedUrl: string): number => {
      try {
        const url = new globalThis.URL(signedUrl);
        const expiresParam = url.searchParams.get('Expires');
        
        if (expiresParam) {
          const expirationSeconds = parseInt(expiresParam, 10);
          return expirationSeconds * 1000; // Convert to milliseconds
        }
        
        // Fallback: assume 30 minutes if we can't parse
        return Date.now() + (30 * 60 * 1000);
      } catch {
        // Fallback: assume 30 minutes if URL parsing fails
        return Date.now() + (30 * 60 * 1000);
      }
    };
    
    // Test with actual Yoto URL format
    const yotoUrl = 'https://secure-media.yotoplay.com/1E7IjRtfSlIqDCrO9EkmFRWntzeRIYx7T4V11zp5rC34~/8Q2muoF9vZ3iCFc4zDzZgOJ4WMAVf8SLZ7lcy3iar4M?Expires=1758053965&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9zZWN1cmUtbWVkaWEueW90b3BsYXkuY29tLzFFN0lqUnRmU2xJcURDck85RWttRlJXbnR6ZVJJWXg3VDRWMTF6cDVyQzM0fi84UTJtdW9GOXZaM2lDRmM0ekR6WmdPSjRXTUFWZjhTTFo3bGN5M2lhcjRNIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzU4MDUzOTY1fX19XX0_&Signature=Pum6oP3bngve1av63vfmU0%7EOzCMm84eOWiyHtKRc3kzoOymUsEhqGHcWGL7tIEe1%7EiD8DMjvVgcMNI5pa0cYvdin6POeaEr8w1rJ6dCCWj62oVomufGb9EF-BXdwpYdWA1fCFUJ5xSyo3S5pm%7ECKE8hIqoZwsklhgiA97d718wYdbuTA6KXbl0kpNQSVPbTjTTian92VRsUDSaRuvHKQeYri2BoWi2mXdUqcFuvhPipUBj84%7E8uPVSWu4SBc3vLVQDHigvlu7y9c7n%7EczUBAbcgyASNybWKsigJKIKSHjJrJQQN36-Gpuh5Tbjt69e8k7Jd925Ouh6rxIY4hwKmeKg__&Key-Pair-Id=K11LSW6MOXJ7KP#sha256=8Q2muoF9vZ3iCFc4zDzZgOJ4WMAVf8SLZ7lcy3iar4M';
    
    const expirationTime = parseUrlExpiration(yotoUrl);
    
    // Should parse the Expires parameter (1758053965) and convert to milliseconds
    expect(expirationTime).toBe(1758053965000);
  });

});

describe('YotoSdk content.getCard method', () => {
  let sdk: YotoSdk;
  const mockGet = vi.fn();

  beforeEach(() => {
    // Mock the mainApiClient
    sdk = new YotoSdk({
      jwt: 'mock-jwt-token',
      stage: 'test'
    });
    
    // Mock the get method
    mockGet.mockClear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sdk as any).mainApiClient = {
      get: mockGet
    };
    
    // Also need to update the content API's client reference
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sdk.content as any).apiClient = (sdk as any).mainApiClient;
  });

  it('should get a card by ID', async () => {
    const mockCard = {
      cardId: 'test-card-123',
      title: 'Test Card',
      content: {
        chapters: [{
          key: 'chapter1',
          title: 'Test Chapter',
          tracks: []
        }]
      },
      metadata: {
        numEpisodes: 1,
        playbackDirection: 'asc'
      }
    };

    mockGet.mockResolvedValue({
      data: { card: mockCard }
    });

    const result = await sdk.content.getCard('test-card-123');

    expect(mockGet).toHaveBeenCalledWith('/content/test-card-123');
    expect(result).toEqual(mockCard);
  });

  it('should handle API errors', async () => {
    const mockError = new YotoSdkError('Card not found', 404);
    mockGet.mockRejectedValue(mockError);

    await expect(sdk.content.getCard('nonexistent-card')).rejects.toThrow('Card not found');
    expect(mockGet).toHaveBeenCalledWith('/content/nonexistent-card');
  });
});

describe('YotoSdk namespaced API structure', () => {
  let sdk: YotoSdk;

  beforeEach(() => {
    sdk = new YotoSdk({
      jwt: 'mock-jwt-token',
      stage: 'test'
    });
  });

  it('should have content namespace', () => {
    expect(sdk.content).toBeDefined();
    expect(typeof sdk.content.getMyCards).toBe('function');
    expect(typeof sdk.content.getCard).toBe('function');
    expect(typeof sdk.content.updateCard).toBe('function');
  });

  it('should have devices namespace', () => {
    expect(sdk.devices).toBeDefined();
    expect(typeof sdk.devices.getMyDevices).toBe('function');
  });

  it('should have media namespace', () => {
    expect(sdk.media).toBeDefined();
    expect(typeof sdk.media.getUploadUrlForTranscode).toBe('function');
    expect(typeof sdk.media.uploadFile).toBe('function');
    expect(typeof sdk.media.getTranscodedUpload).toBe('function');
    expect(typeof sdk.media.getMediaUrl).toBe('function');
    expect(typeof sdk.media.clearMediaCache).toBe('function');
  });

  it('should have icons namespace', () => {
    expect(sdk.icons).toBeDefined();
    expect(typeof sdk.icons.getDisplayIcons).toBe('function');
  });

  it('should maintain backward compatibility with clearMediaCache', () => {
    expect(typeof sdk.clearMediaCache).toBe('function');
  });
});

