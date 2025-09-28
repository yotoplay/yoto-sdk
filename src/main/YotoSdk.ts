import { YotoBaseSdk } from '../base/YotoBaseSdk.js';
import { ContentApi } from '../api/contentApi.js';
import { DevicesApi } from '../api/devicesApi.js';
import { MediaApi } from '../api/mediaApi.js';
import { IconsApi } from '../api/iconsApi.js';
import { FamilyApi } from '../api/familyApi.js';
import { FamilyLibraryGroupsApi } from '../api/familyLibraryGroupsApi.js';

export class YotoSdk extends YotoBaseSdk {
  public readonly content: ContentApi;
  public readonly devices: DevicesApi;
  public readonly media: MediaApi;
  public readonly icons: IconsApi;
  public readonly family: FamilyApi;
  public readonly familyLibraryGroups: FamilyLibraryGroupsApi;

  constructor(config = {}) {
    super(config);
    
    // Initialize API namespaces
    this.content = new ContentApi(this.mainApiClient);
    this.devices = new DevicesApi(this.mainApiClient);
    this.media = new MediaApi(this.mainApiClient);
    this.icons = new IconsApi(this.mainApiClient);
    this.family = new FamilyApi(this.mainApiClient);
    this.familyLibraryGroups = new FamilyLibraryGroupsApi(this.mainApiClient);
  }

  /**
   * Clears the media cache (useful for testing or if media needs to be refreshed)
   */
  clearMediaCache(): void {
    this.media.clearMediaCache();
  }
}
