import type { AxiosInstance } from 'axios';
import type { Device, DevicesResponse } from '../types.js';

export class DevicesApi {
  constructor(private apiClient: AxiosInstance) {}

  async getMyDevices(): Promise<Device[]> {
    const response = await this.apiClient.get<DevicesResponse>('/device-v2/devices/mine');
    return response.data.devices;
  }
}
