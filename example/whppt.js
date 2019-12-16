module.exports = {
  security: {
    provider: 'jwt',
    jwt: {
      secret: 'W5rX8JlYWRlclJrLCJqdGkiOiJiaGdkr3bGl6amZ5IiwiYWxnIjoiSFMyNTYiLCP', // use a 256bit key
      issuer: 'example',
      audience: 'example',
    },
  },
};
