# @yotoplay/yoto-sdk

The main TypeScript SDK for Yoto's public API.

## Installation

```bash
npm install @yotoplay/yoto-sdk
```

## Quick Start

### Basic Usage

```typescript
import { yotoSdk, createYotoSdk } from '@yotoplay/yoto-sdk';

// Option 1: Use default instance (stage-based configuration)
const devices = await yotoSdk.getDevices();

// Option 2: Create custom configured instance
const customSdk = createYotoSdk({
  clientId: 'your-client-id'
});
```

### JWT Authentication (Server-side Usage)

For server-side usage (e.g., API Gateway Lambda functions), you can provide a JWT token directly:

```typescript
import { createYotoSdk } from '@yotoplay/yoto-sdk';

// Server-side usage with JWT
const sdk = createYotoSdk({
  jwt: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...', // JWT token from event.headers
});

// No need to call login() - JWT is already provided
const devices = await sdk.getMyDevices();
const cards = await sdk.getMyCards();
```

### Main SDK Usage

```typescript
import { yotoSdk } from '@yotoplay/yoto-sdk';

// Get user's devices
const devices = await yotoSdk.getMyDevices();

// Get user's cards
const cards = await yotoSdk.getMyCards();

// Get signed media URL with caching
const mediaUrl = await yotoSdk.getMediaUrl(cardId, mediaId);
```

## Error Handling

The SDK provides custom error types for better error handling:

```typescript
import { YotoSdkError } from '@yotoplay/yoto-sdk';

try {
  await yotoSdk.getMyDevices();
} catch (error) {
  if (error instanceof YotoSdkError) {
    console.error('SDK Error:', error.message);
    console.error('Status:', error.status);
    console.error('Response:', error.response);
  }
}
```

## Utility Methods

```typescript
// Extract media ID from track URL
const mediaId = yotoSdk.extractMediaId('yoto:#media123');
// Returns: 'media123'
```

## Examples

### Media Upload and Processing

```typescript
import { yotoSdk } from '@yotoplay/yoto-sdk';
import fs from 'fs';

async function uploadAndProcessMedia() {
  // Read audio file
  const audioBuffer = fs.readFileSync('audio.mp3');
  const sha256 = 'your-file-hash';
  const filename = 'audio.mp3';

  // Get upload URL
  const uploadUrl = await yotoSdk.getUploadUrlForTranscode(sha256, filename);
  
  // Upload file
  await yotoSdk.uploadFile(uploadUrl.url, audioBuffer);
  
  // Get transcoded result
  const transcoded = await yotoSdk.getTranscodedUpload(uploadUrl.uploadId, true);
  
  console.log('Transcoded URL:', transcoded.url);
}
```

## License

MIT
