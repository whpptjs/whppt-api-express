module.exports = {
  security: {
    provider: 'jwt',
    jwt: {
      secret: process.env.JWT_SECRET || 'W5rX8JlYWRlclJrLCJqdGkiOiJiaGdkr3bGl6amZ5IiwiYWxnIjoiSFMyNTYiLCP', // use a 256bit key
      issuer: 'example',
      audience: 'example',
    },
  },
  collections: {
    pages: 'pages',
    listing: 'listing',
  },
};
