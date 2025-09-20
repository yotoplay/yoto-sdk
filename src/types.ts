// Device types
export interface Device {
  id: string;
  name: string;
  type: string;
  status: string;
  lastSeen?: string;
  firmwareVersion?: string;
}

export interface DevicesResponse {
  devices: Device[];
}

// Content/Card types
export interface UserCard {
  cardId: string;
  title: string;
  cover?: {
    imageL?: string;
    imageM?: string;
    imageS?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCardsResponse {
  cards: UserCard[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface YotoJson {
  content: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

// Media types
export interface MediaResponse {
  media: {
    url: string;
  };
}

export interface UploadUrlResponse {
  upload: {
    url: string;
    fields?: Record<string, string>;
  };
}

export interface TranscodeResponse {
  transcode: {
    url: string;
    status: string;
  };
}

// Voice types
export interface Voice {
  voiceId: string;
  name: string;
  category: string;
  description: string;
  labels: {
    accent: string;
    descriptive: string;
    age: string;
    gender: string;
    language: string;
    use_case: string;
  };
}

export interface VoicesResponse {
  voices: Voice[];
}

// Job types
export interface JobProgress {
  total: number;
  completed: number;
  failed: number;
}

export interface JobStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: string;
  createdAt: string;
  updatedAt?: string;
  result?: {
    cardId: string;
    title: string;
  };
  error?: string;
}

export interface JobResponse {
  job: JobStatus;
}

export interface CreateJobRequest {
  title: string;
  content: YotoJson['content'];
  metadata: YotoJson['metadata'];
}

export interface UpdateJobRequest {
  content: YotoJson['content'];
  metadata: YotoJson['metadata'];
}

// SDK Configuration types
export interface YotoSdkConfig {
  stage?: 'test' | 'prod';
  retries?: number;
  retryDelay?: (retryCount: number) => number;
  timeout?: number;
  clientId?: string;
  authDomain?: string;
  audience?: string;
  jwt?: string; // JWT token for server-side usage (bypasses browser auth flow)
  apiDomain?: string; // Override the main API domain (defaults to https://api.yotoplay.com)
  labsApiDomain?: string; // Override the labs API domain (defaults to https://labs.api.yotoplay.com)
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total?: number;
  page?: number;
  limit?: number;
}

// Display Icon types
export interface DisplayIcon {
  mediaId: string;
  userId: string;
  createdAt: string;
  displayIconId: string;
  title: string;
  url: string;
  public: boolean;
  publicTags: string[];
}

export interface DisplayIconsResponse {
  displayIcons: DisplayIcon[];
}

