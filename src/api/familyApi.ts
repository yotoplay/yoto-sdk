import type { AxiosInstance } from 'axios';
import type { FamilyImage, FamilyImagesResponse } from '../types.js';

export class FamilyApi {
  constructor(private apiClient: AxiosInstance) {}

  async getFamilyImage(imageId: string): Promise<FamilyImage> {
    const response = await this.apiClient.get<{ familyImage: FamilyImage }>(`/media/family/images/${imageId}`);
    return response.data.familyImage;
  }

  async getFamilyImages(): Promise<FamilyImage[]> {
    const response = await this.apiClient.get<FamilyImagesResponse>('/media/family/images');
    return response.data.familyImages;
  }

  async uploadFamilyImage(
    imageData: Buffer,
    title: string,
    publicImage = false,
    publicTags: string[] = []
  ): Promise<FamilyImage> {
    const blob = new Blob([imageData], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', blob, 'family-image.jpg');
    formData.append('title', title);
    formData.append('public', publicImage.toString());
    formData.append('publicTags', JSON.stringify(publicTags));

    const response = await this.apiClient.post<{ familyImage: FamilyImage }>(
      '/media/family/images',
      formData,
      {
        headers: formData.getHeaders?.() ?? {}, // only needed if using node-fetch/axios quirks
      }
    );
    return response.data.familyImage;
  }
}