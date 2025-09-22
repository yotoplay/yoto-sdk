import type { AxiosInstance } from 'axios';
import type { DisplayIcon, DisplayIconsResponse } from '../types.js';

export class IconsApi {
  constructor(private apiClient: AxiosInstance) {}

  async getDisplayIcons(): Promise<DisplayIcon[]> {
    const response = await this.apiClient.get<DisplayIconsResponse>('/media/displayIcons/user/yoto');
    return response.data.displayIcons;
  }
}
