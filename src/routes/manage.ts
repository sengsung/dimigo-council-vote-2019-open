import { sequelize as DB } from '../sequelize';

import User from '../models/user';
import List from '../models/list';
import History from '../models/history';

import request from 'request-promise';
import express, { Request, Response } from 'express';

import { wrap, getUserHash } from '../func';
import CONF from '../config';

const router = express.Router();

// 초기 유저 추가
router.post('/user/init', wrap(async (req: Request, res: Response) => {
  // 일단 계정확인하고
  const data = await request({
    method: 'get',
    url: 'https://api.dimigo.hs.kr/v1/user-students',
    headers: {
      Authorization: CONF.API_DIMI_AUTH,
    },
    qs: {
      username: req.body.id,
      password: req.body.password,
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

  for (const s of data) {
    console.log(`${s.user_id} ${s.serial} ${s.name}`);
    await User.create({
      id: s.user_id,
      serial: s.serial,
      hash: getUserHash(s.user_id),
    });
  }
  res.send({ code: 200 });
}));

// 리스트 조회
router.get('/list', wrap(async (req: Request, res: Response) => {
  const list = await List.findAll({ attributes: { exclude: ['createdAt', 'updatedAt'] } });
  res.send({ code: 200, list });
}));

// 리스트 추가
router.post('/list', wrap(async (req: Request, res: Response) => {
  const { name, img } = req.body;
  const list = await List.create({ name, img });
  res.send({ code: 200, id: list.id });
}));

// 리스트 수정
router.put('/list/:id', wrap(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  const list = await List.findOne({ where: { id }, attributes: ['id'] });
  if (!list) return res.send({ code: 404 });

  await List.update({ name }, { where: { id } });
  res.send({ code: 200 });
}));

// 기록 조회(특정 사람)
router.get('/history', wrap(async (req: Request, res: Response) => {
  const total: any = (await DB.query(`
  SELECT uid, sum(overlap)
  FROM Histories
  GROUP BY uid
  ORDER BY sum(overlap) DESC`))[0][0];
  return res.send({ success: true, total: total || [] });
}));

// 기록 삭제(특정 lid)
router.delete('/history/:lid', wrap(async (req: Request, res: Response) => {
  const { lid } = req.params;

  await History.destroy({ where: { lid } });
  res.send({ code: 200 });
}));

export default router;
