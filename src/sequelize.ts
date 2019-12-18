import CONF from './config';
import { Sequelize } from 'sequelize-typescript';

export const sequelize = new Sequelize(CONF.db.database, CONF.db.user, CONF.db.password, {
  dialect: 'mysql',
  host: CONF.db.host,
  port: CONF.db.port,
  timezone: '+09:00',
  models: [`${__dirname}/models`],
});
