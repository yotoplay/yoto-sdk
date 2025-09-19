interface Stages {
  CLIENT_URLS: Record<string, string>;
  API_DOMAINS: Record<string, string>;
  LABS_API_DOMAINS: Record<string, string>;
}

const stages: Stages = {
  CLIENT_URLS: {
    localhost: 'prod', 
    'test-elevenlabs.aws.fooropa.com': 'test',
    'elevenlabs.yotoplay.com': 'prod',
  },

  API_DOMAINS: {
    test: 'https://test.aws.fooropa.com',
    prod: 'https://api.yotoplay.com'
  },

  LABS_API_DOMAINS: {
    test: 'https://labs.aws.fooropa.com',
    prod: 'https://labs.api.yotoplay.com'
  }
};

export default stages; 