module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Intercept API requests starting with `/api`
        destination: 'http://api:9900/:path*' // Use the 'api' service name to route requests inside Docker
      }
    ];
  }
};