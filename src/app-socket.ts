import User from './models/user';
import List from './models/list';
import History from './models/history';

import { literal as SeqLiteral } from 'sequelize';

import socketIO from 'socket.io';

import { httpServer, httpsServer } from './';

import CONF from './config';

export const io = socketIO();

export function listen() {
  io.listen(httpServer);
  io.attach(httpsServer);
}

const vote: IVote = {
  state: false,
  current: {
    lid: 0,
    name: '테스트',
  },
};

io.on('connection', socket => {

  socket.on('error', error => console.log(error));

  socket.emit('init', vote);
  socket.on('init', () => {
    socket.emit('init', vote);
  });

  // =============== 투표 ===============
  socket.on('vote', async data => {
    if (!vote.state) {
      console.log('투표 요청 : 투표 중이 아님');
      return socket.emit('result', ResCode.NotStarted);
    }

    const { hash, lid } = data;
    // 유저 찾아서
    const user = await User.findOne({ where: { hash }, attributes: ['id', 'serial'] });
    if (!user) {
      console.log(`투표 요청 : 유저를 찾을 수 없음 : ${hash}`);
      return socket.emit('result', ResCode.UserNotFound);
    }

    // 현재 투표와 일치하는지 확인하고
    if (lid !== vote.current.lid) {
      console.log(`투표 요청 : 현재 투표와 일치하지 않음 : ${user.serial}`);
      return socket.emit('result', ResCode.NoMatch);
    }

    // 이미 했는지 확인하고
    const history = await History.findOne({ where: { uid: user.id, lid }, attributes: ['id'] });
    if (history) {
      console.log(`투표 요청 : 이미 투표 했음 : ${user.serial}}`);
      await History.update({ overlap: SeqLiteral('overlap + 1') }, { where: { uid: user.id, lid } });
      return socket.emit('result', ResCode.AlreadyVoted);
    } else {
      await History.create({ uid: user.id, lid });
    }

    // 추가!
    console.log(`투표 요청 : 성공 : ${user.serial}`);
    await List.update({ cnt: SeqLiteral('cnt + 1') }, { where: { id: lid } });
    socket.emit('result', ResCode.Success);
  });

  // =============== 관리 ===============
  socket.on('test', async key => {
    if (!chkManager(key)) {
      console.log('관리자 테스트 : 잘못된 암호');
      return socket.emit('result', false);
    }
    const list = await List.findAll({ attributes: { exclude: ['createdAt', 'updatedAt'] } });
    socket.emit('result', list);
  });

  socket.on('start', async key => {
    if (!chkManager(key)) {
      console.log('관리자 투표 시작 : 잘못된 암호');
      return socket.emit('result', '시작 실패');
    }

    vote.state = true;

    console.log('======== 투표 시작 됨 ========');
    socket.emit('result', vote);
    socket.broadcast.emit('start', vote);
  });

  socket.on('stop', key => {
    if (!chkManager(key)) {
      console.log('관리자 투표 종료 : 잘못된 암호');
      return socket.emit('result', '종료 실패');
    }

    vote.state = false;

    console.log('======== 투표 종료 ========');
    socket.emit('result', '종료 성공');
    socket.broadcast.emit('stop');
  });

  socket.on('list', async data => {
    const { key, lid } = data;

    if (!chkManager(key)) {
      console.log('관리자 투표 변경 : 잘못된 암호');
      return socket.emit('result', '변경 실패');
    }

    if (vote.state) {
      console.log('관리자 투표 변경 : 투표가 진행 중');
      return socket.emit('result', '투표가 진행 중 이에요!');
    }

    const list = await List.findOne({ where: { id: lid } });
    if (!list) {
      console.log('관리자 투표 변경 : 존재하지 않는 lid');
      return socket.emit('result', 404);
    }

    vote.current.lid = lid;
    vote.current.name = list.name;

    console.log('관리자 투표 변경 : 성공');
    socket.to('score').emit('change', list.img);
    socket.emit('result', vote);
  });

  socket.on('refresh', key => {
    if (!chkManager(key)) {
      console.log('관리자 새로고침 : 잘못된 암호');
      return socket.emit('result', false);
    }
    console.log('관리자 새로고침 : 성공');
    socket.emit('result', '새로고침 완료');
    socket.broadcast.emit('refresh');
  });

  socket.on('showMain', key => {
    if (!chkManager(key)) {
      console.log('관리자 showMain : 잘못된 암호');
      return socket.emit('result', 'showMain 실패');
    }
    socket.to('score').emit('showMain');
    socket.emit('result', 'showMain 완료');
  });

  socket.on('hideMain', key => {
    if (!chkManager(key)) {
      console.log('관리자 hideMain : 잘못된 암호');
      return socket.emit('result', 'hideMain 실패');
    }
    socket.to('score').emit('hideMain');
    socket.emit('result', 'hideMain 완료');
  });

  socket.on('score', async () => {
    const list = await List.findOne({ where: { id: vote.current.lid }, attributes: ['cnt'] });
    socket.emit('score', list ? list.cnt : 0);
  });

  socket.on('scoreJoin', async () => {
    socket.join('score');
  });

  socket.on('scoreChange', async (key) => {
    if (!chkManager(key)) {
      console.log('관리자 점수판 변경 : 잘못된 암호');
      return socket.emit('result', '관리자 점수판 변경 실패');
    }
    const list = await List.findOne({ where: { id: vote.current.lid } });
    if (list) {
      socket.to('score').emit('change', list.img);
    }
  });
});

export default io;

function chkManager(key: string): boolean {
  return key === CONF.managePass;
}

interface IVote {
  state: boolean;
  current: {
    lid: number;
    name: string;
  };
}

enum ResCode {
  UserNotFound = 0,
  Success = 1,
  AlreadyVoted = 2,
  NotStarted = 3,
  NoMatch = 4,
}
