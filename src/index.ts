import { sequelize } from './sequelize';

import { createServer as createServerHttp } from 'http';
import { createServer as createServerHttps } from 'https';
import fs from 'fs';

import CONF from './config';

import appWeb from './app-web';
import { listen as listenIO } from './app-socket';

const sslSetting = {
  key: fs.readFileSync(CONF.https.key),
  cert: fs.readFileSync(CONF.https.cert),
};

export const httpServer = createServerHttp(appWeb);
export const httpsServer = createServerHttps(sslSetting, appWeb);

(async () => {
  await sequelize.sync();
  console.log('DB Connected');

  httpServer.listen(CONF.http.port, () => {
    console.log('HTTP Server Start');
  });

  if (CONF.https.use) {
    httpsServer.listen(CONF.https.port, () => {
      console.log('HTTPS Server Start');
    });
  }

  listenIO();
})();
