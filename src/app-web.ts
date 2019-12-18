import express, { Response, Request, NextFunction } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

import CONF from './config';

import authRouter from './routes/auth';
import manageRouter from './routes/manage';

const app = express();

const corsOption = {
  // origin: CONF.allowOrigins,
  // credentials: true,
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());

app.use(express.static(`${__dirname}/static`));

app.get('/.well-known/acme-challenge/kOGoTgRZY3SqgC2u8ans4gWdni9HLOCYZi4Mn3sEgdg', (req: Request, res: Response) => {
  res.send('kOGoTgRZY3SqgC2u8ans4gWdni9HLOCYZi4Mn3sEgdg.cONP5JVRwJO9aMMIxeG9uhkF2FCWYrcldmzJjynnBIQ');
});
app.use('/auth', authRouter);
app.use('/manage', needManage, manageRouter);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.log(err)
  res.send({ success: false, code: 500 });
});

function needManage(req: Request, res: Response, next: NextFunction) {
  if (CONF.managePass !== req.headers.authorization) return res.send({ code: 500 });
  next();
}

export default app;
