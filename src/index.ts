export { YotoSdk } from './main/YotoSdk.js';
export { YotoSdkError } from './base/YotoBaseSdk.js';

export type {
  YotoSdkConfig,
  ApiResponse,
  PaginatedResponse,
  Device,
  DevicesResponse,
  UserCard,
  UserCardsResponse,
  YotoJson,
  MediaResponse,
  UploadUrlResponse,
  TranscodeResponse,
  DisplayIcon,
  DisplayIconsResponse,
  FamilyImage,
  FamilyImagesResponse,
  FamilyLibraryGroup,
  FamilyLibraryGroupsResponse,
  FamilyLibraryGroupResponse,
  CreateFamilyLibraryGroupRequest,
  UpdateFamilyLibraryGroupRequest,
} from './types.js';

import { YotoSdk } from './main/YotoSdk.js';
import type { YotoSdkConfig } from './types.js';

// Default SDK instance (using stage-based configuration)
export const yotoSdk = new YotoSdk();

// Factory function for custom configuration
export function createYotoSdk(config: YotoSdkConfig = {}): YotoSdk {
  return new YotoSdk(config);
}

export default yotoSdk;
