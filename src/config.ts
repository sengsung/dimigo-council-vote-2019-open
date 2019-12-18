const dev = process.argv[2] === 'dev' ? true : false;

export default {
  API_DIMI_AUTH: `Basic ${new Buffer('키').toString('base64')}`,
  hashSort: '값',
  db: {
    host: 'localhost',
    port: 3306,
    database: 'dimivote',
    user: dev ? '값' : '값',
    password: dev ? '값' : '값',
  },
  http: {
    port: 80,
  },
  https: {
    use: true,
    port: 443,
    key: './src/ssl/private.key',
    cert: './src/ssl/certificate.crt',
  },
  allowOrigins: [
    'http://localhost',
    'https://localhost',
    'http://vote.dimigo.hs.kr',
    'https://vote.dimigo.hs.kr',
  ],
  managePass: '값',
  dev,
};
