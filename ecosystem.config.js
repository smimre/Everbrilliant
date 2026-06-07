module.exports = {
  apps: [
    {
      name: 'everbrilliant-api',
      script: 'apps/api/dist/src/main.js',
      cwd: '/opt/everbrilliant/everbrilliant-v2',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'everbrilliant-web',
      // Use standalone server directly — 'next start' does not work with output: standalone
      script: 'apps/web/.next/standalone/apps/web/server.js',
      cwd: '/opt/everbrilliant/everbrilliant-v2',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
};
