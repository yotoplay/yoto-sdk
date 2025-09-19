// Auth.js specific types
export interface AuthJSUser {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: unknown;
}

export interface AuthJSSession {
  user: AuthJSUser;
  accessToken: string;
  idToken: string;
  expires: string;
}
