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
  
}