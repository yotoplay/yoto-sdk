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
  clientId: 'your-client-id',
  authDomain: 'your.auth0.com',
  audience: 'https://your.api.com'
});
```

### Authentication Configuration

The SDK supports both automatic stage-based configuration and custom authentication settings:

```typescript
import { createYotoSdk } from '@yotoplay/yoto-sdk';

// Custom authentication configuration
const sdk = createYotoSdk({
  clientId: 'your-auth0-client-id',     // Required for custom auth
  authDomain: 'your.auth0.com',         // Required for custom auth  
  audience: 'https://your.api.com',     // Required for custom auth
  stage: 'prod',                        // Optional: 'test' | 'prod'
  retries: 3,                          // Optional: number of retries
  timeout: 30000                       // Optional: request timeout
});

// Login with custom configuration
await sdk.login();
```

### JWT Authentication (Server-side Usage)

For server-side usage (e.g., API Gateway Lambda functions), you can provide a JWT token directly:

```typescript
import { createYotoSdk } from '@yotoplay/yoto-sdk';

// Server-side usage with JWT
const sdk = createYotoSdk({
  jwt: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...', // JWT token from request
  stage: 'prod'
});

// No need to call login() - JWT is already provided
const devices = await sdk.getMyDevices();
const cards = await sdk.getMyCards();
```

**Note:** When using JWT authentication, the `login()`, `handleCallback()`, and `logout()` methods are not available since the token is provided externally.

### Main SDK Usage

```typescript
import { yotoSdk } from '@yotoplay/yoto-sdk';

// Get user's devices
const devices = await yotoSdk.getMyDevices();

// Get user's cards
const cards = await yotoSdk.getMyCards();

// Get media URL with caching
const mediaUrl = await yotoSdk.getMediaUrl(cardId, mediaId);
```

## API Reference

#### Device Management
```typescript
// Get user's devices
const devices = await yotoSdk.getMyDevices();
```

#### Content Management
```typescript
// Get user's cards
const cards = await yotoSdk.getMyCards();

// Get a specific card by ID
const card = await yotoSdk.getCard(cardId);

// Update a card
const updatedCard = await yotoSdk.updateCard(cardData, true);
```

#### Media Services
```typescript
// Get upload URL for transcoding
const uploadUrl = await yotoSdk.getUploadUrlForTranscode(sha256, filename);

// Upload file
await yotoSdk.uploadFile(uploadUrl.url, fileBuffer);

// Get transcoded upload
const transcoded = await yotoSdk.getTranscodedUpload(uploadId, true);

// Get media URL (with intelligent caching and TTL)
const mediaUrl = await yotoSdk.getMediaUrl(cardId, mediaId);

// Clear media cache
yotoSdk.clearMediaCache();
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
// Extract media ID from track URL (available in both SDKs)
const mediaId = yotoSdk.extractMediaId('yoto:#media123');
// Returns: 'media123'

// Get SDK configuration
const config = yotoSdk.getConfig();
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

### API Gateway Lambda Example

Here's a practical example of using the SDK in an API Gateway Lambda function:

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createYotoSdk } from '@yotoplay/yoto-sdk';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Extract JWT from Authorization header
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Missing or invalid authorization header' })
      };
    }

    const jwt = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Create SDK instance with JWT
    const sdk = createYotoSdk({
      jwt,
      stage: 'prod'
    });

    // Use the SDK to call Yoto API
    const devices = await sdk.getMyDevices();
    const cards = await sdk.getMyCards();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        devices,
        cards
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
```

## License

MIT