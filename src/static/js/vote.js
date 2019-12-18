$(document).ready(function () {
  if (!$.cookie('dimi_hash'))
    window.location.replace('/')
});

var vote;
var voteOK = false;
var socket = io.connect();

socket.on('init', function (data) {
  var currentTeam = document.getElementsByClassName('current-team')[0];

  vote = data;
  if (vote.state) {
    currentTeam.textContent = vote.current.name;
    showVote();
  } else {
    showWait();
  }
});

socket.on('start', function (data) {
  var currentTeam = document.getElementsByClassName('current-team')[0];

  vote = data;
  currentTeam.textContent = vote.current.name;
  showVote();
});

socket.on('stop', function (data) {
  showWait();
});

socket.on('refresh', function (data) {
  window.location.reload();
});

socket.on('result', function (code) {
  switch (code) {
    case 0:
      window.location.replace('/');
      break;
    case 4:
      window.location.reload();
      break;
  }
});

function showVote() {
  var voteButton = document.getElementsByClassName('vote-button')[0];
  var voteMessage = document.getElementsByClassName('message')[0];
  var wait = document.getElementsByClassName('wait')[0];

  voteButton.src = '../assets/vote_normal.png';
  voteButton.classList.remove('vote-button--clicked');
  wait.classList.remove('wait--visible');
  voteMessage.textContent = '투표에 참여해주세요';
  voteOK = false;
}

function showWait() {
  var voteButton = document.getElementsByClassName('vote-button')[0];
  var voteMessage = document.getElementsByClassName('message')[0];
  var wait = document.getElementsByClassName('wait')[0];

  voteButton.src = '../assets/vote_done.png';
  voteButton.classList.add('vote-button--clicked');
  wait.classList.add('wait--visible');
  voteMessage.textContent = '투표에 참여하셨습니다!';
  voteOK = true;
}

function votes() {
  if (voteOK) return;
  showWait();
  socket.emit('vote', { hash: $.cookie('dimi_hash'), lid: vote.current.lid });
}
