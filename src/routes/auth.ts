import User from '../models/user';

import request from 'request-promise';
import express, { Request, Response } from 'express';

import { wrap, getUserHash } from '../func';
import CONF from '../config';

const router = express.Router();

// 기본(디미고 아이디로 로그인)
router.post('/', wrap(async (req: Request, res: Response) => {
  // 일단 계정확인하고
  const { id, password } = req.body;
  if (!id || !password) return res.send({ code: 400 });

  const data = await request({
    method: 'get',
    url: 'https://api.dimigo.hs.kr/v1/users/identify',
    headers: {
      Authorization: CONF.API_DIMI_AUTH,
    },
    qs: {
      username: id,
      password: password,
    },
    json: true,
  }).catch(err => {
    if (err.statusCode === 404) {
      res.send({ code: 404 });
    } else {
      res.send({ code: 500 });
    }
  });
  if (!data) return;

  // 이제 학생인지 점검
  const u = await User.findOne({ where: { id: data.id }, attributes: ['id', 'hash'] });
  if (!u) return res.send({ code: 403 }); // 재학생만 로그인이 가능합니다.

  res.send({ code: 200, hash: u.hash });
}));

// 해시 코드
router.post('/hash', wrap(async (req: Request, res: Response) => {
  const { hash } = req.body;
  if (!hash) return res.send({ code: 400 });

  console.log(hash);
  const u = await User.findOne({ where: { hash } });
  if (!u) return res.send({ code: 404 });

  res.send({ code: 200 });
}));

export default router;
