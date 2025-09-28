import type { AxiosInstance } from 'axios';
import type { 
  FamilyLibraryGroup, 
  FamilyLibraryGroupsResponse, 
  FamilyLibraryGroupResponse,
  CreateFamilyLibraryGroupRequest,
  UpdateFamilyLibraryGroupRequest 
} from '../types.js';

export class FamilyLibraryGroupsApi {
  constructor(private apiClient: AxiosInstance) {}

  async getGroups(): Promise<FamilyLibraryGroup[]> {
    const response = await this.apiClient.get<FamilyLibraryGroupsResponse>('/card/family/library/groups');
    return response.data.groups;
  }

  async createGroup(groupData: CreateFamilyLibraryGroupRequest): Promise<FamilyLibraryGroup> {
    const response = await this.apiClient.post<FamilyLibraryGroupResponse>('/card/family/library/groups', groupData);
    return response.data.group;
  }

  async getGroup(groupId: string): Promise<FamilyLibraryGroup> {
    const response = await this.apiClient.get<FamilyLibraryGroupResponse>(`/card/family/library/groups/${groupId}`);
    return response.data.group;
  }

  async updateGroup(groupId: string, groupData: UpdateFamilyLibraryGroupRequest): Promise<FamilyLibraryGroup> {
    const response = await this.apiClient.put<FamilyLibraryGroupResponse>(`/card/family/library/groups/${groupId}`, groupData);
    return response.data.group;
  }

  async deleteGroup(groupId: string): Promise<void> {
    await this.apiClient.delete(`/card/family/library/groups/${groupId}`);
  }
}
