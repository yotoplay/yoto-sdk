import FormData from 'form-data';
import Blob from 'form-data';
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

  async uploadFamilyImage(imageData: Buffer, title: string, publicImage = false, publicTags: string[] = []): Promise<FamilyImage> {
    const blob = new Blob().append('image', new Uint8Array(imageData));
    const formData = new FormData();
    formData.append('image', blob, 'family-image.jpg');
    formData.append('title', title);
    formData.append('public', publicImage.toString());
    formData.append('publicTags', JSON.stringify(publicTags));

    const response = await this.apiClient.post<{ familyImage: FamilyImage }>('/media/family/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.familyImage;
  }
}
