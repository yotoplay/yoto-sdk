import type { AxiosInstance } from 'axios';
import type { MediaResponse, UploadUrlResponse, TranscodeResponse } from '../types.js';

interface CacheEntry {
  url: string;
  expiresAt: number; // Unix timestamp in milliseconds
}

export class MediaApi {
  private mediaCache = new Map<string, CacheEntry>();
  private loadingPromises = new Map<string, Promise<string>>();

  constructor(private apiClient: AxiosInstance) {}

  async getUploadUrlForTranscode(sha256: string, filename: string): Promise<UploadUrlResponse['upload']> {
    const response = await this.apiClient.get<UploadUrlResponse>('/media/transcode/audio/uploadUrl', {
      params: { sha256, filename }
    });
    return response.data.upload;
  }

  async uploadFile(url: string, fileContent: Buffer): Promise<void> {
    await this.apiClient.put(url, fileContent, {
      headers: { 'Content-Type': 'audio/mpeg' },
      baseURL: '', // Override baseURL for direct upload URLs
    });
  }

  async getTranscodedUpload(uploadId: string, loudnorm = false): Promise<TranscodeResponse['transcode']> {
    const response = await this.apiClient.get<TranscodeResponse>(`/media/upload/${uploadId}/transcoded`, {
      params: { loudnorm }
    });
    return response.data.transcode;
  }

  /**
   * Gets a signed media URL for a track with caching
   * @param cardId - The card ID
   * @param mediaId - The media ID (extracted from trackUrl after 'yoto:#')
   * @returns Promise<string> - The signed media URL
   */
  async getMediaUrl(cardId: string, mediaId: string): Promise<string> {
    const cacheKey = `${cardId}:${mediaId}`;
    
    // Check cache with expiration
    if (this.mediaCache.has(cacheKey)) {
      const entry = this.mediaCache.get(cacheKey)!;
      const now = Date.now();
      
      if (now < entry.expiresAt) {
        return entry.url; // Still valid
      } else {
        this.mediaCache.delete(cacheKey); // Remove expired entry
      }
    }

    // Return existing loading promise if one is in progress
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // Create new fetch promise
    const fetchPromise = this.fetchMediaUrl(cardId, mediaId);
    this.loadingPromises.set(cacheKey, fetchPromise);

    try {
      const mediaUrl = await fetchPromise;
      
      // Parse expiration from signed URL and cache with TTL
      const expiresAt = this.parseUrlExpiration(mediaUrl);
      this.mediaCache.set(cacheKey, { url: mediaUrl, expiresAt });
      
      return mediaUrl;
    } catch (error) {
      // Remove failed promise so it can be retried
      this.loadingPromises.delete(cacheKey);
      throw error;
    }
  }

  /**
   * Fetches the signed media URL from the API
   */
  private async fetchMediaUrl(cardId: string, mediaId: string): Promise<string> {
    try {
      const response = await this.apiClient.get<MediaResponse>(`/card/${cardId}/media/${mediaId}`);
      return response.data.media.url;
    } catch (error) {
      console.error('Error fetching media URL:', error);
      throw new Error(`Failed to fetch media URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parses expiration time from Yoto signed URL
   * Yoto uses the 'Expires' parameter with a Unix timestamp
   */
  private parseUrlExpiration(signedUrl: string): number {
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
  }

  /**
   * Clears the media cache (useful for testing or if media needs to be refreshed)
   */
  clearMediaCache(): void {
    this.mediaCache.clear();
    this.loadingPromises.clear();
  }
}
